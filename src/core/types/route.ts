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
 * Represents a tradable route between two tokens, including the pool path needed to execute the trade
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
 * Extended route with cost data for route optimization
 */
export interface RouteWithCost extends Route {
  /**
   * Cost data for this route
   * Used to select optimal route when multiple options exist
   */
  costData: {
    /**
     * Total cost percentage for this route
     * Lower is better (more cost-efficient)
     * Example: 0.3 means 0.3% cost
     */
    totalCostPercent: number

    /**
     * Per-hop cost breakdown
     * Used for detailed cost analysis and debugging
     */
    hops: Array<{
      /**
       * Pool ID for this hop
       */
      poolId: string

      /**
       * Cost percentage for this specific hop
       */
      costPercent: number
    }>
  }
}
