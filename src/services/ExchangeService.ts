import type {
  ProviderAdapter,
  Exchange,
  Asset,
  TradablePair,
  TradablePairID,
  TradablePairWithSpread,
} from '../types'
import { BIPOOL_MANAGER_ABI, ERC20_ABI } from '../abis'
import { getContractAddress } from '../constants/addresses'
import { ChainId } from '../constants/chainId'
import {
  buildConnectivityStructures,
  generateAllRoutes,
  selectOptimalRoutes,
} from '../utils/routeUtils'

/**
 * Error thrown when an exchange is not found
 */
export class ExchangeNotFoundError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ExchangeNotFoundError'
  }
}

/**
 * Error thrown when a tradable pair is not found
 */
export class PairNotFoundError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PairNotFoundError'
  }
}

/**
 * Service for discovering exchanges and tradable pairs in the Mento protocol
 * All methods are read-only and do not require a signer
 *
 * @example
 * ```typescript
 * import { EthersAdapter } from '@mento-labs/mento-sdk/adapters'
 * import { ExchangeService } from '@mento-labs/mento-sdk/services'
 *
 * const adapter = new EthersAdapter(provider)
 * const exchangeService = new ExchangeService(adapter)
 *
 * // Get all exchanges
 * const exchanges = await exchangeService.getExchanges()
 * ```
 */
export class ExchangeService {
  private adapter: ProviderAdapter
  private exchangesCache: Exchange[] | null = null
  private symbolCache: Map<string, string> = new Map()

  /**
   * Creates a new ExchangeService instance
   *
   * @param adapter - Provider adapter (Ethers v6 or Viem) for blockchain interactions
   */
  constructor(adapter: ProviderAdapter) {
    this.adapter = adapter
  }

  /**
   * Fetches all exchanges from the BiPoolManager contract
   * Results are cached in memory for the service instance lifetime
   *
   * @returns Array of all exchanges from BiPoolManager
   * @throws {Error} If RPC call fails or BiPoolManager contract is unavailable
   *
   * @example
   * ```typescript
   * const exchanges = await exchangeService.getExchanges()
   * console.log(`Found ${exchanges.length} exchanges`)
   * ```
   */
  async getExchanges(): Promise<Exchange[]> {
    // Return cached exchanges if available
    if (this.exchangesCache) {
      return this.exchangesCache
    }

    try {
      // Get BiPoolManager address from constants
      const biPoolManagerAddress = await this.getBiPoolManagerAddress()

      // Fetch exchanges directly from BiPoolManager
      const exchangesData = (await this.adapter.readContract({
        address: biPoolManagerAddress,
        abi: BIPOOL_MANAGER_ABI,
        functionName: 'getExchanges',
        args: [],
      })) as Array<{ exchangeId: string; assets: string[] }>

      // Map to Exchange type with providerAddr set to BiPoolManager
      const exchanges: Exchange[] = exchangesData
        .filter((data) => {
          // Validate: each exchange must have exactly 2 assets
          if (data.assets.length !== 2) {
            console.warn(
              `Skipping invalid exchange ${data.exchangeId}: expected 2 assets, got ${data.assets.length}`
            )
            return false
          }
          return true
        })
        .map((data) => ({
          providerAddr: biPoolManagerAddress,
          id: data.exchangeId,
          assets: data.assets,
        }))

      // Cache the results
      this.exchangesCache = exchanges

      return exchanges
    } catch (error) {
      console.error('Failed to fetch exchanges:', error)
      throw new Error(`Failed to fetch exchanges: ${(error as Error).message}`)
    }
  }

  /**
   * Looks up a specific exchange by its unique identifier
   *
   * @param exchangeId - Unique exchange identifier (typically bytes32 hex string)
   * @returns The exchange with the specified ID
   * @throws {ExchangeNotFoundError} If no exchange with given ID exists
   * @throws {Error} If multiple exchanges found (assertion failure)
   *
   * @example
   * ```typescript
   * const exchange = await exchangeService.getExchangeById('0xabcd...')
   * console.log('Found exchange:', exchange)
   * ```
   */
  async getExchangeById(exchangeId: string): Promise<Exchange> {
    const allExchanges = await this.getExchanges()

    const matchingExchanges = allExchanges.filter((exchange) => exchange.id === exchangeId)

    if (matchingExchanges.length === 0) {
      throw new ExchangeNotFoundError(`No exchange found for id ${exchangeId}`)
    }

    if (matchingExchanges.length > 1) {
      throw new Error(`More than one exchange found with id ${exchangeId}`)
    }

    return matchingExchanges[0]
  }

  /**
   * Finds the exchange for a specific token pair (direct exchange only)
   *
   * @param token0 - Address of first token (order doesn't matter)
   * @param token1 - Address of second token (order doesn't matter)
   * @returns The direct exchange between the two tokens
   * @throws {ExchangeNotFoundError} If no direct exchange exists for the token pair
   * @throws {Error} If multiple exchanges found (assertion failure)
   *
   * @example
   * ```typescript
   * const cUSD = '0x765DE816845861e75A25fCA122bb6898B8B1282a'
   * const CELO = '0x471EcE3750Da237f93B8E339c536989b8978a438'
   * const exchange = await exchangeService.getExchangeForTokens(cUSD, CELO)
   * ```
   */
  async getExchangeForTokens(token0: string, token1: string): Promise<Exchange> {
    const allExchanges = await this.getExchanges()

    // Normalize addresses to lowercase for comparison
    const t0 = token0.toLowerCase()
    const t1 = token1.toLowerCase()

    const matchingExchanges = allExchanges.filter((exchange) => {
      const a0 = exchange.assets[0].toLowerCase()
      const a1 = exchange.assets[1].toLowerCase()

      // Bidirectional match: (t0,t1) or (t1,t0)
      return (a0 === t0 && a1 === t1) || (a0 === t1 && a1 === t0)
    })

    if (matchingExchanges.length === 0) {
      throw new ExchangeNotFoundError(`No exchange found for ${token0} and ${token1}`)
    }

    if (matchingExchanges.length > 1) {
      throw new Error(`More than one exchange found for ${token0} and ${token1}`)
    }

    return matchingExchanges[0]
  }

  /**
   * Generates all direct (single-hop) trading pairs from available exchanges
   * Pairs are deduplicated and assets are sorted alphabetically by symbol
   *
   * @returns Array of direct trading pairs with single-hop paths
   * @throws {Error} If RPC calls fail
   *
   * @example
   * ```typescript
   * const directPairs = await exchangeService.getDirectPairs()
   * console.log(`Found ${directPairs.length} direct pairs`)
   * ```
   */
  async getDirectPairs(): Promise<TradablePair[]> {
    // Get all exchanges
    const exchanges = await this.getExchanges()

    if (exchanges.length === 0) {
      return []
    }

    // Fetch all unique token addresses
    const uniqueTokens = new Set<string>()
    exchanges.forEach((exchange) => {
      exchange.assets.forEach((asset) => uniqueTokens.add(asset))
    })

    // Fetch symbols for all tokens in parallel
    const tokenAddresses = Array.from(uniqueTokens)
    await Promise.all(tokenAddresses.map((addr) => this.fetchTokenSymbol(addr)))

    // Group exchanges by canonical pair ID
    const pairMap = new Map<string, Exchange[]>()

    for (const exchange of exchanges) {
      const [addr0, addr1] = exchange.assets
      const symbol0 = this.symbolCache.get(addr0) || addr0
      const symbol1 = this.symbolCache.get(addr1) || addr1

      // Create canonical pair ID (alphabetically sorted symbols)
      const pairId = [symbol0, symbol1].sort().join('-') as TradablePairID

      if (!pairMap.has(pairId)) {
        pairMap.set(pairId, [])
      }
      pairMap.get(pairId)!.push(exchange)
    }

    // Create TradablePair objects
    const pairs: TradablePair[] = []

    for (const [pairId, pairExchanges] of pairMap.entries()) {
      const firstExchange = pairExchanges[0]
      const [addr0, addr1] = firstExchange.assets

      const asset0: Asset = {
        address: addr0,
        symbol: this.symbolCache.get(addr0) || addr0,
      }

      const asset1: Asset = {
        address: addr1,
        symbol: this.symbolCache.get(addr1) || addr1,
      }

      // Sort assets alphabetically by symbol
      const sortedAssets: [Asset, Asset] =
        asset0.symbol < asset1.symbol ? [asset0, asset1] : [asset1, asset0]

      // Create path with all exchanges for this pair
      const path = pairExchanges.map((exchange) => ({
        providerAddr: exchange.providerAddr,
        id: exchange.id,
        assets: [exchange.assets[0], exchange.assets[1]] as [string, string],
      }))

      pairs.push({
        id: pairId as TradablePairID,
        assets: sortedAssets,
        path,
      })
    }

    return pairs
  }

  /**
   * Discovers all tradable pairs including multi-hop routes (up to 2 hops)
   * Uses cached data by default for instant results, or generates fresh from blockchain
   *
   * @param options - Configuration options
   * @param options.cached - Whether to use pre-generated cached pairs (default: true)
   * @returns Array of all tradable pairs (direct + multi-hop routes)
   *
   * @example
   * ```typescript
   * // Fast: use pre-generated cache
   * const cachedPairs = await exchangeService.getTradablePairs({ cached: true })
   *
   * // Slow but fresh: generate from blockchain
   * const freshPairs = await exchangeService.getTradablePairs({ cached: false })
   * ```
   */
  async getTradablePairs(options?: {
    cached?: boolean
  }): Promise<readonly (TradablePair | TradablePairWithSpread)[]> {
    const cached = options?.cached ?? true

    // TODO: Implement cache loading
    // For now, always generate fresh
    // In the future, this would load from src/constants/tradablePairs/{chainId}.ts

    if (cached) {
      // Try to load from static cache
      try {
        const cachedPairs = await this.loadCachedPairs()
        if (cachedPairs.length > 0) {
          return cachedPairs
        }
      } catch (error) {
        console.warn('Failed to load cached pairs, falling back to fresh generation')
      }
    }

    // Generate fresh pairs from blockchain
    return this.generateFreshPairs()
  }

  /**
   * Generate fresh tradable pairs from blockchain data
   * @private
   */
  private async generateFreshPairs(): Promise<TradablePair[]> {
    // Get direct pairs
    const directPairs = await this.getDirectPairs()

    if (directPairs.length === 0) {
      return []
    }

    // Build connectivity structures for route finding
    const connectivity = buildConnectivityStructures(directPairs)

    // Generate all possible routes (direct + 2-hop)
    const allRoutes = generateAllRoutes(connectivity)

    // Select optimal routes (not returning all routes, just the best one per pair)
    const selectedPairs = selectOptimalRoutes(allRoutes, false, connectivity.addrToSymbol)

    return selectedPairs as TradablePair[]
  }

  /**
   * Load cached tradable pairs for current chain
   * @private
   */
  private async loadCachedPairs(): Promise<TradablePairWithSpread[]> {
    // TODO: Implement actual cache loading from static files
    // For now, return empty array (cache not implemented yet)
    // In Phase 8, we'll add: import cachedPairs from `../constants/tradablePairs/${chainId}`
    return []
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
      const symbol = (await this.adapter.readContract({
        address,
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
   * Looks up the tradable pair between two tokens (direct or multi-hop)
   *
   * @param tokenIn - Input token address (direction matters for routing)
   * @param tokenOut - Output token address (direction matters for routing)
   * @returns The optimal tradable pair connecting the two tokens
   * @throws {PairNotFoundError} If no tradable route exists between tokens
   *
   * @example
   * ```typescript
   * const cUSD = '0x765DE816845861e75A25fCA122bb6898B8B1282a'
   * const cBRL = '0xE4D5...'
   * const pair = await exchangeService.findPairForTokens(cUSD, cBRL)
   *
   * if (pair.path.length === 1) {
   *   console.log('Direct route available')
   * } else {
   *   console.log('Two-hop route:', pair.path)
   * }
   * ```
   */
  async findPairForTokens(tokenIn: string, tokenOut: string): Promise<TradablePair> {
    // Get all tradable pairs
    const allPairs = await this.getTradablePairs()

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

    return matchingPair as TradablePair
  }

  /**
   * Helper: Get BiPoolManager contract address for current chain
   * @private
   */
  private async getBiPoolManagerAddress(): Promise<string> {
    const chainId = (await this.adapter.getChainId()) as ChainId
    return getContractAddress(chainId, 'BiPoolManager')
  }
}
