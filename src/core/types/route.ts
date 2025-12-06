import { Pool } from './pool'
import { Token } from './token'

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
  tokens: [Token, Token]

  /**
   * Array of exchange hops needed to execute the trade
   * Length 1: Direct route (single pool)
   * Length 2: Two-hop route via intermediate token through two pools
   * Order matters for execution
   */
  path: Array<Pool>
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
       * Pool Address for this hop
       */
      poolAddress: string

      /**
       * Cost percentage for this specific hop
       */
      costPercent: number
    }>
  }
}
