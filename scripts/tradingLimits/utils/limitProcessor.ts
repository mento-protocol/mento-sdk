import chalk from 'chalk'
import Table from 'cli-table3'
import { GetLimitIdFunc, ScriptArgs, StatsData, TradingLimit } from '../types'
import {
  formatNetflow,
  formatNumber,
  formatUtilizationPercentage,
} from './formatting'
import { processAssetWithoutLimits } from './tableFormatter'
import { formatRelativeTime, formatTimeframe, formatTimestamp } from './time'

/**
 * Get limit details including values, timeframe, and status
 *
 * @param limit - The trading limit
 * @param limitType - The limit type (L0, L1, LG)
 * @param config - The config for this asset
 * @param state - The state for this asset
 * @returns Object containing limit details
 */
export function getLimitDetails(
  limit: TradingLimit,
  limitType: string,
  config: any,
  state: any
): {
  limitValue: number
  netflowValue: number
  timeframe: string
  utilizationText: string
  status: string
  isLimitBlocking: boolean
  isLimitFullyBlocking: boolean
} {
  // Get the appropriate limit and netflow values based on the limit type
  let limitValue = 0
  let netflowValue = 0
  let timeframe = '—'

  if (config && state) {
    if (limitType === 'L0') {
      limitValue = config.limit0
      netflowValue = state.netflow0
      timeframe = formatTimeframe(config.timestep0)
    } else if (limitType === 'L1') {
      limitValue = config.limit1
      netflowValue = state.netflow1
      timeframe = formatTimeframe(config.timestep1)
    } else if (limitType === 'LG') {
      limitValue = config.limitGlobal
      netflowValue = state.netflowGlobal
      timeframe = 'Global' // Global timeframe doesn't expire
    }
  }

  // Calculate utilization percentage
  let utilizationPercentage = 0
  if (limitValue > 0) {
    utilizationPercentage = Math.abs(netflowValue / limitValue) * 100
  }

  // Format utilization with color based on percentage
  const utilizationText =
    netflowValue !== 0
      ? formatUtilizationPercentage(utilizationPercentage)
      : '0.0%'

  // Calculate status based on remaining limits
  let status
  let isLimitBlocking = false
  let isLimitFullyBlocking = false

  if (limit.maxIn <= 0 && limit.maxOut <= 0) {
    status = chalk.red('BLOCKED')
    isLimitBlocking = true
    isLimitFullyBlocking = true
  } else if (limit.maxIn <= 0) {
    status = chalk.yellow('INFLOWS BLOCKED')
    isLimitBlocking = true
  } else if (limit.maxOut <= 0) {
    status = chalk.yellow('OUTFLOWS BLOCKED')
    isLimitBlocking = true
  } else {
    status = chalk.green('ACTIVE')
  }

  return {
    limitValue,
    netflowValue,
    timeframe,
    utilizationText,
    status,
    isLimitBlocking,
    isLimitFullyBlocking,
  }
}

/**
 * Process assets that have trading limits configured
 *
 * @param exchange - The exchange to process
 * @param asset - The token asset
 * @param exchangeName - Formatted exchange name
 * @param limits - Trading limits for this asset
 * @param configByAsset - Config by asset mapping
 * @param stateByAsset - State by asset mapping
 * @param args - Script command line arguments
 * @param limitsTable - The table for displaying results
 * @param stats - Statistics object to update
 * @param getLimitId - Function to calculate limit ID from exchange ID and asset
 * @param exchangeNameDisplayed - Whether the exchange name has been displayed already
 * @returns Object containing blocking information
 */
export function processAssetWithLimits(
  exchange: any,
  asset: { address: string; symbol: string },
  exchangeName: string,
  limits: TradingLimit[],
  configByAsset: Record<string, any>,
  stateByAsset: Record<string, any>,
  args: ScriptArgs,
  limitsTable: Table.Table,
  stats: StatsData,
  getLimitId: GetLimitIdFunc,
  exchangeNameDisplayed: boolean
): { hasBlockedLimit: boolean; isFullyBlocked: boolean } {
  let hasBlockedLimit = false
  let isFullyBlocked = false

  // Expected limit types
  const limitTypes = ['L0', 'L1', 'LG']

  // Process the existing limits
  for (let i = 0; i < limitTypes.length; i++) {
    const limitType = limitTypes[i]
    const limit = i < limits.length ? (limits[i] as TradingLimit) : null

    if (limit) {
      // Get limit details for existing limit
      const {
        limitValue,
        netflowValue,
        timeframe,
        utilizationText,
        status,
        isLimitBlocking,
        isLimitFullyBlocking,
      } = getLimitDetails(
        limit,
        limitType,
        configByAsset[asset.address],
        stateByAsset[asset.address]
      )

      // Update blocking status
      hasBlockedLimit = hasBlockedLimit || isLimitBlocking
      if (limitType === 'LG' && isLimitFullyBlocking) {
        isFullyBlocked = true
      }

      // Create row for this limit
      const row = createLimitRow(
        exchange,
        asset,
        exchangeName,
        limit,
        limitType,
        limitValue,
        netflowValue,
        timeframe,
        utilizationText,
        status,
        i,
        args,
        getLimitId,
        exchangeNameDisplayed || i > 0
      )

      limitsTable.push(row)
    } else {
      // Create placeholder row for missing limit type
      const row = createPlaceholderLimitRow(
        exchange,
        asset,
        exchangeName,
        limitType,
        i,
        args,
        getLimitId,
        exchangeNameDisplayed || i > 0
      )

      limitsTable.push(row)
    }
  }

  return { hasBlockedLimit, isFullyBlocked }
}

/**
 * Create a table row for a limit
 *
 * @param exchange - The exchange to process
 * @param asset - The token asset
 * @param exchangeName - Formatted exchange name
 * @param limit - The trading limit
 * @param limitType - The limit type (L0, L1, LG)
 * @param limitValue - The limit value
 * @param netflowValue - The netflow value
 * @param timeframe - The timeframe
 * @param utilizationText - The utilization text
 * @param status - The status text
 * @param limitIndex - The index of this limit
 * @param args - Script command line arguments
 * @param getLimitId - Function to calculate limit ID from exchange ID and asset
 * @param skipExchangeAndSymbol - Whether to skip exchange and symbol columns
 * @returns Array representing a table row
 */
export function createLimitRow(
  exchange: any,
  asset: { address: string; symbol: string },
  exchangeName: string,
  limit: TradingLimit,
  limitType: string,
  limitValue: number,
  netflowValue: number,
  timeframe: string,
  utilizationText: string,
  status: string,
  limitIndex: number,
  args: ScriptArgs,
  getLimitId: GetLimitIdFunc,
  skipExchangeAndSymbol: boolean
): any[] {
  const row: any[] = []

  if (args.verbose) {
    // In verbose mode, show Exchange ID and Asset columns
    row.push(
      !skipExchangeAndSymbol ? chalk.cyan(exchange.id) : '',
      asset.address
    )
  } else {
    // In normal mode, show human-readable Exchange name
    row.push(!skipExchangeAndSymbol ? chalk.cyan(exchangeName) : '')
  }

  // Symbol column is always shown
  row.push(!skipExchangeAndSymbol ? chalk.green(asset.symbol) : '')

  // Add limit ID in verbose mode
  if (args.verbose) {
    // Only show limit ID for the first row of each asset
    if (limitIndex === 0) {
      try {
        // Calculate the limit ID (XOR of exchange ID and asset address)
        const limitId = getLimitId(exchange.id, asset.address)
        row.push(chalk.gray(limitId))
      } catch (error) {
        console.error(
          `Error calculating limit ID for ${exchange.id} and ${asset.address}`
        )
        row.push(chalk.red('Error'))
      }
    } else {
      row.push('')
    }
  }

  // Add the rest of the data
  row.push(
    chalk.magenta(limitType),
    chalk.blue(timeframe),
    limitValue > 0 ? formatNumber(limitValue) : '—',
    formatNetflow(netflowValue),
    utilizationText,
    formatNumber(limit.maxIn),
    formatNumber(limit.maxOut),
    formatRelativeTime(limit.until - Math.floor(Date.now() / 1000)),
    formatTimestamp(limit.until),
    status
  )

  return row
}

/**
 * Create a placeholder row for a missing limit type
 *
 * @param exchange - The exchange to process
 * @param asset - The token asset
 * @param exchangeName - Formatted exchange name
 * @param limitType - The limit type (L0, L1, LG)
 * @param limitIndex - The index of this limit
 * @param args - Script command line arguments
 * @param getLimitId - Function to calculate limit ID from exchange ID and asset
 * @param skipExchangeAndSymbol - Whether to skip exchange and symbol columns
 * @returns Array representing a table row
 */
export function createPlaceholderLimitRow(
  exchange: any,
  asset: { address: string; symbol: string },
  exchangeName: string,
  limitType: string,
  limitIndex: number,
  args: ScriptArgs,
  getLimitId: GetLimitIdFunc,
  skipExchangeAndSymbol: boolean
): any[] {
  const row: any[] = []

  if (args.verbose) {
    // In verbose mode, show Exchange ID and Asset columns
    row.push(
      !skipExchangeAndSymbol ? chalk.cyan(exchange.id) : '',
      asset.address
    )
  } else {
    // In normal mode, show human-readable Exchange name
    row.push(!skipExchangeAndSymbol ? chalk.cyan(exchangeName) : '')
  }

  // Symbol column is always shown
  row.push(!skipExchangeAndSymbol ? chalk.green(asset.symbol) : '')

  // Add limit ID in verbose mode
  if (args.verbose) {
    // Only show limit ID for the first row of each asset
    if (limitIndex === 0) {
      try {
        // Calculate the limit ID (XOR of exchange ID and asset address)
        const limitId = getLimitId(exchange.id, asset.address)
        row.push(chalk.gray(limitId))
      } catch (error) {
        console.error(
          `Error calculating limit ID for ${exchange.id} and ${asset.address}`
        )
        row.push(chalk.red('Error'))
      }
    } else {
      row.push('')
    }
  }

  // Add the rest of the data with placeholder values
  row.push(
    chalk.magenta(limitType),
    '—', // Timeframe
    '—', // Limit
    '—', // Netflow
    '—', // Utilization
    '—', // Max In
    '—', // Max Out
    '—', // Resets In
    '—', // Reset Time
    chalk.gray('No limit configured') // Status
  )

  return row
}

/**
 * Process exchanges that have trading limits configured
 *
 * @param exchange - The exchange to process
 * @param tokenAssets - The token assets in the exchange
 * @param exchangeName - Formatted exchange name
 * @param exchangeData - The exchange data
 * @param args - Script command line arguments
 * @param limitsTable - The table for displaying results
 * @param stats - Statistics object to update
 * @param getLimitId - Function to calculate limit ID from exchange ID and asset
 */
export function processExchangeWithLimits(
  exchange: any,
  tokenAssets: Array<{ address: string; symbol: string }>,
  exchangeName: string,
  exchangeData: {
    allLimits: TradingLimit[]
    configByAsset: Record<string, any>
    stateByAsset: Record<string, any>
    limitsByAsset: Record<string, TradingLimit[]>
  },
  args: ScriptArgs,
  limitsTable: Table.Table,
  stats: StatsData,
  getLimitId: GetLimitIdFunc
): void {
  // Exchange has limits for at least one asset, update stats
  stats.exchangesWithLimits++

  // Track if this exchange has any blocked limits
  let hasBlockedLimit = false
  let isFullyBlocked = false

  // Keep track of which assets have limits
  const assetsWithLimits = new Set(Object.keys(exchangeData.limitsByAsset))

  // Flag to track if exchange name has been displayed
  let exchangeNameDisplayed = false

  // Process each asset in the exchange
  for (const asset of tokenAssets) {
    const limits = exchangeData.limitsByAsset[asset.address] || []

    if (limits.length === 0) {
      // Handle assets without limits
      processAssetWithoutLimits(
        exchange,
        asset,
        exchangeName,
        args,
        limitsTable,
        exchangeNameDisplayed
      )
      exchangeNameDisplayed = true
      continue
    }

    // Process assets with limits
    const blockingInfo = processAssetWithLimits(
      exchange,
      asset,
      exchangeName,
      limits,
      exchangeData.configByAsset,
      exchangeData.stateByAsset,
      args,
      limitsTable,
      stats,
      getLimitId,
      exchangeNameDisplayed
    )

    hasBlockedLimit = hasBlockedLimit || blockingInfo.hasBlockedLimit
    isFullyBlocked = isFullyBlocked || blockingInfo.isFullyBlocked
    exchangeNameDisplayed = true
  }

  // Update exchange stats based on limits
  if (isFullyBlocked) {
    stats.fullyBlockedExchanges++
  } else if (hasBlockedLimit) {
    stats.partiallyBlockedExchanges++
  } else {
    stats.activeExchanges++
  }
}
