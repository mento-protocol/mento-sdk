import { ethers } from 'ethers'
import ora from 'ora'
import {
  ExchangeData,
  GetLimitIdFunc,
  Mento,
  ScriptArgs,
  StatsData,
} from '../types'
import { getSymbolFromTokenAddress } from './general'
import {
  createLimitsTable,
  displayStatsSummary,
  fetchExchangeData,
  filterExchangesByToken,
  handleExchangeError,
  handleExchangeWithNoLimits,
  prepareExchangeInfo,
  processExchangeWithLimits,
} from './modules'

/**
 * Initialize statistics data structure
 *
 * @returns Initialized statistics object
 */
export function initializeStats(): StatsData {
  return {
    totalExchanges: 0,
    exchangesWithLimits: 0,
    activeExchanges: 0,
    partiallyBlockedExchanges: 0,
    fullyBlockedExchanges: 0,
  }
}

/**
 * Pre-fetch token symbols for caching
 * This reduces repeated calls for the same token
 *
 * @param exchanges - List of exchanges
 * @param provider - The ethers provider
 */
export async function prefetchTokenSymbols(
  exchanges: ExchangeData[],
  provider: ethers.providers.Provider
): Promise<void> {
  const spinner = ora({
    text: 'Pre-fetching token symbols...',
    color: 'cyan',
  }).start()

  // Extract unique token addresses from all exchanges
  const uniqueTokenAddresses = new Set<string>()

  for (const exchange of exchanges) {
    for (const asset of exchange.assets) {
      uniqueTokenAddresses.add(asset)
    }
  }

  const uniqueTokenCount = uniqueTokenAddresses.size
  spinner.text = `Prefetching ${uniqueTokenCount} token symbols...`

  // Fetch all token symbols in parallel
  await Promise.all(
    Array.from(uniqueTokenAddresses).map(async (address) => {
      await getSymbolFromTokenAddress(address, provider)
    })
  )

  spinner.succeed(`Prefetched ${uniqueTokenCount} token symbols`)
}

/**
 * Process all exchanges and display their trading limits
 *
 * @param exchanges - List of exchanges to process
 * @param mento - The Mento SDK instance
 * @param provider - The ethers provider
 * @param args - Script command line arguments
 * @param getLimitId - Function to calculate limit ID from exchange ID and asset
 */
export async function processTradingLimits(
  exchanges: ExchangeData[],
  mento: Mento,
  provider: ethers.providers.Provider,
  args: ScriptArgs,
  getLimitId: GetLimitIdFunc
): Promise<void> {
  // Initialize statistics
  const stats = initializeStats()
  stats.totalExchanges = exchanges.length

  // Create table for displaying results
  const limitsTable = createLimitsTable(args)

  // Filter exchanges if a token filter is provided
  let exchangesToProcess = exchanges
  if (args.token) {
    exchangesToProcess = await filterExchangesByToken(
      exchanges,
      args.token,
      provider
    )
  }

  // Create a spinner to indicate processing
  const spinner = ora({
    text: 'Fetching trading limit data for each exchange...',
    color: 'cyan',
  }).start()

  // Process each exchange and populate the table
  for (let i = 0; i < exchangesToProcess.length; i++) {
    const exchange = exchangesToProcess[i]
    spinner.text = `Processing exchange ${i + 1}/${
      exchangesToProcess.length
    }: ${exchange.id}`

    try {
      // Prepare exchange information
      const { tokenAssets, exchangeName } = await prepareExchangeInfo(
        exchange,
        provider
      )

      // Fetch exchange data from Mento protocol
      const exchangeData = await fetchExchangeData(exchange, mento)

      // Check if this exchange has any trading limits
      if (exchangeData.allLimits.length > 0) {
        // Process exchange with trading limits
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
      } else {
        // Handle exchange with no trading limits
        handleExchangeWithNoLimits(
          exchange,
          tokenAssets,
          exchangeName,
          args,
          limitsTable
        )
      }
    } catch (error) {
      handleExchangeError(exchange, error)
    }
  }

  // Stop the spinner once processing is complete
  spinner.succeed('Processed all exchanges')

  // Display the table and statistics
  console.log('\n', limitsTable.toString())
  displayStatsSummary(stats)
}
