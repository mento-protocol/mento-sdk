import { TradablePairWithSpread } from './constants/tradablePairs'
import { Address } from './interfaces'
import { Asset, TradablePair } from './mento'

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
 * Type guard to check if a TradablePair has spread data.
 */
export function hasSpreadData(
  pair: TradablePair | TradablePairWithSpread
): pair is TradablePairWithSpread {
  return 'spreadData' in pair && pair.spreadData !== undefined
}

/**
 * Connectivity data structure that represents the trading graph.
 *
 * "Connectivity structures" are data representations that help us efficiently
 * answer the question: "How can I trade from token A to token B?"
 *
 * Think of it like a road map system:
 * - **Tokens are cities** (cUSD, CELO, cEUR, etc.)
 * - **Direct exchanges are roads** connecting two cities
 * - **We want to find paths** between any two cities
 *
 * CONCRETE EXAMPLE:
 * Given these direct trading pairs:
 * - cUSD ↔ CELO (direct exchange exists)
 * - CELO ↔ cEUR (direct exchange exists)
 * - cUSD ↔ cREAL (direct exchange exists)
 *
 * We build these structures:
 *
 * 1. **assetMap**: Quick lookup of token details
 *    ```
 *    '0x765D...' → { address: '0x765D...', symbol: 'cUSD' }
 *    '0x471E...' → { address: '0x471E...', symbol: 'CELO' }
 *    '0xD876...' → { address: '0xD876...', symbol: 'cEUR' }
 *    ```
 *
 * 2. **directPathMap**: Quick lookup of exchange details between token pairs
 *    ```
 *    'celo_addr-cusd_addr' → { exchange details for cUSD↔CELO }
 *    'celo_addr-ceur_addr' → { exchange details for CELO↔cEUR }
 *    'cusd_addr-creal_addr' → { exchange details for cUSD↔cREAL }
 *    ```
 *
 * 3. **graph**: Adjacency list showing which tokens connect to which
 *    ```
 *    'cusd_addr' → Set(['celo_addr', 'creal_addr'])  // cUSD connects to CELO and cREAL
 *    'celo_addr' → Set(['cusd_addr', 'ceur_addr'])   // CELO connects to cUSD and cEUR
 *    'ceur_addr' → Set(['celo_addr'])                // cEUR connects to CELO
 *    'creal_addr' → Set(['cusd_addr'])               // cREAL connects to cUSD
 *    ```
 *
 * 4. **Visual representation of the connectivity graph**:
 *    ```
 *    cREAL ---- cUSD ---- CELO ---- cEUR
 *    ```
 *
 * **How this enables route finding**:
 * - **Direct route**: cUSD → cEUR? Check graph: cUSD connects to [CELO, cREAL], none is cEUR → No direct route
 * - **Two-hop route**: cUSD → ? → cEUR?
 *   - cUSD connects to CELO, CELO connects to cEUR → Found route: cUSD → CELO → cEUR
 *   - cUSD connects to cREAL, cREAL connects to [cUSD] → No route via cREAL
 *
 * The "connectivity" part means we can quickly traverse the network of
 * token connections to find all possible trading paths.
 */
export interface ConnectivityData {
  /** Maps token address to Asset object with symbol and address */
  assetMap: Map<string, Asset>

  /** Maps sorted token address pairs to their direct exchange hop details */
  directPathMap: Map<
    string,
    { providerAddr: Address; id: string; assets: [Address, Address] }
  >

  /** Adjacency list: maps each token address to its directly connected tokens */
  graph: Map<string, Set<string>>

  /** Original direct trading pairs for reference */
  directPairs: TradablePair[]
}

/**
 * Builds the connectivity data structures needed for route generation.
 *
 * This function transforms a list of direct trading pairs into efficient
 * data structures that allow us to quickly find trading routes.
 *
 * **Why do we need multiple data structures?**
 * Each structure serves a specific purpose in route finding:
 *
 * 1. **assetMap**: When we have a token address, quickly get its symbol
 *    - Used for: Creating canonical pair IDs (alphabetical symbol ordering)
 *    - Example: '0x765D...' → 'cUSD' (needed to create 'cEUR-cUSD' pair ID)
 *
 * 2. **directPathMap**: When we know two tokens connect, get exchange details
 *    - Used for: Building the actual trading path with exchange information
 *    - Example: Given tokens A and B, get { providerAddr, exchangeId, assets }
 *
 * 3. **graph**: When we want to explore connections, see all neighbors
 *    - Used for: Finding two-hop routes by traversing token → neighbor → neighbor
 *    - Example: cUSD → [CELO, cREAL], then CELO → [cUSD, cEUR] = found cUSD→CELO→cEUR
 *
 * **Construction Process:**
 * ```
 * Input: [
 *   { id: 'cUSD-CELO', assets: [cUSD, CELO], path: [exchange1] },
 *   { id: 'CELO-cEUR', assets: [CELO, cEUR], path: [exchange2] }
 * ]
 *
 * Step 1 - Build assetMap:
 *   cUSD.address → { address: cUSD.address, symbol: 'cUSD' }
 *   CELO.address → { address: CELO.address, symbol: 'CELO' }
 *   cEUR.address → { address: cEUR.address, symbol: 'cEUR' }
 *
 * Step 2 - Build directPathMap (sorted keys for consistency):
 *   'celo_addr-cusd_addr' → exchange1  // Note: sorted alphabetically
 *   'celo_addr-ceur_addr' → exchange2
 *
 * Step 3 - Build bidirectional graph:
 *   cUSD.address → Set([CELO.address])
 *   CELO.address → Set([cUSD.address, cEUR.address])
 *   cEUR.address → Set([CELO.address])
 * ```
 *
 * **Result**: We can now efficiently answer:
 * - "What's the symbol for address X?" → assetMap.get(X)
 * - "What exchange connects tokens X and Y?" → directPathMap.get(sortedKey)
 * - "What tokens can I reach from token X?" → graph.get(X)
 *
 * @param directPairs - Array of direct trading pairs from exchanges
 * @returns Connectivity data structures for efficient route generation
 *
 * @example
 * ```typescript
 * const directPairs = [
 *   { id: 'cUSD-CELO', assets: [cUSD, CELO], path: [exchange1] },
 *   { id: 'CELO-cEUR', assets: [CELO, cEUR], path: [exchange2] }
 * ]
 *
 * const connectivity = buildConnectivityStructures(directPairs)
 *
 * // Now we can efficiently find routes:
 * // 1. Check if cUSD connects to anything: connectivity.graph.get(cUSD.address) → [CELO.address]
 * // 2. Check if CELO connects to cEUR: connectivity.graph.get(CELO.address) → [cUSD.address, cEUR.address] ✓
 * // 3. Get exchange details: connectivity.directPathMap.get('celo_addr-ceur_addr') → exchange2
 * // Result: Found route cUSD → CELO → cEUR with exchange details
 * ```
 */
export function buildConnectivityStructures(
  directPairs: TradablePair[]
): ConnectivityData {
  const assetMap = new Map<string, Asset>()
  const directPathMap = new Map<
    string,
    { providerAddr: Address; id: string; assets: [Address, Address] }
  >()
  const graph = new Map<string, Set<string>>()

  for (const pair of directPairs) {
    const [assetA, assetB] = pair.assets

    // Build asset map for quick token address -> Asset lookup
    assetMap.set(assetA.address, assetA)
    assetMap.set(assetB.address, assetB)

    // Build direct path map (sorted addresses as key for consistency)
    // This allows quick lookup of exchange details for any token pair
    const sortedAddresses = [assetA.address, assetB.address].sort().join('-')
    if (!directPathMap.has(sortedAddresses)) {
      directPathMap.set(sortedAddresses, pair.path[0])
    }

    // Build bidirectional connectivity graph for route traversal
    // Each token can reach its directly connected tokens
    if (!graph.has(assetA.address)) graph.set(assetA.address, new Set())
    if (!graph.has(assetB.address)) graph.set(assetB.address, new Set())
    graph.get(assetA.address)!.add(assetB.address)
    graph.get(assetB.address)!.add(assetA.address)
  }

  /*
   * VISUAL WALKTHROUGH - How route finding works:
   *
   * 1. INPUT: Direct pairs [cUSD-CELO, CELO-cEUR, cUSD-cREAL]
   *
   * 2. GRAPH STRUCTURE BUILT:
   *    cREAL ---- cUSD ---- CELO ---- cEUR
   *
   * 3. FIND ROUTE: cUSD → cEUR
   *    a) Check graph.get('cusd_addr') → ['celo_addr', 'creal_addr']
   *    b) For each neighbor, check their connections:
   *       - CELO: graph.get('celo_addr') → ['cusd_addr', 'ceur_addr'] ✓ Found cEUR!
   *       - cREAL: graph.get('creal_addr') → ['cusd_addr'] ✗ No cEUR
   *    c) Route found: cUSD → CELO → cEUR
   *    d) Get exchange details:
   *       - Hop 1: directPathMap.get('celo_addr-cusd_addr') → exchange details
   *       - Hop 2: directPathMap.get('celo_addr-ceur_addr') → exchange details
   *
   * 4. RESULT: Complete tradable pair with routing path
   */

  return { assetMap, directPathMap, graph, directPairs }
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
 * (e.g., 'cEUR-cUSD' not 'cUSD-cEUR') for consistent identification.
 *
 * @param connectivity - The connectivity data from buildConnectivityStructures
 * @returns Map of pair ID -> array of possible routes for that pair
 *
 * @example
 * ```typescript
 * // Given direct pairs: cUSD-CELO, CELO-cEUR, cUSD-cREAL
 * const allRoutes = generateAllRoutes(connectivity)
 *
 * // Results might include:
 * // 'cEUR-cUSD' -> [
 * //   { path: [cUSD->CELO, CELO->cEUR] },  // two-hop via CELO
 * //   { path: [cUSD->cREAL, cREAL->cEUR] } // two-hop via cREAL (if exists)
 * // ]
 * // 'cUSD-CELO' -> [{ path: [cUSD->CELO] }] // direct route
 * ```
 */
export function generateAllRoutes(
  connectivity: ConnectivityData
): Map<string, TradablePair[]> {
  const { assetMap, directPathMap, graph, directPairs } = connectivity
  const allCandidates = new Map<string, TradablePair[]>()

  // Step 1: Add all direct pairs (single-hop routes)
  for (const pair of directPairs) {
    if (!allCandidates.has(pair.id)) {
      allCandidates.set(pair.id, [])
    }
    allCandidates.get(pair.id)!.push(pair)
  }

  // Step 2: Generate two-hop pairs using graph traversal
  // Algorithm: For each token, explore all paths of length 2
  for (const [start, neighbors] of graph.entries()) {
    for (const intermediate of neighbors) {
      const secondHopNeighbors = graph.get(intermediate)
      if (!secondHopNeighbors) continue

      for (const end of secondHopNeighbors) {
        if (end === start) continue // Prevent circular routes (A->B->A)

        // Attempt to create a two-hop route: start -> intermediate -> end
        const twoHopPair = createTwoHopPair(
          start,
          intermediate,
          end,
          assetMap,
          directPathMap
        )

        if (twoHopPair) {
          if (!allCandidates.has(twoHopPair.id)) {
            allCandidates.set(twoHopPair.id, [])
          }
          allCandidates.get(twoHopPair.id)!.push(twoHopPair)
        }
      }
    }
  }

  return allCandidates
}

/**
 * Creates a two-hop tradable pair if valid exchange hops exist.
 *
 * This function validates and constructs a two-hop trading route by:
 *
 * 1. **Validating tokens exist** in the asset map
 * 2. **Finding exchange hops** for both segments of the route
 * 3. **Creating canonical pair structure** with sorted symbols
 *
 * **Route Structure**: The resulting pair represents trading from start->end
 * via intermediate token, but the assets are ordered alphabetically by symbol
 * for consistency (canonical form).
 *
 * **Path Representation**: The path array contains the actual exchange hops
 * needed to execute the trade, preserving the routing information.
 *
 * @param start - Starting token address
 * @param intermediate - Intermediate token address for routing
 * @param end - Destination token address
 * @param assetMap - Map of token address -> Asset details
 * @param directPathMap - Map of token pairs -> exchange hop details
 * @returns TradablePair if valid route exists, null otherwise
 *
 * @example
 * ```typescript
 * // Create route: cUSD -> CELO -> cEUR
 * const pair = createTwoHopPair(
 *   '0x765D...', // cUSD address
 *   '0x471E...', // CELO address
 *   '0xD876...', // cEUR address
 *   assetMap,
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
export function createTwoHopPair(
  start: Address,
  intermediate: Address,
  end: Address,
  assetMap: Map<string, Asset>,
  directPathMap: Map<
    string,
    { providerAddr: Address; id: string; assets: [Address, Address] }
  >
): TradablePair | null {
  // Validate that both start and end tokens exist in our asset map
  const assetStart = assetMap.get(start)
  const assetEnd = assetMap.get(end)
  if (!assetStart || !assetEnd) return null

  // Find exchange hops for both segments of the two-hop route
  // Keys are sorted token addresses for consistent lookup
  const hop1Key = [start, intermediate].sort().join('-')
  const hop2Key = [intermediate, end].sort().join('-')
  const hop1 = directPathMap.get(hop1Key)
  const hop2 = directPathMap.get(hop2Key)

  // If either hop doesn't exist, this route is invalid
  if (!hop1 || !hop2) return null

  // Create canonical pair structure (alphabetical symbol ordering)
  const sortedSymbols = [assetStart.symbol, assetEnd.symbol].sort()
  const pairId = `${sortedSymbols[0]}-${sortedSymbols[1]}`

  // Assets array follows alphabetical ordering for consistency
  const assets: [Asset, Asset] =
    assetStart.symbol <= assetEnd.symbol
      ? [assetStart, assetEnd]
      : [assetEnd, assetStart]

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
 * @param allCandidates - Map of pair ID -> array of possible routes
 * @param returnAllRoutes - Whether to return all routes or optimize selection
 * @param assetMap - Asset map for token symbol lookups during optimization
 * @returns Array of selected optimal routes
 *
 * @example
 * ```typescript
 * // Multiple routes for cUSD-cEUR pair
 * const candidates = new Map([
 *   ['cEUR-cUSD', [
 *     { path: [cUSD->CELO->cEUR], spreadData: { totalSpreadPercent: 0.5 } },
 *     { path: [cUSD->cREAL->cEUR], spreadData: { totalSpreadPercent: 0.3 } },
 *     { path: [cUSD->cEUR] } // direct route, no spread data
 *   ]]
 * ])
 *
 * const optimal = selectOptimalRoutes(candidates, false, assetMap)
 * // Returns the cUSD->cREAL->cEUR route (lowest spread: 0.3%)
 * ```
 */
export function selectOptimalRoutes(
  allCandidates: Map<string, TradablePair[]>,
  returnAllRoutes: boolean,
  assetMap: Map<string, Asset>
): (TradablePair | TradablePairWithSpread)[] {
  const result = new Map<string, TradablePair | TradablePairWithSpread>()

  for (const [pairId, candidates] of allCandidates) {
    if (candidates.length === 1) {
      // Only one route available - use it directly
      result.set(pairId, candidates[0])
    } else if (returnAllRoutes) {
      // Return all routes with unique keys (used for cache generation)
      candidates.forEach((candidate, index) => {
        result.set(`${pairId}_${index}`, candidate)
      })
    } else {
      // Multiple routes - select the best one using optimization logic
      const bestRoute = selectBestRoute(candidates, assetMap)
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
 * **Tier 3 - Stablecoin Preference** (Final Fallback):
 * - For two-hop routes, prefer those going through major stablecoins
 * - Stablecoins (cUSD, cEUR, cREAL, eXOF) typically have better liquidity
 * - More reliable execution and tighter spreads
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
  assetMap: Map<string, Asset>
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
  const stablecoins = ['cUSD', 'cEUR', 'cREAL', 'eXOF']
  const routeWithStablecoin = candidates.find((candidate) => {
    const intermediateToken = getIntermediateToken(candidate)
    const asset = assetMap.get(intermediateToken)
    return asset && stablecoins.includes(asset.symbol)
  })

  // Tier 4: Use first available route as last resort
  return routeWithStablecoin || candidates[0]
}

/**
 * Extracts the intermediate token address from a two-hop route.
 *
 * In a two-hop route A->B->C, this function finds token B (the intermediate).
 * The intermediate token is the one that appears in both exchange hops.
 *
 * **Algorithm**: Find the token address that exists in both hop1.assets
 * and hop2.assets arrays.
 *
 * **Fallback**: If no common token found (shouldn't happen in valid routes),
 * returns the first token from the first hop.
 *
 * @param candidate - The two-hop tradable pair
 * @returns The intermediate token address
 *
 * @example
 * ```typescript
 * const twoHopRoute = {
 *   id: 'cEUR-cUSD',
 *   path: [
 *     { assets: ['0x765D...', '0x471E...'] }, // cUSD->CELO hop
 *     { assets: ['0x471E...', '0xD876...'] }  // CELO->cEUR hop
 *   ]
 * }
 *
 * const intermediate = getIntermediateToken(twoHopRoute)
 * // Returns '0x471E...' (CELO address - common to both hops)
 * ```
 */
export function getIntermediateToken(candidate: TradablePair): Address {
  // Find the common token between the two hops
  const [hop1, hop2] = candidate.path
  return (
    hop1.assets.find((addr) => hop2.assets.includes(addr)) || hop1.assets[0]
  )
}
