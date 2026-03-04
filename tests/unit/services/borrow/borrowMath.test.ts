import {
  calculateDebtSuggestions,
  getLiquidationPrice,
  getLiquidationRisk,
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
})
