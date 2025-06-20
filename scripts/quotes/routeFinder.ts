import { Asset, Mento, TradablePair } from '../../src/mento'

/**
 * Finds all possible trading routes between two tokens, including direct and multi-hop paths.
 * This is the main entry point for route discovery.
 *
 * @param mento - Mento SDK instance for accessing trading pairs
 * @param tokenIn - Source token address
 * @param tokenOut - Destination token address
 * @returns Array of all possible routes sorted by efficiency
 */
export async function findAllRoutesForTokens(
  mento: Mento,
  tokenIn: string,
  tokenOut: string
): Promise<TradablePair[]> {
  const routes: TradablePair[] = []
  const directPairs = await mento.getDirectPairs()

  // Find direct routes (single hop: tokenIn -> tokenOut)
  const directRoutes = findDirectRoutes(directPairs, tokenIn, tokenOut)
  routes.push(...directRoutes)

  // Find 2-hop routes (tokenIn -> intermediate -> tokenOut)
  const twoHopRoutes = findTwoHopRoutes(directPairs, tokenIn, tokenOut, routes)
  routes.push(...twoHopRoutes)

  return routes
}

/**
 * Finds direct trading pairs between two tokens (single hop).
 * These are the most efficient routes with no intermediate tokens.
 */
function findDirectRoutes(
  directPairs: TradablePair[],
  tokenIn: string,
  tokenOut: string
): TradablePair[] {
  return directPairs.filter(
    (pair) =>
      pair.path.length === 1 &&
      pair.path[0].assets.includes(tokenIn) &&
      pair.path[0].assets.includes(tokenOut)
  )
}

/**
 * Finds 2-hop routes using an intermediate token.
 * Algorithm: tokenIn -> intermediateToken -> tokenOut
 *
 * This is more complex because we need to:
 * 1. Find all pairs that include tokenIn
 * 2. For each, identify the intermediate token
 * 3. Find pairs that can trade intermediate -> tokenOut
 * 4. Construct valid 2-hop routes
 * 5. Avoid duplicate routes
 */
function findTwoHopRoutes(
  directPairs: TradablePair[],
  tokenIn: string,
  tokenOut: string,
  existingRoutes: TradablePair[]
): TradablePair[] {
  const routes: TradablePair[] = []

  // Get all pairs that include our input token
  const tokenInDirectPairs = directPairs.filter((pair) =>
    pair.path[0].assets.includes(tokenIn)
  )

  for (const firstHopPair of tokenInDirectPairs) {
    const firstHop = firstHopPair.path[0]

    // Find the intermediate token (the "other" token in the pair)
    const intermediateToken = firstHop.assets.find((addr) => addr !== tokenIn)

    // Skip if no intermediate token or if it's our target (would be direct)
    if (!intermediateToken || intermediateToken === tokenOut) continue

    // Find pairs that can trade intermediate -> tokenOut
    const secondHopPairs = findSecondHopCandidates(
      directPairs,
      intermediateToken,
      tokenOut,
      tokenIn
    )

    // Construct 2-hop routes from valid combinations
    for (const secondHopPair of secondHopPairs) {
      const route = createTwoHopRoute(
        firstHopPair,
        secondHopPair,
        tokenIn,
        tokenOut,
        intermediateToken
      )

      // Only add if route is valid and not a duplicate
      if (route && !routeAlreadyExists(route, existingRoutes)) {
        routes.push(route)
      }
    }
  }

  return routes
}

/**
 * Finds candidate pairs for the second hop of a 2-hop route.
 * Must include both the intermediate token and the target token,
 * but cannot include the original input token (to avoid cycles).
 */
function findSecondHopCandidates(
  directPairs: TradablePair[],
  intermediateToken: string,
  tokenOut: string,
  tokenIn: string
): TradablePair[] {
  return directPairs.filter(
    (pair) =>
      pair.path[0].assets.includes(intermediateToken) &&
      pair.path[0].assets.includes(tokenOut) &&
      !pair.path[0].assets.includes(tokenIn) // Prevent cycles
  )
}

/**
 * Constructs a valid TradablePair object for a 2-hop route.
 * This involves creating the proper structure with path and assets.
 *
 * @returns TradablePair or null if the route cannot be constructed
 */
function createTwoHopRoute(
  firstHopPair: TradablePair,
  secondHopPair: TradablePair,
  tokenIn: string,
  tokenOut: string,
  intermediateToken: string
): TradablePair | null {
  const firstHop = firstHopPair.path[0]
  const secondHop = secondHopPair.path[0]

  // Safety check: ensure no cycles
  if (secondHop.assets.includes(tokenIn)) return null

  // Find the intermediate asset object for proper route naming
  const intermediateAsset = firstHopPair.assets.find(
    (a) => a.address === intermediateToken
  )

  if (!intermediateAsset) return null

  // Construct the route with proper naming and path structure
  return {
    id: `${firstHopPair.assets[0].symbol}-${firstHopPair.assets[1].symbol}-via-${intermediateAsset.symbol}-${secondHopPair.assets[0].symbol}-${secondHopPair.assets[1].symbol}`,
    assets: [
      firstHopPair.assets.find((a) => a.address === tokenIn)!,
      secondHopPair.assets.find((a) => a.address === tokenOut)!,
    ] as [Asset, Asset],
    path: [firstHop, secondHop],
  }
}

/**
 * Checks if a route already exists in the routes array.
 * Prevents duplicate routes by comparing hop IDs.
 */
function routeAlreadyExists(
  route: TradablePair,
  existingRoutes: TradablePair[]
): boolean {
  return existingRoutes.some(
    (existing) =>
      existing.path.length === 2 &&
      existing.path[0].id === route.path[0].id &&
      existing.path[1].id === route.path[1].id
  )
}
