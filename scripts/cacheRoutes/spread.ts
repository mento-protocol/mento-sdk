import type { Route, RouteWithCost } from '../../src/core/types'
import type { PublicClient } from 'viem'
import { getPoolCostPercent } from '../../src/utils/costUtils'

/**
 * Calculate cost data for a route by fetching data from the individual pools
 */
export async function calculateCostForRoute(route: Route, publicClient: PublicClient): Promise<RouteWithCost> {
  // Fetch all data concurrently
  const costDataPromises = route.path.map(async (hop) => {
    const costPercent = await getPoolCostPercent(hop, publicClient)
    return {
      hop,
      costPercent,
    }
  })

  const costDataResults = await Promise.all(costDataPromises)

  const hops: Array<{ poolId: string; costPercent: number }> = []
  let totalEffectiveRate = 1 // Start with 100% (no loss)

  // Process the results in order to maintain path integrity
  for (const { hop, costPercent } of costDataResults) {
    if (costPercent !== null) {
      hops.push({
        poolId: hop.poolAddr,
        costPercent: costPercent,
      })

      // Compound the effective rate
      // If spread is 0.5%, then effective rate for this hop is 0.995
      // Round intermediate calculations to prevent floating-point precision errors
      const hopEffectiveRate = Math.round((1 - costPercent / 100) * 1e8) / 1e8
      totalEffectiveRate = Math.round(totalEffectiveRate * hopEffectiveRate * 1e8) / 1e8
    }
  }

  // Calculate total spread from compounded effective rate
  // Round to 8 decimal places to eliminate floating-point precision errors
  const totalCostPercent = Math.round((1 - totalEffectiveRate) * 100 * 1e8) / 1e8

  return {
    ...route,
    costData: {
      totalCostPercent,
      hops: hops.map((hop) => ({
        poolAddress: hop.poolId,
        costPercent: hop.costPercent,
      })),
    },
  }
}



/**
 * Sort routes by spread percentage (best routes first)
 */
export function sortRoutesBySpread(routes: RouteWithCost[]): RouteWithCost[] {
  return routes.sort((a, b) => {
    // Sort by total spread percentage (ascending - lower is better)
    // Routes without spread data go to the end
    if (!a.costData && !b.costData) return 0
    if (!a.costData) return 1
    if (!b.costData) return -1
    return a.costData.totalCostPercent - b.costData.totalCostPercent
  })
}
