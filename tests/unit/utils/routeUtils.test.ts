import {
  buildConnectivityStructures,
  generateAllRoutes,
  selectOptimalRoutes,
  selectBestRoute,
  getIntermediateToken,
  hasCostData,
  type ConnectivityData,
} from '../../../src/utils/routeUtils'
import { encodeRoutePath } from '../../../src/utils/pathEncoder'
import type { Route, RouteID, RouteWithCost } from '../../../src/core/types'
import { PoolType } from '../../../src/core/types'
import type { Address } from 'viem'

/**
 * Unit tests for routeUtils
 *
 * Tests graph-based route finding and optimization algorithms.
 * Tests circular route prevention, 2-hop route generation, and route selection heuristics.
 */
describe('routeUtils', () => {
  // Mock token addresses (valid hex)
  const CUSD_ADDR = '0xaa00000000000000000000000000000000000001'
  const CELO_ADDR = '0xbb00000000000000000000000000000000000002'
  const CEUR_ADDR = '0xcc00000000000000000000000000000000000003'
  const CREAL_ADDR = '0xdd00000000000000000000000000000000000004'
  const USDC_ADDR = '0xee00000000000000000000000000000000000005'

  const FACTORY_ADDR = '0xff00000000000000000000000000000000000099'

  // Mock direct pairs
  const mockDirectPairs: Route[] = [
    {
      id: 'CELO-cUSD' as RouteID,
      tokens: [
        { address: CELO_ADDR, symbol: 'CELO' },
        { address: CUSD_ADDR, symbol: 'cUSD' },
      ],
      path: [
        {
          factoryAddr: FACTORY_ADDR,
          poolAddr: '0x1000000000000000000000000000000000000001',
          token0: CELO_ADDR,
          token1: CUSD_ADDR,
          poolType: PoolType.FPMM as `${PoolType}`,
        },
      ],
    },
    {
      id: 'CELO-cEUR' as RouteID,
      tokens: [
        { address: CELO_ADDR, symbol: 'CELO' },
        { address: CEUR_ADDR, symbol: 'cEUR' },
      ],
      path: [
        {
          factoryAddr: FACTORY_ADDR,
          poolAddr: '0x1000000000000000000000000000000000000002',
          token0: CELO_ADDR,
          token1: CEUR_ADDR,
          poolType: PoolType.FPMM as `${PoolType}`,
        },
      ],
    },
    {
      id: 'cREAL-cUSD' as RouteID,
      tokens: [
        { address: CREAL_ADDR, symbol: 'cREAL' },
        { address: CUSD_ADDR, symbol: 'cUSD' },
      ],
      path: [
        {
          factoryAddr: FACTORY_ADDR,
          poolAddr: '0x1000000000000000000000000000000000000003',
          token0: CREAL_ADDR,
          token1: CUSD_ADDR,
          poolType: PoolType.FPMM as `${PoolType}`,
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

    it('should create direct route map with sorted symbol keys', () => {
      const connectivity = buildConnectivityStructures(mockDirectPairs)

      // Keys use canonicalSymbolKey (sorted symbols), not sorted addresses
      const celoUsdKey = 'CELO-cUSD' as RouteID
      const exchange = connectivity.directRouteMap.get(celoUsdKey)

      expect(exchange).toBeDefined()
      expect(exchange?.poolAddr).toBe('0x1000000000000000000000000000000000000001')
    })

    it('should preserve original direct routes', () => {
      const connectivity = buildConnectivityStructures(mockDirectPairs)

      expect(connectivity.directRoutes).toEqual(mockDirectPairs)
      expect(connectivity.directRoutes.length).toBe(3)
    })
  })

  describe('generateAllRoutes()', () => {
    const makeDirectPair = (
      tokenA: { address: string; symbol: string },
      tokenB: { address: string; symbol: string },
      poolNumber: number
    ): Route => ({
      id: [tokenA.symbol, tokenB.symbol].sort().join('-') as RouteID,
      tokens: [tokenA, tokenB],
      path: [
        {
          factoryAddr: FACTORY_ADDR,
          poolAddr: `0x${poolNumber.toString(16).padStart(39, '0')}`,
          token0: tokenA.address,
          token1: tokenB.address,
          poolType: PoolType.FPMM as `${PoolType}`,
        },
      ],
    })

    const linearFourTokenPairs = (): Route[] => {
      const cUSD = { address: CUSD_ADDR, symbol: 'cUSD' }
      const celo = { address: CELO_ADDR, symbol: 'CELO' }
      const cEUR = { address: CEUR_ADDR, symbol: 'cEUR' }
      const cREAL = { address: CREAL_ADDR, symbol: 'cREAL' }
      return [makeDirectPair(cUSD, celo, 0x601), makeDirectPair(celo, cEUR, 0x602), makeDirectPair(cEUR, cREAL, 0x603)]
    }

    it('should include all direct pairs', () => {
      const connectivity = buildConnectivityStructures(mockDirectPairs)
      const allRoutes = generateAllRoutes(connectivity)

      // All direct pairs should be included
      expect(allRoutes.has('CELO-cUSD')).toBe(true)
      expect(allRoutes.has('CELO-cEUR')).toBe(true)
      expect(allRoutes.has('cREAL-cUSD')).toBe(true)
    })

    it('should preserve parallel direct pools for the same pair', () => {
      const first = makeDirectPair(
        { address: CUSD_ADDR, symbol: 'cUSD' },
        { address: CELO_ADDR, symbol: 'CELO' },
        0x501
      )
      const second = makeDirectPair(
        { address: CUSD_ADDR, symbol: 'cUSD' },
        { address: CELO_ADDR, symbol: 'CELO' },
        0x502
      )

      const routes = generateAllRoutes(buildConnectivityStructures([first, second])).get('CELO-cUSD')

      expect(routes).toHaveLength(2)
      expect(routes?.map((route) => route.path[0].poolAddr)).toEqual([first.path[0].poolAddr, second.path[0].poolAddr])
    })

    it('should find 2-hop routes via graph traversal', () => {
      const connectivity = buildConnectivityStructures(mockDirectPairs)
      const allRoutes = generateAllRoutes(connectivity)

      // Should find 2-hop route: cEUR -> CELO -> cUSD
      const ceurUsdRoutes = allRoutes.get('cEUR-cUSD')
      expect(ceurUsdRoutes).toBeDefined()
      expect(ceurUsdRoutes!.length).toBeGreaterThan(0)

      // Check that at least one route is 2-hop
      const twoHopRoute = ceurUsdRoutes!.find((route) => route.path.length === 2)
      expect(twoHopRoute).toBeDefined()
    })

    it('should prevent circular routes (A→B→A)', () => {
      const connectivity = buildConnectivityStructures(mockDirectPairs)
      const allRoutes = generateAllRoutes(connectivity)

      // Check all routes - none should be circular
      for (const [_pairId, routes] of allRoutes.entries()) {
        for (const route of routes) {
          if (route.path.length === 2) {
            const [hop1, hop2] = route.path
            const start = hop1.token0 === hop2.token0 || hop1.token0 === hop2.token1 ? hop1.token1 : hop1.token0
            const end = hop2.token0 === hop1.token0 || hop2.token0 === hop1.token1 ? hop2.token1 : hop2.token0

            // Start and end should be different (not circular)
            expect(start).not.toBe(end)
          }
        }
      }
    })

    it('should group multiple routes for same pair', () => {
      // Create test data with multiple possible routes between same tokens
      const multiRoutePairs: Route[] = [
        {
          id: 'CELO-cUSD' as RouteID,
          tokens: [
            { address: CELO_ADDR, symbol: 'CELO' },
            { address: CUSD_ADDR, symbol: 'cUSD' },
          ],
          path: [
            {
              factoryAddr: FACTORY_ADDR,
              poolAddr: '0x2000000000000000000000000000000000000001',
              token0: CELO_ADDR,
              token1: CUSD_ADDR,
              poolType: PoolType.FPMM as `${PoolType}`,
            },
          ],
        },
        {
          id: 'CELO-USDC' as RouteID,
          tokens: [
            { address: CELO_ADDR, symbol: 'CELO' },
            { address: USDC_ADDR, symbol: 'USDC' },
          ],
          path: [
            {
              factoryAddr: FACTORY_ADDR,
              poolAddr: '0x2000000000000000000000000000000000000002',
              token0: CELO_ADDR,
              token1: USDC_ADDR,
              poolType: PoolType.FPMM as `${PoolType}`,
            },
          ],
        },
        {
          id: 'USDC-cUSD' as RouteID,
          tokens: [
            { address: USDC_ADDR, symbol: 'USDC' },
            { address: CUSD_ADDR, symbol: 'cUSD' },
          ],
          path: [
            {
              factoryAddr: FACTORY_ADDR,
              poolAddr: '0x2000000000000000000000000000000000000003',
              token0: USDC_ADDR,
              token1: CUSD_ADDR,
              poolType: PoolType.FPMM as `${PoolType}`,
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

    it('should preserve a direct route and every two-hop alternative for the same pair', () => {
      const cUSD = { address: CUSD_ADDR, symbol: 'cUSD' }
      const celo = { address: CELO_ADDR, symbol: 'CELO' }
      const cEUR = { address: CEUR_ADDR, symbol: 'cEUR' }
      const cREAL = { address: CREAL_ADDR, symbol: 'cREAL' }
      const pairs = [
        makeDirectPair(cUSD, cREAL, 0x511),
        makeDirectPair(cUSD, celo, 0x512),
        makeDirectPair(celo, cREAL, 0x513),
        makeDirectPair(cUSD, cEUR, 0x514),
        makeDirectPair(cEUR, cREAL, 0x515),
      ]

      const routes = generateAllRoutes(buildConnectivityStructures(pairs)).get('cREAL-cUSD')

      expect(routes?.map((route) => route.path.length)).toEqual([1, 2, 2])
      expect(routes?.slice(1).map((route) => route.path.map((pool) => pool.poolAddr))).toEqual([
        [pairs[2].path[0].poolAddr, pairs[1].path[0].poolAddr],
        [pairs[4].path[0].poolAddr, pairs[3].path[0].poolAddr],
      ])
    })

    it('should add all two-hop endpoint pairs before eligible three-hop pairs', () => {
      const tokenA = { address: CUSD_ADDR, symbol: 'A' }
      const tokenB = { address: CELO_ADDR, symbol: 'B' }
      const tokenC = { address: CEUR_ADDR, symbol: 'C' }
      const tokenD = { address: CREAL_ADDR, symbol: 'D' }
      const tokenE = { address: USDC_ADDR, symbol: 'E' }
      const pairs = [
        makeDirectPair(tokenA, tokenB, 0x521),
        makeDirectPair(tokenA, tokenC, 0x522),
        makeDirectPair(tokenB, tokenD, 0x523),
        makeDirectPair(tokenD, tokenE, 0x524),
      ]

      const routeIds = [...generateAllRoutes(buildConnectivityStructures(pairs)).keys()]

      expect(routeIds.slice(pairs.length)).toEqual(['A-D', 'B-C', 'B-E', 'A-E', 'C-D'])
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

    it('should discover a three-hop route for a linear four-token graph', () => {
      const connectivity = buildConnectivityStructures(linearFourTokenPairs())
      const allRoutes = generateAllRoutes(connectivity)
      const routes = allRoutes.get('cREAL-cUSD')

      expect(routes).toHaveLength(1)
      expect(routes?.[0].path).toHaveLength(3)
      expect(routes?.[0].tokens.map((token) => token.symbol)).toEqual(['cREAL', 'cUSD'])
      expect(
        encodeRoutePath(
          routes![0].path,
          routes![0].tokens[0].address as Address,
          routes![0].tokens[1].address as Address
        )
      ).toHaveLength(3)
      expect(
        encodeRoutePath(
          routes![0].path,
          routes![0].tokens[1].address as Address,
          routes![0].tokens[0].address as Address
        )
      ).toHaveLength(3)
    })

    it('should suppress a three-hop route when a direct endpoint edge exists', () => {
      const pairs = linearFourTokenPairs()
      pairs.push(
        makeDirectPair({ address: CUSD_ADDR, symbol: 'cUSD' }, { address: CREAL_ADDR, symbol: 'cREAL' }, 0x604)
      )

      const routes = generateAllRoutes(buildConnectivityStructures(pairs)).get('cREAL-cUSD')

      expect(routes?.some((route) => route.path.length === 1)).toBe(true)
      expect(routes?.some((route) => route.path.length === 3)).toBe(false)
    })

    it('should suppress a three-hop route when a two-hop endpoint path exists', () => {
      const pairs = linearFourTokenPairs()
      pairs.push(makeDirectPair({ address: CUSD_ADDR, symbol: 'cUSD' }, { address: CEUR_ADDR, symbol: 'cEUR' }, 0x605))

      const routes = generateAllRoutes(buildConnectivityStructures(pairs)).get('cREAL-cUSD')

      expect(routes?.some((route) => route.path.length === 2)).toBe(true)
      expect(routes?.some((route) => route.path.length === 3)).toBe(false)
    })

    it('should not discover endpoint pairs that require four hops', () => {
      const pairs = linearFourTokenPairs()
      pairs.push(
        makeDirectPair({ address: CREAL_ADDR, symbol: 'cREAL' }, { address: USDC_ADDR, symbol: 'USDC' }, 0x606)
      )

      const allRoutes = generateAllRoutes(buildConnectivityStructures(pairs))

      expect(allRoutes.has('USDC-cUSD')).toBe(false)
    })

    it('should keep cyclic paths simple and avoid repeated tokens', () => {
      const pairs = [
        makeDirectPair({ address: CUSD_ADDR, symbol: 'cUSD' }, { address: CELO_ADDR, symbol: 'CELO' }, 0x607),
        makeDirectPair({ address: CELO_ADDR, symbol: 'CELO' }, { address: CEUR_ADDR, symbol: 'cEUR' }, 0x608),
        makeDirectPair({ address: CEUR_ADDR, symbol: 'cEUR' }, { address: CREAL_ADDR, symbol: 'cREAL' }, 0x609),
        makeDirectPair({ address: CREAL_ADDR, symbol: 'cREAL' }, { address: CELO_ADDR, symbol: 'CELO' }, 0x60a),
        makeDirectPair({ address: CREAL_ADDR, symbol: 'cREAL' }, { address: USDC_ADDR, symbol: 'USDC' }, 0x60b),
      ]
      const allRoutes = generateAllRoutes(buildConnectivityStructures(pairs))

      for (const route of allRoutes.get('USDC-cUSD') ?? []) {
        const pathTokens = new Set<string>()
        for (const pool of route.path) {
          pathTokens.add(pool.token0)
          pathTokens.add(pool.token1)
        }
        expect(pathTokens.size).toBe(route.path.length + 1)
      }
    })

    it('should canonicalize forward and reverse traversal of a three-hop path', () => {
      const pairs = linearFourTokenPairs()
      const reversedPairs = pairs.map((pair) => ({
        ...pair,
        tokens: [pair.tokens[1], pair.tokens[0]] as [(typeof pair.tokens)[0], (typeof pair.tokens)[1]],
        path: pair.path.map((pool) => ({ ...pool, token0: pool.token1, token1: pool.token0 })),
      }))

      const forward = generateAllRoutes(buildConnectivityStructures(pairs)).get('cREAL-cUSD')
      const reverse = generateAllRoutes(buildConnectivityStructures(reversedPairs)).get('cREAL-cUSD')
      const signature = (route: Route) => route.path.map((pool) => pool.poolAddr)

      expect(forward).toHaveLength(1)
      expect(reverse).toHaveLength(1)
      expect(signature(forward![0])).toEqual(signature(reverse![0]))
    })
  })

  describe('selectOptimalRoutes()', () => {
    let connectivity: ConnectivityData
    let allRoutes: Map<RouteID, Route[]>

    beforeEach(() => {
      connectivity = buildConnectivityStructures(mockDirectPairs)
      allRoutes = generateAllRoutes(connectivity)
    })

    it('should return array of selected routes', () => {
      const selected = selectOptimalRoutes(allRoutes, false, connectivity.addrToSymbol)

      expect(Array.isArray(selected)).toBe(true)
      expect(selected.length).toBeGreaterThan(0)
    })

    it('should select single route when only one available', () => {
      // Mock single route scenario
      const singleRouteMap = new Map([['CELO-cUSD' as RouteID, [mockDirectPairs[0]]]])

      const selected = selectOptimalRoutes(singleRouteMap, false, connectivity.addrToSymbol)

      expect(selected.length).toBe(1)
      expect(selected[0]).toEqual(mockDirectPairs[0])
    })

    it('should return all routes when returnAllRoutes is true', () => {
      const selected = selectOptimalRoutes(allRoutes, true, connectivity.addrToSymbol)

      // Should return all routes (not just optimal ones)
      let totalRoutes = 0
      for (const routes of allRoutes.values()) {
        totalRoutes += routes.length
      }

      expect(selected.length).toBe(totalRoutes)
    })

    it('should apply optimization when returnAllRoutes is false', () => {
      const selected = selectOptimalRoutes(allRoutes, false, connectivity.addrToSymbol)

      // Should have one route per unique pair (optimized selection)
      const uniquePairIds = new Set(selected.map((r) => r.id))
      expect(selected.length).toBe(uniquePairIds.size)
    })
  })

  describe('selectBestRoute()', () => {
    it('should prefer route with lowest cost (Tier 1)', () => {
      const candidatesWithCost: RouteWithCost[] = [
        {
          ...mockDirectPairs[0],
          costData: { totalCostPercent: 0.8, hops: [] },
        },
        {
          ...mockDirectPairs[0],
          id: 'CELO-cUSD-alt' as RouteID,
          costData: { totalCostPercent: 0.3, hops: [] }, // Lower cost
        },
        {
          ...mockDirectPairs[0],
          id: 'CELO-cUSD-alt2' as RouteID,
          costData: { totalCostPercent: 0.5, hops: [] },
        },
      ]

      const addrToSymbol = new Map([
        [CELO_ADDR, 'CELO'],
        [CUSD_ADDR, 'cUSD'],
      ])

      const best = selectBestRoute(candidatesWithCost, addrToSymbol)

      expect((best as RouteWithCost).costData.totalCostPercent).toBe(0.3)
    })

    it('should resolve equal costs independently of candidate order', () => {
      const lowerPath: RouteWithCost = {
        ...mockDirectPairs[0],
        costData: { totalCostPercent: 0.3, hops: [] },
      }
      const higherPath: RouteWithCost = {
        ...mockDirectPairs[0],
        path: [
          {
            ...mockDirectPairs[0].path[0],
            poolType: PoolType.Virtual as `${PoolType}`,
            poolAddr: '0x0000000000000000000000000000000000000009',
          },
        ],
        costData: { totalCostPercent: 0.3, hops: [] },
      }
      const addrToSymbol = new Map([
        [CELO_ADDR, 'CELO'],
        [CUSD_ADDR, 'cUSD'],
      ])

      const first = selectBestRoute([higherPath, lowerPath], addrToSymbol)
      const second = selectBestRoute([lowerPath, higherPath], addrToSymbol)

      expect(first.path[0].poolAddr).toBe(mockDirectPairs[0].path[0].poolAddr)
      expect(second.path[0].poolAddr).toBe(mockDirectPairs[0].path[0].poolAddr)
    })

    it('should exclude a three-hop candidate when a shorter candidate exists', () => {
      const shorter: RouteWithCost = {
        ...mockDirectPairs[0],
        costData: { totalCostPercent: 0.8, hops: [] },
      }
      const threeHop: RouteWithCost = {
        id: 'CELO-cUSD' as RouteID,
        tokens: mockDirectPairs[0].tokens,
        path: [
          mockDirectPairs[1].path[0],
          {
            factoryAddr: FACTORY_ADDR,
            poolAddr: '0x3000000000000000000000000000000000000098',
            token0: CEUR_ADDR,
            token1: CREAL_ADDR,
            poolType: PoolType.FPMM as `${PoolType}`,
          },
          mockDirectPairs[2].path[0],
        ],
        costData: { totalCostPercent: 0.1, hops: [] },
      }
      const addrToSymbol = new Map([
        [CELO_ADDR, 'CELO'],
        [CUSD_ADDR, 'cUSD'],
        [CEUR_ADDR, 'cEUR'],
        [CREAL_ADDR, 'cREAL'],
      ])

      expect(selectBestRoute([threeHop, shorter], addrToSymbol)).toBe(shorter)
    })

    it('should prefer direct route over multi-hop (Tier 2)', () => {
      const candidates: Route[] = [
        {
          // 2-hop route
          id: 'cEUR-cUSD' as RouteID,
          tokens: [
            { address: CEUR_ADDR, symbol: 'cEUR' },
            { address: CUSD_ADDR, symbol: 'cUSD' },
          ],
          path: [
            {
              factoryAddr: FACTORY_ADDR,
              poolAddr: '0x3000000000000000000000000000000000000001',
              token0: CEUR_ADDR,
              token1: CELO_ADDR,
              poolType: PoolType.FPMM as `${PoolType}`,
            },
            {
              factoryAddr: FACTORY_ADDR,
              poolAddr: '0x3000000000000000000000000000000000000002',
              token0: CELO_ADDR,
              token1: CUSD_ADDR,
              poolType: PoolType.FPMM as `${PoolType}`,
            },
          ],
        },
        {
          // Direct route
          id: 'cEUR-cUSD' as RouteID,
          tokens: [
            { address: CEUR_ADDR, symbol: 'cEUR' },
            { address: CUSD_ADDR, symbol: 'cUSD' },
          ],
          path: [
            {
              factoryAddr: FACTORY_ADDR,
              poolAddr: '0x3000000000000000000000000000000000000003',
              token0: CEUR_ADDR,
              token1: CUSD_ADDR,
              poolType: PoolType.FPMM as `${PoolType}`,
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
      // The implementation's stablecoin list is: ['USDm', 'EURm', 'USDC', 'USDT']
      const USDM_ADDR = '0xab00000000000000000000000000000000000099'

      const candidates: Route[] = [
        {
          // Route through minor token (cREAL → cREAL loop, no valid intermediate)
          id: 'cEUR-cREAL' as RouteID,
          tokens: [
            { address: CEUR_ADDR, symbol: 'cEUR' },
            { address: CREAL_ADDR, symbol: 'cREAL' },
          ],
          path: [
            {
              factoryAddr: FACTORY_ADDR,
              poolAddr: '0x4000000000000000000000000000000000000001',
              token0: CEUR_ADDR,
              token1: CELO_ADDR,
              poolType: PoolType.FPMM as `${PoolType}`,
            },
            {
              factoryAddr: FACTORY_ADDR,
              poolAddr: '0x4000000000000000000000000000000000000002',
              token0: CELO_ADDR,
              token1: CREAL_ADDR,
              poolType: PoolType.FPMM as `${PoolType}`,
            },
          ],
        },
        {
          // Route through USDm (major stablecoin)
          id: 'cEUR-cREAL' as RouteID,
          tokens: [
            { address: CEUR_ADDR, symbol: 'cEUR' },
            { address: CREAL_ADDR, symbol: 'cREAL' },
          ],
          path: [
            {
              factoryAddr: FACTORY_ADDR,
              poolAddr: '0x4000000000000000000000000000000000000003',
              token0: CEUR_ADDR,
              token1: USDM_ADDR,
              poolType: PoolType.FPMM as `${PoolType}`,
            },
            {
              factoryAddr: FACTORY_ADDR,
              poolAddr: '0x4000000000000000000000000000000000000004',
              token0: USDM_ADDR,
              token1: CREAL_ADDR,
              poolType: PoolType.FPMM as `${PoolType}`,
            },
          ],
        },
      ]

      const addrToSymbol = new Map([
        [CEUR_ADDR, 'cEUR'],
        [CREAL_ADDR, 'cREAL'],
        [CELO_ADDR, 'CELO'],
        [USDM_ADDR, 'USDm'],
      ])

      const best = selectBestRoute(candidates, addrToSymbol)

      // Should select route through USDm (major stablecoin)
      const intermediate = getIntermediateToken(best)
      expect(intermediate).toBe(USDM_ADDR)
    })

    it('should return first route if no better heuristic applies (Tier 4)', () => {
      const candidates: Route[] = [mockDirectPairs[0], mockDirectPairs[1]]

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
      const twoHopRoute: Route = {
        id: 'cEUR-cUSD' as RouteID,
        tokens: [
          { address: CEUR_ADDR, symbol: 'cEUR' },
          { address: CUSD_ADDR, symbol: 'cUSD' },
        ],
        path: [
          {
            factoryAddr: FACTORY_ADDR,
            poolAddr: '0x5000000000000000000000000000000000000001',
            token0: CEUR_ADDR,
            token1: CELO_ADDR,
            poolType: PoolType.FPMM as `${PoolType}`,
          },
          {
            factoryAddr: FACTORY_ADDR,
            poolAddr: '0x5000000000000000000000000000000000000002',
            token0: CELO_ADDR,
            token1: CUSD_ADDR,
            poolType: PoolType.FPMM as `${PoolType}`,
          },
        ],
      }

      const intermediate = getIntermediateToken(twoHopRoute)

      expect(intermediate).toBe(CELO_ADDR) // CELO is the common token
    })

    // Note: getIntermediateToken() is designed for 2-hop routes only
    // Calling it on a direct route would cause an error (hop2 undefined)
    // This is expected behavior - the function is only used on multi-hop routes
  })

  describe('hasCostData()', () => {
    it('should return true for RouteWithCost', () => {
      const pairWithCost: RouteWithCost = {
        ...mockDirectPairs[0],
        costData: { totalCostPercent: 0.5, hops: [] },
      }

      expect(hasCostData(pairWithCost)).toBe(true)
    })

    it('should return false for Route without cost data', () => {
      expect(hasCostData(mockDirectPairs[0])).toBe(false)
    })

    it('should act as type guard for TypeScript', () => {
      const pair: Route | RouteWithCost = mockDirectPairs[0]

      if (hasCostData(pair)) {
        // TypeScript should know this is RouteWithCost
        expect(pair.costData).toBeDefined()
      } else {
        // TypeScript should know this is Route
        expect('costData' in pair).toBe(false)
      }
    })
  })
})
