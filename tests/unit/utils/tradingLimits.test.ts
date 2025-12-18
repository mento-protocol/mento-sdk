import {
  computeLimitId,
  calculateTradingLimitsV1,
  calculateTradingLimitsV2,
  hasConfiguredLimitsV1,
  hasConfiguredLimitsV2,
} from '../../../src/utils/tradingLimits'
import type {
  TradingLimitsConfigV1,
  TradingLimitsStateV1,
  TradingLimitsConfigV2,
  TradingLimitsStateV2,
} from '../../../src/core/types'

describe('tradingLimits utilities', () => {
  describe('computeLimitId()', () => {
    it('should compute correct limit ID by XORing exchangeId and token', () => {
      // Simple test case with known values
      const exchangeId = '0x0000000000000000000000000000000000000000000000000000000000000001'
      const token = '0x0000000000000000000000000000000000000002'

      const result = computeLimitId(exchangeId, token)

      // XOR of 1 and 2 = 3
      expect(result).toBe('0x0000000000000000000000000000000000000000000000000000000000000003')
    })

    it('should handle real-world addresses', () => {
      const exchangeId = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
      const token = '0x471EcE3750Da237f93B8E339c536989b8978a438' // CELO token

      const result = computeLimitId(exchangeId, token)

      expect(result).toMatch(/^0x[0-9a-f]{64}$/i)
      expect(result.length).toBe(66) // 0x + 64 hex chars
    })

    it('should be deterministic', () => {
      const exchangeId = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
      const token = '0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73'

      const result1 = computeLimitId(exchangeId, token)
      const result2 = computeLimitId(exchangeId, token)

      expect(result1).toBe(result2)
    })

    it('should produce different IDs for different tokens', () => {
      const exchangeId = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
      const token1 = '0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73'
      const token2 = '0x471EcE3750Da237f93B8E339c536989b8978a438'

      const result1 = computeLimitId(exchangeId, token1)
      const result2 = computeLimitId(exchangeId, token2)

      expect(result1).not.toBe(result2)
    })
  })

  describe('hasConfiguredLimitsV1()', () => {
    it('should return false when flags is 0', () => {
      const config: TradingLimitsConfigV1 = {
        timestep0: 300,
        timestep1: 86400,
        limit0: 1000n,
        limit1: 10000n,
        limitGlobal: 100000n,
        flags: 0,
      }

      expect(hasConfiguredLimitsV1(config)).toBe(false)
    })

    it('should return true when any flag bit is set', () => {
      const config: TradingLimitsConfigV1 = {
        timestep0: 300,
        timestep1: 86400,
        limit0: 1000n,
        limit1: 10000n,
        limitGlobal: 100000n,
        flags: 1, // L0 enabled
      }

      expect(hasConfiguredLimitsV1(config)).toBe(true)
    })
  })

  describe('hasConfiguredLimitsV2()', () => {
    it('should return false when both limits are 0', () => {
      const config: TradingLimitsConfigV2 = {
        limit0: 0n,
        limit1: 0n,
        decimals: 18,
      }

      expect(hasConfiguredLimitsV2(config)).toBe(false)
    })

    it('should return true when limit0 > 0', () => {
      const config: TradingLimitsConfigV2 = {
        limit0: 1000n,
        limit1: 0n,
        decimals: 18,
      }

      expect(hasConfiguredLimitsV2(config)).toBe(true)
    })

    it('should return true when limit1 > 0', () => {
      const config: TradingLimitsConfigV2 = {
        limit0: 0n,
        limit1: 1000n,
        decimals: 18,
      }

      expect(hasConfiguredLimitsV2(config)).toBe(true)
    })
  })

  describe('calculateTradingLimitsV1()', () => {
    const asset = '0xToken1234567890123456789012345678901234'

    it('should return empty array when no flags are set', () => {
      const config: TradingLimitsConfigV1 = {
        timestep0: 300,
        timestep1: 86400,
        limit0: 1000n,
        limit1: 10000n,
        limitGlobal: 100000n,
        flags: 0,
      }

      const state: TradingLimitsStateV1 = {
        lastUpdated0: Math.floor(Date.now() / 1000) - 100,
        lastUpdated1: Math.floor(Date.now() / 1000) - 100,
        netflow0: 0n,
        netflow1: 0n,
        netflowGlobal: 0n,
      }

      const result = calculateTradingLimitsV1(config, state, asset, 18)

      expect(result).toEqual([])
    })

    it('should calculate L0 limits when flag bit 0 is set', () => {
      const nowEpoch = Math.floor(Date.now() / 1000)

      const config: TradingLimitsConfigV1 = {
        timestep0: 300,
        timestep1: 86400,
        limit0: 1000n,
        limit1: 0n,
        limitGlobal: 0n,
        flags: 1, // Only L0 enabled
      }

      const state: TradingLimitsStateV1 = {
        lastUpdated0: nowEpoch - 100, // 100 seconds ago (within window)
        lastUpdated1: 0,
        netflow0: 200n, // Some netflow
        netflow1: 0n,
        netflowGlobal: 0n,
      }

      const result = calculateTradingLimitsV1(config, state, asset, 18)

      expect(result.length).toBe(1)
      expect(result[0].asset).toBe(asset)
      expect(result[0].maxIn).toBe(800n) // 1000 - 200
      expect(result[0].maxOut).toBe(1200n) // 1000 + 200
      expect(result[0].decimals).toBe(18)
    })

    it('should reset netflow when time window has passed', () => {
      const nowEpoch = Math.floor(Date.now() / 1000)

      const config: TradingLimitsConfigV1 = {
        timestep0: 300, // 5 minutes
        timestep1: 0,
        limit0: 1000n,
        limit1: 0n,
        limitGlobal: 0n,
        flags: 1,
      }

      const state: TradingLimitsStateV1 = {
        lastUpdated0: nowEpoch - 600, // 10 minutes ago (window expired)
        lastUpdated1: 0,
        netflow0: 500n, // Should be reset to 0
        netflow1: 0n,
        netflowGlobal: 0n,
      }

      const result = calculateTradingLimitsV1(config, state, asset, 18)

      expect(result.length).toBe(1)
      expect(result[0].maxIn).toBe(1000n) // Full limit since netflow reset
      expect(result[0].maxOut).toBe(1000n)
    })

    it('should calculate all three limits when all flags set', () => {
      const nowEpoch = Math.floor(Date.now() / 1000)

      const config: TradingLimitsConfigV1 = {
        timestep0: 300,
        timestep1: 86400,
        limit0: 1000n,
        limit1: 10000n,
        limitGlobal: 100000n,
        flags: 7, // All enabled (0b111)
      }

      const state: TradingLimitsStateV1 = {
        lastUpdated0: nowEpoch - 100,
        lastUpdated1: nowEpoch - 1000,
        netflow0: 0n,
        netflow1: 0n,
        netflowGlobal: 0n,
      }

      const result = calculateTradingLimitsV1(config, state, asset, 18)

      expect(result.length).toBe(3)
    })

    it('should apply cascading restrictions from larger to smaller windows', () => {
      const nowEpoch = Math.floor(Date.now() / 1000)

      const config: TradingLimitsConfigV1 = {
        timestep0: 300,
        timestep1: 86400,
        limit0: 1000n,
        limit1: 500n, // Smaller than L0 (after netflow)
        limitGlobal: 0n,
        flags: 3, // L0 and L1 enabled
      }

      const state: TradingLimitsStateV1 = {
        lastUpdated0: nowEpoch - 100,
        lastUpdated1: nowEpoch - 1000,
        netflow0: 0n,
        netflow1: 400n, // L1 maxIn = 500 - 400 = 100
        netflowGlobal: 0n,
      }

      const result = calculateTradingLimitsV1(config, state, asset, 18)

      expect(result.length).toBe(2)
      // L0 should be restricted by L1's lower maxIn
      expect(result[0].maxIn).toBe(100n) // min(1000, 100) = 100
    })
  })

  describe('calculateTradingLimitsV2()', () => {
    const asset = '0xToken1234567890123456789012345678901234'

    it('should return empty array when no limits configured', () => {
      const config: TradingLimitsConfigV2 = {
        limit0: 0n,
        limit1: 0n,
        decimals: 18,
      }

      const state: TradingLimitsStateV2 = {
        lastUpdated0: 0,
        lastUpdated1: 0,
        netflow0: 0n,
        netflow1: 0n,
      }

      const result = calculateTradingLimitsV2(config, state, asset)

      expect(result).toEqual([])
    })

    it('should calculate L0 limits with 5-minute fixed window', () => {
      const nowEpoch = Math.floor(Date.now() / 1000)

      const config: TradingLimitsConfigV2 = {
        limit0: 1000000000000000000n, // 1 token at 15 decimals
        limit1: 0n,
        decimals: 18,
      }

      const state: TradingLimitsStateV2 = {
        lastUpdated0: nowEpoch - 100, // Within 5 min window
        lastUpdated1: 0,
        netflow0: 200000000000000000n,
        netflow1: 0n,
      }

      const result = calculateTradingLimitsV2(config, state, asset)

      expect(result.length).toBe(1)
      expect(result[0].maxIn).toBe(800000000000000000n)
      expect(result[0].maxOut).toBe(1200000000000000000n)
      expect(result[0].decimals).toBe(15) // V2 always returns 15 decimals
      expect(result[0].until).toBe(state.lastUpdated0 + 300) // 5 min window
    })

    it('should calculate L1 limits with 1-day fixed window', () => {
      const nowEpoch = Math.floor(Date.now() / 1000)

      const config: TradingLimitsConfigV2 = {
        limit0: 0n,
        limit1: 10000000000000000000n, // 10 tokens at 15 decimals
        decimals: 18,
      }

      const state: TradingLimitsStateV2 = {
        lastUpdated0: 0,
        lastUpdated1: nowEpoch - 3600, // Within 1 day window
        netflow0: 0n,
        netflow1: 1000000000000000000n,
      }

      const result = calculateTradingLimitsV2(config, state, asset)

      expect(result.length).toBe(1)
      expect(result[0].until).toBe(state.lastUpdated1 + 86400) // 1 day window
    })

    it('should reset netflow when L0 window has passed', () => {
      const nowEpoch = Math.floor(Date.now() / 1000)

      const config: TradingLimitsConfigV2 = {
        limit0: 1000n,
        limit1: 0n,
        decimals: 18,
      }

      const state: TradingLimitsStateV2 = {
        lastUpdated0: nowEpoch - 600, // 10 minutes ago (window expired)
        lastUpdated1: 0,
        netflow0: 500n, // Should be reset
        netflow1: 0n,
      }

      const result = calculateTradingLimitsV2(config, state, asset)

      expect(result[0].maxIn).toBe(1000n) // Full limit
      expect(result[0].maxOut).toBe(1000n)
    })
  })
})
