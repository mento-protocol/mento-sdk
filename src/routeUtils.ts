import { TradablePairWithSpread } from './constants'
import { Address } from './interfaces'
import { Asset, TradablePair, TradablePairID } from './mento'

type TokenSymbol = string

interface ExchangeDetails {
  providerAddr: Address
  id: string
  assets: [Address, Address]
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
 * 2. Generate all possible routes (direct + two-hop)
 * 3. Select optimal routes using spread data or heuristics
 *
 * ALGORITHM OVERVIEW:
 * - Creates a graph where tokens are nodes and direct exchanges are edges
 * - Uses graph traversal to find two-hop routes through intermediate tokens
 * - Optimizes route selection based on spread costs when available
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

  /** Maps sorted token address pairs to their direct exchange hop details
   *    ```
   *    'CELO_addr-EURm_addr' → { exchange details for CELO ↔ EURm }
   *    'CELO_addr-USDm_addr' → { exchange details for CELO ↔ USDm }
   *    'USDm_addr-KESm_addr' → { exchange details for USDm ↔ KESm }
   *    ```
   */
  directPathMap: Map<TradablePairID, ExchangeDetails>

  /** Original direct trading pairs from mento.getDirectPairs() for reference */
  directPairs: TradablePair[]
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
 * @param directPairs - Array of direct trading pairs
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
export function buildConnectivityStructures(
  directPairs: TradablePair[]
): ConnectivityData {
  const addrToSymbol = new Map<Address, TokenSymbol>()
  const directPathMap = new Map<
    TradablePairID,
    { providerAddr: Address; id: string; assets: [Address, Address] }
  >()
  const tokenGraph = new Map<string, Set<string>>()

  for (const pair of directPairs) {
    const [assetA, assetB] = pair.assets

    // Build address-to-symbol map for quick symbol lookups
    addrToSymbol.set(assetA.address, assetA.symbol)
    addrToSymbol.set(assetB.address, assetB.symbol)

    // Build direct path map (sorted addresses as key for consistency)
    // for quick lookup of exchange details for any token pair
    const sortedAddresses = [assetA.address, assetB.address]
      .sort()
      .join('-') as TradablePairID
    if (!directPathMap.has(sortedAddresses)) {
      directPathMap.set(sortedAddresses, pair.path[0])
    }

    // Build bidirectional connectivity graph for route traversal
    // Each token can reach its directly connected tokens
    if (!tokenGraph.has(assetA.address))
      tokenGraph.set(assetA.address, new Set())
    if (!tokenGraph.has(assetB.address))
      tokenGraph.set(assetB.address, new Set())
    tokenGraph.get(assetA.address)!.add(assetB.address)
    tokenGraph.get(assetB.address)!.add(assetA.address)
  }

  return { addrToSymbol, directPathMap, tokenGraph, directPairs }
}

/**
 * Generates all possible routes (direct + two-hop) using connectivity data.
 *
 * This function implements a route discovery algorithm that:
 *
 * 1. **Adds all direct pairs** (single-hop routes)
 * 2. **Discovers two-hop routes** using graph traversal:
 *    - For each token A, find its neighbors (tokens directly connected)
 *    - For each neighbor B, find B's neighbors
 *    - If B connects to token C (C ≠ A), then A->B->C is a valid route
 *
 * **Route Deduplication**: Multiple routes between the same token pair
 * are collected in arrays, allowing the selection algorithm to choose
 * the best one based on spread data or heuristics.
 *
 * **Canonical Pair IDs**: All pairs use alphabetically sorted symbols
 * (e.g., 'EURm-USDm' not 'USDm-EURm') for consistent identification.
 *
 * @param connectivityData - The connectivity data from buildConnectivityStructures()
 * @returns Map of pair ID -> array of possible routes for that pair
 *
 * @example
 * ```typescript
 * // Given direct pairs: USDm-CELO, CELO-EURm, USDm-USDC
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
export function generateAllRoutes(
  connectivityData: ConnectivityData
): Map<TradablePairID, TradablePair[]> {
  const { addrToSymbol, directPathMap, tokenGraph, directPairs } =
    connectivityData
  const allRoutes = new Map<TradablePairID, TradablePair[]>()

  // Step 1: Add all direct pairs (single-hop routes)
  for (const pair of directPairs) {
    if (!allRoutes.has(pair.id)) {
      allRoutes.set(pair.id, [])
    }
    allRoutes.get(pair.id)!.push(pair)
  }

  // Step 2: Generate two-hop pairs using graph traversal
  // Algorithm: For each token, explore all paths of length 2

  // OUTER LOOP: "For each starting token..." (e.g., USDm, CELO, EURm, etc.)
  for (const [start, neighbors] of tokenGraph.entries()) {
    // MIDDLE LOOP: "Where can I go from the starting token?" (first hop)
    // Example: If start = USDm, neighbors might be [CELO, USDC, KESm]
    for (const intermediate of neighbors) {
      // Get all tokens reachable from this intermediate token (second hop destinations)
      const secondHopNeighbors = tokenGraph.get(intermediate)
      if (!secondHopNeighbors) continue

      // INNER LOOP: "From the intermediate token, where can I go?" (second hop)
      // Example: If intermediate = CELO, secondHopNeighbors might be [USDm, EURm, BRLm]
      for (const end of secondHopNeighbors) {
        // Skip circular routes like USDm → CELO → USDm (pointless)
        if (end === start) continue

        // At this point we have a potential route: start → intermediate → end
        // Example: USDm → CELO → EURm

        // Try to create a valid two-hop trading pair from this route
        const twoHopPair = createTwoHopPair(
          start,
          intermediate,
          end,
          addrToSymbol,
          directPathMap
        )

        // If we successfully created the pair, add it to our collection
        if (twoHopPair) {
          if (!allRoutes.has(twoHopPair.id)) {
            allRoutes.set(twoHopPair.id, [])
          }
          allRoutes.get(twoHopPair.id)!.push(twoHopPair)
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
export function createTwoHopPair(
  startToken: Address,
  intermediateToken: Address,
  endToken: Address,
  addrToSymbol: Map<Address, TokenSymbol>,
  directPathMap: Map<
    string,
    { providerAddr: Address; id: string; assets: [Address, Address] }
  >
): TradablePair | null {
  // Validate that both start and end tokens exist in our address-to-symbol map
  const startSymbol = addrToSymbol.get(startToken)
  const endSymbol = addrToSymbol.get(endToken)
  if (!startSymbol || !endSymbol) return null

  // Create Asset objects from address and symbol
  const startAsset: Asset = { address: startToken, symbol: startSymbol }
  const endAsset: Asset = { address: endToken, symbol: endSymbol }

  // Find exchange hops for both segments of the two-hop route
  // Keys are sorted token addresses for consistent lookup
  const hop1Key = [startToken, intermediateToken].sort().join('-')
  const hop2Key = [intermediateToken, endToken].sort().join('-')
  const hop1 = directPathMap.get(hop1Key)
  const hop2 = directPathMap.get(hop2Key)

  // If either hop doesn't exist, this route is invalid
  if (!hop1 || !hop2) return null

  // Create canonical pair structure (alphabetical symbol ordering)
  const sortedSymbols = [startSymbol, endSymbol].sort()
  const pairId: TradablePairID = `${sortedSymbols[0]}-${sortedSymbols[1]}`

  // Assets array follows alphabetical ordering for consistency
  const assets: [Asset, Asset] =
    startSymbol <= endSymbol ? [startAsset, endAsset] : [endAsset, startAsset]

  return {
    id: pairId,
    assets,
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
 *     { path: [USDm->CELO->EURm], spreadData: { totalSpreadPercent: 0.5 } },
 *     { path: [USDm->BRLm->EURm], spreadData: { totalSpreadPercent: 0.3 } },
 *     { path: [USDm->EURm] } // direct route, no spread data
 *   ]]
 * ])
 *
 * const optimal = selectOptimalRoutes(candidates, false, assetMap)
 * // Returns the USDm->BRLm->EURm route (lowest spread: 0.3%)
 * ```
 */
export function selectOptimalRoutes(
  allRoutes: Map<TradablePairID, TradablePair[]>,
  returnAllRoutes: boolean,
  addrToSymbol: Map<Address, TokenSymbol>
): (TradablePair | TradablePairWithSpread)[] {
  const result = new Map<string, TradablePair | TradablePairWithSpread>()

  for (const [pairId, routes] of allRoutes) {
    if (routes.length === 1) {
      // Only one route available - use it directly
      result.set(pairId, routes[0])
    } else if (returnAllRoutes) {
      // Return all routes with unique keys (used for cache generation)
      routes.forEach((route, index) => {
        result.set(`${pairId}_${index}`, route)
      })
    } else {
      // Multiple routes - select the best one using optimization logic
      const bestRoute = selectBestRoute(routes, addrToSymbol)
      result.set(pairId, bestRoute)
    }
  }

  return Array.from(result.values())
}

/**
 * Selects the best route from candidates using spread data or fallback heuristics.
 *
 * This function implements a sophisticated route selection algorithm with
 * multiple optimization tiers:
 *
 * **Tier 1 - Spread-Based Optimization** (Preferred):
 * - Use routes with spread data (actual cost information)
 * - Select route with lowest `totalSpreadPercent`
 * - This provides the most cost-efficient trading
 *
 * **Tier 2 - Direct Route Preference** (Fallback):
 * - If no spread data available, prefer direct (single-hop) routes
 * - Direct routes have lower execution risk and gas costs
 *
 * **Tier 3 - Major Stablecoin Preference** (Final Fallback):
 * - For two-hop routes, prefer those going through major stablecoins
 * - Major FX currencies like USDm and EURm typically have better liquidity
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
 *   { path: [A->B->C], spreadData: { totalSpreadPercent: 0.8 } },
 *   { path: [A->D->C], spreadData: { totalSpreadPercent: 0.4 } }, // Winner: lowest spread
 *   { path: [A->C] }, // direct route, no spread data
 * ]
 *
 * const best = selectBestRoute(candidates, assetMap)
 * // Returns the A->D->C route (0.4% spread)
 * ```
 */
export function selectBestRoute(
  candidates: TradablePair[],
  addrToSymbol: Map<Address, TokenSymbol>
): TradablePair | TradablePairWithSpread {
  // Tier 1: Prefer routes with spread data (lowest spread wins)
  const candidatesWithSpread = candidates.filter(hasSpreadData)
  if (candidatesWithSpread.length > 0) {
    return candidatesWithSpread.reduce((best, current) =>
      current.spreadData.totalSpreadPercent < best.spreadData.totalSpreadPercent
        ? current
        : best
    )
  }

  // Tier 2: Prefer direct routes (single-hop, lower risk)
  const directRoute = candidates.find((c) => c.path.length === 1)
  if (directRoute) return directRoute

  // Tier 3: Prefer routes through major stablecoins (better liquidity)
  const stablecoins = ['USDm', 'EURm', 'USDC', 'USDT']
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
export function getIntermediateToken(route: TradablePair): Address | undefined {
  // Find the common token between the two hops
  const [hop1, hop2] = route.path
  return hop1.assets.find((addr) => hop2.assets.includes(addr))
}

/**
 * Type guard to check if a Route has spread data.
 */
export function hasSpreadData(
  pair: TradablePair | TradablePairWithSpread
): pair is TradablePairWithSpread {
  return 'spreadData' in pair && pair.spreadData !== undefined
}
