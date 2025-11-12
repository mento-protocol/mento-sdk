/**
 * Represents a liquidity pool between two tokens in the Mento protocol
 */
export interface Exchange {
  /**
   * The address of the exchange provider contract managing this pool
   */
  providerAddr: string

  /**
   * Unique identifier for this exchange within the provider
   */
  id: string

  /**
   * Array of exactly 2 token addresses forming the trading pair
   * Order is not guaranteed (could be [tokenA, tokenB] or [tokenB, tokenA])
   */
  assets: string[]
}

/**
 * Represents a token with its identifying information
 */
export interface Asset {
  /**
   * Token contract address
   */
  address: string

  /**
   * Human-readable token symbol (e.g., 'cUSD', 'CELO')
   * Fetched from on-chain via ERC-20 symbol() method
   * Falls back to address if symbol fetch fails
   */
  symbol: string
}

/**
 * Canonical pair identifier: sorted symbols joined with hyphen
 */
export type TradablePairID = `${string}-${string}`

/**
 * Represents a tradable route between two tokens, including the exchange path needed to execute the trade
 */
export interface TradablePair {
  /**
   * Canonical identifier: sorted symbols joined with hyphen
   * Always uses alphabetical order (e.g., 'cEUR-cUSD' not 'cUSD-cEUR')
   * Ensures consistent identification regardless of query direction
   */
  id: TradablePairID

  /**
   * The two tokens being traded, in alphabetical order by symbol
   * Always [symbolA, symbolB] where symbolA < symbolB alphabetically
   */
  assets: [Asset, Asset]

  /**
   * Array of exchange hops needed to execute the trade
   * Length 1: Direct trade (single exchange)
   * Length 2: Two-hop route via intermediate token
   * Order matters for execution
   */
  path: Array<{
    /**
     * Exchange provider contract address
     */
    providerAddr: string

    /**
     * Exchange ID within that provider
     */
    id: string

    /**
     * The two token addresses for this hop
     * Order may differ from pair assets (depends on routing direction)
     */
    assets: [string, string]
  }>
}

/**
 * Extended pair with spread cost data for route optimization
 */
export interface TradablePairWithSpread extends TradablePair {
  /**
   * Spread cost data for this route
   * Used to select optimal route when multiple options exist
   */
  spreadData: {
    /**
     * Total cost percentage for this route
     * Lower is better (more cost-efficient)
     * Example: 0.3 means 0.3% spread cost
     */
    totalSpreadPercent: number
  }
}
