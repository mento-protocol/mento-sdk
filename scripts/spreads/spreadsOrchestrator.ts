import chalk from 'chalk'
import { ethers } from 'ethers'
import ora from 'ora'
import { BiPoolManager__factory } from '@mento-protocol/mento-core-ts'
import { ExchangeData, Mento } from './types'
import { CommandLineArgs } from './utils/parseCommandLineArgs'
import { getTokenSymbol } from './utils/prefetchTokenSymbols'

// FixidityLib uses 24 decimal places
const FIXIDITY_DECIMALS = 24

interface SpreadInfo {
  exchangeId: string
  asset0Symbol: string
  asset1Symbol: string
  spreadPercentage: string
}

export async function processSpreads(
  exchanges: ExchangeData[],
  mento: Mento,
  provider: ethers.providers.Provider,
  args: CommandLineArgs
): Promise<void> {
  const spinner = ora({
    text: 'Fetching spread information...',
    color: 'cyan',
  }).start()

  const spreadInfos: SpreadInfo[] = []

  // Process each exchange
  for (const exchange of exchanges) {
    // Get the BiPoolManager contract for this exchange
    const biPoolManager = BiPoolManager__factory.connect(
      exchange.providerAddr,
      provider
    )
    
    // Get token symbols
    const asset0Symbol = await getTokenSymbol(exchange.assets[0], provider)
    const asset1Symbol = await getTokenSymbol(exchange.assets[1], provider)

    // Apply token filter if specified
    if (
      args.token &&
      !asset0Symbol.toLowerCase().includes(args.token.toLowerCase()) &&
      !asset1Symbol.toLowerCase().includes(args.token.toLowerCase())
    ) {
      continue
    }

    try {
      // Get pool exchange info
      const poolExchange = await biPoolManager.getPoolExchange(exchange.id)
      
      // Convert spread from FixidityLib.Fraction to percentage
      // The spread is stored as a fraction with 24 decimal places
      const spreadValue = Number(poolExchange.config.spread)
      const spreadPercentage = ((spreadValue / Math.pow(10, FIXIDITY_DECIMALS)) * 100).toFixed(6).replace(/\.?0+$/, '')

      spreadInfos.push({
        exchangeId: exchange.id,
        asset0Symbol,
        asset1Symbol,
        spreadPercentage,
      })
    } catch (error) {
      // If we can't get the pool exchange info, skip this exchange
      continue
    }
  }

  spinner.succeed('Spread information fetched')

  // Create a table header
  console.log('\n' + chalk.bold('Exchange Spreads:'))
  console.log(
    chalk.gray(
      '----------------------------------------------------------------'
    )
  )
  console.log(
    chalk.bold(
      'Exchange ID'.padEnd(20) +
        ' | ' +
        'Asset 0'.padEnd(15) +
        ' | ' +
        'Asset 1'.padEnd(15) +
        ' | ' +
        'Spread (%)'
    )
  )
  console.log(
    chalk.gray(
      '----------------------------------------------------------------'
    )
  )

  // Display all spread information
  for (const info of spreadInfos) {
    console.log(
      info.exchangeId.slice(0, 20).padEnd(20) +
        ' | ' +
        info.asset0Symbol.padEnd(15) +
        ' | ' +
        info.asset1Symbol.padEnd(15) +
        ' | ' +
        chalk.green(info.spreadPercentage + '%')
    )
  }

  console.log(
    chalk.gray(
      '----------------------------------------------------------------'
    )
  )
} 