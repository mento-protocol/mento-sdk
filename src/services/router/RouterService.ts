import { PoolService } from '../pools'
import { ERC20_ABI, ROUTER_ABI } from '../../core/abis'
import { RouteNotFoundError } from '../../core/errors'
import { Route, RouteID, Pool, RouteWithCost, Token } from '../../core/types'
import { buildConnectivityStructures, generateAllRoutes, selectOptimalRoutes } from '../../utils/routeUtils'
import { canonicalSymbolKey } from '../../utils/sortUtils'
import { Address, PublicClient } from 'viem'
import { getContractAddress, ChainId } from '../../core/constants'

/**
 * Route structure expected by the Router contract's getAmountsOut function
 */
interface RouterRoute {
  from: Address
  to: Address
  factory: Address
}

// TODO: Consider separating out quotes and swap execition from this

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

    // Fetch symbols for all tokens in parallel. Used for the route ids
    const tokenAddresses = Array.from(uniqueTokens)
    await Promise.all(tokenAddresses.map((addr: string) => this.fetchTokenSymbol(addr)))

    const routes: Route[] = []

    // Loop all pools
    for (const pool of pools) {
      const symbol0 = this.symbolCache.get(pool.token0)
      const symbol1 = this.symbolCache.get(pool.token1)

      if (!symbol0 || !symbol1) {
        // TODO: Consider error handling across the codebase for better consumer experience.
        throw new Error(`Symbol not found for token ${pool.token0} or ${pool.token1}`)
      }

      // Create canonical route ID (alphabetically sorted symbols)
      const routeId = canonicalSymbolKey(symbol0, symbol1) as RouteID

      // Sort tokens to match the canonical route ID order (alphabetical by symbol)
      const sortedTokens: [Token, Token] =
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
        console.warn('Failed to load cached routes, falling back to fresh generation')
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
      console.warn(`Failed to fetch symbol for token ${address}, using address as fallback`)
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
  async findRoute(tokenIn: string, tokenOut: string, options?: { cached?: boolean }): Promise<Route> {
    // Get all tradable routes
    const allRoutes = await this.getRoutes(options)

    const t0 = tokenIn.toLowerCase()
    const t1 = tokenOut.toLowerCase()

    // Search for matching route (bidirectional)
    const matchingRoute = allRoutes.find((route) => {
      const a0 = route.tokens[0].address.toLowerCase()
      const a1 = route.tokens[1].address.toLowerCase()

      // Match either direction: (t0,t1) or (t1,t0)
      return (a0 === t0 && a1 === t1) || (a0 === t1 && a1 === t0)
    })

    if (!matchingRoute) {
      throw new RouteNotFoundError(tokenIn, tokenOut)
    }

    return matchingRoute as Route
  }

  /**
   * Calculates the expected output amount for a swap between two tokens.
   *
   * @param tokenIn - The address of the input token
   * @param tokenOut - The address of the output token
   * @param amountIn - The amount of input tokens (in wei/smallest unit)
   * @param route - Optional pre-fetched route. If not provided, the optimal route will be found automatically.
   * @returns The expected output amount (in wei/smallest unit)
   * @throws {RouteNotFoundError} If no route exists between the token pair
   * @throws {Error} If the Router contract call fails
   *
   * @example
   * ```typescript
   * const cUSD = '0x765DE816845861e75A25fCA122bb6898B8B1282a'
   * const CELO = '0x471EcE3750Da237f93B8E339c536989b8978a438'
   *
   * // Calculate output for 100 cUSD
   * const amountIn = BigInt(100) * BigInt(10 ** 18) // 100 cUSD in wei
   * const expectedOut = await routerService.getAmountOut(cUSD, CELO, amountIn)
   * console.log(`Expected CELO output: ${expectedOut}`)
   *
   * // Or provide a pre-fetched route for better performance
   * const route = await routerService.findRoute(cUSD, CELO)
   * const expectedOut2 = await routerService.getAmountOut(cUSD, CELO, amountIn, route)
   * ```
   */
  async getAmountOut(tokenIn: Address, tokenOut: Address, amountIn: bigint, route?: Route): Promise<bigint> {
    // If the consumer does not provide a route then we find the best route.
    if (!route) {
      route = await this.findRoute(tokenIn, tokenOut)
    }

    // Convert route.path to Router contract's Route[] format
    const routerRoutes = this.pathToRouterRoutes(route.path, tokenIn, tokenOut)
    const routerAddress = getContractAddress(this.chainId as ChainId, 'Router')

    const amounts = await this.publicClient.readContract({
      address: routerAddress as `0x${string}`,
      abi: ROUTER_ABI,
      functionName: 'getAmountsOut',
      args: [amountIn, routerRoutes],
    }) as bigint[]
    
    return amounts[amounts.length - 1]
  }

  /**
   * Converts a route path to the format expected by the Router contract's getAmountsOut
   *
   * @param path - The route path (array of pools)
   * @param tokenIn - The input token address (determines swap direction)
   * @param tokenOut - The output token address
   * @returns Array of RouterRoute objects for the contract call
   * @private
   */
  private pathToRouterRoutes(path: Pool[], tokenIn: Address, _tokenOut: Address): RouterRoute[] {
    const routes: RouterRoute[] = []
    const tokenInLower = tokenIn.toLowerCase()

    // Check if we need to reverse the path
    // The path is stored in canonical order, but we may need to traverse it backwards
    const firstPool = path[0]
    const startsWithTokenIn =
      firstPool.token0.toLowerCase() === tokenInLower || firstPool.token1.toLowerCase() === tokenInLower

    // If tokenIn isn't in the first pool, reverse the path
    const orderedPath = startsWithTokenIn ? path : [...path].reverse()

    let currentTokenIn = tokenInLower

    for (const pool of orderedPath) {
      const token0 = pool.token0.toLowerCase()
      const token1 = pool.token1.toLowerCase()

      // Determine direction: which token is the input for this hop?
      let from: Address
      let to: Address

      if (currentTokenIn === token0) {
        from = pool.token0 as Address
        to = pool.token1 as Address
      } else if (currentTokenIn === token1) {
        from = pool.token1 as Address
        to = pool.token0 as Address
      } else {
        throw new Error(`Token ${currentTokenIn} not found in pool ${pool.poolAddr}`)
      }

      routes.push({
        from,
        to,
        factory: pool.factoryAddr as Address,
      })

      // The output of this hop becomes the input of the next hop
      currentTokenIn = to.toLowerCase()
    }

    return routes
  }
}
