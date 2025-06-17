#!/usr/bin/env ts-node

import { BiPoolManager__factory } from '@mento-protocol/mento-core-ts'
import chalk from 'chalk'
import { ethers } from 'ethers'
import ora from 'ora'
import { Mento } from '../../src/mento'
import { getSymbolFromTokenAddress } from '../../src/utils'
import { displayPoolConfig } from './poolConfigOrchestrator'
import { ExchangeData } from './types'
import { parseCommandLineArgs } from './utils/parseCommandLineArgs'
import { prefetchTokenSymbols } from './utils/prefetchTokenSymbols'

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
    console.log(chalk.bold.blue('Mento Pool Config Visualizer'))
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
    await prefetchTokenSymbols(exchanges, provider)

    // Process spreads for each exchange
    const exchangeData: ExchangeData[] = []
    for (const exchange of exchanges) {
      const biPoolManager = BiPoolManager__factory.connect(
        exchange.providerAddr,
        provider
      )
      const poolExchange = await biPoolManager.getPoolExchange(exchange.id)
      if (!poolExchange) continue

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
      const resetFrequencyHours =
        Number(poolExchange.config.referenceRateResetFrequency) / 3600

      exchangeData.push({
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
        referenceRateResetFrequency: resetFrequencyHours,
        minimumReports: Number(poolExchange.config.minimumReports),
        stablePoolResetSize: Number(poolExchange.config.stablePoolResetSize),
      })
    }

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
      '  yarn poolConfigs [--token|-t <symbol>] [--exchange|-e <exchangeId>]'
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
