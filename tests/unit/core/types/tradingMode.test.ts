import { TradingMode, isTradingEnabled } from '../../../../src/core/types'

/**
 * Unit tests for TradingMode enum and isTradingEnabled helper
 *
 * The BreakerBox uses a bitmask approach where:
 * - 0 = Bidirectional (trading enabled)
 * - Any non-zero value = Trading suspended
 */
describe('TradingMode', () => {
  describe('enum values', () => {
    it('should have BIDIRECTIONAL = 0', () => {
      expect(TradingMode.BIDIRECTIONAL).toBe(0)
    })

    it('should have SUSPENDED = 1', () => {
      expect(TradingMode.SUSPENDED).toBe(1)
    })
  })

  describe('isTradingEnabled()', () => {
    it('should return true for mode 0 (BIDIRECTIONAL)', () => {
      expect(isTradingEnabled(0)).toBe(true)
      expect(isTradingEnabled(TradingMode.BIDIRECTIONAL)).toBe(true)
    })

    it('should return false for mode 1 (SUSPENDED)', () => {
      expect(isTradingEnabled(1)).toBe(false)
      expect(isTradingEnabled(TradingMode.SUSPENDED)).toBe(false)
    })

    it('should return false for any non-zero bitmask value', () => {
      // BreakerBox uses bitmask - values 1, 2, 3 are all possible
      expect(isTradingEnabled(2)).toBe(false)
      expect(isTradingEnabled(3)).toBe(false)
    })

    it('should handle large bitmask values', () => {
      // Edge case: any non-zero should be treated as suspended
      expect(isTradingEnabled(255)).toBe(false)
    })
  })
})
