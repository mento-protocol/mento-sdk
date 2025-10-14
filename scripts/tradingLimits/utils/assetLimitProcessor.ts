import chalk from 'chalk'
import Table from 'cli-table3'
import { format, formatDistance, fromUnixTime } from 'date-fns'
import {
  TradingLimitsConfig,
  TradingLimitsState,
} from '../../../src/interfaces'
import { getLimitId } from '../../../src/limits'
import { ScriptArgs, TradingLimit } from '../types'

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
  config: TradingLimitsConfig,
  state: TradingLimitsState
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
 * @param asset - The token asset
 * @param exchangeName - Formatted exchange name
 * @param exchangeId - The exchange ID
 * @param limits - Trading limits for this asset
 * @param configByAsset - Config by asset mapping
 * @param stateByAsset - State by asset mapping
 * @param args - Script command line arguments (currently unused but passed through)
 * @param limitsTable - The table for displaying results
 * @param exchangeNameDisplayed - Whether the exchange name has been displayed already
 * @returns Object containing blocking information
 */
export function processAssetWithLimits(
  asset: { address: string; symbol: string },
  exchangeName: string,
  exchangeId: string,
  limits: TradingLimit[],
  configByAsset: Record<string, TradingLimitsConfig>,
  stateByAsset: Record<string, TradingLimitsState>,
  args: ScriptArgs,
  limitsTable: Table.Table,
  exchangeNameDisplayed: boolean
): { hasBlockedLimit: boolean; isFullyBlocked: boolean } {
  let hasBlockedLimit = false
  let isFullyBlocked = false

  // Make a local copy of the flag to track its state during processing
  let localExchangeNameDisplayed = exchangeNameDisplayed

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
        asset,
        exchangeName,
        exchangeId,
        limit,
        limitType,
        limitValue,
        netflowValue,
        timeframe,
        utilizationText,
        status,
        i,
        args,
        localExchangeNameDisplayed,
        i > 0
      )

      limitsTable.push(row)

      // Once we've added a row with the exchange name, mark it as displayed
      if (!localExchangeNameDisplayed) {
        localExchangeNameDisplayed = true
      }
    } else {
      // Create placeholder row for missing limit type
      const row = createPlaceholderLimitRow(
        asset,
        exchangeName,
        exchangeId,
        limitType,
        i,
        args,
        localExchangeNameDisplayed,
        i > 0
      )

      limitsTable.push(row)

      // Once we've added a row with the exchange name, mark it as displayed
      if (!localExchangeNameDisplayed) {
        localExchangeNameDisplayed = true
      }
    }
  }

  return { hasBlockedLimit, isFullyBlocked }
}

/**
 * Create a table row for a limit
 *
 * @param asset - The token asset
 * @param exchangeName - Formatted exchange name
 * @param exchangeId - The exchange ID
 * @param limit - The trading limit
 * @param limitType - The limit type (L0, L1, LG)
 * @param limitValue - The limit value
 * @param netflowValue - The netflow value
 * @param timeframe - The timeframe
 * @param utilizationText - The utilization text
 * @param status - The status text
 * @param limitIndex - The index of this limit
 * @param args - Script command line arguments (currently unused but passed through)
 * @param skipExchangeName - Whether to skip exchange name column
 * @param skipSymbol - Whether to skip symbol column
 * @returns Array representing a table row
 */
export function createLimitRow(
  asset: { address: string; symbol: string },
  exchangeName: string,
  exchangeId: string,
  limit: TradingLimit,
  limitType: string,
  limitValue: number,
  netflowValue: number,
  timeframe: string,
  utilizationText: string,
  status: string,
  limitIndex: number,
  args: ScriptArgs,
  skipExchangeName: boolean,
  skipSymbol: boolean
): string[] {
  const row: string[] = []

  // Show human-readable Exchange name only once per exchange
  row.push(!skipExchangeName ? chalk.cyan(exchangeName) : '')

  // Show symbol only once per asset
  row.push(!skipSymbol ? chalk.green(asset.symbol) : '')

  // Helper to add thousand separators, remove decimals
  function formatNumber(num: number): string {
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
  }

  // Format reset time information
  const seconds = limit.until - Math.floor(Date.now() / 1000)
  const futureDate = new Date(Date.now() + seconds * 1000)
  let resetIn = `in ${formatDistance(futureDate, new Date(), {
    addSuffix: false,
  })}`
  let resetTime = `${format(fromUnixTime(limit.until), 'MMM d, HH:mm:ss')}`

  // Handle global limits which don't have resets
  if (limitType === 'LG') {
    resetIn = '—'
    resetTime = 'manual reset required'
  } else if (seconds <= 0) {
    resetIn = 'now'
  }

  // Limit type
  row.push(chalk.cyan(limitType))

  // Limit value and usage (netflow)
  row.push(limitValue > 0 ? formatNumber(limitValue) : '—')
  row.push(netflowValue !== 0 ? formatNetflow(netflowValue) : '0')

  // Utilization percentage
  row.push(utilizationText)

  // Timeframe
  row.push(timeframe)

  // Reset information
  row.push(resetIn)
  row.push(resetTime)

  // Max in/out values
  row.push(formatNumber(limit.maxIn))
  row.push(formatNumber(limit.maxOut))

  // Status column
  row.push(status)

  // Add limit ID column if verbose mode is enabled
  if (args.verbose) {
    const limitId = getLimitId(exchangeId, asset.address)
    row.push(chalk.gray(limitId))
  }

  // Return the completed row
  return row
}

/**
 * Create a placeholder row for a non-existent limit type
 *
 * @param asset - The token asset
 * @param exchangeName - Formatted exchange name
 * @param exchangeId - The exchange ID
 * @param limitType - The limit type (L0, L1, LG)
 * @param limitIndex - The index of this limit
 * @param args - Script command line arguments (currently unused but passed through)
 * @param skipExchangeName - Whether to skip exchange name column
 * @param skipSymbol - Whether to skip symbol column
 * @returns Array representing a table row
 */
export function createPlaceholderLimitRow(
  asset: { address: string; symbol: string },
  exchangeName: string,
  exchangeId: string,
  limitType: string,
  limitIndex: number,
  args: ScriptArgs,
  skipExchangeName: boolean,
  skipSymbol: boolean
): string[] {
  const row: string[] = []

  // Show human-readable Exchange name only once per exchange
  row.push(!skipExchangeName ? chalk.cyan(exchangeName) : '')

  // Show symbol only once per asset
  row.push(!skipSymbol ? chalk.green(asset.symbol) : '')

  // Limit type
  row.push(chalk.gray(limitType))

  // Empty data for placeholder
  row.push(chalk.gray('—')) // Limit
  row.push(chalk.gray('—')) // Netflow
  row.push(chalk.gray('—')) // Utilization
  row.push(chalk.gray('—')) // Timeframe
  row.push(chalk.gray('—')) // Resets In
  row.push(chalk.gray('—')) // Reset Time
  row.push(chalk.gray('—')) // Max In
  row.push(chalk.gray('—')) // Max Out
  row.push(chalk.gray('NOT CONFIGURED')) // Status

  // Add limit ID column if verbose mode is enabled
  if (args.verbose) {
    const limitId = getLimitId(exchangeId, asset.address)
    row.push(chalk.gray(limitId))
  }

  return row
}

/**
 * Format utilization percentage with color coding based on usage level
 * and include a visual progress bar
 *
 * @param percentage - Utilization percentage
 * @returns Formatted utilization string with color and progress bar
 */
function formatUtilizationPercentage(percentage: number): string {
  // Round to 1 decimal place
  const rounded = Math.round(percentage * 10) / 10

  // Create a visual progress bar
  const progressBarWidth = 10
  const filledBlocks = Math.min(
    Math.floor((rounded / 100) * progressBarWidth),
    progressBarWidth
  )
  const emptyBlocks = progressBarWidth - filledBlocks

  let progressBar = ''
  let barColor = chalk.green

  // Apply color based on utilization level
  if (rounded >= 90) {
    barColor = chalk.red.bold
  } else if (rounded >= 75) {
    barColor = chalk.yellow.bold
  } else if (rounded >= 50) {
    barColor = chalk.yellow
  } else if (rounded > 0) {
    barColor = chalk.green
  }

  // Create the filled portion of the bar
  progressBar = barColor('█'.repeat(filledBlocks))

  // Add the empty portion of the bar
  if (emptyBlocks > 0) {
    progressBar += chalk.gray('░'.repeat(emptyBlocks))
  }

  // Combine progress bar with percentage
  return `${progressBar} ${barColor(`${rounded.toFixed(1)}%`)}`
}

/**
 * Format netflow values with colors
 *
 * @param value - The netflow value
 * @returns Formatted netflow string with colors
 */
function formatNetflow(value: number): string {
  // Helper to add thousand separators, remove decimals
  const formatted = value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })

  // Apply colors based on positive/negative values
  if (value < 0) {
    return chalk.green(formatted) // Negative is outflow, shown in green
  } else if (value > 0) {
    return chalk.red(formatted) // Positive is inflow, shown in red
  } else {
    return formatted
  }
}

/**
 * Format timeframe in human-readable form
 *
 * @param seconds - Timeframe in seconds
 * @returns Human-readable timeframe
 */
export function formatTimeframe(seconds: number): string {
  if (seconds >= 86400) {
    const days = seconds / 86400
    return `${days} day${days !== 1 ? 's' : ''}`
  } else if (seconds >= 3600) {
    const hours = seconds / 3600
    return `${hours} hour${hours !== 1 ? 's' : ''}`
  } else if (seconds >= 60) {
    const minutes = seconds / 60
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`
  } else {
    return `${seconds} second${seconds !== 1 ? 's' : ''}`
  }
}
