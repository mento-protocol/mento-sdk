#!/usr/bin/env ts-node

import chalk from 'chalk'
import { ethers } from 'ethers'
import ora from 'ora'
import { ExchangeData, Mento } from './types'
import { parseCommandLineArgs } from './utils/parseCommandLineArgs'
import { prefetchTokenSymbols } from './utils/prefetchTokenSymbols'
import { processSpreads } from './spreadsOrchestrator'

/**
 * CLI tool to visualize all spread configurations for all exchanges in the Mento protocol.
 */
async function main(): Promise<void> {
  try {
    // Parse command line arguments
    const args = parseCommandLineArgs()

    // Set up provider - this assumes you're connecting to the network where Mento is deployed
    const rpcUrl = process.env.RPC_URL || 'https://forno.celo.org'
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl)

    console.log(chalk.gray('\n==============================='))
    console.log(chalk.bold.blue('Mento Spreads Visualizer'))
    console.log(chalk.gray('===============================\n'))
    console.log(chalk.yellow(`Using RPC URL: ${rpcUrl}\n`))

    if (args.token) {
      console.log(chalk.yellow(`Filtering by token: ${args.token}\n`))
    }

    if (args.exchange) {
      console.log(chalk.yellow(`Filtering by exchange ID: ${args.exchange}`))
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
    const filteredExchanges = args.exchange
      ? exchanges.filter((exchange) =>
          exchange.id.toLowerCase().includes(args.exchange!.toLowerCase())
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

    // Prefetch token symbols if needed (for better performance)
    await prefetchTokenSymbols(filteredExchanges, provider)

    // Process all exchanges and display spreads
    await processSpreads(filteredExchanges, mento, provider, args)

    // Display usage information
    console.log('\n' + chalk.bold('Usage:'))
    console.log(
      '  yarn spreads [--token|-t <symbol>] [--exchange|-e <exchangeId>]'
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