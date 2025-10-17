import Table from 'cli-table3'
import {
  TradingLimitsConfig,
  TradingLimitsState,
} from '../../../src/interfaces'
import { ExchangeData, ScriptArgs, TradingLimit } from '../types'
import { processAssetWithLimits } from './assetLimitProcessor'
import { handleExchangeWithNoLimits } from './tableFormatter'

/**
 * Process exchange with trading limits
 *
 * @param exchange - The exchange to process
 * @param tokenAssets - List of token assets in the exchange
 * @param exchangeName - Formatted exchange name
 * @param exchangeData - Exchange data including limits, configs, and states
 * @param args - Script command line arguments (currently unused but passed through)
 * @param limitsTable - The table for displaying results
 */
export function processExchangeWithLimits(
  exchange: ExchangeData,
  tokenAssets: Array<{ address: string; symbol: string }>,
  exchangeName: string,
  exchangeData: {
    allLimits: TradingLimit[]
    configByAsset: Record<string, TradingLimitsConfig>
    stateByAsset: Record<string, TradingLimitsState>
    limitsByAsset: Record<string, TradingLimit[]>
  },
  args: ScriptArgs,
  limitsTable: Table.Table
): void {
  // Track if we've displayed the exchange name - only show exchange name once per exchange
  let exchangeNameDisplayed = false

  // Process each asset in the exchange
  for (const asset of tokenAssets) {
    const limits = exchangeData.limitsByAsset[asset.address] || []

    // Process asset limits
    if (limits.length > 0) {
      processAssetWithLimits(
        asset,
        exchangeName,
        exchange.id,
        limits,
        exchangeData.configByAsset,
        exchangeData.stateByAsset,
        args,
        limitsTable,
        exchangeNameDisplayed
      )
      // Mark that we've displayed the exchange name
      exchangeNameDisplayed = true
    } else {
      // Handle asset without limits
      handleExchangeWithNoLimits(
        [asset],
        exchangeName,
        limitsTable,
        exchangeNameDisplayed,
        args.verbose
      )

      // Mark that we've displayed the exchange name
      exchangeNameDisplayed = true
    }
  }
}
