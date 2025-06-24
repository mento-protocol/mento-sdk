#!/usr/bin/env ts-node

import {
  BiPoolManager__factory,
  IBreakerBox__factory,
  MedianDeltaBreaker__factory,
  ValueDeltaBreaker__factory,
} from '@mento-protocol/mento-core-ts'
import chalk from 'chalk'
import { BigNumber, ethers } from 'ethers'
import ora from 'ora'
import { batchProcess } from '../shared/batchProcessor'
import {
  getSymbolFromTokenAddress,
  prefetchTokenSymbolsFromExchanges,
} from '../shared/tokenUtils'
import { Mento } from './types'
import { parseCommandLineArgs } from './utils/parseCommandLineArgs'

interface BreakerBoxData {
  exchangeId: string
  rateFeedId: string
  asset0: string
  asset1: string
  status: string
  tradingMode: string
  medianThreshold: string
  medianSmoothingFactor: string
  medianEMA: string
  valueThreshold: string
  valueReference: string
  cooldown: string
}

interface ProcessedExchangeResult {
  success: boolean
  data?: BreakerBoxData
  error?: Error
}

/**
 * CLI tool to visualize all breaker box configurations and their current states
 * for all exchanges in the Mento protocol.
 */
async function main(): Promise<void> {
  const startTime = Date.now()

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
    exchangesSpinner.succeed(
      `Fetched ${exchanges.length} exchanges from protocol`
    )

    // Prefetch token symbols for better performance
    if (exchanges.length > 0) {
      await prefetchTokenSymbolsFromExchanges(exchanges, provider)
    }

    // Process exchanges in parallel
    const processSpinner = ora({
      text: `Processing ${exchanges.length} exchanges in parallel...`,
      color: 'cyan',
    }).start()

    // Helper functions for formatting
    const formatNumber = (num: BigNumber, decimals = 4) => {
      const decimal = Number(num) / 1e24
      return decimal.toFixed(decimals).replace(/\.?0+$/, '')
    }

    const formatEMA = (num: BigNumber) => {
      const decimal = Number(num) / 1e24
      return decimal.toFixed(6).replace(/\.?0+$/, '')
    }

    // Process exchanges in batches to avoid overwhelming the RPC endpoint
    const results = await batchProcess(
      exchanges,
      async (exchange, index): Promise<ProcessedExchangeResult> => {
        try {
          // Update spinner text periodically
          if (index % 6 === 0) {
            processSpinner.text = `Processing exchanges... (${index + 1}/${
              exchanges.length
            })`
          }

          const biPoolManager = BiPoolManager__factory.connect(
            exchange.providerAddr,
            provider
          )

          // Fetch exchange config and breaker box address in parallel
          const [breakerBoxAddr, exchangeConfig] = await Promise.all([
            biPoolManager.breakerBox(),
            biPoolManager.getPoolExchange(exchange.id),
          ])

          const breakerBox = IBreakerBox__factory.connect(
            breakerBoxAddr,
            provider
          )

          // Get breaker parameters
          const referenceRateFeedId = exchangeConfig.config.referenceRateFeedID

          // Get trading mode and breaker addresses in parallel
          const [tradingMode, breakerAddresses] = await Promise.all([
            breakerBox.getRateFeedTradingMode(referenceRateFeedId),
            breakerBox.getBreakers(),
          ])

          const status =
            tradingMode === 0
              ? 'active'
              : tradingMode === 1
              ? 'tripped'
              : 'disabled'

          if (breakerAddresses.length < 2) {
            throw new Error(
              `Insufficient breakers found for exchange ${exchange.id}`
            )
          }

          // Connect to both breakers
          const medianBreaker = MedianDeltaBreaker__factory.connect(
            breakerAddresses[0],
            provider
          )
          const valueBreaker = ValueDeltaBreaker__factory.connect(
            breakerAddresses[1],
            provider
          )

          // Fetch all breaker parameters and token symbols in parallel
          const [
            medianThreshold,
            medianSmoothingFactor,
            medianEMA,
            valueThreshold,
            valueReference,
            cooldown,
            asset0Symbol,
            asset1Symbol,
          ] = await Promise.all([
            medianBreaker.rateChangeThreshold(referenceRateFeedId),
            medianBreaker.getSmoothingFactor(referenceRateFeedId),
            medianBreaker.medianRatesEMA(referenceRateFeedId),
            valueBreaker.rateChangeThreshold(referenceRateFeedId),
            valueBreaker.referenceValues(referenceRateFeedId),
            medianBreaker.getCooldown(referenceRateFeedId),
            getSymbolFromTokenAddress(exchangeConfig.asset0, provider),
            getSymbolFromTokenAddress(exchangeConfig.asset1, provider),
          ])

          const data: BreakerBoxData = {
            exchangeId: exchange.id,
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
            cooldown: `${cooldown.div(60).toString()}m`,
          }

          return { success: true, data }
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error : new Error(String(error)),
          }
        }
      },
      6 // Process 6 exchanges concurrently
    )

    processSpinner.succeed('Exchange data processed')

    // Process results and collect successful data
    const tableData: BreakerBoxData[] = []
    let successCount = 0
    let errorCount = 0

    for (const result of results) {
      if (result.success && result.data) {
        tableData.push(result.data)
        successCount++
      } else {
        errorCount++
        console.log(
          chalk.yellow(
            `Warning: Failed to process exchange - ${result.error?.message}`
          )
        )
      }
    }

    // Display processing summary
    if (errorCount > 0) {
      console.log(
        `\nProcessing summary: ${successCount} successful, ${errorCount} failed`
      )
    }

    // Filter by token symbol if specified
    let filteredData = args.token
      ? tableData.filter(
          (data) =>
            data.asset0.toLowerCase() === args.token?.toLowerCase() ||
            data.asset1.toLowerCase() === args.token?.toLowerCase()
        )
      : tableData

    // Filter by exchange ID if specified
    if (args.exchange) {
      filteredData = filteredData.filter(
        (data) => data.exchangeId === args.exchange
      )
    }

    // Define column widths
    const colWidths = {
      exchangeId: 66,
      rateFeedId: 42,
      asset0: 9,
      asset1: 9,
      status: 7,
      tradingMode: 12,
      medianThreshold: 13,
      medianSmoothingFactor: 13,
      medianEMA: 11,
      valueThreshold: 12,
      valueReference: 9,
      cooldown: 7,
    }

    // Calculate total table width
    const numColumns = Object.keys(colWidths).length
    const totalWidth =
      Object.values(colWidths).reduce((a, b) => a + b, 0) +
      (numColumns - 1) * 3 +
      1 // 3 for ' | ', 1 for initial space

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
      const statusColor =
        data.status === 'active'
          ? chalk.green
          : data.status === 'tripped'
          ? chalk.red
          : chalk.yellow
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

    // Display performance summary
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2)
    console.log(chalk.gray(`\nCompleted in ${totalTime}s`))

    // Display legend
    console.log(chalk.bold('\nLegend:'))
    console.log(
      `${chalk.green('ACTIVE')} - Circuit breaker is active and monitoring`
    )
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

// Run the script
main().catch((error) => {
  console.error('Error:', error)
  process.exit(1)
})
