import {
  calculateDebtSuggestions,
  calculateMaxDebt,
  getLiquidationPrice,
  getLiquidationRisk,
  getLoanDetails,
  getLtv,
  getRedemptionRisk,
} from '../../../../src/services/borrow/borrowMath'

const WAD = 10n ** 18n

describe('borrowMath', () => {
  describe('getRedemptionRisk', () => {
    it('returns null when total debt is zero', () => {
      expect(getRedemptionRisk(1n, 0n)).toBeNull()
    })

    it('matches threshold behavior near medium and low boundaries', () => {
      // 0.05005 > 0.05 => medium
      expect(getRedemptionRisk(50050n, 1_000_000n)).toBe('medium')
      // 0.600001 > 0.60 => low
      expect(getRedemptionRisk(600001n, 1_000_000n)).toBe('low')
      // exactly 0.05 => high (strict > comparison)
      expect(getRedemptionRisk(50_000n, 1_000_000n)).toBe('high')
      // exactly 0.60 => medium (strict > comparison)
      expect(getRedemptionRisk(600_000n, 1_000_000n)).toBe('medium')
    })
  })

  describe('getLiquidationRisk', () => {
    it('classifies risk around boundaries with strict greater-than checks', () => {
      const maxLtv = WAD
      const mediumBoundary = 540_000_000_000_000_000n // 54%
      const highBoundary = 730_000_000_000_000_000n // 73%

      expect(getLiquidationRisk(mediumBoundary, maxLtv)).toBe('low')
      expect(getLiquidationRisk(mediumBoundary + 1n, maxLtv)).toBe('medium')
      expect(getLiquidationRisk(highBoundary, maxLtv)).toBe('medium')
      expect(getLiquidationRisk(highBoundary + 1n, maxLtv)).toBe('high')
    })
  })

  describe('getLiquidationPrice', () => {
    it('returns null for invalid mcr (<= 1)', () => {
      expect(getLiquidationPrice(2n * WAD, 1n * WAD, WAD)).toBeNull()
    })

    it('computes liquidation price for valid inputs', () => {
      // (1e18 * 1.1e18) / 2e18 = 0.55e18
      expect(getLiquidationPrice(2n * WAD, 1n * WAD, 1_100_000_000_000_000_000n)).toBe(
        550_000_000_000_000_000n
      )
    })
  })

  describe('calculateDebtSuggestions', () => {
    it('returns standard suggestions at 30/60/80% of max debt', () => {
      const maxDebt = 1_000n * WAD
      const minDebt = 200n * WAD
      const suggestions = calculateDebtSuggestions(maxDebt, minDebt)

      expect(suggestions).toEqual([
        {
          amount: 300n * WAD,
          ltv: 300_000_000_000_000_000n,
          risk: 'low',
        },
        {
          amount: 600n * WAD,
          ltv: 600_000_000_000_000_000n,
          risk: 'medium',
        },
        {
          amount: 800n * WAD,
          ltv: 800_000_000_000_000_000n,
          risk: 'high',
        },
      ])
    })

    it('clamps first suggestion to min debt and skips later suggestions below min debt', () => {
      const maxDebt = 400n * WAD
      const minDebt = 250n * WAD
      const suggestions = calculateDebtSuggestions(maxDebt, minDebt)

      expect(suggestions).toEqual([
        {
          amount: 250n * WAD,
          ltv: 625_000_000_000_000_000n,
          risk: 'medium',
        },
        {
          amount: 320n * WAD,
          ltv: 800_000_000_000_000_000n,
          risk: 'high',
        },
      ])
    })

    it('drops suggestions that exceed maxLtv after min-debt clamping', () => {
      const maxDebt = 150n * WAD
      const minDebt = 200n * WAD
      expect(calculateDebtSuggestions(maxDebt, minDebt)).toEqual([])
    })

    it('returns empty list when maxDebt is non-positive', () => {
      expect(calculateDebtSuggestions(0n, 1n)).toEqual([])
    })
  })

  describe('getLtv', () => {
    it('returns null when collateralUsd is zero', () => {
      // collateral=1, price=0 → collateralUsd=0 → null
      expect(getLtv(WAD, WAD, 0n)).toBeNull()
      // collateral=0 → collateralUsd=0 → null
      expect(getLtv(0n, WAD, WAD)).toBeNull()
    })

    it('computes LTV for normal inputs', () => {
      // collateral=2e18, price=1e18, debt=1e18 → collateralUsd=2e18, ltv=0.5e18 (50%)
      expect(getLtv(2n * WAD, WAD, WAD)).toBe(WAD / 2n)
    })

    it('returns 1e18 when debt equals collateralUsd', () => {
      // collateral=1e18, price=1e18, debt=1e18 → collateralUsd=1e18, ltv=1e18 (100%)
      expect(getLtv(WAD, WAD, WAD)).toBe(WAD)
    })

    it('handles large collateral values', () => {
      // collateral=100e18, price=2e18, debt=50e18 → collateralUsd=200e18, ltv=0.25e18
      expect(getLtv(100n * WAD, 50n * WAD, 2n * WAD)).toBe(WAD / 4n)
    })
  })

  describe('calculateMaxDebt', () => {
    it('computes max debt from collateral USD and maxLtv', () => {
      // collateralUsd=100e18, maxLtv=0.9e18 → maxDebt=90e18
      const maxDebt = calculateMaxDebt(100n * WAD, (9n * WAD) / 10n)
      expect(maxDebt).toBe(90n * WAD)
    })

    it('returns zero when collateralUsd is zero', () => {
      expect(calculateMaxDebt(0n, WAD)).toBe(0n)
    })

    it('returns zero when maxLtv is zero', () => {
      expect(calculateMaxDebt(100n * WAD, 0n)).toBe(0n)
    })
  })

  describe('getLiquidationRisk (maxLtv = 0 edge case)', () => {
    it('returns low when maxLtv is zero', () => {
      expect(getLiquidationRisk(100n, 0n)).toBe('low')
    })
  })

  describe('getLoanDetails', () => {
    // MCR = 110% = 1.1e18
    const MCR = 1_100_000_000_000_000_000n
    // maxLtv = 1e18 * 1e18 / MCR ≈ 909090909090909090n
    const maxLtv = (WAD * WAD) / MCR

    it('returns all nulls (except maxLtv-derived) when collateral/debt are null', () => {
      const result = getLoanDetails(null, null, null, null, MCR)

      expect(result.collateral).toBeNull()
      expect(result.collateralUsd).toBeNull()
      expect(result.debt).toBeNull()
      expect(result.ltv).toBeNull()
      expect(result.status).toBeNull()
      expect(result.liquidationRisk).toBeNull()
      expect(result.liquidationPrice).toBeNull()
      expect(result.maxDebt).toBeNull()
      expect(result.maxDebtAllowed).toBeNull()
      // maxLtv and maxLtvAllowed are always computed from mcr
      expect(result.maxLtv).toBe(maxLtv)
    })

    it('returns healthy status for a well-collateralised loan', () => {
      // collateral=2 ETH at $1500, debt=$300 → ~10% LTV, well below 83% allowed
      const collateral = 2n * WAD
      const price = 1500n * WAD
      const debt = 300n * WAD

      const result = getLoanDetails(collateral, debt, 5n * WAD / 100n, price, MCR)

      expect(result.status).toBe('healthy')
      expect(result.ltv).not.toBeNull()
      expect(result.liquidationRisk).toBe('low')
    })

    it('returns at-risk status when ltv is between maxLtvAllowed and maxLtv', () => {
      // maxLtvAllowed ≈ 83.3% of 100% ≈ 83.3%
      // maxLtv ≈ 90.9%
      // Choose ltv ≈ 87%, which is > maxLtvAllowed but < maxLtv
      // collateral=1, price=1, debt=0.87e18
      const result = getLoanDetails(WAD, 87n * WAD / 100n, 0n, WAD, MCR)

      expect(result.status).toBe('at-risk')
      expect(result.liquidationRisk).toBeDefined()
    })

    it('returns liquidatable status when ltv exceeds maxLtv', () => {
      // ltv > maxLtv: collateral=1, price=1, debt=0.95e18 (95% LTV > 90.9% maxLtv)
      const result = getLoanDetails(WAD, 95n * WAD / 100n, 0n, WAD, MCR)

      expect(result.status).toBe('liquidatable')
    })

    it('returns underwater status when collateral is negative', () => {
      const result = getLoanDetails(-1n, 100n * WAD, 0n, WAD, MCR)

      expect(result.status).toBe('underwater')
      expect(result.ltv).toBe(WAD) // DECIMAL_PRECISION
    })

    it('returns null ltv when collateralUsd is zero', () => {
      // collateral exists but price=0 → collateralUsd=null... actually collPrice=0 makes collateralUsd=0
      const result = getLoanDetails(WAD, WAD, 0n, 0n, MCR)

      // collateralUsd = 0 (collateral * 0 / WAD = 0), so ltv = null (not > 0)
      expect(result.collateralUsd).toBe(0n)
      expect(result.ltv).toBeNull()
      expect(result.status).toBeNull()
      expect(result.maxDebtAllowed).toBeNull() // collateralUsd not > 0
    })

    it('returns null ltv and status when debt is null', () => {
      const result = getLoanDetails(WAD, null, null, WAD, MCR)

      expect(result.ltv).toBeNull()
      expect(result.status).toBeNull()
      expect(result.collateralUsd).toBe(WAD) // collateral=1 at price=1
      expect(result.maxDebt).not.toBeNull() // can compute from collateralUsd
    })

    it('returns null collateralUsd when collPrice is null', () => {
      const result = getLoanDetails(WAD, null, null, null, MCR)

      expect(result.collateralUsd).toBeNull()
      expect(result.maxDebt).toBeNull()
      expect(result.maxDebtAllowed).toBeNull()
    })

    it('computes liquidation price when collateral and debt are positive', () => {
      const result = getLoanDetails(2n * WAD, WAD, 0n, WAD, MCR)

      // liquidationPrice = (debt * mcr) / collateral = (1e18 * 1.1e18) / 2e18 = 0.55e18
      expect(result.liquidationPrice).toBe(550_000_000_000_000_000n)
    })

    it('returns null liquidationPrice when collateral or debt is null', () => {
      const resultNoDebt = getLoanDetails(WAD, null, null, WAD, MCR)
      expect(resultNoDebt.liquidationPrice).toBeNull()

      const resultNoColl = getLoanDetails(null, WAD, null, WAD, MCR)
      expect(resultNoColl.liquidationPrice).toBeNull()
    })

    it('passes through interestRate as-is', () => {
      const interestRate = 50_000_000_000_000_000n // 5%
      const result = getLoanDetails(WAD, WAD / 2n, interestRate, WAD, MCR)
      expect(result.interestRate).toBe(interestRate)
    })
  })
})
