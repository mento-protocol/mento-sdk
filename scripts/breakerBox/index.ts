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
import { getAddress } from '../../src/constants'
import { getChainId } from '../../src/utils'
import { batchProcess } from '../shared/batchProcessor'
import { toRateFeedId } from '../shared/rateFeedUtils'
import {
    getSymbolFromTokenAddress,
    prefetchTokenSymbolsFromExchanges,
} from '../shared/tokenUtils'
import { Mento } from './types'
import { parseCommandLineArgs } from './utils/parseCommandLineArgs'

const CURRENCIES = ["AUD", "USD", "PHP", "ZAR", "CAD", "EUR", "BRL", "XOF", "COP", "GHS", "CHF", "NGN", "JPY", "CHF", "GBP", "KES", "CELO", "ETH", "EURC", "EUROC", "USDC", "USDT"];
const RATEFEED_REVERSE_LOOKUP: Record<string, string> = CURRENCIES.reduce((acc, cur0) => {
  return {
    ...acc,
    ...CURRENCIES.reduce((acc, cur1) => {
      for (const rateFeed of [`${cur0}${cur1}`, `${cur0}/${cur1}`, `relayed:${cur0}/${cur1}`, `relayed:${cur0}${cur1}`]) {
        acc[toRateFeedId(rateFeed).toLocaleLowerCase()] = rateFeed
      }
      return acc
    }, {} as Record<string, string>)
  }
}, {
  ["0x765DE816845861e75A25fCA122bb6898B8B1282a".toLocaleLowerCase()]: "cUSD (CELOUSD)",
  ["0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73".toLocaleLowerCase()]: "cEUR (CELOEUR)",
  ["0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787".toLocaleLowerCase()]: "cREAL (CELOBRL)",
  ["0x73F93dcc49cB8A239e2032663e9475dd5ef29A08".toLocaleLowerCase()]: "eXOF (CELOXOF)",
})


interface BreakerBoxData {
  exchangeId: string
  rateFeedId: string
  rateFeed: string
  dependencies: string[]
  asset0: string
  asset1: string
  exchangePair: string
  status: string
  tradingMode: string
  medianThreshold: string
  medianSmoothingFactor: string
  medianEMA: string
  medianCooldown: string
  valueThreshold: string
  valueReference: string
  valueCooldown: string
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
    const rpcUrl =
      args.rpcUrl || process.env.RPC_URL || 'https://forno.celo.org'
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
    const rateFeedsSpinner = ora({
      text: 'Fetching rate feeds...',
      color: 'cyan',
    }).start()

    const breakerBox = IBreakerBox__factory.connect(
      getAddress('BreakerBox', await getChainId(provider)),
      provider
    )

    const rateFeedIds = await breakerBox.getRateFeeds()

    rateFeedsSpinner.succeed(
      `Fetched ${rateFeedIds.length} rate feeds from protocol`
    )

    const exchangesSpinner = ora({
      text: 'Fetching exchanges...',
      color: 'cyan',
    }).start()


    const exchanges = await mento.getExchanges()

    const biPoolManager = BiPoolManager__factory.connect(
      // XXX: Currently (and for the future will be deprecated) all exchanges have the same provider
      exchanges[0].providerAddr,
      provider
    )

    const pools = await Promise.all(exchanges.map(async exchange => {
      // Fetch exchange config and breaker box address in parallel
      return {
        id: exchange.id,
        ...(await biPoolManager.getPoolExchange(exchange.id))
      }
    }))

    const poolForRateFeed: Record<string, typeof pools[0]> = pools.reduce((acc, pool) => {
      acc[pool.config.referenceRateFeedID] = pool
      return acc;
    }, {} as Record<string, typeof pools[0]>)

    exchangesSpinner.succeed(
      `Fetched ${exchanges.length} exchanges from protocol`
    )

    // Prefetch token symbols for better performance
    if (exchanges.length > 0) {
      await prefetchTokenSymbolsFromExchanges(exchanges, provider)
    }

    // Process exchanges in parallel
    const processSpinner = ora({
      text: `Processing ${rateFeedIds.length} rateFeeds in parallel...`,
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

    const getRateFeedDependencies = async (rateFeed: string) => {
      const deps: string[] = []
      for (let index = 0; ; index++) {
        try {
          const dep = await breakerBox.rateFeedDependencies(rateFeed, index)
          deps.push(dep)
        } catch (e) {
          // revert => no more items
          break
        }
      }
      return deps.map(d => RATEFEED_REVERSE_LOOKUP[d.toLocaleLowerCase()] ? RATEFEED_REVERSE_LOOKUP[d.toLocaleLowerCase()] : d)
    }

    const breakerAddressesOnChain = (await breakerBox.getBreakers()).map(b => b.toLowerCase())
    const breakerAddressesConfig = [
      await mento.getAddress("MedianDeltaBreaker"),
      await mento.getAddress("ValueDeltaBreaker")
    ].map(b => b.toLowerCase())

    if (breakerAddressesConfig.length != breakerAddressesOnChain.length ||
      breakerAddressesOnChain.find(bo => breakerAddressesConfig.find(bc => bo == bc) === undefined) ||
      breakerAddressesConfig.find(bc => breakerAddressesOnChain.find(bo => bc == bo) === undefined)
    ) {
      processSpinner.fail("Breakers don't match on-chain config")

      console.log("On-Chain: ", JSON.stringify(breakerAddressesOnChain))
      console.log("Config: ", JSON.stringify(breakerAddressesConfig))

      throw new Error(
        `Breakers on-chain do not match breakers in config`
      )
    }

    // Connect to both breakers
    const medianBreaker = MedianDeltaBreaker__factory.connect(
      await mento.getAddress("MedianDeltaBreaker"),
      provider
    )
    const valueBreaker = ValueDeltaBreaker__factory.connect(
      await mento.getAddress("ValueDeltaBreaker"),
      provider
    )


    // Process exchanges in batches to avoid overwhelming the RPC endpoint
    const results = await batchProcess(
      rateFeedIds,
      async (rateFeed): Promise<ProcessedExchangeResult | null> => {
        try {
          // Get trading mode and breaker addresses in parallel
          const tradingMode = await breakerBox.getRateFeedTradingMode(rateFeed)

          const status = tradingMode === 0 ? 'active' : tradingMode === 1 ? 'tripped' : 'disabled'

          // Fetch all breaker parameters and token symbols in parallel
          const [
            medianThreshold,
            medianSmoothingFactor,
            medianEMA,
            valueThreshold,
            valueReference,
            medianCooldown,
            valueCooldown,
            medianEnabled,
            valueEnabled
          ] = await Promise.all([
            medianBreaker.rateChangeThreshold(rateFeed),
            medianBreaker.getSmoothingFactor(rateFeed),
            medianBreaker.medianRatesEMA(rateFeed),
            valueBreaker.rateChangeThreshold(rateFeed),
            valueBreaker.referenceValues(rateFeed),
            medianBreaker.getCooldown(rateFeed),
            valueBreaker.getCooldown(rateFeed),
            breakerBox.isBreakerEnabled(medianBreaker.address, rateFeed),
            breakerBox.isBreakerEnabled(valueBreaker.address, rateFeed),
          ])

          if (!medianEnabled && !valueEnabled) return null

          let asset0Symbol = "n/a"
          let asset1Symbol = "n/a"

          const pool = poolForRateFeed[rateFeed];
          if (pool != undefined) {
            asset0Symbol = await getSymbolFromTokenAddress(pool.asset0, provider)
            asset1Symbol = await getSymbolFromTokenAddress(pool.asset1, provider)
          }

          const data: BreakerBoxData = {
            exchangeId: pool ? pool.id : "n/a",
            rateFeedId: rateFeed,
            rateFeed: RATEFEED_REVERSE_LOOKUP[rateFeed.toLocaleLowerCase()] || "n/a",
            asset0: asset0Symbol,
            asset1: asset1Symbol,
            dependencies: await getRateFeedDependencies(rateFeed),
            exchangePair: pool ? `${asset0Symbol}/${asset1Symbol}` : "n/a",
            status: status,
            tradingMode: tradingMode.toString(),
            medianThreshold: medianEnabled ? formatNumber(medianThreshold) : '-',
            medianSmoothingFactor: medianEnabled ? formatNumber(medianSmoothingFactor) : '-',
            medianEMA: medianEnabled ? formatEMA(medianEMA) : '-',
            medianCooldown: medianEnabled ? `${medianCooldown.toString()}s` : '-',
            valueThreshold: valueEnabled ? formatNumber(valueThreshold) : '-',
            valueReference: valueEnabled ? formatNumber(valueReference) : '-',
            valueCooldown: valueEnabled ? `${valueCooldown.toString()}s` : '-'
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

    const filteredResults = results.filter(r => r !== null && r.success === true)
    // XXX: The usafe of "!" should be solved by the above line but I think we are using an old version
    // of typescript that doesn't understand the implications of the filtering.
    const sortedResults = filteredResults.sort((a, b) => a!.data!.rateFeed.localeCompare(b!.data!.rateFeed))

    processSpinner.succeed('Exchange data processed')


    // Process results and collect successful data
    const tableData: BreakerBoxData[] = []
    let successCount = 0
    let errorCount = 0

    for (const result of sortedResults) {
      if (result?.success && result.data) {
        tableData.push(result.data)
        successCount++
      } else {
        errorCount++
        console.log(
          chalk.yellow(
            `Warning: Failed to process exchange - ${result?.error?.message}`
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
      rateFeedId: 42,
      rateFeed: 15,
      dependencies: 20,
      exchangePair: 16,
      status: 7,
      tradingMode: 12,
      medianThreshold: 12,
      medianSmoothingFactor: 10,
      medianEMA: 10,
      medianCooldown: 12,
      valueThreshold: 10,
      valueReference: 10,
      valueCooldown: 12,
    }
    const medianWidths = colWidths.medianSmoothingFactor + colWidths.medianThreshold + colWidths.medianEMA + colWidths.medianCooldown + 9
    const valueWidths = colWidths.valueThreshold + colWidths.valueReference + colWidths.valueCooldown + 6

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
      ''.padEnd(colWidths.rateFeedId) +
      ' | ' +
      ''.padEnd(colWidths.rateFeed) +
      ' | ' +
      ''.padEnd(colWidths.dependencies) +
      ' | ' +
      ''.padEnd(colWidths.exchangePair) +
      ' | ' +
      ''.padEnd(colWidths.status) +
      ' | ' +
      ''.padEnd(colWidths.tradingMode) +
      ' | ' +
      'Median Delta Breaker'.padEnd(medianWidths) +
      ' | ' +
      'Value Delta Breaker'.padEnd(valueWidths)
      // 'M. Thresh'.padEnd(colWidths.medianThreshold) +
      // ' | ' +
      // 'M. Smooth'.padEnd(colWidths.medianSmoothingFactor) +
      // ' | ' +
      // 'M. EMA'.padEnd(colWidths.medianEMA) +
      // ' | ' +
      // 'M. Cooldown'.padEnd(colWidths.medianCooldown) +
      // ' | ' +
      // 'V. Thresh'.padEnd(colWidths.valueThreshold) +
      // ' | ' +
      // 'V. Ref'.padEnd(colWidths.valueReference) +
      // ' | ' +
      // 'V. Cooldown'.padEnd(colWidths.valueCooldown)
    )
    console.log(
      'Rate Feed ID'.padEnd(colWidths.rateFeedId) +
      ' | ' +
      'Rate Feed'.padEnd(colWidths.rateFeed) +
      ' | ' +
      'Dependencies'.padEnd(colWidths.dependencies) +
      ' | ' +
      'Exchange Pair'.padEnd(colWidths.exchangePair) +
      ' | ' +
      'Status'.padEnd(colWidths.status) +
      ' | ' +
      'Trading Mode'.padEnd(colWidths.tradingMode) +
      ' | ' +
      '-'.repeat(medianWidths) +
      ' | ' +
      '-'.repeat(valueWidths)
    )
    console.log(
      ''.padEnd(colWidths.rateFeedId) +
      ' | ' +
      ''.padEnd(colWidths.rateFeed) +
      ' | ' +
      ''.padEnd(colWidths.dependencies) +
      ' | ' +
      ''.padEnd(colWidths.exchangePair) +
      ' | ' +
      ''.padEnd(colWidths.status) +
      ' | ' +
      ''.padEnd(colWidths.tradingMode) +
      ' | ' +
      'Threshold'.padEnd(colWidths.medianThreshold) +
      ' | ' +
      'Smoothing'.padEnd(colWidths.medianSmoothingFactor) +
      ' | ' +
      'EMA'.padEnd(colWidths.medianEMA) +
      ' | ' +
      'Cooldown'.padEnd(colWidths.medianCooldown) +
      ' | ' +
      'Threshold'.padEnd(colWidths.valueThreshold) +
      ' | ' +
      'Reference'.padEnd(colWidths.valueReference) +
      ' | ' +
      'Cooldown'.padEnd(colWidths.valueCooldown)
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
        data.rateFeedId.padEnd(colWidths.rateFeedId) +
        ' | ' +
        data.rateFeed.padEnd(colWidths.rateFeed) +
        ' | ' +
        data.dependencies.join(", ").padEnd(colWidths.dependencies) +
        ' | ' +
        data.exchangePair.padEnd(colWidths.exchangePair) +
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
        data.medianCooldown.padEnd(colWidths.medianCooldown) +
        ' | ' +
        data.valueThreshold.padEnd(colWidths.valueThreshold) +
        ' | ' +
        data.valueReference.padEnd(colWidths.valueReference) +
        ' | ' +
        data.valueCooldown.padEnd(colWidths.valueCooldown)
      )
    }

    console.log('='.repeat(totalWidth))
    console.log(`Total rate feeds: ${filteredData.length}`)

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
