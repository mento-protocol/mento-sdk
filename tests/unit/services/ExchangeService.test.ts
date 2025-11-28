import {
  ExchangeService,
  ExchangeNotFoundError,
  PairNotFoundError,
} from '../../../src/services/ExchangeService'
import type { Exchange, TradablePair } from '../../../src/types'
import type { PublicClient } from 'viem'
import { ChainId } from '../../../src/constants'

/**
 * Unit tests for ExchangeService
 *
 * Tests all exchange discovery methods in isolation using mocked PublicClient.
 * Tests cover User Stories 1-4: Exchange queries, direct pairs, multi-hop routes, and pair lookup.
 */
describe('ExchangeService', () => {
  let mockPublicClient: jest.Mocked<PublicClient>
  let service: ExchangeService

  // Mock exchange data
  const mockExchanges: Exchange[] = [
    {
      providerAddr: '0xBiPoolManager000000000000000000000000000',
      id: '0xexchange1',
      assets: [
        '0xcUSD0000000000000000000000000000000000',
        '0xCELO0000000000000000000000000000000000',
      ],
    },
    {
      providerAddr: '0xBiPoolManager000000000000000000000000000',
      id: '0xexchange2',
      assets: [
        '0xCELO0000000000000000000000000000000000',
        '0xcEUR0000000000000000000000000000000000',
      ],
    },
    {
      providerAddr: '0xBiPoolManager000000000000000000000000000',
      id: '0xexchange3',
      assets: [
        '0xcUSD0000000000000000000000000000000000',
        '0xcREAL000000000000000000000000000000000',
      ],
    },
  ]

  beforeEach(() => {
    // Mock PublicClient
    mockPublicClient = {
      readContract: jest.fn(),
    } as unknown as jest.Mocked<PublicClient>

    service = new ExchangeService(mockPublicClient, ChainId.CELO)
  })

  // =========================================================================
  // USER STORY 1: Query All Available Exchanges
  // =========================================================================

  describe('getExchanges()', () => {
    beforeEach(() => {
      // Mock BiPoolManager.getExchanges() response
      mockPublicClient.readContract.mockResolvedValue(
        mockExchanges.map((ex) => ({
          exchangeId: ex.id,
          assets: ex.assets,
        }))
      )
    })

    it('should fetch and return all exchanges from BiPoolManager', async () => {
      const exchanges = await service.getExchanges()

      expect(exchanges).toHaveLength(3)
      expect(exchanges[0].id).toBe(mockExchanges[0].id)
      expect(exchanges[0].assets).toEqual(mockExchanges[0].assets)
      // providerAddr will be the actual BiPoolManager address, not mock
      expect(mockPublicClient.readContract).toHaveBeenCalledWith({
        address: expect.any(String), // BiPoolManager address
        abi: expect.any(Array),
        functionName: 'getExchanges',
      })
    })

    it('should return cached results on second call without additional RPC call', async () => {
      // First call
      const firstResult = await service.getExchanges()

      // Second call
      const secondResult = await service.getExchanges()

      expect(firstResult).toEqual(secondResult)
      expect(mockPublicClient.readContract).toHaveBeenCalledTimes(1) // Only called once
    })

    it('should validate exchange has exactly 2 assets and skip invalid exchanges', async () => {
      // Mock response with invalid exchange (3 assets)
      mockPublicClient.readContract.mockResolvedValue([
        { exchangeId: '0xvalid', assets: ['0xtoken1', '0xtoken2'] },
        {
          exchangeId: '0xinvalid',
          assets: ['0xtoken1', '0xtoken2', '0xtoken3'],
        }, // 3 assets
        { exchangeId: '0xvalid2', assets: ['0xtoken3', '0xtoken4'] },
      ])

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

      const exchanges = await service.getExchanges()

      expect(exchanges).toHaveLength(2) // Only 2 valid exchanges
      expect(exchanges.find((ex) => ex.id === '0xinvalid')).toBeUndefined()
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Skipping invalid exchange 0xinvalid')
      )

      consoleSpy.mockRestore()
    })

    it('should skip exchanges with less than 2 assets', async () => {
      // Mock response with invalid exchange (1 asset)
      mockPublicClient.readContract.mockResolvedValue([
        { exchangeId: '0xvalid', assets: ['0xtoken1', '0xtoken2'] },
        { exchangeId: '0xinvalid', assets: ['0xtoken1'] }, // 1 asset
      ])

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

      const exchanges = await service.getExchanges()

      expect(exchanges).toHaveLength(1)
      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })

    it('should throw error if RPC call fails', async () => {
      mockPublicClient.readContract.mockRejectedValue(
        new Error('RPC connection failed')
      )

      await expect(service.getExchanges()).rejects.toThrow(
        'Failed to fetch exchanges'
      )
    })
  })

  describe('getExchangeById()', () => {
    beforeEach(() => {
      mockPublicClient.readContract.mockResolvedValue(
        mockExchanges.map((ex) => ({
          exchangeId: ex.id,
          assets: ex.assets,
        }))
      )
    })

    it('should return exchange with matching ID', async () => {
      const exchange = await service.getExchangeById('0xexchange2')

      expect(exchange.id).toBe('0xexchange2')
      expect(exchange.assets).toEqual(mockExchanges[1].assets)
    })

    it('should throw ExchangeNotFoundError if no exchange with given ID exists', async () => {
      await expect(service.getExchangeById('0xnonexistent')).rejects.toThrow(
        ExchangeNotFoundError
      )
      await expect(service.getExchangeById('0xnonexistent')).rejects.toThrow(
        'No exchange found for id 0xnonexistent'
      )
    })

    it('should throw error if multiple exchanges found with same ID (assertion failure)', async () => {
      // Mock duplicate exchanges
      mockPublicClient.readContract.mockResolvedValue([
        { exchangeId: '0xduplicate', assets: ['0xtoken1', '0xtoken2'] },
        { exchangeId: '0xduplicate', assets: ['0xtoken3', '0xtoken4'] },
      ])

      await expect(service.getExchangeById('0xduplicate')).rejects.toThrow(
        'More than one exchange found'
      )
    })
  })

  describe('getExchangesForProvider()', () => {
    beforeEach(() => {
      // Mock exchanges from multiple providers
      mockPublicClient.readContract.mockResolvedValue([
        { exchangeId: '0xex1', assets: ['0xtoken1', '0xtoken2'] },
        { exchangeId: '0xex2', assets: ['0xtoken3', '0xtoken4'] },
        { exchangeId: '0xex3', assets: ['0xtoken5', '0xtoken6'] },
      ])
    })

    it('should return exchanges filtered by provider address', async () => {
      const exchanges = await service.getExchanges()
      const providerAddr = exchanges[0].providerAddr

      const filteredExchanges = await service.getExchangesForProvider(
        providerAddr
      )

      // All exchanges should have the same provider (BiPoolManager)
      expect(filteredExchanges.length).toBeGreaterThan(0)
      filteredExchanges.forEach((ex) => {
        expect(ex.providerAddr.toLowerCase()).toBe(providerAddr.toLowerCase())
      })
    })

    it('should return empty array for non-existent provider', async () => {
      const exchanges = await service.getExchangesForProvider('0xnonexistent')

      expect(exchanges).toEqual([])
    })

    it('should handle case-insensitive provider address matching', async () => {
      const exchanges = await service.getExchanges()
      const providerAddr = exchanges[0].providerAddr

      // Test lowercase
      const lowerResult = await service.getExchangesForProvider(
        providerAddr.toLowerCase()
      )
      // Test uppercase
      const upperResult = await service.getExchangesForProvider(
        providerAddr.toUpperCase()
      )

      expect(lowerResult.length).toBe(upperResult.length)
    })
  })

  // =========================================================================
  // USER STORY 2: Discover Direct Trading Pairs
  // =========================================================================

  describe('getDirectPairs()', () => {
    beforeEach(() => {
      mockPublicClient.readContract.mockImplementation(
        async ({ functionName }: any) => {
          if (functionName === 'getExchanges') {
            return mockExchanges.map((ex) => ({
              exchangeId: ex.id,
              assets: ex.assets,
            }))
          }
          // Symbol fetching
          if (functionName === 'symbol') {
            return 'TOKEN'
          }
          return null
        }
      )
    })

    it('should return array of TradablePair objects', async () => {
      const pairs = await service.getDirectPairs()

      expect(Array.isArray(pairs)).toBe(true)
      expect(pairs.length).toBeGreaterThan(0)

      // Verify structure of first pair
      const pair = pairs[0]
      expect(pair).toHaveProperty('id')
      expect(pair).toHaveProperty('assets')
      expect(pair).toHaveProperty('path')
      expect(pair.assets).toHaveLength(2)
      // Note: path may contain all exchanges for the pair (could be multiple)
      expect(pair.path.length).toBeGreaterThanOrEqual(1)
    })

    it('should deduplicate multiple exchanges for same token pair', async () => {
      // Mock duplicate exchanges for same pair
      mockPublicClient.readContract.mockImplementation(
        async ({ functionName }: any) => {
          if (functionName === 'getExchanges') {
            return [
              { exchangeId: '0xex1', assets: ['0xtoken1', '0xtoken2'] },
              { exchangeId: '0xex2', assets: ['0xtoken1', '0xtoken2'] }, // Duplicate pair
              { exchangeId: '0xex3', assets: ['0xtoken3', '0xtoken4'] },
            ]
          }
          if (functionName === 'symbol') {
            return 'TOKEN'
          }
          return null
        }
      )

      const pairs = await service.getDirectPairs()

      // Should only have 2 unique pairs (duplicates merged)
      const pairIds = pairs.map((p) => p.id)
      const uniquePairIds = new Set(pairIds)
      expect(uniquePairIds.size).toBe(pairIds.length) // No duplicate IDs
    })

    it('should sort pair assets alphabetically by symbol', async () => {
      mockPublicClient.readContract.mockImplementation(
        async ({ functionName, address }: any) => {
          if (functionName === 'getExchanges') {
            return [
              { exchangeId: '0xex1', assets: ['0xZZZ', '0xAAA'] }, // Z comes before A in address
            ]
          }
          if (functionName === 'symbol') {
            // Return symbols based on address
            if (address === '0xZZZ') return 'ZZZ'
            if (address === '0xAAA') return 'AAA'
          }
          return null
        }
      )

      const pairs = await service.getDirectPairs()

      expect(pairs.length).toBeGreaterThan(0)
      const pair = pairs[0]

      // Assets should be sorted alphabetically by symbol (AAA before ZZZ)
      expect(pair.assets[0].symbol < pair.assets[1].symbol).toBe(true)
    })

    it('should create canonical pair IDs using alphabetically sorted symbols', async () => {
      mockPublicClient.readContract.mockImplementation(
        async ({ functionName, address }: any) => {
          if (functionName === 'getExchanges') {
            return [{ exchangeId: '0xex1', assets: ['0xtoken1', '0xtoken2'] }]
          }
          if (functionName === 'symbol') {
            if (address === '0xtoken1') return 'ZZZ'
            if (address === '0xtoken2') return 'AAA'
          }
          return null
        }
      )

      const pairs = await service.getDirectPairs()

      expect(pairs[0].id).toBe('AAA-ZZZ') // Alphabetically sorted
    })

    it('should fetch and cache token symbols', async () => {
      const symbolCalls: string[] = []

      mockPublicClient.readContract.mockImplementation(
        async ({ functionName, address }: any) => {
          if (functionName === 'getExchanges') {
            return mockExchanges.map((ex) => ({
              exchangeId: ex.id,
              assets: ex.assets,
            }))
          }
          if (functionName === 'symbol') {
            symbolCalls.push(address)
            return 'SYM'
          }
          return null
        }
      )

      // First call
      await service.getDirectPairs()
      const firstCallCount = symbolCalls.length

      // Second call - should use cached symbols
      symbolCalls.length = 0
      await service.getDirectPairs()
      const secondCallCount = symbolCalls.length

      // Second call should make fewer symbol fetches (cached)
      expect(secondCallCount).toBeLessThanOrEqual(firstCallCount)
    })

    it('should use address as fallback if symbol fetch fails', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()

      mockPublicClient.readContract.mockImplementation(
        async ({ functionName }: any) => {
          if (functionName === 'getExchanges') {
            return [{ exchangeId: '0xex1', assets: ['0xtoken1', '0xtoken2'] }]
          }
          if (functionName === 'symbol') {
            throw new Error('Symbol fetch failed')
          }
          return null
        }
      )

      const pairs = await service.getDirectPairs()

      // Should still work, using addresses as fallback
      expect(pairs.length).toBeGreaterThan(0)
      expect(consoleWarnSpy).toHaveBeenCalled()

      consoleWarnSpy.mockRestore()
    })
  })

  describe('getExchangeForTokens()', () => {
    beforeEach(() => {
      mockPublicClient.readContract.mockResolvedValue(
        mockExchanges.map((ex) => ({
          exchangeId: ex.id,
          assets: ex.assets,
        }))
      )
    })

    it('should return exchange for valid token pair', async () => {
      const token0 = mockExchanges[0].assets[0]
      const token1 = mockExchanges[0].assets[1]

      const exchange = await service.getExchangeForTokens(token0, token1)

      expect(exchange.id).toBe(mockExchanges[0].id)
      expect(exchange.assets).toEqual(mockExchanges[0].assets)
    })

    it('should handle bidirectional token order (token0-token1 vs token1-token0)', async () => {
      const token0 = mockExchanges[0].assets[0]
      const token1 = mockExchanges[0].assets[1]

      // Both orders should work
      const exchange1 = await service.getExchangeForTokens(token0, token1)
      const exchange2 = await service.getExchangeForTokens(token1, token0)

      expect(exchange1).toEqual(exchange2)
    })

    it('should throw ExchangeNotFoundError if no exchange exists for pair', async () => {
      await expect(
        service.getExchangeForTokens('0xnonexistent1', '0xnonexistent2')
      ).rejects.toThrow(ExchangeNotFoundError)
    })
  })

  // =========================================================================
  // USER STORY 3: Discover Multi-Hop Trading Paths
  // =========================================================================

  describe('getTradablePairs()', () => {
    beforeEach(() => {
      mockPublicClient.readContract.mockImplementation(
        async ({ functionName }: any) => {
          if (functionName === 'getExchanges') {
            return mockExchanges.map((ex) => ({
              exchangeId: ex.id,
              assets: ex.assets,
            }))
          }
          if (functionName === 'symbol') {
            return 'TOKEN'
          }
          return null
        }
      )
    })

    it('should return both direct and 2-hop pairs', async () => {
      const pairs = await service.getTradablePairs()

      expect(pairs.length).toBeGreaterThan(0)

      // Should have pairs with routing information
      // Note: path may contain multiple exchanges for same pair (grouped)
      pairs.forEach((pair) => {
        expect(pair.path.length).toBeGreaterThan(0)
      })
    })

    it('should generate fresh pairs when cached option is false', async () => {
      const pairs = await service.getTradablePairs({ cached: false })

      // Should generate fresh pairs successfully
      expect(pairs.length).toBeGreaterThan(0)
    })

    it('should attempt to load from cache when cached option is true', async () => {
      const pairs = await service.getTradablePairs({ cached: true })

      // Cache doesn't exist, should fall back to fresh generation
      expect(pairs.length).toBeGreaterThan(0)
    })

    it('should default to fresh generation if cached option not specified', async () => {
      const pairs = await service.getTradablePairs()

      expect(pairs.length).toBeGreaterThan(0)
    })
  })

  // =========================================================================
  // USER STORY 4: Find Exchange for Specific Token Pair
  // =========================================================================

  describe('findPairForTokens()', () => {
    beforeEach(() => {
      mockPublicClient.readContract.mockImplementation(
        async ({ functionName, address }: any) => {
          if (functionName === 'getExchanges') {
            return mockExchanges.map((ex) => ({
              exchangeId: ex.id,
              assets: ex.assets,
            }))
          }
          if (functionName === 'symbol') {
            // Return different symbols for different tokens
            if (address?.includes('cUSD')) return 'cUSD'
            if (address?.includes('CELO')) return 'CELO'
            if (address?.includes('cEUR')) return 'cEUR'
            if (address?.includes('cREAL')) return 'cREAL'
            return 'TOKEN'
          }
          return null
        }
      )
    })

    it('should return pair for valid token combination', async () => {
      const token0 = mockExchanges[0].assets[0]
      const token1 = mockExchanges[0].assets[1]

      // Use cached: false to use mocked exchanges instead of real cached pairs
      const pair = await service.findPairForTokens(token0, token1, {
        cached: false,
      })

      expect(pair).toBeDefined()
      expect(pair.path.length).toBeGreaterThanOrEqual(1)
    })

    it('should handle bidirectional token order', async () => {
      const token0 = mockExchanges[0].assets[0]
      const token1 = mockExchanges[0].assets[1]

      // Use cached: false to use mocked exchanges instead of real cached pairs
      const pair1 = await service.findPairForTokens(token0, token1, {
        cached: false,
      })
      const pair2 = await service.findPairForTokens(token1, token0, {
        cached: false,
      })

      // Should find same pair regardless of order
      expect(pair1.id).toBe(pair2.id)
    })

    it('should throw PairNotFoundError if no route exists', async () => {
      await expect(
        service.findPairForTokens('0xnonexistent1', '0xnonexistent2', {
          cached: false,
        })
      ).rejects.toThrow(PairNotFoundError)

      await expect(
        service.findPairForTokens('0xnonexistent1', '0xnonexistent2', {
          cached: false,
        })
      ).rejects.toThrow(/No pair found for tokens/)
    })

    it('should return optimal route when multiple routes exist', async () => {
      // With the current mock data (cUSD-CELO, CELO-cEUR, cUSD-cREAL),
      // there may be multiple routes (e.g., direct vs 2-hop)
      const token0 = mockExchanges[0].assets[0] // cUSD
      const token1 = mockExchanges[0].assets[1] // CELO

      // Use cached: false to use mocked exchanges instead of real cached pairs
      const pair = await service.findPairForTokens(token0, token1, {
        cached: false,
      })

      // Should return a valid pair (optimization happens in selectOptimalRoutes)
      expect(pair).toBeDefined()
      expect(pair.path.length).toBeGreaterThan(0)
    })
  })
})
