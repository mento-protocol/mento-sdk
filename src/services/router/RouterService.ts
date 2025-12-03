import { PairNotFoundError } from '@services/ExchangeService'
import { PoolService } from '@services/pools'
import { ERC20_ABI } from 'core/abis'
import { Route, RouteID, Asset, Pool } from 'core/types'
import { RouteWithSpread } from 'utils'
import {
  buildConnectivityStructures,
  generateAllRoutes,
  selectOptimalRoutes,
} from 'utils/routeUtils'
import { PublicClient } from 'viem'

export class RouterService {
  private symbolCache: Map<string, string> = new Map()

  constructor(
    private publicClient: PublicClient,
    private chainId: number,
    private poolService: PoolService
  ) {}

  /**
   * Generates all direct (single-hop) routes from available exchanges
   * Routes are deduplicated and assets are sorted alphabetically by symbol
   *
   * @returns Array of direct routes with single-hop paths
   * @throws {Error} If RPC calls fail
   *
   * @example
   * ```typescript
   * const directRoutes = await exchangeService.getDirectRoutes()
   * console.log(`Found ${directRoutes.length} direct routes`)
   * ```
   */
  async getDirectRoutes(): Promise<Route[]> {
    // Get all pools
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
    await Promise.all(tokenAddresses.map((addr: string) => this.fetchTokenSymbol(addr)))

    // Group pools by canonical pair ID
    const pairMap = new Map<string, Pool[]>()

    for (const pool of pools) {
      const symbol0 = this.symbolCache.get(pool.token0) || pool.token0
      const symbol1 = this.symbolCache.get(pool.token1) || pool.token1

      // Create canonical pair ID (alphabetically sorted symbols)
      const pairId = [symbol0, symbol1].sort().join('-') as RouteID

      if (!pairMap.has(pairId)) {
        pairMap.set(pairId, [])
      }
      pairMap.get(pairId)!.push(pool)
    }

    // Create Route objects
    const pairs: Route[] = []

    for (const [pairId, pairPools] of pairMap.entries()) {
      const firstPool = pairPools[0]

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

      // Create path with all pools for this pair
      const path = pairPools.map((pool: Pool) => ({
        providerAddr: pool.factoryAddr,
        id: pool.poolAddress,
        assets: [pool.token0, pool.token1] as [string, string],
      }))

      pairs.push({
        id: pairId as RouteID,
        assets: sortedAssets,
        path,
      })
    }

    return pairs
  }

  /**
   * Discovers all tradable routes including multi-hop routes (up to 2 hops)
   * Uses cached data by default for instant results, or generates fresh from blockchain
   *
   * @param options - Configuration options
   * @param options.cached - Whether to use pre-generated cached routes (default: true)
   * @returns Array of all tradable routes (direct + multi-hop routes)
   *
   * @example
   * ```typescript
   * // Fast: use pre-generated cache
   * const cachedRoutes = await exchangeService.getRoutes({ cached: true })
   *
   * // Slow but fresh: generate from blockchain
   * const freshRoutes = await exchangeService.getRoutes({ cached: false })
   * ```
   */
  async getRoutes(options?: {
    cached?: boolean
  }): Promise<readonly (Route | RouteWithSpread)[]> {
    const cached = options?.cached ?? true

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
    return this.generateFreshRoutes()
  }

  /**
   * Generate fresh tradable routes from blockchain data
   * @private
   */
  private async generateFreshRoutes(): Promise<Route[]> {
    // Get direct routes
    const directPairs = await this.getDirectRoutes()

    if (directPairs.length === 0) {
      return []
    }

    // Build connectivity structures for route finding
    const connectivity = buildConnectivityStructures(directPairs)

    // Generate all possible routes (direct + 2-hop)
    const allRoutes = generateAllRoutes(connectivity)

    // Select optimal routes (not returning all routes, just the best one per pair)
    const selectedPairs = selectOptimalRoutes(
      allRoutes,
      false,
      connectivity.addrToSymbol
    )

    return selectedPairs as Route[]
  }

  /**
   * Load cached tradable routes for current chain
   * @private
   */
  private async loadCachedRoutes(): Promise<RouteWithSpread[]> {
    const { getCachedRoutes } = await import('../../utils/routes')
    const cachedRoutes = await getCachedRoutes(this.chainId)
    return (cachedRoutes as RouteWithSpread[]) || []
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
   * @throws {PairNotFoundError} If no tradable route exists between tokens
   *
   * @example
   * ```typescript
   * const cUSD = '0x765DE816845861e75A25fCA122bb6898B8B1282a'
   * const cBRL = '0xE4D5...'
   * const route = await exchangeService.findRoute(cUSD, cBRL)
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
    const allPairs = await this.getRoutes(options)

    // Normalize addresses for comparison
    const t0 = tokenIn.toLowerCase()
    const t1 = tokenOut.toLowerCase()

    // Search for matching pair (bidirectional)
    const matchingPair = allPairs.find((pair) => {
      const a0 = pair.assets[0].address.toLowerCase()
      const a1 = pair.assets[1].address.toLowerCase()

      // Match either direction: (t0,t1) or (t1,t0)
      return (a0 === t0 && a1 === t1) || (a0 === t1 && a1 === t0)
    })

    if (!matchingPair) {
      throw new PairNotFoundError(
        `No pair found for tokens ${tokenIn} and ${tokenOut}. They may not have a tradable path.`
      )
    }

    return matchingPair as Route
  }
}
