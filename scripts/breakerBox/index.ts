#!/usr/bin/env ts-node

import chalk from 'chalk'
import { ethers } from 'ethers'
import ora from 'ora'
import { Mento, ExchangeData } from './types'
import { parseCommandLineArgs } from './utils/parseCommandLineArgs'
import { 
  BiPoolManager__factory, 
  IBreakerBox__factory, 
  WithThreshold__factory, 
  WithCooldown__factory,
  MedianDeltaBreaker__factory,
  ValueDeltaBreaker__factory
} from '@mento-protocol/mento-core-ts'
import { BigNumber } from 'ethers'
import { getSymbolFromTokenAddress } from '../../src/utils'

/**
 * CLI tool to visualize all breaker box configurations and their current states
 * for all exchanges in the Mento protocol.
 */
async function main(): Promise<void> {
  try {
    // Parse command line arguments
    const args = parseCommandLineArgs()

    // Set up provider - this assumes you're connecting to the network where Mento is deployed
    const rpcUrl = process.env.RPC_URL || 'https://forno.celo.org'
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl)

    console.log(chalk.gray('\n==============================='))
    console.log(chalk.bold.blue('Mento Breaker Box Visualizer'))
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
    exchangesSpinner.succeed(`Fetched ${exchanges.length} exchanges from protocol`)

    // Process each exchange
    const tableData: {
      exchangeId: string;
      rateFeedId: string;
      asset0: string;
      asset1: string;
      status: string;
      tradingMode: string;
      medianThreshold: string;
      medianSmoothingFactor: string;
      medianEMA: string;
      valueThreshold: string;
      valueReference: string;
      cooldown: string;
    }[] = []
    const processSpinner = ora({
      text: 'Processing exchange data...',
      color: 'cyan',
    }).start()

    for (const exchange of exchanges) {
      try {
        const biPoolManager = BiPoolManager__factory.connect(
          exchange.providerAddr!,
          provider
        )
        const [breakerBoxAddr, exchangeConfig] = await Promise.all([
          biPoolManager.breakerBox(),
          biPoolManager.getPoolExchange(exchange.id),
        ])
        const breakerBox = IBreakerBox__factory.connect(breakerBoxAddr, provider)
        
        // Get and display breaker parameters
        const referenceRateFeedId = exchangeConfig.config.referenceRateFeedID
        const tradingMode = await breakerBox.getRateFeedTradingMode(referenceRateFeedId)
        const status = tradingMode === 0 ? 'active' : tradingMode === 1 ? 'tripped' : 'disabled'
        
        // Format the exchange ID to be more readable
        const shortExchangeId = exchange.id.slice(0, 64) + '...'
        
        // Get breaker addresses
        const breakerAddresses = await breakerBox.getBreakers()
        
        // Get parameters from both breakers
        const medianBreaker = MedianDeltaBreaker__factory.connect(breakerAddresses[0], provider)
        const valueBreaker = ValueDeltaBreaker__factory.connect(breakerAddresses[1], provider)
        
        const [
          medianThreshold,
          medianSmoothingFactor,
          medianEMA,
          valueThreshold,
          valueReference,
          cooldown
        ] = await Promise.all([
          medianBreaker.rateChangeThreshold(referenceRateFeedId),
          medianBreaker.getSmoothingFactor(referenceRateFeedId),
          medianBreaker.medianRatesEMA(referenceRateFeedId),
          valueBreaker.rateChangeThreshold(referenceRateFeedId),
          valueBreaker.referenceValues(referenceRateFeedId),
          medianBreaker.getCooldown(referenceRateFeedId)
        ])
        
        // Convert threshold from e24 to decimal and format numbers
        const formatNumber = (num: BigNumber, decimals: number = 4) => {
          const decimal = Number(num) / 1e24
          return decimal.toFixed(decimals).replace(/\.?0+$/, '')
        }

        const formatEMA = (num: BigNumber) => {
          const decimal = Number(num) / 1e24
          return decimal.toFixed(6).replace(/\.?0+$/, '')
        }

        // Get token symbols
        const asset0Symbol = await getSymbolFromTokenAddress(exchangeConfig.asset0, provider)
        const asset1Symbol = await getSymbolFromTokenAddress(exchangeConfig.asset1, provider)

        tableData.push({
          exchangeId: referenceRateFeedId.slice(0, 64),
          rateFeedId: referenceRateFeedId,
          asset0: asset0Symbol,
          asset1: asset1Symbol,
          status: status,
          tradingMode: tradingMode.toString(),
          medianThreshold: formatNumber(medianThreshold),
          medianSmoothingFactor: formatNumber(medianSmoothingFactor),
          medianEMA: formatEMA(medianEMA),
          valueThreshold: formatNumber(valueThreshold),
          valueReference: formatNumber(valueReference),
          cooldown: `${cooldown}s`
        })
      } catch (error) {
        // Print error row
        console.log(
          (exchange.id.slice(0, 64) + '...').padEnd(66) + ' | ' +
          chalk.red('ERROR').padEnd(10) + ' | ' +
          'N/A'.padEnd(14) + ' | ' +
          'N/A'.padEnd(16) + ' | ' +
          'N/A'.padEnd(16) + ' | ' +
          'N/A'
        )
        console.log(chalk.gray('  Error: ' + (error instanceof Error ? error.message : String(error))))
      }
    }

    processSpinner.succeed('Exchange data processed')

    // Filter by token symbol if specified
    const filteredData = args.token
      ? tableData.filter(
          (data) =>
            data.asset0.toLowerCase() === args.token?.toLowerCase() ||
            data.asset1.toLowerCase() === args.token?.toLowerCase()
        )
      : tableData

    // Define column widths
    const colWidths = {
      exchangeId: 66,
      rateFeedId: 66,
      asset0: 10,
      asset1: 10,
      status: 10,
      tradingMode: 14,
      medianThreshold: 16,
      medianSmoothingFactor: 20,
      medianEMA: 16,
      valueThreshold: 16,
      valueReference: 16,
      cooldown: 10
    }

    // Calculate total table width
    const numColumns = Object.keys(colWidths).length
    const totalWidth = Object.values(colWidths).reduce((a, b) => a + b, 0) + (numColumns - 1) * 3 + 1 // 3 for ' | ', 1 for initial space

    // Create table header
    console.log('\nBreaker Box Configuration Details:')
    console.log('='.repeat(totalWidth))
    console.log(
      'Exchange ID'.padEnd(colWidths.exchangeId) +
      ' | ' +
      'Rate Feed ID'.padEnd(colWidths.rateFeedId) +
      ' | ' +
      'Asset 0'.padEnd(colWidths.asset0) +
      ' | ' +
      'Asset 1'.padEnd(colWidths.asset1) +
      ' | ' +
      'Status'.padEnd(colWidths.status) +
      ' | ' +
      'Trading Mode'.padEnd(colWidths.tradingMode) +
      ' | ' +
      'Median Thresh'.padEnd(colWidths.medianThreshold) +
      ' | ' +
      'Median Smooth'.padEnd(colWidths.medianSmoothingFactor) +
      ' | ' +
      'Median EMA'.padEnd(colWidths.medianEMA) +
      ' | ' +
      'Value Thresh'.padEnd(colWidths.valueThreshold) +
      ' | ' +
      'Value Ref'.padEnd(colWidths.valueReference) +
      ' | ' +
      'Cooldown'.padEnd(colWidths.cooldown)
    )
    console.log('-'.repeat(totalWidth))

    // Display each exchange
    for (const data of filteredData) {
      // Color the status
      const statusColor = data.status === 'active' ? chalk.green : data.status === 'tripped' ? chalk.red : chalk.yellow
      const statusStr = statusColor(data.status.padEnd(colWidths.status))

      console.log(
        data.exchangeId.padEnd(colWidths.exchangeId) +
        ' | ' +
        data.rateFeedId.padEnd(colWidths.rateFeedId) +
        ' | ' +
        data.asset0.padEnd(colWidths.asset0) +
        ' | ' +
        data.asset1.padEnd(colWidths.asset1) +
        ' | ' +
        statusStr +
        ' | ' +
        data.tradingMode.padEnd(colWidths.tradingMode) +
        ' | ' +
        data.medianThreshold.padEnd(colWidths.medianThreshold) +
        ' | ' +
        data.medianSmoothingFactor.padEnd(colWidths.medianSmoothingFactor) +
        ' | ' +
        data.medianEMA.padEnd(colWidths.medianEMA) +
        ' | ' +
        data.valueThreshold.padEnd(colWidths.valueThreshold) +
        ' | ' +
        data.valueReference.padEnd(colWidths.valueReference) +
        ' | ' +
        data.cooldown.padEnd(colWidths.cooldown)
      )
    }

    console.log('='.repeat(totalWidth))
    console.log(`Total exchanges: ${filteredData.length}`)

    // Display legend
    console.log(chalk.bold('\nLegend:'))
    console.log(`${chalk.green('ACTIVE')} - Circuit breaker is active and monitoring`)
    console.log(`${chalk.red('TRIPPED')} - Circuit breaker has been triggered`)
    console.log(`${chalk.yellow('DISABLED')} - Circuit breaker is disabled`)

    // Display usage information
    console.log('\n' + chalk.bold('Usage:'))
    console.log(
      '  yarn breakerBox [--token|-t <symbol>] [--exchange|-e <exchangeId>]'
    )
  } catch (error) {
    console.error(chalk.red('ERROR: An unexpected error occurred:'))
    console.error(error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}

function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'active':
      return chalk.green('ACTIVE')
    case 'tripped':
      return chalk.red('TRIPPED')
    case 'disabled':
      return chalk.yellow('DISABLED')
    default:
      return chalk.gray(status)
  }
}

// Run the script
main().catch((error) => {
  console.error('Error:', error)
  process.exit(1)
}) 