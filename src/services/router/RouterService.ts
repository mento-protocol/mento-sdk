import { PoolService } from '../pools'
import { ERC20_ABI } from '../../core/abis'
import { RouteNotFoundError } from '../../core/errors'
import { Route, RouteID, Asset, Pool, RouteWithCost } from '../../core/types'
import {
  buildConnectivityStructures,
  generateAllRoutes,
  selectOptimalRoutes,
} from '../../utils/routeUtils'
import { PublicClient } from 'viem'

/**
 * Service for discovering and managing trading routes in the Mento protocol.
 * Handles route discovery for both direct (single-hop) and multi-hop trading paths.
 *
 * Routes are identified by their token pair and include the path of pools
 * needed to execute the trade. Multi-hop routes (up to 2 hops) are automatically
 * discovered when no direct route exists between two tokens.
 */
export class RouterService {
  private symbolCache: Map<string, string> = new Map()

  constructor(
    private publicClient: PublicClient,
    private chainId: number,
    private poolService: PoolService
  ) {}

  /**
   * Generates all direct (single-hop) routes from available pools
   * Routes are deduplicated and assets are sorted alphabetically by symbol
   *
   * @returns Array of direct routes with single-hop paths
   * @throws {Error} If RPC calls fail
   *
   * @example
   * ```typescript
   * const directRoutes = await routerService.getDirectRoutes()
   * console.log(`Found ${directRoutes.length} direct routes`)
   * ```
   */
  async getDirectRoutes(): Promise<Route[]> {
    const pools = await this.poolService.getPools()

    if (pools.length === 0) {
      return []
    }

    // Fetch all unique token addresses
    const uniqueTokens = new Set<string>()
    pools.forEach((pool: Pool) => {
      uniqueTokens.add(pool.token0)
      uniqueTokens.add(pool.token1)
    })

    // Fetch symbols for all tokens in parallel
    const tokenAddresses = Array.from(uniqueTokens)
    await Promise.all(
      tokenAddresses.map((addr: string) => this.fetchTokenSymbol(addr))
    )

    // Group pools by canonical route ID
    const routeMap = new Map<string, Pool[]>()

    for (const pool of pools) {
      const symbol0 = this.symbolCache.get(pool.token0) || pool.token0
      const symbol1 = this.symbolCache.get(pool.token1) || pool.token1

      // Create canonical route ID (alphabetically sorted symbols)
      const routeId = [symbol0, symbol1].sort().join('-') as RouteID

      if (!routeMap.has(routeId)) {
        routeMap.set(routeId, [])
      }
      routeMap.get(routeId)!.push(pool)
    }

    // Create Route objects
    const routes: Route[] = []

    for (const [routeId, routePools] of routeMap.entries()) {
      const firstPool = routePools[0]

      const asset0: Asset = {
        address: firstPool.token0,
        symbol: this.symbolCache.get(firstPool.token0) || firstPool.token0,
      }

      const asset1: Asset = {
        address: firstPool.token1,
        symbol: this.symbolCache.get(firstPool.token1) || firstPool.token1,
      }

      // Sort assets alphabetically by symbol
      const sortedAssets: [Asset, Asset] =
        asset0.symbol < asset1.symbol ? [asset0, asset1] : [asset1, asset0]

      // Create path with all pools for this route
      const path = routePools.map((pool: Pool) => ({
        providerAddr: pool.factoryAddr,
        id: pool.poolAddress,
        assets: [pool.token0, pool.token1] as [string, string],
      }))

      routes.push({
        id: routeId as RouteID,
        assets: sortedAssets,
        path,
      })
    }

    return routes
  }

  /**
   * Discovers all tradable routes including multi-hop routes (up to 2 hops)
   * Uses cached data by default for instant results, or generates fresh from blockchain
   *
   * @param options - Configuration options
   * @param options.cached - Whether to use pre-generated cached routes (default: true)
   * @param options.returnAllRoutes - Whether to return all possible routes or just the optimal one per pair (default: false)
   * @returns Array of all tradable routes (direct + multi-hop routes)
   *
   * @example
   * ```typescript
   * // Fast: use pre-generated cache
   * const cachedRoutes = await routerService.getRoutes({ cached: true })
   *
   * // Slow but fresh: generate from blockchain
   * const freshRoutes = await routerService.getRoutes({ cached: false })
   *
   * // Get all route variants (useful for cache generation)
   * const allRoutes = await routerService.getRoutes({ cached: false, returnAllRoutes: true })
   * ```
   */
  async getRoutes(options?: {
    cached?: boolean
    returnAllRoutes?: boolean
  }): Promise<readonly (Route | RouteWithCost)[]> {
    const cached = options?.cached ?? true
    const returnAllRoutes = options?.returnAllRoutes ?? false

    // TODO: Implement cache loading
    // For now, always generate fresh
    // In the future, this would load from src/constants/routes/{chainId}.ts

    if (cached) {
      // Try to load from static cache
      try {
        const cachedRoutes = await this.loadCachedRoutes()
        if (cachedRoutes.length > 0) {
          return cachedRoutes
        }
      } catch (error) {
        console.warn(
          'Failed to load cached routes, falling back to fresh generation'
        )
      }
    }

    // Generate fresh routes from blockchain
    return this.generateFreshRoutes(returnAllRoutes)
  }

  /**
   * Generate fresh tradable routes from blockchain data
   * @param returnAllRoutes - Whether to return all routes or just optimal ones per pair
   * @private
   */
  private async generateFreshRoutes(
    returnAllRoutes: boolean = false
  ): Promise<Route[]> {
    // Get direct routes
    const directRoutes = await this.getDirectRoutes()

    if (directRoutes.length === 0) {
      return []
    }

    // Build connectivity structures for route finding
    const connectivity = buildConnectivityStructures(directRoutes)

    // Generate all possible routes (direct + 2-hop)
    const allRoutes = generateAllRoutes(connectivity)

    // Select routes based on returnAllRoutes flag
    const selectedRoutes = selectOptimalRoutes(
      allRoutes,
      returnAllRoutes,
      connectivity.addrToSymbol
    )

    return selectedRoutes as Route[]
  }

  /**
   * Load cached tradable routes for current chain
   * @private
   */
  private async loadCachedRoutes(): Promise<RouteWithCost[]> {
    const { getCachedRoutes } = await import('../../utils/routes')
    const cachedRoutes = await getCachedRoutes(this.chainId)
    return (cachedRoutes as RouteWithCost[]) || []
  }

  /**
   * Helper: Fetch token symbol from on-chain
   * Results are cached to avoid redundant RPC calls
   * Falls back to address if symbol fetch fails
   *
   * @private
   */
  private async fetchTokenSymbol(address: string): Promise<string> {
    // Return cached symbol if available
    if (this.symbolCache.has(address)) {
      return this.symbolCache.get(address)!
    }

    try {
      const symbol = (await this.publicClient.readContract({
        address: address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'symbol',
        args: [],
      })) as string

      // Cache the symbol
      this.symbolCache.set(address, symbol)
      return symbol
    } catch (error) {
      // Fallback to address if symbol fetch fails
      console.warn(
        `Failed to fetch symbol for token ${address}, using address as fallback`
      )
      this.symbolCache.set(address, address)
      return address
    }
  }

  /**
   * Looks up the tradable route between two tokens (direct or multi-hop)
   *
   * @param tokenIn - Input token address (direction matters for routing)
   * @param tokenOut - Output token address (direction matters for routing)
   * @returns The optimal tradable route connecting the two tokens
   * @throws {RouteNotFoundError} If no route exists between the token pair
   *
   * @example
   * ```typescript
   * const cUSD = '0x765DE816845861e75A25fCA122bb6898B8B1282a'
   * const cBRL = '0xE4D5...'
   * const route = await routerService.findRoute(cUSD, cBRL)
   *
   * if (route.path.length === 1) {
   *   console.log('Direct route available')
   * } else {
   *   console.log('Two-hop route:', route.path)
   * }
   * ```
   */
  async findRoute(
    tokenIn: string,
    tokenOut: string,
    options?: { cached?: boolean }
  ): Promise<Route> {
    // Get all tradable routes
    const allRoutes = await this.getRoutes(options)

    const t0 = tokenIn.toLowerCase()
    const t1 = tokenOut.toLowerCase()

    // Search for matching route (bidirectional)
    const matchingRoute = allRoutes.find((route) => {
      const a0 = route.assets[0].address.toLowerCase()
      const a1 = route.assets[1].address.toLowerCase()

      // Match either direction: (t0,t1) or (t1,t0)
      return (a0 === t0 && a1 === t1) || (a0 === t1 && a1 === t0)
    })

    if (!matchingRoute) {
      throw new RouteNotFoundError(tokenIn, tokenOut)
    }

    return matchingRoute as Route
  }

  //  await mento.getAmountOut(
  //           fromTokenAddr,
  //           toTokenAddr,
  //           amountWeiBN,
  //           tradablePair,

  // Needs to call router
  // - getAmountsOut(uint256 amountIn, Route[] memory routes) public view returns (uint256[] memory amounts) {
  // Route looks like this: {from, to, factory}
  // What should the factory be when calling getAmountsOut?
  // It can be null, but if it is null then the default factory in the router is used
  // 
  // TODO: Confirm the default factory
}
