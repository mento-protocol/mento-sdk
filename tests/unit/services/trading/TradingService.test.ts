import { TradingService } from '../../../../src/services/trading/TradingService'
import { TradingLimitsService } from '../../../../src/services/trading/TradingLimitsService'
import { RouteService } from '../../../../src/services/routes/RouteService'
import { TradingMode, PoolType, isTradingEnabled } from '../../../../src/core/types'
import type { Route, Pool, TradingLimit } from '../../../../src/core/types'
import type { PublicClient } from 'viem'
import { ChainId } from '../../../../src/core/constants'
import { RouteNotFoundError } from '../../../../src/core/errors'

/**
 * Unit tests for TradingService
 *
 * Tests circuit breaker checks for rate feeds, pairs, and routes.
 * The BreakerBox uses a bitmask approach where:
 * - 0 = Bidirectional (trading enabled)
 * - Any non-zero value = Trading suspended
 */
describe('TradingService', () => {
  let mockPublicClient: jest.Mocked<PublicClient>
  let mockRouteService: jest.Mocked<RouteService>
  let service: TradingService

  // Mock addresses
  const MOCK_BREAKERBOX = '0x303ED1df62Fa067659B586EbEe8De0EcE824Ab39'
  const MOCK_RATE_FEED_1 = '0xRateFeed1000000000000000000000000000000'
  const MOCK_RATE_FEED_2 = '0xRateFeed2000000000000000000000000000000'
  const MOCK_POOL_1 = '0xPool1000000000000000000000000000000000000'
  const MOCK_POOL_2 = '0xPool2000000000000000000000000000000000000'
  const TOKEN_A = '0xTokenA00000000000000000000000000000000000'
  const TOKEN_B = '0xTokenB00000000000000000000000000000000000'
  const TOKEN_C = '0xTokenC00000000000000000000000000000000000'

  // Mock pool data
  const mockPool1: Pool = {
    factoryAddr: '0xFactory1',
    poolAddr: MOCK_POOL_1,
    token0: TOKEN_A,
    token1: TOKEN_B,
    poolType: PoolType.FPMM,
  }

  const mockPool2: Pool = {
    factoryAddr: '0xFactory2',
    poolAddr: MOCK_POOL_2,
    token0: TOKEN_B,
    token1: TOKEN_C,
    poolType: PoolType.FPMM,
  }

  // Mock routes
  const mockDirectRoute: Route = {
    id: 'TokenA-TokenB',
    tokens: [
      { address: TOKEN_A, symbol: 'TokenA' },
      { address: TOKEN_B, symbol: 'TokenB' },
    ],
    path: [mockPool1],
  }

  const mockMultiHopRoute: Route = {
    id: 'TokenA-TokenC',
    tokens: [
      { address: TOKEN_A, symbol: 'TokenA' },
      { address: TOKEN_C, symbol: 'TokenC' },
    ],
    path: [mockPool1, mockPool2],
  }

  beforeEach(() => {
    mockPublicClient = {
      readContract: jest.fn(),
    } as unknown as jest.Mocked<PublicClient>

    mockRouteService = {
      findRoute: jest.fn(),
    } as unknown as jest.Mocked<RouteService>

    service = new TradingService(mockPublicClient, ChainId.CELO, mockRouteService)
  })

  describe('getRateFeedTradingMode()', () => {
    it('should return 0 (BIDIRECTIONAL) when trading is enabled', async () => {
      mockPublicClient.readContract.mockResolvedValue(0)

      const mode = await service.getRateFeedTradingMode(MOCK_RATE_FEED_1)

      expect(mode).toBe(0)
      expect(mode).toBe(TradingMode.BIDIRECTIONAL)
      expect(isTradingEnabled(mode)).toBe(true)
      expect(mockPublicClient.readContract).toHaveBeenCalledWith(
        expect.objectContaining({
          functionName: 'getRateFeedTradingMode',
          args: [MOCK_RATE_FEED_1],
        })
      )
    })

    it('should return non-zero when circuit breaker is tripped', async () => {
      mockPublicClient.readContract.mockResolvedValue(1)

      const mode = await service.getRateFeedTradingMode(MOCK_RATE_FEED_1)

      expect(mode).toBe(1)
      expect(isTradingEnabled(mode)).toBe(false)
    })

    it('should handle bitmask values (e.g., 2 or 3)', async () => {
      // BreakerBox uses bitmask - values like 2, 3 are possible
      mockPublicClient.readContract.mockResolvedValue(2)

      const mode = await service.getRateFeedTradingMode(MOCK_RATE_FEED_1)

      expect(mode).toBe(2)
      expect(isTradingEnabled(mode)).toBe(false)
    })

    it('should call BreakerBox contract on correct chain', async () => {
      mockPublicClient.readContract.mockResolvedValue(0)

      await service.getRateFeedTradingMode(MOCK_RATE_FEED_1)

      expect(mockPublicClient.readContract).toHaveBeenCalledWith(
        expect.objectContaining({
          address: MOCK_BREAKERBOX,
        })
      )
    })
  })

  describe('isPairTradable()', () => {
    it('should return true when direct route rate feed is enabled (0)', async () => {
      mockRouteService.findRoute.mockResolvedValue(mockDirectRoute)
      mockPublicClient.readContract.mockImplementation(async ({ functionName }) => {
        if (functionName === 'referenceRateFeedID') return MOCK_RATE_FEED_1
        if (functionName === 'getRateFeedTradingMode') return 0 // enabled
        return null
      })

      const isTradable = await service.isPairTradable(TOKEN_A, TOKEN_B)

      expect(isTradable).toBe(true)
    })

    it('should return false when direct route rate feed is suspended (1)', async () => {
      mockRouteService.findRoute.mockResolvedValue(mockDirectRoute)
      mockPublicClient.readContract.mockImplementation(async ({ functionName }) => {
        if (functionName === 'referenceRateFeedID') return MOCK_RATE_FEED_1
        if (functionName === 'getRateFeedTradingMode') return 1 // suspended
        return null
      })

      const isTradable = await service.isPairTradable(TOKEN_A, TOKEN_B)

      expect(isTradable).toBe(false)
    })

    it('should return false when direct route rate feed is suspended (any non-zero)', async () => {
      mockRouteService.findRoute.mockResolvedValue(mockDirectRoute)
      mockPublicClient.readContract.mockImplementation(async ({ functionName }) => {
        if (functionName === 'referenceRateFeedID') return MOCK_RATE_FEED_1
        if (functionName === 'getRateFeedTradingMode') return 3 // bitmask combined value
        return null
      })

      const isTradable = await service.isPairTradable(TOKEN_A, TOKEN_B)

      expect(isTradable).toBe(false)
    })

    it('should throw RouteNotFoundError when route does not exist', async () => {
      mockRouteService.findRoute.mockRejectedValue(
        new RouteNotFoundError(TOKEN_A, TOKEN_C)
      )

      await expect(service.isPairTradable(TOKEN_A, TOKEN_C)).rejects.toThrow(
        RouteNotFoundError
      )
    })
  })

  describe('isRouteTradable()', () => {
    it('should return true when all hops have enabled rate feeds (0)', async () => {
      mockPublicClient.readContract.mockImplementation(
        async ({ functionName, address }) => {
          if (functionName === 'referenceRateFeedID') {
            return address === MOCK_POOL_1 ? MOCK_RATE_FEED_1 : MOCK_RATE_FEED_2
          }
          if (functionName === 'getRateFeedTradingMode') return 0 // enabled
          return null
        }
      )

      const isTradable = await service.isRouteTradable(mockMultiHopRoute)

      expect(isTradable).toBe(true)
    })

    it('should return false when any hop has suspended rate feed', async () => {
      mockPublicClient.readContract.mockImplementation(
        async ({ functionName, address, args }) => {
          if (functionName === 'referenceRateFeedID') {
            return address === MOCK_POOL_1 ? MOCK_RATE_FEED_1 : MOCK_RATE_FEED_2
          }
          if (functionName === 'getRateFeedTradingMode') {
            const rateFeedId = args?.[0]
            // First rate feed is enabled, second is suspended
            return rateFeedId === MOCK_RATE_FEED_1 ? 0 : 1
          }
          return null
        }
      )

      const isTradable = await service.isRouteTradable(mockMultiHopRoute)

      expect(isTradable).toBe(false)
    })

    it('should check all pools in multi-hop route', async () => {
      const referenceRateFeedIDCalls: string[] = []
      const tradingModeCalls: string[] = []

      mockPublicClient.readContract.mockImplementation(
        async ({ functionName, address, args }) => {
          if (functionName === 'referenceRateFeedID') {
            referenceRateFeedIDCalls.push(address as string)
            return address === MOCK_POOL_1 ? MOCK_RATE_FEED_1 : MOCK_RATE_FEED_2
          }
          if (functionName === 'getRateFeedTradingMode') {
            tradingModeCalls.push(args?.[0] as string)
            return 0 // enabled
          }
          return null
        }
      )

      await service.isRouteTradable(mockMultiHopRoute)

      // Should have checked both pools
      expect(referenceRateFeedIDCalls).toContain(MOCK_POOL_1)
      expect(referenceRateFeedIDCalls).toContain(MOCK_POOL_2)

      // Should have checked both rate feeds
      expect(tradingModeCalls).toContain(MOCK_RATE_FEED_1)
      expect(tradingModeCalls).toContain(MOCK_RATE_FEED_2)
    })

    it('should return true for single-hop route with enabled rate feed', async () => {
      mockPublicClient.readContract.mockImplementation(async ({ functionName }) => {
        if (functionName === 'referenceRateFeedID') return MOCK_RATE_FEED_1
        if (functionName === 'getRateFeedTradingMode') return 0 // enabled
        return null
      })

      const isTradable = await service.isRouteTradable(mockDirectRoute)

      expect(isTradable).toBe(true)
    })
  })

  describe('getPoolTradabilityStatus()', () => {
    let tradingLimitsServiceSpy: jest.SpyInstance

    const mockLimitWithCapacity: TradingLimit = {
      asset: TOKEN_A,
      maxIn: 1000n,
      maxOut: 1000n,
      until: 9999999999,
      decimals: 18,
    }

    const mockLimitExhaustedIn: TradingLimit = {
      asset: TOKEN_A,
      maxIn: 0n,
      maxOut: 1000n,
      until: 9999999999,
      decimals: 18,
    }

    const mockLimitExhaustedOut: TradingLimit = {
      asset: TOKEN_B,
      maxIn: 1000n,
      maxOut: 0n,
      until: 9999999999,
      decimals: 18,
    }

    beforeEach(() => {
      tradingLimitsServiceSpy = jest.spyOn(
        (service as unknown as { tradingLimitsService: TradingLimitsService }).tradingLimitsService,
        'getPoolTradingLimits'
      )
    })

    it('should return tradable=true when circuit breaker OK and no limits configured', async () => {
      tradingLimitsServiceSpy.mockResolvedValue([])
      mockPublicClient.readContract.mockImplementation(async ({ functionName }) => {
        if (functionName === 'referenceRateFeedID') return MOCK_RATE_FEED_1
        if (functionName === 'getRateFeedTradingMode') return TradingMode.BIDIRECTIONAL
        return null
      })

      const status = await service.getPoolTradabilityStatus(mockPool1)

      expect(status.tradable).toBe(true)
      expect(status.circuitBreakerOk).toBe(true)
      expect(status.limitsOk).toBe(true)
      expect(status.tradingMode).toBe(TradingMode.BIDIRECTIONAL)
      expect(status.limits).toEqual([])
    })

    it('should return tradable=true when circuit breaker OK and all limits have capacity', async () => {
      tradingLimitsServiceSpy.mockResolvedValue([mockLimitWithCapacity])
      mockPublicClient.readContract.mockImplementation(async ({ functionName }) => {
        if (functionName === 'referenceRateFeedID') return MOCK_RATE_FEED_1
        if (functionName === 'getRateFeedTradingMode') return TradingMode.BIDIRECTIONAL
        return null
      })

      const status = await service.getPoolTradabilityStatus(mockPool1)

      expect(status.tradable).toBe(true)
      expect(status.circuitBreakerOk).toBe(true)
      expect(status.limitsOk).toBe(true)
      expect(status.limits).toEqual([mockLimitWithCapacity])
    })

    it('should return tradable=false and circuitBreakerOk=false when circuit breaker tripped', async () => {
      tradingLimitsServiceSpy.mockResolvedValue([])
      mockPublicClient.readContract.mockImplementation(async ({ functionName }) => {
        if (functionName === 'referenceRateFeedID') return MOCK_RATE_FEED_1
        if (functionName === 'getRateFeedTradingMode') return TradingMode.SUSPENDED
        return null
      })

      const status = await service.getPoolTradabilityStatus(mockPool1)

      expect(status.tradable).toBe(false)
      expect(status.circuitBreakerOk).toBe(false)
      expect(status.limitsOk).toBe(true)
      expect(status.tradingMode).toBe(TradingMode.SUSPENDED)
    })

    it('should return tradable=false when circuit breaker tripped with bitmask value', async () => {
      tradingLimitsServiceSpy.mockResolvedValue([])
      mockPublicClient.readContract.mockImplementation(async ({ functionName }) => {
        if (functionName === 'referenceRateFeedID') return MOCK_RATE_FEED_1
        if (functionName === 'getRateFeedTradingMode') return 3 // bitmask: multiple breakers
        return null
      })

      const status = await service.getPoolTradabilityStatus(mockPool1)

      expect(status.tradable).toBe(false)
      expect(status.circuitBreakerOk).toBe(false)
      expect(status.tradingMode).toBe(3)
    })

    it('should return tradable=false and limitsOk=false when maxIn is exhausted', async () => {
      tradingLimitsServiceSpy.mockResolvedValue([mockLimitExhaustedIn])
      mockPublicClient.readContract.mockImplementation(async ({ functionName }) => {
        if (functionName === 'referenceRateFeedID') return MOCK_RATE_FEED_1
        if (functionName === 'getRateFeedTradingMode') return TradingMode.BIDIRECTIONAL
        return null
      })

      const status = await service.getPoolTradabilityStatus(mockPool1)

      expect(status.tradable).toBe(false)
      expect(status.circuitBreakerOk).toBe(true)
      expect(status.limitsOk).toBe(false)
    })

    it('should return tradable=false and limitsOk=false when maxOut is exhausted', async () => {
      tradingLimitsServiceSpy.mockResolvedValue([mockLimitExhaustedOut])
      mockPublicClient.readContract.mockImplementation(async ({ functionName }) => {
        if (functionName === 'referenceRateFeedID') return MOCK_RATE_FEED_1
        if (functionName === 'getRateFeedTradingMode') return TradingMode.BIDIRECTIONAL
        return null
      })

      const status = await service.getPoolTradabilityStatus(mockPool1)

      expect(status.tradable).toBe(false)
      expect(status.circuitBreakerOk).toBe(true)
      expect(status.limitsOk).toBe(false)
    })

    it('should return tradable=false when both circuit breaker tripped and limits exhausted', async () => {
      tradingLimitsServiceSpy.mockResolvedValue([mockLimitExhaustedIn])
      mockPublicClient.readContract.mockImplementation(async ({ functionName }) => {
        if (functionName === 'referenceRateFeedID') return MOCK_RATE_FEED_1
        if (functionName === 'getRateFeedTradingMode') return TradingMode.SUSPENDED
        return null
      })

      const status = await service.getPoolTradabilityStatus(mockPool1)

      expect(status.tradable).toBe(false)
      expect(status.circuitBreakerOk).toBe(false)
      expect(status.limitsOk).toBe(false)
    })

    it('should return limitsOk=false when any limit has zero maxIn even if others have capacity', async () => {
      tradingLimitsServiceSpy.mockResolvedValue([mockLimitWithCapacity, mockLimitExhaustedIn])
      mockPublicClient.readContract.mockImplementation(async ({ functionName }) => {
        if (functionName === 'referenceRateFeedID') return MOCK_RATE_FEED_1
        if (functionName === 'getRateFeedTradingMode') return TradingMode.BIDIRECTIONAL
        return null
      })

      const status = await service.getPoolTradabilityStatus(mockPool1)

      expect(status.tradable).toBe(false)
      expect(status.limitsOk).toBe(false)
    })

    it('should call getPoolRateFeedId and getPoolTradingLimits with the given pool', async () => {
      tradingLimitsServiceSpy.mockResolvedValue([])
      mockPublicClient.readContract.mockImplementation(async ({ functionName }) => {
        if (functionName === 'referenceRateFeedID') return MOCK_RATE_FEED_1
        if (functionName === 'getRateFeedTradingMode') return TradingMode.BIDIRECTIONAL
        return null
      })

      await service.getPoolTradabilityStatus(mockPool1)

      expect(tradingLimitsServiceSpy).toHaveBeenCalledWith(mockPool1)
      expect(mockPublicClient.readContract).toHaveBeenCalledWith(
        expect.objectContaining({
          address: mockPool1.poolAddr,
          functionName: 'referenceRateFeedID',
        })
      )
    })

    it('should return detailed limits array in the response', async () => {
      const multiLimits: TradingLimit[] = [mockLimitWithCapacity, { ...mockLimitWithCapacity, asset: TOKEN_B }]
      tradingLimitsServiceSpy.mockResolvedValue(multiLimits)
      mockPublicClient.readContract.mockImplementation(async ({ functionName }) => {
        if (functionName === 'referenceRateFeedID') return MOCK_RATE_FEED_1
        if (functionName === 'getRateFeedTradingMode') return TradingMode.BIDIRECTIONAL
        return null
      })

      const status = await service.getPoolTradabilityStatus(mockPool1)

      expect(status.limits).toEqual(multiLimits)
      expect(status.limits).toHaveLength(2)
    })
  })
})
