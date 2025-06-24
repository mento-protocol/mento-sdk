import { TradablePair } from '../../src/mento'
import { TradablePairWithSpread } from '../cacheTradablePairs/config'

/**
 * Deduplicates routes by comparing their path signatures.
 * Routes with identical exchange hops are considered duplicates regardless of direction.
 *
 * This eliminates redundant symmetric routes like:
 * - USDC → cUSD → USD₮
 * - USD₮ → cUSD → USDC
 *
 * Which use the same exchanges and have identical spreads.
 *
 * @param routes - Array of routes to deduplicate
 * @returns Array of unique routes with duplicates removed
 */
export function deduplicateRoutes<
  T extends TradablePair | TradablePairWithSpread
>(routes: T[]): T[] {
  const seenPathSignatures = new Set<string>()
  const uniqueRoutes: T[] = []

  for (const route of routes) {
    const pathSignature = createRouteSignature(route)

    if (!seenPathSignatures.has(pathSignature)) {
      seenPathSignatures.add(pathSignature)
      uniqueRoutes.push(route)
    }
  }

  return uniqueRoutes
}

/**
 * Creates a path signature for a route based on its exchange hops.
 * Used for identifying duplicate routes that use the same exchanges.
 *
 * @param route - The route to create a signature for
 * @returns A string signature representing the route's exchange pattern
 */
export function createRouteSignature(
  route: TradablePair | TradablePairWithSpread
): string {
  return (
    route.path
      .map((hop) => `${hop.id}:${hop.providerAddr}`)
      // Sort to handle path direction differences (A→B→C vs C→B→A)
      .sort()
      .join('|')
  )
}
