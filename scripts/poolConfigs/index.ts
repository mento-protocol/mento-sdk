#!/usr/bin/env ts-node

import { BiPoolManager__factory } from '@mento-protocol/mento-core-ts'
import chalk from 'chalk'
import { ethers } from 'ethers'
// import ora from 'ora'
import { batchProcess } from '../shared/batchProcessor'
import {
  getSymbolFromTokenAddress,
  prefetchTokenSymbolsFromExchanges,
} from '../shared/tokenUtils'
import { displayPoolConfig } from './poolConfigOrchestrator'
import { ExchangeData, Mento } from './types'
import { parseCommandLineArgs } from './utils/parseCommandLineArgs'

/**
 * CLI tool to visualize all spread configurations for all exchanges in the Mento protocol.
 */
async function main(): Promise<void> {
  const ora = (await import('ora')).default;
  try {
    // Parse command line arguments
    const args = parseCommandLineArgs()

    // Use RPC URL from command line args or fallback to environment variable
    const rpcUrl =
      args.rpcUrl || process.env.RPC_URL || 'https://forno.celo.org'
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl)

    console.log(chalk.gray('\n==============================='))
    console.log(chalk.bold.blue('Mento Pool Config Visualizer'))
    console.log(chalk.gray('===============================\n'))
    console.log(chalk.yellow(`Using RPC URL: ${rpcUrl}`))

    if (args.chainId) {
      console.log(chalk.yellow(`Network: Chain ID ${args.chainId}\n`))
    } else {
      console.log()
    }

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

    // Fetch all exchanges
    const exchangesSpinner = ora({
      text: 'Fetching exchanges...',
      color: 'cyan',
    }).start()
    const exchanges = await mento.getExchanges()
    exchangesSpinner.succeed(
      `Successfully fetched ${exchanges.length} exchanges`
    )

    // Prefetch token symbols for better performance
    if (exchanges.length > 0) {
      await prefetchTokenSymbolsFromExchanges(exchanges, provider)
    }

    // Process spreads for each exchange in batches
    const configSpinner = ora({
      text: 'Fetching pool configurations...',
      color: 'cyan',
    }).start()

    // Process exchanges in batches to avoid overwhelming the RPC endpoint
    const results = await batchProcess(
      exchanges,
      async (exchange) => {
        try {
          const biPoolManager = BiPoolManager__factory.connect(
            exchange.providerAddr,
            provider
          )
          const poolExchange = await biPoolManager.getPoolExchange(exchange.id)
          if (!poolExchange) return null

          // Use cached symbols instead of making additional RPC calls
          const asset0Symbol = await getSymbolFromTokenAddress(
            poolExchange.asset0,
            provider
          )
          const asset1Symbol = await getSymbolFromTokenAddress(
            poolExchange.asset1,
            provider
          )

          // Convert spread from FixidityLib.Fraction to percentage
          const spread = (Number(poolExchange.config.spread.value) / 1e24) * 100

          // Convert referenceRateResetFrequency from seconds to hours
          const resetFrequencyMinutes =
            Number(poolExchange.config.referenceRateResetFrequency) / 60

          const exchangeData: ExchangeData = {
            exchangeId: exchange.id,
            asset0: {
              address: poolExchange.asset0,
              symbol: asset0Symbol,
            },
            asset1: {
              address: poolExchange.asset1,
              symbol: asset1Symbol,
            },
            spread,
            referenceRateFeedID: poolExchange.config.referenceRateFeedID,
            referenceRateResetFrequency: resetFrequencyMinutes,
            minimumReports: Number(poolExchange.config.minimumReports),
            stablePoolResetSize: Number(
              poolExchange.config.stablePoolResetSize
            ),
          }

          return exchangeData
        } catch (error) {
          console.warn(
            chalk.yellow(
              `Warning: Failed to fetch config for exchange ${exchange.id}`
            )
          )
          return null
        }
      },
      12 // Process 12 exchanges concurrently
    )

    const exchangeData = results.filter(
      (data): data is ExchangeData => data !== null
    )

    configSpinner.succeed(
      `Successfully fetched ${exchangeData.length} pool configurations`
    )

    // Filter by token symbol if specified
    let filteredData = args.token
      ? exchangeData.filter(
        (data) =>
          data.asset0.symbol.toLowerCase() === args.token?.toLowerCase() ||
          data.asset1.symbol.toLowerCase() === args.token?.toLowerCase()
      )
      : exchangeData

    // Filter by exchange ID if specified
    if (args.exchange) {
      filteredData = filteredData.filter(
        (data) => data.exchangeId === args.exchange
      )
    }

    // Process and display the spreads
    displayPoolConfig(filteredData)

    // Display usage information
    console.log('\n' + chalk.bold('Usage:'))
    console.log(
      '  yarn poolConfigs [--token|-t <symbol>] [--exchange|-e <exchangeId>] [--network|-n <network>] [--chainId|-c <chainId>]'
    )
    console.log('\n' + chalk.bold('Network options:'))
    console.log('  --network celo       # Celo mainnet')
    console.log('  --network alfajores  # Alfajores testnet')
    console.log(
      '  --chainId 42220      # Celo mainnet (same as --network celo)'
    )
    console.log('  --chainId 44787      # Alfajores testnet')
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
