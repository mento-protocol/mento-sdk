/**
 * Represents an exchange (legacy v2 type - used by BiPoolManager)
 * @deprecated Use Pool type for v3
 */
export interface Exchange {
  /**
   * Exchange provider contract address
   */
  providerAddr: string

  /**
   * Unique exchange identifier
   */
  id: string

  /**
   * The two token addresses for this exchange
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
 * Route identifier: sorted symbols joined with hyphen
 * Represents the two endpoint tokens regardless of the path taken
 */
export type RouteID = `${string}-${string}`

/**
 * Represents a tradable route between two tokens, including the exchange path needed to execute the trade
 */
export interface Route {
  /**
   * Canonical identifier: sorted symbols joined with hyphen
   * Always uses alphabetical order (e.g., 'cEUR-cUSD' not 'cUSD-cEUR')
   * Ensures consistent identification regardless of query direction
   */
  id: RouteID

  /**
   * The two tokens being traded, in alphabetical order by symbol
   * Always [symbolA, symbolB] where symbolA < symbolB alphabetically
   */
  assets: [Asset, Asset]

  /**
   * Array of exchange hops needed to execute the trade
   * Length 1: Direct route (single exchange)
   * Length 2: Two-hop route via intermediate token
   * Order matters for execution
   */
  path: Array<{
    // TODO: Rename to factory address
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
     * Order may differ from route assets (depends on routing direction)
     */
    assets: [string, string]
  }>
}

/**
 * Extended route with spread cost data for route optimization
 */
export interface RouteWithSpread extends Route {
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

    /**
     * Per-hop spread breakdown
     * Used for detailed cost analysis and debugging
     */
    hops: Array<{
      /**
       * Exchange ID for this hop
       */
      exchangeId: string

      /**
       * Spread percentage for this specific hop
       */
      spreadPercent: number
    }>
  }
}
