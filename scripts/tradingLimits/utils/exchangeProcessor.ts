import chalk from 'chalk'
import { ethers } from 'ethers'
import { batchProcess } from '../../shared/batchProcessor'
import { ExchangeData, Mento, TradingLimit } from '../types'
import { TradingLimitsConfig } from './../../../src/interfaces/tradingLimitsConfig'
import { getSymbolFromTokenAddress } from './getSymbolFromTokenAddress'
// Import type extensions for Object.groupBy
import { TradingLimitsState } from '../../../src/interfaces'
import './typeExtensions'

/**
 * Helper function to filter exchanges by token
 *
 * @param exchanges - List of exchanges to filter
 * @param tokenFilter - Token symbol to filter by
 * @param provider - The ethers provider
 * @returns Filtered list of exchanges that contain the token
 */
export async function filterExchangesByToken(
  exchanges: ExchangeData[],
  tokenFilter: string,
  provider: ethers.providers.Provider
): Promise<ExchangeData[]> {
  try {
    // Process exchanges in batches to avoid overwhelming RPC endpoint
    const results = await batchProcess(
      exchanges,
      async (exchange: ExchangeData, index: number) => {
        // Get token symbols for all assets in this exchange (already cached during prefetch)
        const tokenSymbols = await Promise.all(
          exchange.assets.map((addr: string) =>
            getSymbolFromTokenAddress(addr, provider)
          )
        )

        // Check if any token matches the filter
        const hasMatchingToken = tokenSymbols.some((symbol) =>
          symbol.toLowerCase().includes(tokenFilter.toLowerCase())
        )

        return hasMatchingToken ? exchange : null
      },
      10 // Process 10 exchanges concurrently
    )

    return results.filter(
      (exchange): exchange is ExchangeData => exchange !== null
    )
  } catch (error) {
    console.error(
      chalk.red(`Error filtering exchanges by token: ${tokenFilter}`)
    )
    console.error(error instanceof Error ? error.message : String(error))
    return [] // Return empty array on error
  }
}

/**
 * Prepare exchange information including token assets and exchange name
 *
 * @param exchange - The exchange to process
 * @param provider - The ethers provider
 * @returns Object containing token assets and formatted exchange name
 */
export async function prepareExchangeInfo(
  exchange: ExchangeData,
  provider: ethers.providers.Provider
): Promise<{
  tokenAssets: Array<{ address: string; symbol: string }>
  exchangeName: string
}> {
  // Get token symbols for display and prepare asset info (using cached symbols)
  // Since symbols are already cached, this should be very fast
  const tokenAssets = await Promise.all(
    exchange.assets.map(async (addr: string) => ({
      address: addr,
      symbol: await getSymbolFromTokenAddress(addr, provider),
    }))
  )

  // Create readable exchange name
  const exchangeName = tokenAssets.map((asset) => asset.symbol).join(' <-> ')

  return { tokenAssets, exchangeName }
}

/**
 * Fetch and organize exchange data from the Mento protocol
 *
 * @param exchange - The exchange to process
 * @param mento - The Mento SDK instance
 * @returns Object containing limits, configs, states, and organized data
 */
export async function fetchExchangeData(
  exchange: ExchangeData,
  mento: Mento
): Promise<{
  allLimits: TradingLimit[]
  limitConfigs: TradingLimitsConfig[]
  limitStates: TradingLimitsState[]
  configByAsset: Record<string, TradingLimitsConfig>
  stateByAsset: Record<string, TradingLimitsState>
  limitsByAsset: Record<string, TradingLimit[]>
}> {
  // Get exchange data in parallel to reduce network calls
  const [allLimits, limitConfigs, limitStates] = await Promise.all([
    mento.getTradingLimits(exchange.id),
    mento.getTradingLimitConfig(exchange.id),
    mento.getTradingLimitState(exchange.id),
  ])

  // Create maps for easy lookup by asset address
  const configByAsset = limitConfigs.reduce(
    (map: Record<string, TradingLimitsConfig>, cfg: TradingLimitsConfig) => {
      map[cfg.asset] = cfg
      return map
    },
    {}
  )

  const stateByAsset = limitStates.reduce(
    (map: Record<string, TradingLimitsState>, state: TradingLimitsState) => {
      map[state.asset] = state
      return map
    },
    {}
  )

  // Group limits by asset
  const limitsByAsset = Object.groupBy(
    allLimits,
    (limit) => limit.asset as string
  )

  return {
    allLimits,
    limitConfigs,
    limitStates,
    configByAsset,
    stateByAsset,
    limitsByAsset,
  }
}
