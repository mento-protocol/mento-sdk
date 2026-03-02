import type { LoanDetails, RiskLevel } from '../../core/types'
import {
  MAX_LTV_ALLOWED_RATIO,
  LTV_RISK_MEDIUM,
  LTV_RISK_HIGH,
  REDEMPTION_RISK_MEDIUM,
  REDEMPTION_RISK_LOW,
} from '../../core/constants'

const DECIMAL_PRECISION = 10n ** 18n
const THOUSAND = 1000n
const NORMALIZED_MAX_LTV = DECIMAL_PRECISION
const DEBT_SUGGESTION_RATIOS = [300n, 600n, 800n] as const

export function getLtv(
  collateral: bigint,
  debt: bigint,
  collPrice: bigint,
): bigint | null {
  const collateralUsd = (collateral * collPrice) / DECIMAL_PRECISION
  if (collateralUsd === 0n) return null
  return (debt * DECIMAL_PRECISION) / collateralUsd
}

export function getLiquidationPrice(
  collateral: bigint,
  debt: bigint,
  mcr: bigint,
): bigint | null {
  if (collateral <= 0n || debt <= 0n) return null
  if (mcr <= DECIMAL_PRECISION) return null
  // liquidationPrice = (debt * mcr) / collateral
  return (debt * mcr) / collateral
}

export function getLiquidationRisk(ltv: bigint, maxLtv: bigint): RiskLevel {
  if (maxLtv <= 0n) return 'low'

  // Compare using cross-multiplication to avoid floor-division drift.
  if (ltv * THOUSAND > maxLtv * LTV_RISK_HIGH) return 'high'
  if (ltv * THOUSAND > maxLtv * LTV_RISK_MEDIUM) return 'medium'
  return 'low'
}

export function getRedemptionRisk(
  debtInFront: bigint,
  totalDebt: bigint,
): RiskLevel | null {
  if (totalDebt === 0n) return null

  // Compare using cross-multiplication to avoid floor-division drift.
  if (debtInFront * THOUSAND > totalDebt * REDEMPTION_RISK_LOW) return 'low'
  if (debtInFront * THOUSAND > totalDebt * REDEMPTION_RISK_MEDIUM) return 'medium'
  return 'high'
}

export function calculateMaxDebt(collateralUsd: bigint, maxLtv: bigint): bigint {
  return (collateralUsd * maxLtv) / DECIMAL_PRECISION
}

export function calculateDebtSuggestions(
  maxDebt: bigint,
  minDebt: bigint,
): { amount: bigint; ltv: bigint; risk: RiskLevel }[] {
  if (maxDebt <= 0n) return []

  const suggestions: { amount: bigint; ltv: bigint; risk: RiskLevel }[] = []

  for (let i = 0; i < DEBT_SUGGESTION_RATIOS.length; i++) {
    let amount = (maxDebt * DEBT_SUGGESTION_RATIOS[i]) / THOUSAND

    // Mirror frontend behavior:
    // - First suggestion is clamped up to minDebt.
    // - Later suggestions below minDebt are omitted.
    if (amount < minDebt) {
      if (i === 0) {
        amount = minDebt
      } else {
        continue
      }
    }

    // ltv relative to maxLtv (normalized to 1e18 where 1e18 === maxLtv)
    const ltv = (amount * DECIMAL_PRECISION) / maxDebt

    // Hide suggestions that exceed maxLtv.
    if (ltv > NORMALIZED_MAX_LTV) {
      continue
    }

    suggestions.push({
      amount,
      ltv,
      risk: getLiquidationRisk(ltv, NORMALIZED_MAX_LTV),
    })
  }

  return suggestions
}

export function getLoanDetails(
  collateral: bigint | null,
  debt: bigint | null,
  interestRate: bigint | null,
  collPrice: bigint | null,
  mcr: bigint,
): LoanDetails {
  // maxLtv = 1 / MCR (MCR is e.g. 1.1e18 meaning 110%)
  const maxLtv = (DECIMAL_PRECISION * DECIMAL_PRECISION) / mcr
  // maxLtvAllowed = maxLtv * MAX_LTV_ALLOWED_RATIO / 1000
  const maxLtvAllowed = (maxLtv * MAX_LTV_ALLOWED_RATIO) / THOUSAND

  const collateralUsd =
    collateral !== null && collPrice !== null
      ? (collateral * collPrice) / DECIMAL_PRECISION
      : null

  const ltv =
    debt !== null && collateralUsd !== null && collateralUsd > 0n
      ? (debt * DECIMAL_PRECISION) / collateralUsd
      : collateral !== null && collateral < 0n
        ? DECIMAL_PRECISION
        : null

  const status =
    ltv === null
      ? null
      : collateral !== null && (collateral < 0n || ltv > DECIMAL_PRECISION)
        ? 'underwater'
        : ltv > maxLtv
          ? 'liquidatable'
          : ltv > maxLtvAllowed
            ? 'at-risk'
            : 'healthy'

  const maxDebt = collateralUsd !== null ? calculateMaxDebt(collateralUsd, maxLtv) : null
  const maxDebtAllowed =
    collateralUsd !== null && collateralUsd > 0n
      ? (collateralUsd * maxLtvAllowed) / DECIMAL_PRECISION
      : null

  const liquidationRisk = ltv !== null ? getLiquidationRisk(ltv, maxLtv) : null

  const liquidationPrice =
    collateral !== null && debt !== null && collateral > 0n
      ? getLiquidationPrice(collateral, debt, mcr)
      : null

  return {
    collateral,
    collateralUsd,
    collPrice,
    debt,
    interestRate,
    ltv,
    maxLtv,
    maxLtvAllowed,
    liquidationPrice,
    liquidationRisk,
    maxDebt,
    maxDebtAllowed,
    status,
  }
}
