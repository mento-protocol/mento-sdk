import type { Route, RouteID, RouteToken, RouteWithCost, Pool } from '../core/types'
import { canonicalSymbolKey } from './sortUtils'

type TokenSymbol = string
type Address = string

const MAX_DISCOVERED_ROUTE_HOPS = 3

interface DiscoveredRoute {
  route: Route
  start: Address
  end: Address
}

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
 * 2. Generate all possible routes (direct + two-hop + eligible three-hop)
 * 3. Select optimal routes using cost data or heuristics
 *
 * ALGORITHM OVERVIEW:
 * - Creates a graph where tokens are nodes and direct exchanges are edges
 * - Uses bounded graph traversal to find simple routes through intermediate tokens
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
 * - USDm ↔ CELO (direct exchange exists)
 * - CELO ↔ EURm (direct exchange exists)
 * - USDm ↔ BRLm (direct exchange exists)
 *
 * How route finding works:
 * - Direct route: USDm → EURm? Check token graph: USDm connects to [CELO, BRLm], none is EURm → No direct route
 * - Two-hop route: USDm → ? → EURm?
 *   - USDm connects to CELO, CELO connects to EURm → Found route: USDm → CELO → EURm
 *   - USDm connects to BRLm, BRLm connects to [USDm] → No route via BRLm
 *
 * The "connectivity" part means we can quickly traverse the network of
 * token connections to find all possible trading paths.
 */

export interface ConnectivityData {
  /** Maps token address to symbol for efficient lookups
   *
   *    ```
   *    '0x765D...' → 'USDm'
   *    '0x471E...' → 'CELO'
   *    '0xD876...' → 'EURm'
   *    ```
   */
  addrToSymbol: Map<Address, TokenSymbol>

  /** Adjacency list mapping which tokens connect to which
   * Used for finding two-hop routes by traversing token → neighbor → neighbor.
   *
   * Example for a USDm => EURm swap: First we find USDm → [CELO, KESm, ...]
   * Then we find CELO → [USDm, EURm, ...] = found route via USDm → CELO → EURm
   *
   *    ```
   *    'USDm_addr' → Set(['CELO_addr', 'KESm_addr'])  // USDm connects to CELO and KESm
   *    'CELO_addr' → Set(['USDm_addr', 'EURm_addr'])  // CELO connects to USDm and EURm
   *    'EURm_addr' → Set(['CELO_addr'])               // EURm connects to CELO
   *    'KESm_addr' → Set(['USDm_addr'])               // KESm connects to USDm
   *    ```
   */
  tokenGraph: Map<Address, Set<Address>>

  /** Maps sorted token address pairs to their direct route details
   *    ```
   *    'CELO_addr-EURm_addr' → { route details for CELO ↔ EURm }
   *    'CELO_addr-USDm_addr' → { route details for CELO ↔ USDm }
   *    'USDm_addr-KESm_addr' → { route details for USDm ↔ KESm }
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
 *   { id: 'USDm-CELO', assets: [USDm, CELO], path: [exchange1_CELO_USDm] },
 *   { id: 'CELO-EURm', assets: [CELO, EURm], path: [exchange2_CELO_EURm] }
 * ]
 *
 * Step 1 - Build addrToSymbol map:
 *   USDm.address → 'USDm'
 *   CELO.address → 'CELO'
 *   EURm.address → 'EURm'
 *
 * Step 2 - Build directPathMap (sorted alphabetically for consistency):
 *   'CELO_addr-EURm_addr' → exchange2_CELO_EURm
 *   'CELO_addr-USDm_addr' → exchange1_CELO_USDm
 *
 * Step 3 - Build bidirectional tokenGraph:
 *   USDm.address → Set([CELO.address])
 *   CELO.address → Set([USDm.address, EURm.address])
 *   EURm.address → Set([CELO.address])
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
 *   { id: 'USDm-CELO', assets: [USDm, CELO], path: [exchange1] },
 *   { id: 'CELO-EURm', assets: [CELO, EURm], path: [exchange2] }
 * ]
 *
 * const connectivityData = buildConnectivityStructures(directPairs)
 *
 * // Now we can efficiently find routes:
 * // 1. Check if USDm connects to anything: connectivityData.tokenGraph.get(USDm.address) → [CELO.address]
 * // 2. Check if CELO connects to EURm: connectivityData.tokenGraph.get(CELO.address) → [USDm.address, EURm.address] ✓
 * // 3. Get exchange details: connectivityData.directPathMap.get('CELO_addr-EURm_addr') → exchange2_CELO_EURm
 * // Result: Found route USDm → CELO → EURm with exchange details
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
 * Generates all possible routes (direct + two-hop + eligible three-hop) using
 * connectivity data.
 *
 * This function implements a route discovery algorithm that:
 *
 * 1. **Adds all direct routes** (single-hop routes).
 * 2. **Discovers multi-hop candidates** with one bounded simple-path traversal.
 * 3. **Keeps every two-hop route** and only the shortest routes with three or
 *    more hops. The current discovery limit is three hops.
 *
 * **Route Deduplication**: Multiple routes between the same token pair
 * are collected in arrays, allowing the selection algorithm to choose
 * the best one based on cost data or heuristics.
 *
 * **Canonical Route IDs**: All routes use alphabetically sorted symbols
 * (e.g., 'EURm-USDm' not 'USDm-EURm') for consistent identification.
 *
 * @param connectivityData - The connectivity data from buildConnectivityStructures()
 * @returns Map of route ID -> array of possible routes for that token pair
 *
 * @example
 * ```typescript
 * // Given direct routes: USDm-CELO, CELO-EURm, USDm-USDC
 * const allRoutes = generateAllRoutes(connectivityData)
 *
 * // Results might include:
 * // 'USDm-CELO' -> [{ path: [USDm->CELO] }] // direct route
 * // 'EURm-USDm' -> [
 * //   { path: [USDm->USDC, USDC->EURm] } // two-hop via USDC
 * //   { path: [USDm->CELO, CELO->EURm] } // two-hop via CELO
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

  // Step 2: Discover every simple multi-hop candidate in one bounded traversal.
  const discoveredRoutes: DiscoveredRoute[] = []

  // OUTER LOOP: "For each starting token..." (e.g., USDm, CELO, EURm, etc.)
  for (const start of tokenGraph.keys()) {
    discoverSimplePaths(
      start,
      start,
      [],
      new Set([start]),
      new Set<string>(),
      MAX_DISCOVERED_ROUTE_HOPS,
      tokenGraph,
      addrToSymbol,
      directRouteMap,
      (route, pathStart, pathEnd) => discoveredRoutes.push({ route, start: pathStart, end: pathEnd })
    )
  }

  // Step 3: Determine the minimum structural distance for every endpoint pair.
  // Direct routes seed the map with one hop. The traversal supplies distances
  // from two hops up to MAX_DISCOVERED_ROUTE_HOPS.
  const minimumHopsByRouteId = new Map<RouteID, number>()
  for (const routeId of allRoutes.keys()) minimumHopsByRouteId.set(routeId, 1)

  for (const { route } of discoveredRoutes) {
    const minimumHops = minimumHopsByRouteId.get(route.id)
    if (minimumHops === undefined || route.path.length < minimumHops) {
      minimumHopsByRouteId.set(route.id, route.path.length)
    }
  }

  // Preserve existing two-hop alternatives, including alternatives for direct
  // pairs. Routes with three or more hops are eligible only when they are the
  // shortest structural path for their endpoint pair. Insert every two-hop
  // route first to preserve the existing route and map order.
  const seenGeneratedPaths = new Set<string>()
  for (const { route, start, end } of discoveredRoutes) {
    if (route.path.length !== 2) continue
    addGeneratedRoute(allRoutes, route, start, end, addrToSymbol, seenGeneratedPaths)
  }

  for (const { route, start, end } of discoveredRoutes) {
    const minimumHops = minimumHopsByRouteId.get(route.id)
    if (route.path.length < 3 || route.path.length !== minimumHops) continue
    addGeneratedRoute(allRoutes, route, start, end, addrToSymbol, seenGeneratedPaths)
  }

  return allRoutes
}

/**
 * Walks a token graph up to `maxHops`, emitting only simple paths. The graph
 * stores token connectivity while `directRouteMap` resolves each edge to the
 * executable pool used by the route path.
 */
function discoverSimplePaths(
  start: Address,
  current: Address,
  path: Pool[],
  visitedTokens: Set<Address>,
  visitedPools: Set<string>,
  maxHops: number,
  tokenGraph: Map<Address, Set<Address>>,
  addrToSymbol: Map<Address, TokenSymbol>,
  directRouteMap: Map<RouteID, Pool>,
  onRoute: (route: Route, start: Address, end: Address) => void
): void {
  if (path.length === maxHops) return

  // RECURSIVE LOOP: "Where can I go from the current token?"
  // Example: USDm → CELO then inspects CELO's neighbors, such as EURm.
  for (const next of tokenGraph.get(current) ?? []) {
    // Skip circular paths such as USDm → CELO → USDm.
    if (visitedTokens.has(next)) continue

    const currentSymbol = addrToSymbol.get(current)
    const nextSymbol = addrToSymbol.get(next)
    if (!currentSymbol || !nextSymbol) continue

    const pool = directRouteMap.get(canonicalSymbolKey(currentSymbol, nextSymbol) as RouteID)
    if (!pool || visitedPools.has(poolSignature(pool))) continue

    const nextPath = [...path, pool]
    const nextVisitedTokens = new Set(visitedTokens).add(next)
    const nextVisitedPools = new Set(visitedPools).add(poolSignature(pool))

    // Two or more pools define a potential multi-hop route.
    // Example: USDm → CELO → EURm is a two-hop route.
    if (nextPath.length >= 2) {
      const route = createRouteFromPath(start, next, nextPath, addrToSymbol)
      if (route) onRoute(route, start, next)
    }

    discoverSimplePaths(
      start,
      next,
      nextPath,
      nextVisitedTokens,
      nextVisitedPools,
      maxHops,
      tokenGraph,
      addrToSymbol,
      directRouteMap,
      onRoute
    )
  }
}

function addGeneratedRoute(
  allRoutes: Map<RouteID, Route[]>,
  route: Route,
  start: Address,
  end: Address,
  addrToSymbol: Map<Address, TokenSymbol>,
  seenGeneratedPaths: Set<string>
): void {
  const canonicalRoute = canonicalizeGeneratedRoute(route, start, end, addrToSymbol)
  const signature = `${canonicalRoute.id}:${canonicalRoute.path.map(poolSignature).join('|')}`
  if (seenGeneratedPaths.has(signature)) return
  seenGeneratedPaths.add(signature)

  if (!allRoutes.has(canonicalRoute.id)) allRoutes.set(canonicalRoute.id, [])
  allRoutes.get(canonicalRoute.id)!.push(canonicalRoute)
}

function createRouteFromPath(
  startAddr: Address,
  endAddr: Address,
  path: Pool[],
  addrToSymbol: Map<Address, TokenSymbol>
): Route | null {
  const startSymbol = addrToSymbol.get(startAddr)
  const endSymbol = addrToSymbol.get(endAddr)
  if (!startSymbol || !endSymbol || startAddr === endAddr) return null

  const routeId = canonicalSymbolKey(startSymbol, endSymbol) as RouteID
  const startToken: RouteToken = { address: startAddr, symbol: startSymbol }
  const endToken: RouteToken = { address: endAddr, symbol: endSymbol }

  return {
    id: routeId,
    tokens: startSymbol <= endSymbol ? [startToken, endToken] : [endToken, startToken],
    path,
  }
}

function canonicalizeGeneratedRoute(
  route: Route,
  startAddr: Address,
  endAddr: Address,
  addrToSymbol: Map<Address, TokenSymbol>
): Route {
  const startSymbol = addrToSymbol.get(startAddr)
  const endSymbol = addrToSymbol.get(endAddr)
  if (!startSymbol || !endSymbol || startSymbol < endSymbol) return route

  return { ...route, path: [...route.path].reverse() }
}

function poolSignature(pool: Pool): string {
  return `${pool.poolAddr}:${pool.factoryAddr}`
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
 * // Create route: USDm -> CELO -> EURm
 * const pair = createTwoHopPair(
 *   '0x765D...', // USDm address
 *   '0x471E...', // CELO address
 *   '0xD876...', // EURm address
 *   addrToSymbol,
 *   directPathMap
 * )
 *
 * // Result:
 * // {
 * //   id: 'EURm-USDm',           // alphabetical order
 * //   assets: [EURm, USDm],     // alphabetical order
 * //   path: [                   // actual routing path
 * //     { USDm->CELO exchange },
 * //     { CELO->EURm exchange }
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
  const startToken: RouteToken = { address: startAddr, symbol: startSymbol }
  const endToken: RouteToken = { address: endAddr, symbol: endSymbol }

  // Token array follows alphabetical ordering for consistency
  const tokens: [RouteToken, RouteToken] = startSymbol <= endSymbol ? [startToken, endToken] : [endToken, startToken]

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
 * // Multiple routes for USDm-EURm pair
 * const candidates = new Map([
 *   ['EURm-USDm', [
 *     { path: [USDm->CELO->EURm], costData: { totalCostPercent: 0.5 } },
 *     { path: [USDm->BRLm->EURm], costData: { totalCostPercent: 0.3 } },
 *     { path: [USDm->EURm] } // direct route, no cost data
 *   ]]
 * ])
 *
 * const optimal = selectOptimalRoutes(candidates, false, assetMap)
 * // Returns the USDm->BRLm->EURm route (lowest cost: 0.3%)
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
 * This function implements a tiered route selection algorithm.
 *
 * **Eligibility guard**:
 * - Exclude three-hop candidates when a direct or two-hop candidate exists
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
 * - Major FX currencies like USDm and EURm typically have better liquidity
 *
 * **Tier 4 - Deterministic Path Order** (Last Resort):
 * - If no other heuristic applies, use the route with the lowest stable path key
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
  // A three-hop route is eligible only when no direct or two-hop candidate
  // exists. Keep this invariant at selection time as a defense against stale
  // or manually assembled candidate sets.
  const shorterCandidates = candidates.filter((candidate) => candidate.path.length <= 2)
  const eligibleCandidates = shorterCandidates.length > 0 ? shorterCandidates : candidates

  // Tier 1: Prefer routes with cost data (lowest cost wins)
  const candidatesWithCost = eligibleCandidates.filter(hasCostData)
  if (candidatesWithCost.length > 0) {
    return candidatesWithCost.reduce((best, current) => (compareCostedRoutes(current, best) < 0 ? current : best))
  }

  // Tier 2: Prefer direct routes (single-hop, lower risk)
  const directRoutes = eligibleCandidates.filter((candidate) => candidate.path.length === 1)
  if (directRoutes.length > 0) return [...directRoutes].sort(compareRoutePath)[0]

  // Tier 3: Prefer routes through major stablecoins (better liquidity)
  const stablecoins = ['USDm', 'EURm', 'USDC', 'USDT']
  const routesWithStablecoin = eligibleCandidates.filter((candidate) => {
    return getIntermediateTokens(candidate).some((token) => {
      const symbol = addrToSymbol.get(token)
      return symbol !== undefined && stablecoins.includes(symbol)
    })
  })
  if (routesWithStablecoin.length > 0) return [...routesWithStablecoin].sort(compareRoutePath)[0]

  // Tier 4: Use a stable path key so discovery order cannot change the result.
  return [...eligibleCandidates].sort(compareRoutePath)[0]
}

function compareCostedRoutes(candidate: RouteWithCost, current: RouteWithCost): number {
  const costDifference = candidate.costData.totalCostPercent - current.costData.totalCostPercent
  return costDifference || compareRoutePath(candidate, current)
}

/**
 * Compares route paths by hop count and a stable pool identity key.
 *
 * Callers must apply their own higher-level ordering before this comparator,
 * such as route ID or cost preference.
 */
export function compareRoutePath(first: Route, second: Route): number {
  const hopDifference = first.path.length - second.path.length
  if (hopDifference !== 0) return hopDifference

  const firstKey = deterministicRoutePathKey(first)
  const secondKey = deterministicRoutePathKey(second)
  if (firstKey < secondKey) return -1
  if (firstKey > secondKey) return 1
  return 0
}

/**
 * Returns the canonical, case-insensitive key for a route's pool path.
 *
 * Keep this ordering stable across fresh route selection, cache generation,
 * and cached route lookup.
 */
export function deterministicRoutePathKey(route: Route): string {
  return route.path
    .map((pool) =>
      [pool.poolType, pool.factoryAddr, pool.poolAddr, pool.token0, pool.token1]
        .map((value) => value.toLowerCase())
        .join(':')
    )
    .join('|')
}

/**
 * Extracts the first intermediate token address from a multi-hop route.
 * In a two-hop route A->B->C, this function finds token B. For longer routes,
 * it preserves the helper's original single-token return type and returns the
 * first intermediate token.
 */
export function getIntermediateToken(route: Route): Address | undefined {
  return getIntermediateTokens(route)[0]
}

/**
 * Returns every intermediate token in an executable multi-hop path. Adjacent
 * pools must share exactly one token for that token to be considered part of
 * the path.
 */
export function getIntermediateTokens(route: Route): Address[] {
  const intermediateTokens: Address[] = []

  for (let index = 0; index < route.path.length - 1; index++) {
    const currentPool = route.path[index]
    const nextPool = route.path[index + 1]
    const nextTokens = new Set([nextPool.token0, nextPool.token1])
    const sharedTokens = [currentPool.token0, currentPool.token1].filter((token) => nextTokens.has(token))
    if (sharedTokens.length !== 1) return []
    intermediateTokens.push(sharedTokens[0])
  }

  return intermediateTokens
}

/**
 * Type guard to check if a Route has cost data.
 */
export function hasCostData(pair: Route | RouteWithCost): pair is RouteWithCost {
  return 'costData' in pair && pair.costData !== undefined
}
