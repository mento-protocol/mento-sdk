import type { Route, RouteID, Token, RouteWithCost, Pool } from '../core/types'
import { canonicalAddressKey, canonicalSymbolKey } from './sortUtils'
import type { Address as ViemAddress } from 'viem'

type TokenSymbol = string
type Address = string

/**
 * =============================================================================
 * ROUTE GENERATION UTILITIES
 * =============================================================================
 *
 * Utilities for generating optimal trading routes in the Mento protocol.
 *
 * The main workflow is:
 *
 * 1. Build connectivity structures from direct trading pairs
 * 2. Generate all possible routes (direct + two-hop)
 * 3. Select optimal routes using cost data or heuristics
 *
 * ALGORITHM OVERVIEW:
 * - Creates a graph where tokens are nodes and direct exchanges are edges
 * - Uses graph traversal to find two-hop routes through intermediate tokens
 * - Optimizes route selection based on cost data when available
 * - Falls back to heuristics (prefer direct routes, major stablecoins)
 * =============================================================================
 */

/**
 * Connectivity data structure that represents the token graph connecting all tokens.
 * Helps to efficiently answer: "How can I trade from token A to token B?"
 *
 * CONCRETE EXAMPLE:
 * Given these direct trading pairs:
 * - cUSD ↔ CELO (direct exchange exists)
 * - CELO ↔ cEUR (direct exchange exists)
 * - cUSD ↔ cREAL (direct exchange exists)
 *
 * How route finding works:
 * - Direct route: cUSD → cEUR? Check token graph: cUSD connects to [CELO, cREAL], none is cEUR → No direct route
 * - Two-hop route: cUSD → ? → cEUR?
 *   - cUSD connects to CELO, CELO connects to cEUR → Found route: cUSD → CELO → cEUR
 *   - cUSD connects to cREAL, cREAL connects to [cUSD] → No route via cREAL
 *
 * The "connectivity" part means we can quickly traverse the network of
 * token connections to find all possible trading paths.
 */

export interface ConnectivityData {
  /** Maps token address to symbol for efficient lookups
   *
   *    ```
   *    '0x765D...' → 'cUSD'
   *    '0x471E...' → 'CELO'
   *    '0xD876...' → 'cEUR'
   *    ```
   */
  addrToSymbol: Map<Address, TokenSymbol>

  /** Adjacency list mapping which tokens connect to which
   * Used for finding two-hop routes by traversing token → neighbor → neighbor.
   *
   * Example for a cUSD => cEUR swap: First we find cUSD → [CELO, cKES, ...]
   * Then we find CELO → [cUSD, cEUR, ...] = found route via cUSD → CELO → cEUR
   *
   *    ```
   *    'cUSD_addr' → Set(['CELO_addr', 'cKES_addr'])  // cUSD connects to CELO and cKES
   *    'CELO_addr' → Set(['cUSD_addr', 'cEUR_addr'])  // CELO connects to cUSD and cEUR
   *    'cEUR_addr' → Set(['CELO_addr'])               // cEUR connects to CELO
   *    'cKES_addr' → Set(['cUSD_addr'])               // cKES connects to cUSD
   *    ```
   */
  tokenGraph: Map<Address, Set<Address>>

  /** Maps sorted token address pairs to their direct route details
   *    ```
   *    'CELO_addr-cEUR_addr' → { route details for CELO ↔ cEUR }
   *    'CELO_addr-cUSD_addr' → { route details for CELO ↔ cUSD }
   *    'cUSD_addr-cKES_addr' → { route details for cUSD ↔ cKES }
   *    ```
   */
  directRouteMap: Map<RouteID, Pool>

  /** Original direct routes from mento.getDirectRoutes() for reference */
  directRoutes: Route[]
}

/**
 * Builds the connectivity data structures needed for route generation.
 *
 * Transforms a list of direct trading pairs into our ConnectivityData
 * that allow us to quickly find trading routes.
 *
 * **Construction Process:**
 *
 * ```
 * Input: TradablePairs = [
 *   { id: 'cUSD-CELO', assets: [cUSD, CELO], path: [exchange1_CELO_cUSD] },
 *   { id: 'CELO-cEUR', assets: [CELO, cEUR], path: [exchange2_CELO_cEUR] }
 * ]
 *
 * Step 1 - Build addrToSymbol map:
 *   cUSD.address → 'cUSD'
 *   CELO.address → 'CELO'
 *   cEUR.address → 'cEUR'
 *
 * Step 2 - Build directPathMap (sorted alphabetically for consistency):
 *   'CELO_addr-cEUR_addr' → exchange2_CELO_cEUR
 *   'CELO_addr-cUSD_addr' → exchange1_CELO_cUSD
 *
 * Step 3 - Build bidirectional tokenGraph:
 *   cUSD.address → Set([CELO.address])
 *   CELO.address → Set([cUSD.address, cEUR.address])
 *   cEUR.address → Set([CELO.address])
 * ```
 *
 * **Result**: We can now efficiently answer:
 * - "What's the symbol for address X?" → addrToSymbol.get(addr)
 * - "What exchange connects tokens X and Y?" → directPathMap.get(sortedAddressPairKey)
 * - "What tokens can I reach from token X?" → tokenGraph.get(X)
 *
 * @param directRoutes - Array of direct trading pairs
 * @returns Connectivity data structure for efficient route generation
 *
 * @example
 * ```typescript
 * const directPairs = [
 *   { id: 'cUSD-CELO', assets: [cUSD, CELO], path: [exchange1] },
 *   { id: 'CELO-cEUR', assets: [CELO, cEUR], path: [exchange2] }
 * ]
 *
 * const connectivityData = buildConnectivityStructures(directPairs)
 *
 * // Now we can efficiently find routes:
 * // 1. Check if cUSD connects to anything: connectivityData.tokenGraph.get(cUSD.address) → [CELO.address]
 * // 2. Check if CELO connects to cEUR: connectivityData.tokenGraph.get(CELO.address) → [cUSD.address, cEUR.address] ✓
 * // 3. Get exchange details: connectivityData.directPathMap.get('CELO_addr-cEUR_addr') → exchange2_CELO_cEUR
 * // Result: Found route cUSD → CELO → cEUR with exchange details
 * ```
 */
export function buildConnectivityStructures(directRoutes: Route[]): ConnectivityData {
  const addrToSymbol = new Map<Address, TokenSymbol>()
  const directRouteMap = new Map<RouteID, Pool>()
  const tokenGraph = new Map<string, Set<string>>()

  for (const route of directRoutes) {
    const [tokenA, tokenB] = route.tokens

    // Build address-to-symbol map for quick symbol lookups
    addrToSymbol.set(tokenA.address, tokenA.symbol)
    addrToSymbol.set(tokenB.address, tokenB.symbol)

    // Build direct path map (sorted addresses as key for consistency)
    // for quick lookup of exchange details for any token pair
    const routeId = canonicalSymbolKey(tokenA.symbol, tokenB.symbol) as RouteID
    if (!directRouteMap.has(routeId)) {
      directRouteMap.set(routeId, route.path[0])
    }

    // Build bidirectional connectivity graph for route traversal
    // Each token can reach its directly connected tokens
    if (!tokenGraph.has(tokenA.address)) tokenGraph.set(tokenA.address, new Set())
    if (!tokenGraph.has(tokenB.address)) tokenGraph.set(tokenB.address, new Set())
    tokenGraph.get(tokenA.address)!.add(tokenB.address)
    tokenGraph.get(tokenB.address)!.add(tokenA.address)
  }

  return { addrToSymbol, directRouteMap, tokenGraph, directRoutes }
}

/**
 * Generates all possible routes (direct + two-hop) using connectivity data.
 *
 * This function implements a route discovery algorithm that:
 *
 * 1. **Adds all direct routes** (single-hop routes)
 * 2. **Discovers two-hop routes** using graph traversal:
 *    - For each token A, find its neighbors (tokens directly connected)
 *    - For each neighbor B, find B's neighbors
 *    - If B connects to token C (C ≠ A), then A->B->C is a valid route
 *
 * **Route Deduplication**: Multiple routes between the same token pair
 * are collected in arrays, allowing the selection algorithm to choose
 * the best one based on cost data or heuristics.
 *
 * **Canonical Route IDs**: All routes use alphabetically sorted symbols
 * (e.g., 'cEUR-cUSD' not 'cUSD-cEUR') for consistent identification.
 *
 * @param connectivityData - The connectivity data from buildConnectivityStructures()
 * @returns Map of route ID -> array of possible routes for that token pair
 *
 * @example
 * ```typescript
 * // Given direct routes: cUSD-CELO, CELO-cEUR, cUSD-USDC
 * const allRoutes = generateAllRoutes(connectivityData)
 *
 * // Results might include:
 * // 'cUSD-CELO' -> [{ path: [cUSD->CELO] }] // direct route
 * // 'cEUR-cUSD' -> [
 * //   { path: [cUSD->USDC, USDC->cEUR] } // two-hop via USDC
 * //   { path: [cUSD->CELO, CELO->cEUR] } // two-hop via CELO
 * // ]
 * ```
 */
export function generateAllRoutes(connectivityData: ConnectivityData): Map<RouteID, Route[]> {
  const { addrToSymbol, directRouteMap, tokenGraph, directRoutes } = connectivityData
  const allRoutes = new Map<RouteID, Route[]>()

  // Step 1: Add all direct pairs (single-hop routes)
  for (const route of directRoutes) {
    if (!allRoutes.has(route.id)) {
      allRoutes.set(route.id, [])
    }
    allRoutes.get(route.id)!.push(route)
  }

  // Step 2: Generate two-hop routes using graph traversal
  // Algorithm: For each token, explore all paths of length 2

  // OUTER LOOP: "For each starting token..." (e.g., cUSD, CELO, cEUR, etc.)
  for (const [start, neighbors] of tokenGraph.entries()) {
    // MIDDLE LOOP: "Where can I go from the starting token?" (first hop)
    // Example: If start = cUSD, neighbors might be [CELO, USDC, cKES]
    for (const intermediate of neighbors) {
      // Get all tokens reachable from this intermediate token (second hop destinations)
      const secondHopNeighbors = tokenGraph.get(intermediate)
      if (!secondHopNeighbors) continue

      // INNER LOOP: "From the intermediate token, where can I go?" (second hop)
      // Example: If intermediate = CELO, secondHopNeighbors might be [cUSD, cEUR, cBRL]
      for (const end of secondHopNeighbors) {
        // Skip circular routes like cUSD → CELO → cUSD (pointless)
        if (end === start) continue

        // At this point we have a potential route: start → intermediate → end
        // Example: cUSD → CELO → cEUR

        // Try to create a valid two-hop trading pair from this route
        const twoHopRoute = createTwoHopRoute(start, intermediate, end, addrToSymbol, directRouteMap)

        // If we successfully created the pair, add it to our collection
        if (twoHopRoute) {
          if (!allRoutes.has(twoHopRoute.id)) {
            allRoutes.set(twoHopRoute.id, [])
          }
          allRoutes.get(twoHopRoute.id)!.push(twoHopRoute)
        }
      }
    }
  }

  return allRoutes
}

/**
 * Creates a two-hop tradable pair if valid exchange hops exist.
 *
 * 1. **Validates tokens exist** in the asset map
 * 2. **Finds exchange hops** for both segments of the route
 * 3. **Creates canonical pair structure** with sorted symbols
 *
 * **Route Structure**: The resulting pair represents trading from start->end
 * via intermediate token, but the assets are ordered alphabetically by symbol
 * for consistency (canonical form).
 *
 * **Path Representation**: The path array contains the actual exchange hops
 * needed to execute the trade, preserving the routing information.
 *
 * @param startToken - Starting token address
 * @param intermediate - Intermediate token address for routing
 * @param end - Destination token address
 * @param assetMap - Map of token address -> Asset details
 * @param directPathMap - Map of token pairs -> exchange hop details
 * @returns Route if valid route exists, null otherwise
 *
 * @example
 * ```typescript
 * // Create route: cUSD -> CELO -> cEUR
 * const pair = createTwoHopPair(
 *   '0x765D...', // cUSD address
 *   '0x471E...', // CELO address
 *   '0xD876...', // cEUR address
 *   addrToSymbol,
 *   directPathMap
 * )
 *
 * // Result:
 * // {
 * //   id: 'cEUR-cUSD',           // alphabetical order
 * //   assets: [cEUR, cUSD],     // alphabetical order
 * //   path: [                   // actual routing path
 * //     { cUSD->CELO exchange },
 * //     { CELO->cEUR exchange }
 * //   ]
 * // }
 * ```
 */
export function createTwoHopRoute(
  startAddr: Address,
  intermediateAddr: Address,
  endAddr: Address,
  addrToSymbol: Map<Address, TokenSymbol>,
  directRouteMap: Map<RouteID, Pool>
): Route | null {
  // Validate that both all tokens exist in our address-to-symbol map
  const startSymbol = addrToSymbol.get(startAddr)
  const intermediateSymbol = addrToSymbol.get(intermediateAddr)
  const endSymbol = addrToSymbol.get(endAddr)
  if (!startSymbol || !intermediateSymbol || !endSymbol) return null

  // Find exchange hops for both segments of the two-hop route
  // Keys are sorted token addresses for consistent lookup
  const hop1Key = canonicalSymbolKey(startSymbol, intermediateSymbol) as RouteID
  const hop2Key = canonicalSymbolKey(intermediateSymbol, endSymbol) as RouteID
  const hop1 = directRouteMap.get(hop1Key)
  const hop2 = directRouteMap.get(hop2Key)

  // If either hop doesn't exist, this route is invalid
  if (!hop1 || !hop2) return null

  // Create canonical pair structure (alphabetical symbol ordering)
  const routeId = canonicalSymbolKey(startSymbol, endSymbol) as RouteID

  // Create Token objects from address and symbol
  const startToken: Token = { address: startAddr, symbol: startSymbol }
  const endToken: Token = { address: endAddr, symbol: endSymbol }

  // Token array follows alphabetical ordering for consistency
  const tokens: [Token, Token] = startSymbol <= endSymbol ? [startToken, endToken] : [endToken, startToken]

  return {
    id: routeId,
    tokens,
    path: [hop1, hop2], // Preserves actual routing path for execution
  }
}

/**
 * Selects optimal routes from all candidates based on spread data or heuristics.
 *
 * This is the route optimization engine that implements the following logic:
 *
 * **For Single Route**: Use it directly (no optimization needed)
 *
 * **For Multiple Routes**:
 * - If `returnAllRoutes=true`: Return all routes (used for cache generation)
 * - If `returnAllRoutes=false`: Apply optimization to select the best route
 *
 * **Route Selection Strategy**: Delegates to `selectBestRoute()` which uses
 * a multi-tier approach prioritizing cost efficiency and reliability.
 *
 * @param allRoutes - Map of pair ID -> array of possible routes
 * @param returnAllRoutes - Whether to return all routes or optimize selection
 * @param assetMap - Asset map for token symbol lookups during optimization
 * @returns Array of selected optimal routes
 *
 * @example
 * ```typescript
 * // Multiple routes for cUSD-cEUR pair
 * const candidates = new Map([
 *   ['cEUR-cUSD', [
 *     { path: [cUSD->CELO->cEUR], costData: { totalCostPercent: 0.5 } },
 *     { path: [cUSD->cREAL->cEUR], costData: { totalCostPercent: 0.3 } },
 *     { path: [cUSD->cEUR] } // direct route, no cost data
 *   ]]
 * ])
 *
 * const optimal = selectOptimalRoutes(candidates, false, assetMap)
 * // Returns the cUSD->cREAL->cEUR route (lowest cost: 0.3%)
 * ```
 */
export function selectOptimalRoutes(
  allRoutes: Map<RouteID, Route[]>,
  returnAllRoutes: boolean,
  addrToSymbol: Map<Address, TokenSymbol>
): (Route | RouteWithCost)[] {
  const result = new Map<string, Route | RouteWithCost>()

  for (const [routeId, routes] of allRoutes) {
    if (routes.length === 1) {
      // Only one route available - use it directly
      result.set(routeId, routes[0])
    } else if (returnAllRoutes) {
      // Return all routes with unique keys (used for cache generation)
      routes.forEach((route, index) => {
        result.set(`${routeId}_${index}`, route)
      })
    } else {
      // Multiple routes - select the best one using optimization logic
      const bestRoute = selectBestRoute(routes, addrToSymbol)
      result.set(routeId, bestRoute)
    }
  }

  return Array.from(result.values())
}

/**
 * Selects the best route from candidates using cost data or fallback heuristics.
 *
 * This function implements a sophisticated route selection algorithm with
 * multiple optimization tiers:
 *
 * **Tier 1 - Cost-Based Optimization** (Preferred):
 * - Use routes with cost data (actual cost information)
 * - Select route with lowest `totalCostPercent`
 * - This provides the most cost-efficient trading
 *
 * **Tier 2 - Direct Route Preference** (Fallback):
 * - If no cost data available, prefer direct (single-hop) routes
 * - Direct routes have lower execution risk and gas costs
 *
 * **Tier 3 - Major Stablecoin Preference** (Final Fallback):
 * - For two-hop routes, prefer those going through major stablecoins
 * - Major FX currencies like cUSD and cEUR typically have better liquidity
 *
 * **Tier 4 - First Available** (Last Resort):
 * - If no other heuristics apply, use the first route found
 *
 * @param candidates - Array of possible routes for the same token pair
 * @param assetMap - Asset map for token symbol lookups
 * @returns The optimal route selected using the tier system
 *
 * @example
 * ```typescript
 * const candidates = [
 *   { path: [A->B->C], costData: { totalCostPercent: 0.8 } },
 *   { path: [A->D->C], costData: { totalCostPercent: 0.4 } }, // Winner: lowest cost
 *   { path: [A->C] }, // direct route, no cost data
 * ]
 *
 * const best = selectBestRoute(candidates, assetMap)
 * // Returns the A->D->C route (0.4% cost)
 * ```
 */
export function selectBestRoute(candidates: Route[], addrToSymbol: Map<Address, TokenSymbol>): Route | RouteWithCost {
  // Tier 1: Prefer routes with cost data (lowest cost wins)
  const candidatesWithCost = candidates.filter(hasCostData)
  if (candidatesWithCost.length > 0) {
    return candidatesWithCost.reduce((best, current) =>
      current.costData.totalCostPercent < best.costData.totalCostPercent ? current : best
    )
  }

  // Tier 2: Prefer direct routes (single-hop, lower risk)
  const directRoute = candidates.find((c) => c.path.length === 1)
  if (directRoute) return directRoute

  // Tier 3: Prefer routes through major stablecoins (better liquidity)
  const stablecoins = ['cUSD', 'cEUR', 'USDC', 'USDT']
  const routeWithStablecoin = candidates.find((candidate) => {
    const intermediateToken = getIntermediateToken(candidate)
    if (!intermediateToken) return false
    const symbol = addrToSymbol.get(intermediateToken)
    return symbol && stablecoins.includes(symbol)
  })

  // Tier 4: Use first available route as last resort
  return routeWithStablecoin || candidates[0]
}

/**
 * Extracts the intermediate token address from a two-hop route.
 * In a two-hop route A->B->C, this function finds token B (the intermediate).
 */
export function getIntermediateToken(route: Route): Address | undefined {
  // Find the common token between the two hops
  const [hop1, hop2] = route.path
  const hop1Tokens = [hop1.token0, hop1.token1]
  const hop2Tokens = [hop2.token0, hop2.token1]
  return hop1Tokens.find((addr) => hop2Tokens.includes(addr))
}

/**
 * Type guard to check if a Route has cost data.
 */
export function hasCostData(pair: Route | RouteWithCost): pair is RouteWithCost {
  return 'costData' in pair && pair.costData !== undefined
}
