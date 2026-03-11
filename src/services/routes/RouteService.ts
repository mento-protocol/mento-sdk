import { PoolService } from '../pools'
import { ERC20_ABI } from '../../core/abis'
import { RouteNotFoundError } from '../../core/errors'
import { Route, RouteID, Pool, RouteWithCost, RouteToken } from '../../core/types'
import { buildConnectivityStructures, generateAllRoutes, selectOptimalRoutes } from '../../utils/routeUtils'
import { canonicalSymbolKey } from '../../utils/sortUtils'
import { PublicClient } from 'viem'
import { multicall } from '../../utils/multicall'

export interface RouteOptions {
  /**
   * Whether to use pre-generated cached routes (default: true)
   */
  cached?: boolean
  /**
   * Whether to return all possible routes or just the optimal one per pair (default: false)
   */
  returnAllRoutes?: boolean
}

/**
 * Service for discovering and managing trading routes in the Mento protocol.
 * Handles route discovery for both direct (single-hop) and multi-hop trading paths.
 *
 * Routes are identified by their token pair and include the path of pools
 * needed to execute the trade. Multi-hop routes (up to 2 hops) are automatically
 * discovered when no direct route exists between two tokens.
 */
export class RouteService {
  private symbolCache: Map<string, string> = new Map()
  private routeCache = new Map<string, readonly (Route | RouteWithCost)[]>()
  private routeLookupCache = new Map<string, Map<string, Route>>()
  private routePromises = new Map<string, Promise<readonly (Route | RouteWithCost)[]>>()

  constructor(private publicClient: PublicClient, private chainId: number, private poolService: PoolService) {}

  /**
   * Generates all direct (single-hop) routes from available pools
   * Routes are deduplicated and assets are sorted alphabetically by symbol
   *
   * @returns Array of direct routes with single-hop paths
   * @throws {Error} If RPC calls fail
   *
   * @example
   * ```typescript
   * const directRoutes = await routeService.getDirectRoutes()
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

    // Fetch symbols for all tokens in parallel. Used for the route ids
    const tokenAddresses = Array.from(uniqueTokens)
    await this.hydrateTokenSymbols(tokenAddresses)

    const routes: Route[] = []

    // Loop all pools
    for (const pool of pools) {
      const symbol0 = this.symbolCache.get(pool.token0)
      const symbol1 = this.symbolCache.get(pool.token1)

      if (!symbol0 || !symbol1) {
        throw new Error(`Symbol not found for token ${pool.token0} or ${pool.token1}`)
      }

      // Create canonical route ID (alphabetically sorted symbols)
      const routeId = canonicalSymbolKey(symbol0, symbol1) as RouteID

      // Sort tokens to match the canonical route ID order (alphabetical by symbol)
      const sortedTokens: [RouteToken, RouteToken] =
        symbol0 < symbol1
          ? [
              { address: pool.token0, symbol: symbol0 },
              { address: pool.token1, symbol: symbol1 },
            ]
          : [
              { address: pool.token1, symbol: symbol1 },
              { address: pool.token0, symbol: symbol0 },
            ]

      routes.push({
        id: routeId,
        tokens: sortedTokens,
        path: [pool],
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
   * const cachedRoutes = await routeService.getRoutes({ cached: true })
   *
   * // Slower but fresh: generate from blockchain
   * const freshRoutes = await routeService.getRoutes({ cached: false })
   *
   * // Get all route variants (useful for cache generation)
   * const allRoutes = await routeService.getRoutes({ cached: false, returnAllRoutes: true })
   * ```
   */
  async getRoutes(options?: RouteOptions): Promise<readonly (Route | RouteWithCost)[]> {
    const cached = options?.cached ?? true
    const returnAllRoutes = options?.returnAllRoutes ?? false
    const cacheKey = this.getCacheKey(cached, returnAllRoutes)
    const cachedRoutes = this.routeCache.get(cacheKey)

    if (cachedRoutes) {
      return cachedRoutes
    }

    const inFlight = this.routePromises.get(cacheKey)
    if (inFlight) {
      return inFlight
    }

    const promise = this.loadRoutes(cached, returnAllRoutes)
    this.routePromises.set(cacheKey, promise)

    try {
      const routes = await promise
      this.routeCache.set(cacheKey, routes)
      if (!returnAllRoutes) {
        this.routeLookupCache.set(cacheKey, this.buildLookup(routes))
      }
      return routes
    } finally {
      this.routePromises.delete(cacheKey)
    }
  }

  async warm(options?: RouteOptions): Promise<readonly (Route | RouteWithCost)[]> {
    return this.getRoutes(options)
  }

  /**
   * Looks up the tradable route between two tokens (direct or multi-hop)
   *
   * @param tokenIn - Input token address (direction matters for routing)
   * @param tokenOut - Output token address (direction matters for routing)
   * @param options - Optional configuration (e.g., cached)
   * @returns The optimal tradable route connecting the two tokens
   * @throws {RouteNotFoundError} If no route exists between the token pair
   *
   * @example
   * ```typescript
   * const USDm = '0x765DE816845861e75A25fCA122bb6898B8B1282a'
   * const BRLm = '0xE4D5...'
   * const route = await routeService.findRoute(USDm, BRLm)
   *
   * if (route.path.length === 1) {
   *   console.log('Direct route available')
   * } else {
   *   console.log('Two-hop route:', route.path)
   * }
   * ```
   */
  async findRoute(tokenIn: string, tokenOut: string, options?: { cached?: boolean }): Promise<Route> {
    const cached = options?.cached ?? true
    const cacheKey = this.getCacheKey(cached, false)
    const routes = await this.getRoutes({ cached, returnAllRoutes: false })
    const lookup = this.routeLookupCache.get(cacheKey) ?? this.buildLookup(routes)
    this.routeLookupCache.set(cacheKey, lookup)
    const matchingRoute = lookup.get(makeTokenPairKey(tokenIn, tokenOut))

    if (!matchingRoute) {
      throw new RouteNotFoundError(tokenIn, tokenOut)
    }

    return matchingRoute
  }

  /**
   * Generate fresh tradable routes from blockchain data
   * @param returnAllRoutes - Whether to return all routes or just optimal ones per pair
   * @private
   */
  private async generateFreshRoutes(returnAllRoutes: boolean = false): Promise<Route[]> {
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
    const selectedRoutes = selectOptimalRoutes(allRoutes, returnAllRoutes, connectivity.addrToSymbol)

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

  private async loadRoutes(cached: boolean, returnAllRoutes: boolean): Promise<readonly (Route | RouteWithCost)[]> {
    if (cached) {
      try {
        const cachedRoutes = await this.loadCachedRoutes()
        if (cachedRoutes.length > 0) {
          return returnAllRoutes ? cachedRoutes : cachedRoutes
        }
      } catch {
        // Cache miss or corrupt - silently fall through to fresh generation
      }
    }

    return this.generateFreshRoutes(returnAllRoutes)
  }

  private getCacheKey(cached: boolean, returnAllRoutes: boolean): string {
    return `${cached ? 'cached' : 'fresh'}:${returnAllRoutes ? 'all' : 'best'}`
  }

  private buildLookup(routes: readonly (Route | RouteWithCost)[]): Map<string, Route> {
    const lookup = new Map<string, Route>()
    for (const route of routes) {
      lookup.set(
        makeTokenPairKey(route.tokens[0].address, route.tokens[1].address),
        route as Route
      )
    }
    return lookup
  }

  private async hydrateTokenSymbols(addresses: string[]): Promise<void> {
    const missingAddresses = addresses.filter((address) => !this.symbolCache.has(address))
    if (missingAddresses.length === 0) {
      return
    }

    const results = await multicall(
      this.publicClient,
      missingAddresses.map((address) => ({
        address: address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'symbol',
        args: [] as const,
      }))
    )

    for (const [index, address] of missingAddresses.entries()) {
      const result = results[index]
      if (!result || result.status === 'failure') {
        this.symbolCache.set(address, address)
        continue
      }

      this.symbolCache.set(address, result.result as string)
    }
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
    } catch {
      // Fallback to address if symbol fetch fails
      this.symbolCache.set(address, address)
      return address
    }
  }
}

function makeTokenPairKey(tokenA: string, tokenB: string): string {
  const [first, second] = [tokenA.toLowerCase(), tokenB.toLowerCase()].sort()
  return `${first}:${second}`
}
