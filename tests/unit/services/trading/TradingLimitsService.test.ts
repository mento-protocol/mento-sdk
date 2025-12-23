import { TradingLimitsService } from '../../../../src/services/trading/TradingLimitsService'
import { PoolType } from '../../../../src/core/types'
import type { Pool } from '../../../../src/core/types'
import type { PublicClient } from 'viem'
import { ChainId } from '../../../../src/core/constants'

/**
 * Unit tests for TradingLimitsService
 *
 * Tests trading limit queries for both FPMM (V2) and Virtual (V1) pools.
 */
describe('TradingLimitsService', () => {
  let mockPublicClient: jest.Mocked<PublicClient>
  let service: TradingLimitsService

  // Mock addresses (valid hex)
  const MOCK_POOL_FPMM = '0x1111111111111111111111111111111111111111'
  const MOCK_POOL_VIRTUAL = '0x2222222222222222222222222222222222222222'
  const TOKEN_A = '0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
  const TOKEN_B = '0xBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB'
  const EXCHANGE_ID = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'

  // Mock pool data
  const mockFPMMPool: Pool = {
    factoryAddr: '0x3333333333333333333333333333333333333333',
    poolAddr: MOCK_POOL_FPMM,
    token0: TOKEN_A,
    token1: TOKEN_B,
    poolType: PoolType.FPMM,
  }

  const mockVirtualPool: Pool = {
    factoryAddr: '0x4444444444444444444444444444444444444444',
    poolAddr: MOCK_POOL_VIRTUAL,
    token0: TOKEN_A,
    token1: TOKEN_B,
    poolType: PoolType.Virtual,
    exchangeId: EXCHANGE_ID,
  }

  beforeEach(() => {
    mockPublicClient = {
      readContract: jest.fn(),
    } as unknown as jest.Mocked<PublicClient>

    service = new TradingLimitsService(mockPublicClient, ChainId.CELO)
  })

  describe('getPoolTradingLimits() - FPMM pools', () => {
    it('should return trading limits for both tokens in FPMM pool', async () => {
      const nowEpoch = Math.floor(Date.now() / 1000)

      // Mock getTradingLimits calls for both tokens
      mockPublicClient.readContract.mockImplementation(async ({ functionName, args }) => {
        if (functionName === 'getTradingLimits') {
          return [
            { limit0: 1000n, limit1: 10000n, decimals: 18 }, // config
            {
              lastUpdated0: nowEpoch - 100,
              lastUpdated1: nowEpoch - 1000,
              netflow0: 0n,
              netflow1: 0n,
            }, // state
          ]
        }
        return null
      })

      const limits = await service.getPoolTradingLimits(mockFPMMPool)

      // Should have limits for both tokens (2 limits each = L0 and L1)
      expect(limits.length).toBe(4)
      expect(mockPublicClient.readContract).toHaveBeenCalledTimes(2)
    })

    it('should return empty array when no limits configured for FPMM', async () => {
      // Mock no limits configured
      mockPublicClient.readContract.mockResolvedValue([
        { limit0: 0n, limit1: 0n, decimals: 18 }, // config with no limits
        { lastUpdated0: 0, lastUpdated1: 0, netflow0: 0n, netflow1: 0n },
      ])

      const limits = await service.getPoolTradingLimits(mockFPMMPool)

      expect(limits).toEqual([])
    })

    it('should handle errors gracefully for FPMM', async () => {
      mockPublicClient.readContract.mockRejectedValue(new Error('Contract call failed'))

      const limits = await service.getPoolTradingLimits(mockFPMMPool)

      expect(limits).toEqual([])
    })
  })

  describe('getPoolTradingLimits() - Virtual pools', () => {
    it('should return trading limits using Broker contract', async () => {
      const nowEpoch = Math.floor(Date.now() / 1000)

      mockPublicClient.readContract.mockImplementation(async ({ functionName }) => {
        if (functionName === 'tradingLimitsConfig') {
          // V1 config: [timestep0, timestep1, limit0, limit1, limitGlobal, flags]
          return [300, 86400, 1000n, 10000n, 100000n, 3] // L0 and L1 enabled
        }
        if (functionName === 'tradingLimitsState') {
          // V1 state: [lastUpdated0, lastUpdated1, netflow0, netflow1, netflowGlobal]
          return [nowEpoch - 100, nowEpoch - 1000, 0n, 0n, 0n]
        }
        return null
      })

      const limits = await service.getPoolTradingLimits(mockVirtualPool)

      // Should have limits for both tokens (2 limits each = L0 and L1)
      expect(limits.length).toBe(4)
    })

    it('should warn and return empty when Virtual pool missing exchangeId', async () => {
      const poolWithoutExchangeId: Pool = {
        ...mockVirtualPool,
        exchangeId: undefined,
      }

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

      const limits = await service.getPoolTradingLimits(poolWithoutExchangeId)

      expect(limits).toEqual([])
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('missing exchangeId')
      )

      consoleSpy.mockRestore()
    })

    it('should return empty array when no limits configured for Virtual', async () => {
      mockPublicClient.readContract.mockImplementation(async ({ functionName }) => {
        if (functionName === 'tradingLimitsConfig') {
          return [300, 86400, 1000n, 10000n, 100000n, 0] // flags = 0, no limits
        }
        if (functionName === 'tradingLimitsState') {
          return [0, 0, 0n, 0n, 0n]
        }
        return null
      })

      const limits = await service.getPoolTradingLimits(mockVirtualPool)

      expect(limits).toEqual([])
    })

    it('should handle errors gracefully for Virtual', async () => {
      mockPublicClient.readContract.mockRejectedValue(new Error('Contract call failed'))

      const limits = await service.getPoolTradingLimits(mockVirtualPool)

      expect(limits).toEqual([])
    })
  })

  describe('getPoolTradingLimits() - limit calculation', () => {
    it('should calculate maxIn and maxOut based on netflow for FPMM', async () => {
      const nowEpoch = Math.floor(Date.now() / 1000)

      mockPublicClient.readContract.mockImplementation(async ({ args }) => {
        const token = args?.[0]
        if (token === TOKEN_A) {
          return [
            { limit0: 1000n, limit1: 0n, decimals: 18 },
            { lastUpdated0: nowEpoch - 100, lastUpdated1: 0, netflow0: 200n, netflow1: 0n },
          ]
        }
        // Token B has no limits
        return [
          { limit0: 0n, limit1: 0n, decimals: 18 },
          { lastUpdated0: 0, lastUpdated1: 0, netflow0: 0n, netflow1: 0n },
        ]
      })

      const limits = await service.getPoolTradingLimits(mockFPMMPool)

      // Only TOKEN_A has limits
      expect(limits.length).toBe(1)
      expect(limits[0].asset).toBe(TOKEN_A)
      expect(limits[0].maxIn).toBe(800n) // 1000 - 200
      expect(limits[0].maxOut).toBe(1200n) // 1000 + 200
    })

    it('should include until timestamp based on time window', async () => {
      const nowEpoch = Math.floor(Date.now() / 1000)
      const lastUpdated = nowEpoch - 100

      mockPublicClient.readContract.mockImplementation(async ({ args }) => {
        const token = args?.[0]
        if (token === TOKEN_A) {
          return [
            { limit0: 1000n, limit1: 0n, decimals: 18 },
            { lastUpdated0: lastUpdated, lastUpdated1: 0, netflow0: 0n, netflow1: 0n },
          ]
        }
        return [
          { limit0: 0n, limit1: 0n, decimals: 18 },
          { lastUpdated0: 0, lastUpdated1: 0, netflow0: 0n, netflow1: 0n },
        ]
      })

      const limits = await service.getPoolTradingLimits(mockFPMMPool)

      expect(limits[0].until).toBe(lastUpdated + 300) // L0 = 5 min window
    })
  })
})
