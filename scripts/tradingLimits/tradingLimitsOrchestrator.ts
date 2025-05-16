import { ethers } from 'ethers'
import ora from 'ora'
import { ExchangeData, Mento, ScriptArgs } from './types'

import { ErrorType, handleError } from './utils/errorHandler'
import { processExchangeWithLimits } from './utils/exchangeLimitProcessor'
import {
  fetchExchangeData,
  filterExchangesByToken,
  prepareExchangeInfo,
} from './utils/exchangeProcessor'
import {
  createLimitsTable,
  handleExchangeWithNoLimits,
} from './utils/tableFormatter'

/**
 * Process all exchanges and display their trading limits
 *
 * @param exchanges - List of exchanges to process
 * @param mento - The Mento SDK instance
 * @param provider - The ethers provider
 * @param args - Script command line arguments
 */
export async function processTradingLimits(
  exchanges: ExchangeData[],
  mento: Mento,
  provider: ethers.providers.Provider,
  args: ScriptArgs
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
          limitsTable
        )
      } else {
        // Handle exchange with no trading limits
        handleExchangeWithNoLimits(
          tokenAssets,
          exchangeName,
          limitsTable,
          false // Pass false to ensure the exchange name is displayed in the first row for this exchange
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
