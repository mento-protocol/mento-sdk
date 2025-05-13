#!/usr/bin/env ts-node

import chalk from 'chalk'
import { ethers } from 'ethers'
import ora from 'ora'
import { getLimitId } from '../../src/limits'
import { ExchangeData, Mento } from './types'
import { parseCommandLineArgs } from './utils/parseCommandLineArgs'
import {
  prefetchTokenSymbols,
  processTradingLimits,
} from './utils/tradingLimitsProcessor'

/**
 * CLI tool to visualize all trading limit configurations and their current states
 * for all exchanges in the Mento protocol.
 */
async function main(): Promise<void> {
  try {
    // Parse command line arguments
    const args = parseCommandLineArgs()

    // Set up provider - this assumes you're connecting to the network where Mento is deployed
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.RPC_URL || 'https://forno.celo.org'
    )

    console.log(chalk.gray('\n==============================='))
    console.log(chalk.bold.blue('Mento Trading Limits Visualizer'))
    console.log(chalk.gray('===============================\n'))

    if (args.token) {
      console.log(chalk.yellow(`Filtering by token: ${args.token}\n`))
    }

    if (args.exchange) {
      console.log(chalk.yellow(`Filtering by exchange ID: ${args.exchange}`))
    }

    if (args.verbose) {
      console.log(
        chalk.yellow('Verbose mode enabled: Showing additional details')
      )
    }

    // Create Mento SDK instance
    const connectSpinner = ora({
      text: 'Connecting to Mento protocol...',
      color: 'cyan',
    }).start()
    const mento = await Mento.create(provider)
    connectSpinner.succeed('Connected to Mento protocol')

    // Get all exchanges
    const exchangesSpinner = ora({
      text: 'Fetching exchanges...',
      color: 'cyan',
    }).start()
    const exchanges = (await mento.getExchanges()) as ExchangeData[]

    // Apply exchange ID filter if specified
    let filteredExchanges = args.exchange
      ? exchanges.filter((exchange) =>
          exchange.id.toLowerCase().includes(args.exchange.toLowerCase())
        )
      : exchanges

    // Show combined success message with filter information if relevant
    if (args.exchange) {
      exchangesSpinner.succeed(
        `Fetched ${exchanges.length} exchanges from protocol, filtered to ${filteredExchanges.length} matching exchange ID "${args.exchange}"`
      )
    } else {
      exchangesSpinner.succeed(
        `Fetched ${exchanges.length} exchanges from protocol`
      )
    }

    // Prefetch token symbols if needed
    await prefetchTokenSymbols(filteredExchanges, provider)

    // Process all exchanges and display trading limits
    await processTradingLimits(
      filteredExchanges,
      mento,
      provider,
      args,
      getLimitId
    )

    // Display legend
    console.log(chalk.bold('\nLegend:'))
    console.log(`${chalk.green('ACTIVE')} - Trading is fully enabled`)
    console.log(
      `${chalk.yellow(
        'INFLOWS BLOCKED'
      )} - Deposits are blocked, withdrawals allowed`
    )
    console.log(
      `${chalk.yellow(
        'OUTFLOWS BLOCKED'
      )} - Withdrawals are blocked, deposits allowed`
    )
    console.log(
      `${chalk.red('BLOCKED')} - All trading is blocked until window resets`
    )

    // Display usage information
    console.log('\n' + chalk.bold('Usage:'))
    console.log(
      '  yarn tradingLimits [--token|-t <symbol>] [--exchange|-e <exchangeId>] [--verbose|-v]'
    )
  } catch (error) {
    console.error(chalk.red('ERROR: An unexpected error occurred:'))
    console.error(error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}

// Run the script
main().catch((error) => {
  console.error('Error:', error)
  process.exit(1)
})
