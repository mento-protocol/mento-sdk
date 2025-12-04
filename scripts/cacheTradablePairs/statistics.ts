import type { RouteWithCost } from '../../src/core/types'

export interface RouteStatistics {
  totalRoutes: number
  uniquePairs: number
  hopDistribution: {
    oneHop: number
    twoHop: number
  }
  topPairsWithMostRoutes: Array<{
    pairId: string
    routeCount: number
  }>
}

/**
 * Calculate route distribution and pairing statistics
 */
export function calculateStatistics(
  pairs: RouteWithCost[]
): RouteStatistics {
  // Count unique trading pairs for reference
  const uniquePairIds = new Set(pairs.map((pair) => pair.id))

  // Count routes per unique pair
  const routesPerPair = new Map<string, number>()
  pairs.forEach((pair) => {
    routesPerPair.set(pair.id, (routesPerPair.get(pair.id) || 0) + 1)
  })

  // Count hop distribution
  const hopDistribution = {
    oneHop: pairs.filter((pair) => pair.path.length === 1).length,
    twoHop: pairs.filter((pair) => pair.path.length === 2).length,
  }

  // Find top 3 pairs with most routes
  const topPairsWithMostRoutes = Array.from(routesPerPair.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([pairId, routeCount]) => ({ pairId, routeCount }))

  return {
    totalRoutes: pairs.length,
    uniquePairs: uniquePairIds.size,
    hopDistribution,
    topPairsWithMostRoutes,
  }
}

/**
 * Display statistics in a formatted way
 */
export function displayStatistics(statistics: RouteStatistics): void {
  console.log(`\n\x1b[1mRoute Stats\x1b[0m`)
  console.log(
    `   ${statistics.totalRoutes} total routes covering ${statistics.uniquePairs} unique trading pairs with multiple route options`
  )
  console.log(`   Direct routes (1 hop): ${statistics.hopDistribution.oneHop}`)
  console.log(
    `   Multi-hop routes (2 hops): ${statistics.hopDistribution.twoHop}`
  )

  console.log(`\nTop Pairs with Most Route Options:`)
  statistics.topPairsWithMostRoutes.forEach((pair, index) => {
    console.log(`   ${index + 1}. ${pair.pairId}: ${pair.routeCount} routes`)
  })
}
