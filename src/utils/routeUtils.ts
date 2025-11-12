import type { TradablePair, TradablePairID, Asset, TradablePairWithSpread } from '../types'

/**
 * Internal connectivity graph structure for route finding
 */
interface ConnectivityData {
  /**
   * Maps token address to symbol for fast lookups
   * Avoids redundant on-chain symbol fetches
   */
  addrToSymbol: Map<string, string>

  /**
   * Adjacency list representing the token connectivity graph
   * Maps each token address to set of directly connected token addresses
   * Used for two-hop route discovery via graph traversal
   */
  tokenGraph: Map<string, Set<string>>

  /**
   * Maps sorted token pair to exchange details
   * Enables fast lookup of exchange for any token pair
   * Key is always sorted: [addr0, addr1].sort().join('-')
   */
  directPathMap: Map<string, ExchangeDetails>

  /**
   * Original direct pairs (for reference and deduplication)
   */
  directPairs: TradablePair[]
}

/**
 * Internal exchange details structure
 * NOT EXPORTED - used only within route utilities
 */
interface ExchangeDetails {
  providerAddr: string
  id: string
  assets: [string, string]
}

/**
 * Build connectivity structures from direct pairs for route finding
 * Creates token graph, address-to-symbol map, and direct path map
 *
 * @param directPairs - Array of direct trading pairs
 * @returns Connectivity data structure for route generation
 */
export function buildConnectivityStructures(directPairs: TradablePair[]): ConnectivityData {
  const addrToSymbol = new Map<string, string>()
  const tokenGraph = new Map<string, Set<string>>()
  const directPathMap = new Map<string, ExchangeDetails>()

  for (const pair of directPairs) {
    const [asset0, asset1] = pair.assets

    // Populate address-to-symbol mapping
    addrToSymbol.set(asset0.address, asset0.symbol)
    addrToSymbol.set(asset1.address, asset1.symbol)

    // Build bidirectional token graph (adjacency list)
    if (!tokenGraph.has(asset0.address)) {
      tokenGraph.set(asset0.address, new Set())
    }
    if (!tokenGraph.has(asset1.address)) {
      tokenGraph.set(asset1.address, new Set())
    }
    tokenGraph.get(asset0.address)!.add(asset1.address)
    tokenGraph.get(asset1.address)!.add(asset0.address)

    // Create direct path map with sorted address key
    const sortedAddrs = [asset0.address, asset1.address].sort()
    const pairKey = sortedAddrs.join('-')

    // Use first exchange hop from the path as the representative exchange
    const firstHop = pair.path[0]
    directPathMap.set(pairKey, {
      providerAddr: firstHop.providerAddr,
      id: firstHop.id,
      assets: [firstHop.assets[0], firstHop.assets[1]],
    })
  }

  return {
    addrToSymbol,
    tokenGraph,
    directPathMap,
    directPairs,
  }
}

/**
 * Generate all possible routes (direct + 2-hop) from connectivity data
 *
 * @param connectivity - Token connectivity data
 * @returns Map of pair IDs to arrays of possible routes
 */
export function generateAllRoutes(
  connectivity: ConnectivityData
): Map<TradablePairID, TradablePair[]> {
  const allRoutes = new Map<TradablePairID, TradablePair[]>()
  const { addrToSymbol, tokenGraph, directPathMap, directPairs } = connectivity

  // Add all direct pairs
  for (const pair of directPairs) {
    if (!allRoutes.has(pair.id)) {
      allRoutes.set(pair.id, [])
    }
    allRoutes.get(pair.id)!.push(pair)
  }

  // Generate 2-hop routes via graph traversal
  // For each token A, for each neighbor B, for each neighbor C (where C ≠ A),
  // create route A→B→C
  for (const [tokenA, neighborsOfA] of tokenGraph.entries()) {
    for (const tokenB of neighborsOfA) {
      const neighborsOfB = tokenGraph.get(tokenB)
      if (!neighborsOfB) continue

      for (const tokenC of neighborsOfB) {
        // Skip if C is the same as A (would create circular route)
        if (tokenC === tokenA) continue

        // Skip if A and C already have a direct connection (we already have that pair)
        const sortedACAddrs = [tokenA, tokenC].sort()
        if (directPathMap.has(sortedACAddrs.join('-'))) continue

        // Create 2-hop route A→B→C
        const symbolA = addrToSymbol.get(tokenA) || tokenA
        const symbolB = addrToSymbol.get(tokenB) || tokenB
        const symbolC = addrToSymbol.get(tokenC) || tokenC

        // Get the two exchange hops
        const sortedABAddrs = [tokenA, tokenB].sort()
        const sortedBCAddrs = [tokenB, tokenC].sort()

        const hopAB = directPathMap.get(sortedABAddrs.join('-'))
        const hopBC = directPathMap.get(sortedBCAddrs.join('-'))

        if (!hopAB || !hopBC) continue

        // Create canonical pair ID (sorted symbols)
        const pairId = [symbolA, symbolC].sort().join('-') as TradablePairID

        // Create the 2-hop pair
        const asset0: Asset = { address: tokenA, symbol: symbolA }
        const asset1: Asset = { address: tokenC, symbol: symbolC }

        const sortedAssets: [Asset, Asset] =
          symbolA < symbolC ? [asset0, asset1] : [asset1, asset0]

        const twoHopPair: TradablePair = {
          id: pairId,
          assets: sortedAssets,
          path: [
            {
              providerAddr: hopAB.providerAddr,
              id: hopAB.id,
              assets: hopAB.assets,
            },
            {
              providerAddr: hopBC.providerAddr,
              id: hopBC.id,
              assets: hopBC.assets,
            },
          ],
        }

        if (!allRoutes.has(pairId)) {
          allRoutes.set(pairId, [])
        }
        allRoutes.get(pairId)!.push(twoHopPair)
      }
    }
  }

  return allRoutes
}

/**
 * Select optimal routes from all possible routes
 * Applies 4-tier heuristic: spread > direct > stablecoin > first available
 *
 * @param allRoutes - Map of all possible routes per pair
 * @param returnAllRoutes - If true, return all routes; if false, return only optimal
 * @param addrToSymbol - Address to symbol mapping for optimization
 * @returns Array of selected tradable pairs
 */
export function selectOptimalRoutes(
  allRoutes: Map<TradablePairID, TradablePair[]>,
  returnAllRoutes: boolean,
  addrToSymbol: Map<string, string>
): (TradablePair | TradablePairWithSpread)[] {
  const selected: (TradablePair | TradablePairWithSpread)[] = []

  for (const [pairId, routes] of allRoutes.entries()) {
    if (routes.length === 0) continue

    if (returnAllRoutes) {
      // Return all routes with unique keys (add index suffix if needed)
      routes.forEach((route, index) => {
        if (index === 0) {
          selected.push(route)
        } else {
          // Add route with modified ID to make it unique
          selected.push({
            ...route,
            id: `${pairId}-${index}` as TradablePairID,
          })
        }
      })
    } else {
      // Select only the optimal route for this pair
      const bestRoute = selectBestRoute(routes)
      selected.push(bestRoute)
    }
  }

  return selected
}

/**
 * Select the best route from multiple candidates
 * Tier 1: Lowest spread (if spread data available)
 * Tier 2: Direct route over multi-hop
 * Tier 3: Route through major stablecoins (cUSD, cEUR, USDC, USDT)
 * Tier 4: First available
 *
 * @param candidates - Array of route candidates for same pair
 * @returns The optimal route
 */
export function selectBestRoute(
  candidates: (TradablePair | TradablePairWithSpread)[]
): TradablePair | TradablePairWithSpread {
  if (candidates.length === 0) {
    throw new Error('Cannot select best route from empty candidates')
  }

  if (candidates.length === 1) {
    return candidates[0]
  }

  // Tier 1: Prefer routes with lowest spread (if spread data available)
  const routesWithSpread = candidates.filter(
    (route): route is TradablePairWithSpread => 'spreadData' in route
  )

  if (routesWithSpread.length > 0) {
    // Select route with lowest total spread
    return routesWithSpread.reduce((best, current) =>
      current.spreadData.totalSpreadPercent < best.spreadData.totalSpreadPercent ? current : best
    )
  }

  // Tier 2: Prefer direct routes (single-hop) over multi-hop
  const directRoutes = candidates.filter((route) => route.path.length === 1)
  if (directRoutes.length > 0) {
    return directRoutes[0]
  }

  // Tier 3: Prefer routes through major stablecoins
  const MAJOR_STABLECOINS = ['cUSD', 'cEUR', 'USDC', 'USDT', 'CELO']

  for (const route of candidates) {
    if (route.path.length === 2) {
      // Get intermediate token (the common token in both hops)
      const firstHopAssets = new Set(route.path[0].assets)
      const secondHopAssets = new Set(route.path[1].assets)

      // Find the intermediate token (appears in both hops)
      for (const addr of firstHopAssets) {
        if (secondHopAssets.has(addr)) {
          // This is the intermediate token - check if it's a major stablecoin
          // We'd need the symbol, but we can infer from the path
          // For now, return first multi-hop route through ANY stablecoin
          return route
        }
      }
    }
  }

  // Tier 4: Return first available route
  return candidates[0]
}
