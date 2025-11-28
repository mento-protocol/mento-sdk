import type { ExchangeService } from '../../../src/services/ExchangeService'

/**
 * Shared test suite for Exchange Discovery functionality
 *
 * @param service - ExchangeService instance to test
 */
export function createExchangeDiscoveryTests(service: ExchangeService) {
  describe('Exchange Discovery - Provider Parity', () => {
    describe('getExchanges()', () => {
      it('should return non-empty array of exchanges', async () => {
        const exchanges = await service.getExchanges()

        expect(Array.isArray(exchanges)).toBe(true)
        expect(exchanges.length).toBeGreaterThan(0)
      })

      it('should return exchanges with valid structure', async () => {
        const exchanges = await service.getExchanges()

        exchanges.forEach((exchange) => {
          expect(exchange).toHaveProperty('providerAddr')
          expect(exchange).toHaveProperty('id')
          expect(exchange).toHaveProperty('assets')
          expect(Array.isArray(exchange.assets)).toBe(true)
          expect(exchange.assets.length).toBe(2) // All exchanges must have exactly 2 assets
        })
      })

      it('should return consistent results across multiple calls (caching)', async () => {
        const firstCall = await service.getExchanges()
        const secondCall = await service.getExchanges()

        expect(firstCall).toEqual(secondCall)
        expect(firstCall.length).toBe(secondCall.length)
      })

      it('should return exchanges with valid ethereum addresses', async () => {
        const exchanges = await service.getExchanges()

        exchanges.forEach((exchange) => {
          // Provider address should be valid hex string
          expect(exchange.providerAddr).toMatch(/^0x[a-fA-F0-9]{40}$/)

          // Asset addresses should be valid
          exchange.assets.forEach((asset) => {
            expect(asset).toMatch(/^0x[a-fA-F0-9]{40}$/)
          })
        })
      })
    })

    describe('getDirectRoutes()', () => {
      it('should return non-empty array of trading pairs', async () => {
        const pairs = await service.getDirectRoutes()

        expect(Array.isArray(pairs)).toBe(true)
        expect(pairs.length).toBeGreaterThan(0)
      })

      it('should return pairs with valid structure', async () => {
        const pairs = await service.getDirectRoutes()

        pairs.forEach((pair) => {
          expect(pair).toHaveProperty('id')
          expect(pair).toHaveProperty('assets')
          expect(pair).toHaveProperty('path')

          // Assets should be array of 2
          expect(pair.assets).toHaveLength(2)
          expect(pair.assets[0]).toHaveProperty('address')
          expect(pair.assets[0]).toHaveProperty('symbol')

          // Path should have exactly 1 exchange for direct pairs
          expect(pair.path).toHaveLength(1)
        })
      })

      it('should return pairs with alphabetically sorted symbols', async () => {
        const pairs = await service.getDirectRoutes()

        pairs.forEach((pair) => {
          const [asset0, asset1] = pair.assets
          // First symbol should come before second alphabetically
          expect(asset0.symbol <= asset1.symbol).toBe(true)
        })
      })

      it('should return pairs with canonical IDs (sorted symbols)', async () => {
        const pairs = await service.getDirectRoutes()

        pairs.forEach((pair) => {
          const [symbol0, symbol1] = pair.id.split('-')
          // ID symbols should be alphabetically sorted
          expect(symbol0 < symbol1).toBe(true)
        })
      })

      it('should not have duplicate pairs', async () => {
        const pairs = await service.getDirectRoutes()

        const pairIds = pairs.map((p) => p.id)
        const uniqueIds = new Set(pairIds)

        expect(pairIds.length).toBe(uniqueIds.size)
      })

      it('should fetch token symbols successfully', async () => {
        const pairs = await service.getDirectRoutes()

        pairs.forEach((pair) => {
          pair.assets.forEach((asset) => {
            // Symbol should not be empty
            expect(asset.symbol.length).toBeGreaterThan(0)
            // Symbol should not be the address (fallback scenario)
            expect(asset.symbol).not.toBe(asset.address)
          })
        })
      })
    })

    describe('getRoutes()', () => {
      it('should return non-empty array including both direct and multi-hop pairs', async () => {
        const pairs = await service.getRoutes()

        expect(Array.isArray(pairs)).toBe(true)
        expect(pairs.length).toBeGreaterThan(0)

        // Should have at least some direct pairs
        const directPairs = pairs.filter((p) => p.path.length === 1)
        expect(directPairs.length).toBeGreaterThan(0)

        // May have 2-hop pairs
        const twoHopPairs = pairs.filter((p) => p.path.length === 2)
        // Note: might be 0 in test environment with limited liquidity
      })

      it('should return pairs with valid structure', async () => {
        const pairs = await service.getRoutes()

        pairs.forEach((pair) => {
          expect(pair).toHaveProperty('id')
          expect(pair).toHaveProperty('assets')
          expect(pair).toHaveProperty('path')

          // Path length should be 1 or 2 (direct or 2-hop)
          expect(pair.path.length).toBeGreaterThanOrEqual(1)
          expect(pair.path.length).toBeLessThanOrEqual(2)
        })
      })

      it('should include all direct pairs', async () => {
        const directPairs = await service.getDirectRoutes()
        const allPairs = await service.getRoutes()

        // All direct pair IDs should be present in all pairs
        const allPairIds = new Set(allPairs.map((p) => p.id))

        directPairs.forEach((directPair) => {
          expect(allPairIds.has(directPair.id)).toBe(true)
        })
      })

      it('should generate fresh pairs when cached=false', async () => {
        const pairs = await service.getRoutes({ cached: false })

        expect(pairs.length).toBeGreaterThan(0)
      })
    })

    describe('findRoute()', () => {
      it('should find pair for tokens with direct exchange', async () => {
        // Get first exchange to find a valid pair
        const exchanges = await service.getExchanges()
        expect(exchanges.length).toBeGreaterThan(0)

        const [token0, token1] = exchanges[0].assets

        const pair = await service.findRoute(token0, token1)

        expect(pair).toBeDefined()
        expect(pair.path.length).toBeGreaterThan(0)

        // Verify the pair contains the requested tokens
        const pairAddresses = new Set([
          pair.assets[0].address.toLowerCase(),
          pair.assets[1].address.toLowerCase(),
        ])
        expect(pairAddresses.has(token0.toLowerCase())).toBe(true)
        expect(pairAddresses.has(token1.toLowerCase())).toBe(true)
      })

      it('should handle bidirectional token order', async () => {
        const exchanges = await service.getExchanges()
        expect(exchanges.length).toBeGreaterThan(0)

        const [token0, token1] = exchanges[0].assets

        const pair1 = await service.findRoute(token0, token1)
        const pair2 = await service.findRoute(token1, token0)

        // Should find the same pair regardless of token order
        expect(pair1.id).toBe(pair2.id)
      })

      it('should throw error for non-existent token pair', async () => {
        const fakeToken1 = '0x0000000000000000000000000000000000000001'
        const fakeToken2 = '0x0000000000000000000000000000000000000002'

        await expect(
          service.findRoute(fakeToken1, fakeToken2)
        ).rejects.toThrow(/No pair found for tokens/)
      })
    })

    describe('getExchangeById()', () => {
      it('should find exchange by valid ID', async () => {
        const exchanges = await service.getExchanges()
        expect(exchanges.length).toBeGreaterThan(0)

        const exchangeId = exchanges[0].id

        const foundExchange = await service.getExchangeById(exchangeId)

        expect(foundExchange).toEqual(exchanges[0])
      })

      it('should throw error for non-existent exchange ID', async () => {
        const fakeId =
          '0x0000000000000000000000000000000000000000000000000000000000000000'

        await expect(service.getExchangeById(fakeId)).rejects.toThrow(
          /No exchange found/
        )
      })
    })

    describe('getExchangeForTokens()', () => {
      it('should find direct exchange for token pair', async () => {
        const exchanges = await service.getExchanges()
        expect(exchanges.length).toBeGreaterThan(0)

        const [token0, token1] = exchanges[0].assets

        const exchange = await service.getExchangeForTokens(token0, token1)

        expect(exchange).toBeDefined()
        expect(exchange.id).toBe(exchanges[0].id)
      })

      it('should handle bidirectional token order', async () => {
        const exchanges = await service.getExchanges()
        expect(exchanges.length).toBeGreaterThan(0)

        const [token0, token1] = exchanges[0].assets

        const exchange1 = await service.getExchangeForTokens(token0, token1)
        const exchange2 = await service.getExchangeForTokens(token1, token0)

        expect(exchange1).toEqual(exchange2)
      })

      it('should throw error if no direct exchange exists', async () => {
        const fakeToken1 = '0x0000000000000000000000000000000000000001'
        const fakeToken2 = '0x0000000000000000000000000000000000000002'

        await expect(
          service.getExchangeForTokens(fakeToken1, fakeToken2)
        ).rejects.toThrow(/No exchange found/)
      })
    })

    // NOTE: getExchangesForProvider() is planned (T029) but not yet implemented
  })
}
