// Legacy file - this has been replaced by modular implementations in the /modules directory
// This file is kept for reference purposes only and is no longer used by the application.

import chalk from 'chalk'
import Table from 'cli-table3'
import { ethers } from 'ethers'
import {
  ExchangeData,
  GetLimitIdFunc,
  Mento,
  ScriptArgs,
  StatsData,
  TradingLimit,
} from '../types'
import {
  formatNetflow,
  formatNumber,
  formatUtilizationPercentage,
} from './formatting'
import { getSymbolFromTokenAddress } from './general'
import { formatRelativeTime, formatTimeframe, formatTimestamp } from './time'

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
    const filteredExchanges: ExchangeData[] = []

    for (const exchange of exchanges) {
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

      if (hasMatchingToken) {
        filteredExchanges.push(exchange)
      }
    }

    return filteredExchanges
  } catch (error) {
    console.error(
      chalk.red(`Error filtering exchanges by token: ${tokenFilter}`)
    )
    console.error(error instanceof Error ? error.message : String(error))
    return [] // Return empty array on error
  }
}

/**
 * Process a single exchange and update the table and stats
 *
 * @param exchange - The exchange to process
 * @param mento - The Mento SDK instance
 * @param provider - The ethers provider
 * @param args - Script command line arguments
 * @param limitsTable - The table for displaying results
 * @param stats - Statistics object to update
 * @param getLimitId - Function to calculate limit ID from exchange ID and asset
 */
export async function processExchange(
  exchange: ExchangeData,
  mento: Mento,
  provider: ethers.providers.Provider,
  args: ScriptArgs,
  limitsTable: Table.Table,
  stats: StatsData,
  getLimitId: GetLimitIdFunc
): Promise<void> {
  try {
    // Get token info and display exchange being processed
    const { tokenAssets, exchangeName } = await prepareExchangeInfo(
      exchange,
      provider
    )

    console.log(
      chalk.yellow(`Processing exchange: ${exchange.id} (${exchangeName})`)
    )
    stats.totalExchanges++

    // Fetch and process exchange data
    try {
      const exchangeData = await fetchExchangeData(exchange, mento)

      if (exchangeData.allLimits.length === 0) {
        handleExchangeWithNoLimits(
          exchange,
          tokenAssets,
          exchangeName,
          args,
          limitsTable
        )
        return
      }

      processExchangeWithLimits(
        exchange,
        tokenAssets,
        exchangeName,
        exchangeData,
        args,
        limitsTable,
        stats,
        getLimitId
      )
    } catch (limitError) {
      handleLimitError(limitError, exchange, exchangeName, args, limitsTable)
    }
  } catch (error) {
    console.error(chalk.red(`Error processing exchange ${exchange.id}:`))
    console.error(error instanceof Error ? error.message : String(error))
  }
}

/**
 * Prepare exchange information including token assets and exchange name
 *
 * @param exchange - The exchange to process
 * @param provider - The ethers provider
 * @returns Object containing token assets and formatted exchange name
 */
async function prepareExchangeInfo(
  exchange: ExchangeData,
  provider: ethers.providers.Provider
): Promise<{
  tokenAssets: Array<{ address: string; symbol: string }>
  exchangeName: string
}> {
  // Get token symbols for display and prepare asset info (using cached symbols)
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
async function fetchExchangeData(
  exchange: ExchangeData,
  mento: Mento
): Promise<{
  allLimits: TradingLimit[]
  limitConfigs: any[]
  limitStates: any[]
  configByAsset: Record<string, any>
  stateByAsset: Record<string, any>
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
    (map: Record<string, any>, cfg: any) => {
      map[cfg.asset] = cfg
      return map
    },
    {}
  )

  const stateByAsset = limitStates.reduce(
    (map: Record<string, any>, state: any) => {
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

/**
 * Handle exchanges that have no trading limits configured
 *
 * @param exchange - The exchange to process
 * @param tokenAssets - The token assets in the exchange
 * @param exchangeName - Formatted exchange name
 * @param args - Script command line arguments
 * @param limitsTable - The table for displaying results
 */
function handleExchangeWithNoLimits(
  exchange: ExchangeData,
  tokenAssets: Array<{ address: string; symbol: string }>,
  exchangeName: string,
  args: ScriptArgs,
  limitsTable: Table.Table
): void {
  // No limits for any assets in this exchange
  for (const asset of tokenAssets) {
    const row: any[] = []

    if (args.verbose) {
      // In verbose mode, show Exchange ID and Asset
      row.push(chalk.cyan(exchange.id), asset.address)
    } else {
      // In normal mode, show human-readable Exchange name
      row.push(chalk.cyan(exchangeName))
    }

    // Symbol is always shown
    row.push(chalk.green(asset.symbol))

    // Add limit ID column in verbose mode
    if (args.verbose) {
      row.push('—')
    }

    row.push(
      '—',
      '—',
      '—',
      '—',
      '—',
      '—',
      '—',
      '—',
      '—',
      chalk.gray('No limits configured')
    )

    limitsTable.push(row)
  }
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
function processExchangeWithLimits(
  exchange: ExchangeData,
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

/**
 * Process assets that have no trading limits configured
 *
 * @param exchange - The exchange to process
 * @param asset - The token asset
 * @param exchangeName - Formatted exchange name
 * @param args - Script command line arguments
 * @param limitsTable - The table for displaying results
 * @param exchangeNameDisplayed - Whether the exchange name has been displayed already
 */
function processAssetWithoutLimits(
  exchange: ExchangeData,
  asset: { address: string; symbol: string },
  exchangeName: string,
  args: ScriptArgs,
  limitsTable: Table.Table,
  exchangeNameDisplayed: boolean
): void {
  // This asset has no limits configured
  const row: any[] = []

  if (args.verbose) {
    // In verbose mode, show Exchange ID and Asset
    row.push(
      !exchangeNameDisplayed ? chalk.cyan(exchange.id) : '',
      asset.address
    )
  } else {
    // In normal mode, show human-readable Exchange name
    row.push(!exchangeNameDisplayed ? chalk.cyan(exchangeName) : '')
  }

  // Symbol is always shown
  row.push(chalk.green(asset.symbol))

  // Add limit ID column in verbose mode
  if (args.verbose) {
    row.push('—')
  }

  row.push(
    '—',
    '—',
    '—',
    '—',
    '—',
    '—',
    '—',
    '—',
    '—',
    chalk.gray('No limits configured')
  )

  limitsTable.push(row)
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
function processAssetWithLimits(
  exchange: ExchangeData,
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

  // Add each limit type (L0, L1, LG) for this asset
  for (let i = 0; i < limits.length; i++) {
    const limit = limits[i] as TradingLimit
    const limitType = i === 0 ? 'L0' : i === 1 ? 'L1' : 'LG'

    // Get limit details
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
      exchangeNameDisplayed && i > 0
    )

    limitsTable.push(row)
  }

  return { hasBlockedLimit, isFullyBlocked }
}

/**
 * Get limit details including values, timeframe, and status
 *
 * @param limit - The trading limit
 * @param limitType - The limit type (L0, L1, LG)
 * @param config - The config for this asset
 * @param state - The state for this asset
 * @returns Object containing limit details
 */
function getLimitDetails(
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
function createLimitRow(
  exchange: ExchangeData,
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
  row.push(limitIndex === 0 ? chalk.green(asset.symbol) : '')

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
 * Handle limit errors for an exchange
 *
 * @param limitError - The error that occurred
 * @param exchange - The exchange to process
 * @param exchangeName - Formatted exchange name
 * @param args - Script command line arguments
 * @param limitsTable - The table for displaying results
 */
function handleLimitError(
  limitError: any,
  exchange: ExchangeData,
  exchangeName: string,
  args: ScriptArgs,
  limitsTable: Table.Table
): void {
  console.error(chalk.red(`Error fetching limits for exchange ${exchange.id}:`))
  console.error(
    limitError instanceof Error ? limitError.message : String(limitError)
  )

  // Add a row showing the error for this exchange
  const row: any[] = []

  if (args.verbose) {
    row.push(chalk.cyan(exchange.id), chalk.gray('—'))
  } else {
    row.push(chalk.cyan(exchangeName))
  }

  row.push(chalk.gray('—'))

  if (args.verbose) {
    row.push(chalk.gray('—'))
  }

  // Fill the remaining columns with the error message
  row.push(
    chalk.gray('—'),
    chalk.gray('—'),
    chalk.gray('—'),
    chalk.gray('—'),
    chalk.gray('—'),
    chalk.gray('—'),
    chalk.gray('—'),
    chalk.gray('—'),
    chalk.gray('—'),
    chalk.red('ERROR: Failed to fetch limits')
  )

  limitsTable.push(row)
}
