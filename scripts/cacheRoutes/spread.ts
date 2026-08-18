import type { Route, RouteWithCost } from '../../src/core/types'
import type { Pool } from '../../src/core/types'
import type { PublicClient } from 'viem'
import { getPoolCostPercent } from '../../src/utils/costUtils'

/**
 * Cache of in-flight and completed pool-cost reads for one cache-generation run.
 * Rejected reads are removed by getMemoizedPoolCostPercent so a retry can run
 * the RPC call again.
 */
export type PoolCostMemo = Map<string, Promise<number>>

export function createPoolCostMemo(): PoolCostMemo {
  return new Map<string, Promise<number>>()
}

function poolCostKey(pool: Pool): string {
  return `${pool.poolType}:${pool.poolAddr.toLowerCase()}`
}

/**
 * Read a pool cost once per cache-generation run.
 *
 * The promise is cached before it is awaited so concurrent routes that share a
 * pool also share one RPC read. Failed promises are evicted for retry passes.
 */
export function getMemoizedPoolCostPercent(
  pool: Pool,
  publicClient: PublicClient,
  memo: PoolCostMemo
): Promise<number> {
  const key = poolCostKey(pool)
  const cached = memo.get(key)
  if (cached) return cached

  const read = Promise.resolve()
    .then(() => getPoolCostPercent(pool, publicClient))
    .catch((error: unknown) => {
      memo.delete(key)
      throw error
    })

  memo.set(key, read)
  return read
}

/**
 * Calculate cost data for a route by fetching data from the individual pools
 */
export async function calculateCostForRoute(
  route: Route,
  publicClient: PublicClient,
  memo: PoolCostMemo = createPoolCostMemo()
): Promise<RouteWithCost> {
  // Fetch all data concurrently
  const costDataPromises = route.path.map(async (hop) => {
    const costPercent = await getMemoizedPoolCostPercent(hop, publicClient, memo)
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
  // Round to 8 decimal places for consistency with intermediate calculations
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
    if (!a.costData && !b.costData) return compareRouteIdentity(a, b)
    if (!a.costData) return 1
    if (!b.costData) return -1
    return a.costData.totalCostPercent - b.costData.totalCostPercent || compareRouteIdentity(a, b)
  })
}

function compareRouteIdentity(first: Route, second: Route): number {
  if (first.id < second.id) return -1
  if (first.id > second.id) return 1

  const hopDifference = first.path.length - second.path.length
  if (hopDifference !== 0) return hopDifference

  const firstKey = deterministicPathKey(first)
  const secondKey = deterministicPathKey(second)
  if (firstKey < secondKey) return -1
  if (firstKey > secondKey) return 1
  return 0
}

function deterministicPathKey(route: Route): string {
  return route.path
    .map((pool) =>
      [pool.poolType, pool.factoryAddr, pool.poolAddr, pool.token0, pool.token1]
        .map((value) => value.toLowerCase())
        .join(':')
    )
    .join('|')
}
