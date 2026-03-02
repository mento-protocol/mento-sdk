import { Address, zeroAddress } from 'viem'
import { BorrowPosition, TroveStatus } from '../../../core/types'
import { validateAddress } from '../../../utils/validation'

const MAX_SAFE_INTEGER_BIGINT = BigInt(Number.MAX_SAFE_INTEGER)

type LatestTroveData = {
  entireDebt: bigint
  entireColl: bigint
  redistBoldDebtGain: bigint
  redistCollGain: bigint
  accruedInterest: bigint
  recordedDebt: bigint
  annualInterestRate: bigint
  accruedBatchManagementFee: bigint
  lastInterestRateAdjTime: bigint | number
}

type TrovesData = {
  status: bigint | number
  lastDebtUpdateTime: bigint | number
  interestBatchManager: string
}

function requireAddress(value: unknown, fieldName: string): Address {
  if (typeof value !== 'string') {
    throw new Error(`${fieldName} must be a string address`)
  }
  validateAddress(value, fieldName)
  return value as Address
}

function requireBigInt(value: unknown, fieldName: string): bigint {
  if (typeof value !== 'bigint') {
    throw new Error(`${fieldName} must be a bigint`)
  }
  if (value < 0n) {
    throw new Error(`${fieldName} cannot be negative`)
  }
  return value
}

function requireNonNegativeInteger(value: unknown, fieldName: string): number {
  if (typeof value === 'bigint') {
    if (value < 0n) {
      throw new Error(`${fieldName} cannot be negative`)
    }
    if (value > MAX_SAFE_INTEGER_BIGINT) {
      throw new Error(`${fieldName} exceeds Number.MAX_SAFE_INTEGER`)
    }
    return Number(value)
  }

  if (typeof value === 'number') {
    if (!Number.isSafeInteger(value)) {
      throw new Error(`${fieldName} must be a safe integer`)
    }
    if (value < 0) {
      throw new Error(`${fieldName} cannot be negative`)
    }
    return value
  }

  throw new Error(`${fieldName} must be a number or bigint`)
}

export function mapTroveStatus(statusNum: number): TroveStatus {
  if (!Number.isSafeInteger(statusNum) || statusNum < 0) {
    throw new Error(`Invalid trove status: ${statusNum}`)
  }

  switch (statusNum) {
    case 0:
      return 'nonExistent'
    case 1:
      return 'active'
    case 2:
      return 'closedByOwner'
    case 3:
      return 'closedByLiquidation'
    case 4:
      return 'zombie'
    default:
      throw new Error(`Unknown trove status: ${statusNum}`)
  }
}

export function parseBorrowPosition(
  troveId: string,
  latestData: unknown,
  trovesData: unknown
): BorrowPosition {
  if (typeof troveId !== 'string' || troveId.length === 0) {
    throw new Error('troveId must be a non-empty string')
  }

  const latest = latestData as Partial<LatestTroveData>
  const trove = trovesData as Partial<TrovesData>

  const interestBatchManager = requireAddress(
    trove.interestBatchManager,
    'trovesData.interestBatchManager'
  )

  return {
    troveId,
    collateral: requireBigInt(latest.entireColl, 'latestData.entireColl'),
    debt: requireBigInt(latest.entireDebt, 'latestData.entireDebt'),
    annualInterestRate: requireBigInt(latest.annualInterestRate, 'latestData.annualInterestRate'),
    status: mapTroveStatus(requireNonNegativeInteger(trove.status, 'trovesData.status')),
    interestBatchManager:
      interestBatchManager.toLowerCase() === zeroAddress ? null : interestBatchManager,
    lastDebtUpdateTime: requireNonNegativeInteger(
      trove.lastDebtUpdateTime,
      'trovesData.lastDebtUpdateTime'
    ),
    lastInterestRateAdjTime: requireNonNegativeInteger(
      latest.lastInterestRateAdjTime,
      'latestData.lastInterestRateAdjTime'
    ),
    redistBoldDebtGain: requireBigInt(latest.redistBoldDebtGain, 'latestData.redistBoldDebtGain'),
    redistCollGain: requireBigInt(latest.redistCollGain, 'latestData.redistCollGain'),
    accruedInterest: requireBigInt(latest.accruedInterest, 'latestData.accruedInterest'),
    recordedDebt: requireBigInt(latest.recordedDebt, 'latestData.recordedDebt'),
    accruedBatchManagementFee: requireBigInt(
      latest.accruedBatchManagementFee,
      'latestData.accruedBatchManagementFee'
    ),
  }
}
