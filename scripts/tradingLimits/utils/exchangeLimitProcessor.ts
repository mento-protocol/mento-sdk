import Table from 'cli-table3'
import { ExchangeData, ScriptArgs } from '../types'
import { processAssetWithLimits } from './assetLimitProcessor'
import { handleExchangeWithNoLimits } from './tableFormatter'

/**
 * Process exchange with trading limits
 *
 * @param exchange - The exchange to process
 * @param tokenAssets - List of token assets in the exchange
 * @param exchangeName - Formatted exchange name
 * @param exchangeData - Exchange data including limits, configs, and states
 * @param args - Script command line arguments
 * @param limitsTable - The table for displaying results
 */
export function processExchangeWithLimits(
  exchange: ExchangeData,
  tokenAssets: Array<{ address: string; symbol: string }>,
  exchangeName: string,
  exchangeData: {
    allLimits: any[]
    configByAsset: Record<string, any>
    stateByAsset: Record<string, any>
    limitsByAsset: Record<string, any[]>
  },
  args: ScriptArgs,
  limitsTable: Table.Table
): void {
  // Track if we've displayed the exchange name - only show exchange name once per exchange
  let exchangeNameDisplayed = false

  // Track if any limits are blocked
  let hasBlockingLimit = false
  let hasFullyBlockedLimit = false

  // Process each asset in the exchange
  for (const asset of tokenAssets) {
    const limits = exchangeData.limitsByAsset[asset.address] || []

    // Process asset limits
    if (limits.length > 0) {
      // Process asset with limits
      const blockingInfo = processAssetWithLimits(
        exchange,
        asset,
        exchangeName,
        limits,
        exchangeData.configByAsset,
        exchangeData.stateByAsset,
        args,
        limitsTable,
        exchangeNameDisplayed
      )

      // Track if this asset has blocked limits
      hasBlockingLimit = hasBlockingLimit || blockingInfo.hasBlockedLimit
      hasFullyBlockedLimit = hasFullyBlockedLimit || blockingInfo.isFullyBlocked

      // Mark that we've displayed the exchange name
      exchangeNameDisplayed = true
    } else {
      // Handle asset without limits
      handleExchangeWithNoLimits(
        [asset],
        exchangeName,
        limitsTable,
        exchangeNameDisplayed
      )

      // Mark that we've displayed the exchange name
      exchangeNameDisplayed = true
    }
  }
}
