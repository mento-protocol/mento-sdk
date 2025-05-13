import { ethers } from 'ethers'
import ora from 'ora'
import { ExchangeData, GetLimitIdFunc, Mento, ScriptArgs } from '../types'

import { ErrorType, handleError } from './errorHandler'
import {
  fetchExchangeData,
  filterExchangesByToken,
  prepareExchangeInfo,
} from './exchangeProcessor'
import { processExchangeWithLimits } from './limitProcessor'
import { createLimitsTable, handleExchangeWithNoLimits } from './tableFormatter'

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
      handleError(ErrorType.EXCHANGE_ERROR, { exchange }, error)
    }
  }

  // Stop the spinner once processing is complete
  spinner.succeed('Processed all exchanges')

  // Display the table
  console.log('\n' + limitsTable.toString())
}
