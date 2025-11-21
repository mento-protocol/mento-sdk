import {
  buildConnectivityStructures,
  generateAllRoutes,
  selectOptimalRoutes,
  selectBestRoute,
  getIntermediateToken,
  hasSpreadData,
  type ConnectivityData,
} from '../../../src/utils/routeUtils'
import type {
  TradablePair,
  TradablePairID,
  Asset,
  TradablePairWithSpread,
} from '../../../src/types'

/**
 * Unit tests for routeUtils
 *
 * Tests graph-based route finding and optimization algorithms.
 * Tests circular route prevention, 2-hop route generation, and route selection heuristics.
 */
describe('routeUtils', () => {
  // Mock token addresses and symbols
  const CUSD_ADDR = '0xcUSD0000000000000000000000000000000000'
  const CELO_ADDR = '0xCELO0000000000000000000000000000000000'
  const CEUR_ADDR = '0xcEUR0000000000000000000000000000000000'
  const CREAL_ADDR = '0xcREAL000000000000000000000000000000000'
  const USDC_ADDR = '0xUSDC0000000000000000000000000000000000'

  // Mock direct pairs
  const mockDirectPairs: TradablePair[] = [
    {
      id: 'CELO-cUSD' as TradablePairID,
      assets: [
        { address: CELO_ADDR, symbol: 'CELO' },
        { address: CUSD_ADDR, symbol: 'cUSD' },
      ],
      path: [
        {
          providerAddr: '0xBiPoolManager',
          id: '0xex1',
          assets: [CELO_ADDR, CUSD_ADDR],
        },
      ],
    },
    {
      id: 'CELO-cEUR' as TradablePairID,
      assets: [
        { address: CELO_ADDR, symbol: 'CELO' },
        { address: CEUR_ADDR, symbol: 'cEUR' },
      ],
      path: [
        {
          providerAddr: '0xBiPoolManager',
          id: '0xex2',
          assets: [CELO_ADDR, CEUR_ADDR],
        },
      ],
    },
    {
      id: 'cREAL-cUSD' as TradablePairID,
      assets: [
        { address: CREAL_ADDR, symbol: 'cREAL' },
        { address: CUSD_ADDR, symbol: 'cUSD' },
      ],
      path: [
        {
          providerAddr: '0xBiPoolManager',
          id: '0xex3',
          assets: [CREAL_ADDR, CUSD_ADDR],
        },
      ],
    },
  ]

  describe('buildConnectivityStructures()', () => {
    it('should create address-to-symbol map correctly', () => {
      const connectivity = buildConnectivityStructures(mockDirectPairs)

      expect(connectivity.addrToSymbol.get(CUSD_ADDR)).toBe('cUSD')
      expect(connectivity.addrToSymbol.get(CELO_ADDR)).toBe('CELO')
      expect(connectivity.addrToSymbol.get(CEUR_ADDR)).toBe('cEUR')
      expect(connectivity.addrToSymbol.get(CREAL_ADDR)).toBe('cREAL')
    })

    it('should create bidirectional token graph', () => {
      const connectivity = buildConnectivityStructures(mockDirectPairs)

      // cUSD connects to CELO and cREAL
      const cusdNeighbors = connectivity.tokenGraph.get(CUSD_ADDR)
      expect(cusdNeighbors).toBeDefined()
      expect(cusdNeighbors?.has(CELO_ADDR)).toBe(true)
      expect(cusdNeighbors?.has(CREAL_ADDR)).toBe(true)

      // CELO connects to cUSD and cEUR
      const celoNeighbors = connectivity.tokenGraph.get(CELO_ADDR)
      expect(celoNeighbors).toBeDefined()
      expect(celoNeighbors?.has(CUSD_ADDR)).toBe(true)
      expect(celoNeighbors?.has(CEUR_ADDR)).toBe(true)
    })

    it('should create direct path map with sorted keys', () => {
      const connectivity = buildConnectivityStructures(mockDirectPairs)

      // Keys should be sorted alphabetically
      const celoUsdKey = [CELO_ADDR, CUSD_ADDR]
        .sort()
        .join('-') as TradablePairID
      const exchange = connectivity.directPathMap.get(celoUsdKey)

      expect(exchange).toBeDefined()
      expect(exchange?.id).toBe('0xex1')
    })

    it('should preserve original direct pairs', () => {
      const connectivity = buildConnectivityStructures(mockDirectPairs)

      expect(connectivity.directPairs).toEqual(mockDirectPairs)
      expect(connectivity.directPairs.length).toBe(3)
    })
  })

  describe('generateAllRoutes()', () => {
    it('should include all direct pairs', () => {
      const connectivity = buildConnectivityStructures(mockDirectPairs)
      const allRoutes = generateAllRoutes(connectivity)

      // All direct pairs should be included
      expect(allRoutes.has('CELO-cUSD')).toBe(true)
      expect(allRoutes.has('CELO-cEUR')).toBe(true)
      expect(allRoutes.has('cREAL-cUSD')).toBe(true)
    })

    it('should find 2-hop routes via graph traversal', () => {
      const connectivity = buildConnectivityStructures(mockDirectPairs)
      const allRoutes = generateAllRoutes(connectivity)

      // Should find 2-hop route: cEUR -> CELO -> cUSD
      const ceurUsdRoutes = allRoutes.get('cEUR-cUSD')
      expect(ceurUsdRoutes).toBeDefined()
      expect(ceurUsdRoutes!.length).toBeGreaterThan(0)

      // Check that at least one route is 2-hop
      const twoHopRoute = ceurUsdRoutes!.find(
        (route) => route.path.length === 2
      )
      expect(twoHopRoute).toBeDefined()
    })

    it('should prevent circular routes (A→B→A)', () => {
      const connectivity = buildConnectivityStructures(mockDirectPairs)
      const allRoutes = generateAllRoutes(connectivity)

      // Check all routes - none should be circular
      for (const [pairId, routes] of allRoutes.entries()) {
        for (const route of routes) {
          if (route.path.length === 2) {
            const [hop1, hop2] = route.path
            const start =
              hop1.assets[0] === hop2.assets[0] ||
              hop1.assets[0] === hop2.assets[1]
                ? hop1.assets[1]
                : hop1.assets[0]
            const end =
              hop2.assets[0] === hop1.assets[0] ||
              hop2.assets[0] === hop1.assets[1]
                ? hop2.assets[1]
                : hop2.assets[0]

            // Start and end should be different (not circular)
            expect(start).not.toBe(end)
          }
        }
      }
    })

    it('should group multiple routes for same pair', () => {
      // Create test data with multiple possible routes between same tokens
      const multiRoutePairs: TradablePair[] = [
        {
          id: 'CELO-cUSD' as TradablePairID,
          assets: [
            { address: CELO_ADDR, symbol: 'CELO' },
            { address: CUSD_ADDR, symbol: 'cUSD' },
          ],
          path: [
            {
              providerAddr: '0xProvider1',
              id: '0xex1',
              assets: [CELO_ADDR, CUSD_ADDR],
            },
          ],
        },
        {
          id: 'CELO-USDC' as TradablePairID,
          assets: [
            { address: CELO_ADDR, symbol: 'CELO' },
            { address: USDC_ADDR, symbol: 'USDC' },
          ],
          path: [
            {
              providerAddr: '0xProvider2',
              id: '0xex2',
              assets: [CELO_ADDR, USDC_ADDR],
            },
          ],
        },
        {
          id: 'USDC-cUSD' as TradablePairID,
          assets: [
            { address: USDC_ADDR, symbol: 'USDC' },
            { address: CUSD_ADDR, symbol: 'cUSD' },
          ],
          path: [
            {
              providerAddr: '0xProvider3',
              id: '0xex3',
              assets: [USDC_ADDR, CUSD_ADDR],
            },
          ],
        },
      ]

      const connectivity = buildConnectivityStructures(multiRoutePairs)
      const allRoutes = generateAllRoutes(connectivity)

      // cUSD-CELO pair should have both direct and 2-hop routes
      const celoUsdRoutes = allRoutes.get('CELO-cUSD')
      expect(celoUsdRoutes).toBeDefined()
      expect(celoUsdRoutes!.length).toBeGreaterThan(1) // Direct + at least one 2-hop via USDC
    })

    it('should create canonical pair IDs (sorted symbols)', () => {
      const connectivity = buildConnectivityStructures(mockDirectPairs)
      const allRoutes = generateAllRoutes(connectivity)

      // All pair IDs should be alphabetically sorted
      for (const pairId of allRoutes.keys()) {
        const [sym1, sym2] = pairId.split('-')
        expect(sym1 < sym2).toBe(true) // First symbol should come before second
      }
    })
  })

  describe('selectOptimalRoutes()', () => {
    let connectivity: ConnectivityData
    let allRoutes: Map<TradablePairID, TradablePair[]>

    beforeEach(() => {
      connectivity = buildConnectivityStructures(mockDirectPairs)
      allRoutes = generateAllRoutes(connectivity)
    })

    it('should return array of selected routes', () => {
      const selected = selectOptimalRoutes(
        allRoutes,
        false,
        connectivity.addrToSymbol
      )

      expect(Array.isArray(selected)).toBe(true)
      expect(selected.length).toBeGreaterThan(0)
    })

    it('should select single route when only one available', () => {
      // Mock single route scenario
      const singleRouteMap = new Map([
        ['CELO-cUSD' as TradablePairID, [mockDirectPairs[0]]],
      ])

      const selected = selectOptimalRoutes(
        singleRouteMap,
        false,
        connectivity.addrToSymbol
      )

      expect(selected.length).toBe(1)
      expect(selected[0]).toEqual(mockDirectPairs[0])
    })

    it('should return all routes when returnAllRoutes is true', () => {
      const selected = selectOptimalRoutes(
        allRoutes,
        true,
        connectivity.addrToSymbol
      )

      // Should return all routes (not just optimal ones)
      let totalRoutes = 0
      for (const routes of allRoutes.values()) {
        totalRoutes += routes.length
      }

      expect(selected.length).toBe(totalRoutes)
    })

    it('should apply optimization when returnAllRoutes is false', () => {
      const selected = selectOptimalRoutes(
        allRoutes,
        false,
        connectivity.addrToSymbol
      )

      // Should have one route per unique pair (optimized selection)
      const uniquePairIds = new Set(selected.map((r) => r.id))
      expect(selected.length).toBe(uniquePairIds.size)
    })
  })

  describe('selectBestRoute()', () => {
    it('should prefer route with lowest spread (Tier 1)', () => {
      const candidatesWithSpread: TradablePairWithSpread[] = [
        {
          ...mockDirectPairs[0],
          spreadData: { totalSpreadPercent: 0.8 },
        },
        {
          ...mockDirectPairs[0],
          id: 'CELO-cUSD-alt' as TradablePairID,
          spreadData: { totalSpreadPercent: 0.3 }, // Lower spread
        },
        {
          ...mockDirectPairs[0],
          id: 'CELO-cUSD-alt2' as TradablePairID,
          spreadData: { totalSpreadPercent: 0.5 },
        },
      ]

      const addrToSymbol = new Map([
        [CELO_ADDR, 'CELO'],
        [CUSD_ADDR, 'cUSD'],
      ])

      const best = selectBestRoute(candidatesWithSpread, addrToSymbol)

      expect(
        (best as TradablePairWithSpread).spreadData.totalSpreadPercent
      ).toBe(0.3)
    })

    it('should prefer direct route over multi-hop (Tier 2)', () => {
      const candidates: TradablePair[] = [
        {
          // 2-hop route
          id: 'cEUR-cUSD' as TradablePairID,
          assets: [
            { address: CEUR_ADDR, symbol: 'cEUR' },
            { address: CUSD_ADDR, symbol: 'cUSD' },
          ],
          path: [
            {
              providerAddr: '0xP1',
              id: '0xex1',
              assets: [CEUR_ADDR, CELO_ADDR],
            },
            {
              providerAddr: '0xP2',
              id: '0xex2',
              assets: [CELO_ADDR, CUSD_ADDR],
            },
          ],
        },
        {
          // Direct route
          id: 'cEUR-cUSD' as TradablePairID,
          assets: [
            { address: CEUR_ADDR, symbol: 'cEUR' },
            { address: CUSD_ADDR, symbol: 'cUSD' },
          ],
          path: [
            {
              providerAddr: '0xP3',
              id: '0xex3',
              assets: [CEUR_ADDR, CUSD_ADDR],
            },
          ],
        },
      ]

      const addrToSymbol = new Map([
        [CEUR_ADDR, 'cEUR'],
        [CUSD_ADDR, 'cUSD'],
        [CELO_ADDR, 'CELO'],
      ])

      const best = selectBestRoute(candidates, addrToSymbol)

      expect(best.path.length).toBe(1) // Direct route selected
    })

    it('should prefer route through major stablecoin (Tier 3)', () => {
      const candidates: TradablePair[] = [
        {
          // Route through minor token
          id: 'cEUR-cREAL' as TradablePairID,
          assets: [
            { address: CEUR_ADDR, symbol: 'cEUR' },
            { address: CREAL_ADDR, symbol: 'cREAL' },
          ],
          path: [
            {
              providerAddr: '0xP1',
              id: '0xex1',
              assets: [CEUR_ADDR, CREAL_ADDR],
            },
            {
              providerAddr: '0xP2',
              id: '0xex2',
              assets: [CREAL_ADDR, CREAL_ADDR],
            },
          ],
        },
        {
          // Route through cUSD (major stablecoin)
          id: 'cEUR-cREAL' as TradablePairID,
          assets: [
            { address: CEUR_ADDR, symbol: 'cEUR' },
            { address: CREAL_ADDR, symbol: 'cREAL' },
          ],
          path: [
            {
              providerAddr: '0xP3',
              id: '0xex3',
              assets: [CEUR_ADDR, CUSD_ADDR],
            }, // cUSD intermediate
            {
              providerAddr: '0xP4',
              id: '0xex4',
              assets: [CUSD_ADDR, CREAL_ADDR],
            },
          ],
        },
      ]

      const addrToSymbol = new Map([
        [CEUR_ADDR, 'cEUR'],
        [CREAL_ADDR, 'cREAL'],
        [CUSD_ADDR, 'cUSD'],
      ])

      const best = selectBestRoute(candidates, addrToSymbol)

      // Should select route through cUSD
      const intermediate = getIntermediateToken(best)
      expect(intermediate).toBe(CUSD_ADDR)
    })

    it('should return first route if no better heuristic applies (Tier 4)', () => {
      const candidates: TradablePair[] = [
        mockDirectPairs[0],
        mockDirectPairs[1],
      ]

      const addrToSymbol = new Map([
        [CELO_ADDR, 'CELO'],
        [CUSD_ADDR, 'cUSD'],
        [CEUR_ADDR, 'cEUR'],
      ])

      const best = selectBestRoute(candidates, addrToSymbol)

      // Should return first route (Tier 4 fallback)
      expect(best).toBe(candidates[0])
    })
  })

  describe('getIntermediateToken()', () => {
    it('should extract intermediate token from 2-hop route', () => {
      const twoHopRoute: TradablePair = {
        id: 'cEUR-cUSD' as TradablePairID,
        assets: [
          { address: CEUR_ADDR, symbol: 'cEUR' },
          { address: CUSD_ADDR, symbol: 'cUSD' },
        ],
        path: [
          { providerAddr: '0xP1', id: '0xex1', assets: [CEUR_ADDR, CELO_ADDR] },
          { providerAddr: '0xP2', id: '0xex2', assets: [CELO_ADDR, CUSD_ADDR] },
        ],
      }

      const intermediate = getIntermediateToken(twoHopRoute)

      expect(intermediate).toBe(CELO_ADDR) // CELO is the common token
    })

    // Note: getIntermediateToken() is designed for 2-hop routes only
    // Calling it on a direct route would cause an error (hop2 undefined)
    // This is expected behavior - the function is only used on multi-hop routes
  })

  describe('hasSpreadData()', () => {
    it('should return true for TradablePairWithSpread', () => {
      const pairWithSpread: TradablePairWithSpread = {
        ...mockDirectPairs[0],
        spreadData: { totalSpreadPercent: 0.5 },
      }

      expect(hasSpreadData(pairWithSpread)).toBe(true)
    })

    it('should return false for TradablePair without spread data', () => {
      expect(hasSpreadData(mockDirectPairs[0])).toBe(false)
    })

    it('should act as type guard for TypeScript', () => {
      const pair: TradablePair | TradablePairWithSpread = mockDirectPairs[0]

      if (hasSpreadData(pair)) {
        // TypeScript should know this is TradablePairWithSpread
        expect(pair.spreadData).toBeDefined()
      } else {
        // TypeScript should know this is TradablePair
        expect('spreadData' in pair).toBe(false)
      }
    })
  })
})
