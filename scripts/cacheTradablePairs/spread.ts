import { BIPOOL_MANAGER_ABI } from '../../src/core/abis'
import type { Route, RouteWithCost } from '../../src/core/types'
import type { PublicClient } from 'viem'

// Type for the pool exchange result from getPoolExchange
interface PoolExchangeResult {
  asset0: string
  asset1: string
  pricingModule: string
  bucket0: bigint
  bucket1: bigint
  lastBucketUpdate: bigint
  config: {
    spread: {
      value: bigint
    }
    referenceRateFeedID: string
    referenceRateResetFrequency: bigint
    minimumReports: bigint
    stablePoolResetSize: {
      value: bigint
    }
  }
}

/**
 * Calculate spread data for a tradable pair by fetching fixed spreads from pool configs
 */
export async function calculateSpreadForPair(
  pair: Route,
  publicClient: PublicClient
): Promise<RouteWithCost> {
  // Fetch all exchange spreads concurrently
  const spreadPromises = pair.path.map(async (hop) => {
    const spread = await getExchangeSpread(hop.id, hop.providerAddr, publicClient)
    return {
      hop,
      spread,
    }
  })

  const spreadResults = await Promise.all(spreadPromises)

  const hops: Array<{ poolId: string; costPercent: number }> = []
  let totalEffectiveRate = 1 // Start with 100% (no loss)

  // Process the results in order to maintain path integrity
  for (const { hop, spread } of spreadResults) {
    if (spread !== null) {
      hops.push({
        poolId: hop.id,
        costPercent: spread,
      })

      // Compound the effective rate
      // If spread is 0.5%, then effective rate for this hop is 0.995
      // Round intermediate calculations to prevent floating-point precision errors
      const hopEffectiveRate = Math.round((1 - spread / 100) * 1e8) / 1e8
      totalEffectiveRate =
        Math.round(totalEffectiveRate * hopEffectiveRate * 1e8) / 1e8
    }
  }

  // Calculate total spread from compounded effective rate
  // Round to 8 decimal places to eliminate floating-point precision errors
  const totalCostPercent =
    Math.round((1 - totalEffectiveRate) * 100 * 1e8) / 1e8

  return {
    ...pair,
    costData: {
      totalCostPercent,
      hops,
    },
  }
}

/**
 * Fetch spread for a specific exchange from the BiPoolManager using viem
 */
async function getExchangeSpread(
  exchangeId: string,
  providerAddr: string,
  publicClient: PublicClient
): Promise<number | null> {
  try {
    const poolExchange = (await publicClient.readContract({
      address: providerAddr as `0x${string}`,
      abi: BIPOOL_MANAGER_ABI,
      functionName: 'getPoolExchange',
      args: [exchangeId],
    })) as PoolExchangeResult

    if (!poolExchange) return null

    // Convert spread from FixidityLib.Fraction to percentage
    // FixidityLib uses 24 decimal places (1e24 = 100%)
    // Round to 8 decimal places to eliminate floating-point precision errors
    const costPercent =
      Math.round((Number(poolExchange.config.spread.value) / 1e24) * 100 * 1e8) /
      1e8
    return costPercent
  } catch (error) {
    console.error(`Error fetching spread for exchange ${exchangeId}:`, error)
    return null
  }
}

/**
 * Sort pairs by spread percentage (best routes first)
 */
export function sortPairsBySpread(
  pairs: RouteWithCost[]
): RouteWithCost[] {
  return pairs.sort((a, b) => {
    // Sort by total spread percentage (ascending - lower is better)
    // Routes without spread data go to the end
    if (!a.costData && !b.costData) return 0
    if (!a.costData) return 1
    if (!b.costData) return -1
    return a.costData.totalCostPercent - b.costData.totalCostPercent
  })
}
