import { BiPoolManager__factory } from '@mento-protocol/mento-core-ts'
import { providers } from 'ethers'
import { TradablePair } from '../../src/mento'
import { TradablePairWithSpread } from './config'

/**
 * Calculate spread data for a tradable pair by fetching fixed spreads from pool configs
 */
export async function calculateSpreadForPair(
  pair: TradablePair,
  provider: providers.Provider
): Promise<TradablePairWithSpread> {
  // Fetch all exchange spreads concurrently
  const spreadPromises = pair.path.map(async (hop) => {
    const spread = await getExchangeSpread(hop.id, hop.providerAddr, provider)
    return {
      hop,
      spread,
    }
  })

  const spreadResults = await Promise.all(spreadPromises)

  const hops: Array<{ exchangeId: string; spreadPercent: number }> = []
  let totalEffectiveRate = 1 // Start with 100% (no loss)

  // Process the results in order to maintain path integrity
  for (const { hop, spread } of spreadResults) {
    if (spread !== null) {
      hops.push({
        exchangeId: hop.id,
        spreadPercent: spread,
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
  const totalSpreadPercent =
    Math.round((1 - totalEffectiveRate) * 100 * 1e8) / 1e8

  return {
    ...pair,
    spreadData: {
      totalSpreadPercent,
      hops,
    },
  }
}

/**
 * Fetch spread for a specific exchange from the BiPoolManager
 */
async function getExchangeSpread(
  exchangeId: string,
  providerAddr: string,
  provider: providers.Provider
): Promise<number | null> {
  try {
    const biPoolManager = BiPoolManager__factory.connect(providerAddr, provider)
    const poolExchange = await biPoolManager.getPoolExchange(exchangeId)
    if (!poolExchange) return null

    // Convert spread from FixidityLib.Fraction to percentage
    // Round to 8 decimal places to eliminate floating-point precision errors
    const spreadPercent =
      Math.round(
        (Number(poolExchange.config.spread.value) / 1e24) * 100 * 1e8
      ) / 1e8
    return spreadPercent
  } catch (error) {
    console.error(`Error fetching spread for exchange ${exchangeId}:`, error)
    return null
  }
}

/**
 * Sort pairs by spread percentage (best routes first)
 */
export function sortPairsBySpread(
  pairs: TradablePairWithSpread[]
): TradablePairWithSpread[] {
  return pairs.sort((a, b) => {
    // Sort by total spread percentage (ascending - lower is better)
    // Routes without spread data go to the end
    if (!a.spreadData && !b.spreadData) return 0
    if (!a.spreadData) return 1
    if (!b.spreadData) return -1
    return a.spreadData.totalSpreadPercent - b.spreadData.totalSpreadPercent
  })
}
