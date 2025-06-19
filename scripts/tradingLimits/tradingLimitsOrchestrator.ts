import { ethers } from 'ethers'
import ora from 'ora'
import { batchProcess } from '../shared/batchProcessor'
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

interface ProcessedExchangeResult {
  success: boolean
  exchange: ExchangeData
  tokenAssets?: Array<{ address: string; symbol: string }>
  exchangeName?: string
  exchangeData?: any
  error?: Error
}

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
  const limitsTable = createLimitsTable()

  // Filter exchanges if a token filter is provided
  let exchangesToProcess = exchanges
  if (args.token) {
    const filterSpinner = ora({
      text: 'Filtering exchanges by token...',
      color: 'cyan',
    }).start()

    exchangesToProcess = await filterExchangesByToken(
      exchanges,
      args.token,
      provider
    )

    filterSpinner.succeed(
      `Filtered to ${exchangesToProcess.length} exchanges matching "${args.token}"`
    )
  }

  // Create a spinner to indicate processing
  const spinner = ora({
    text: `Processing ${exchangesToProcess.length} exchanges in parallel...`,
    color: 'cyan',
  }).start()

  // Process exchanges in batches to avoid overwhelming the RPC endpoint
  const results = await batchProcess(
    exchangesToProcess,
    async (
      exchange: ExchangeData,
      index: number
    ): Promise<ProcessedExchangeResult> => {
      try {
        // Update spinner text periodically (for the first item in each batch)
        if (index % 8 === 0) {
          spinner.text = `Processing exchanges... (${index + 1}/${
            exchangesToProcess.length
          })`
        }

        // Prepare exchange information and fetch exchange data in parallel
        const [{ tokenAssets, exchangeName }, exchangeData] = await Promise.all(
          [
            prepareExchangeInfo(exchange, provider),
            fetchExchangeData(exchange, mento),
          ]
        )

        return {
          success: true,
          exchange,
          tokenAssets,
          exchangeName,
          exchangeData,
        }
      } catch (error) {
        return {
          success: false,
          exchange,
          error: error instanceof Error ? error : new Error(String(error)),
        }
      }
    },
    8 // Process 8 exchanges concurrently
  )

  // Stop the spinner once processing is complete
  spinner.succeed(`Processed ${exchangesToProcess.length} exchanges`)

  // Process results and populate the table
  let successCount = 0
  let errorCount = 0

  for (const result of results) {
    if (
      result.success &&
      result.tokenAssets &&
      result.exchangeName &&
      result.exchangeData
    ) {
      successCount++

      // Check if this exchange has any trading limits
      if (result.exchangeData.allLimits.length > 0) {
        // Process exchange with trading limits
        processExchangeWithLimits(
          result.exchange,
          result.tokenAssets,
          result.exchangeName,
          result.exchangeData,
          args,
          limitsTable
        )
      } else {
        // Handle exchange with no trading limits
        handleExchangeWithNoLimits(
          result.tokenAssets,
          result.exchangeName,
          limitsTable,
          false // Pass false to ensure the exchange name is displayed in the first row for this exchange
        )
      }
    } else {
      errorCount++
      handleError(
        ErrorType.EXCHANGE_ERROR,
        { exchange: result.exchange },
        result.error
      )
    }
  }

  // Display processing summary
  if (errorCount > 0) {
    console.log(
      `\nProcessing summary: ${successCount} successful, ${errorCount} failed`
    )
  }

  // Display the table
  console.log('\n' + limitsTable.toString())
}
