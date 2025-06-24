import chalk from 'chalk'
import { ExchangeData } from './types'

export function displayPoolConfig(exchangeData: ExchangeData[]) {
  if (exchangeData.length === 0) {
    console.log('No exchanges found matching the criteria.')
    return
  }

  // Define column widths
  const colWidths = {
    exchangeId: 66,
    asset0: 12,
    asset1: 12,
    spread: 12,
    refRateFeed: 42,
    resetFreq: 14,
    minReports: 12,
    resetSize: 10,
  }

  // Calculate total table width
  const numColumns = Object.keys(colWidths).length
  const totalWidth =
    Object.values(colWidths).reduce((a, b) => a + b, 0) +
    (numColumns - 1) * 3 +
    1 // 3 for ' | ', 1 for initial space

  // Create table header
  console.log('\nPool Configuration Details:')
  console.log('='.repeat(totalWidth))
  console.log(
    'Exchange ID'.padEnd(colWidths.exchangeId) +
      ' | ' +
      'Asset 0'.padEnd(colWidths.asset0) +
      ' | ' +
      'Asset 1'.padEnd(colWidths.asset1) +
      ' | ' +
      'Spread (%)'.padEnd(colWidths.spread) +
      ' | ' +
      'Ref Rate Feed'.padEnd(colWidths.refRateFeed) +
      ' | ' +
      'Reset Freq (h)'.padEnd(colWidths.resetFreq) +
      ' | ' +
      'Min Reports'.padEnd(colWidths.minReports) +
      ' | ' +
      'Reset Size'.padEnd(colWidths.resetSize)
  )
  console.log('-'.repeat(totalWidth))

  // Sort exchanges by spread
  const sortedExchanges = [...exchangeData].sort((a, b) => a.spread - b.spread)

  // Display each exchange
  for (const exchange of sortedExchanges) {
    // Pad the spread string before coloring
    const spreadRaw = exchange.spread.toFixed(4).padEnd(colWidths.spread)
    const spreadColor =
      exchange.spread > 1
        ? chalk.red
        : exchange.spread > 0.5
        ? chalk.yellow
        : chalk.green
    const spreadStr = spreadColor(spreadRaw)

    // Format reset size to be more readable (convert from e18 to actual number)
    const resetSize = exchange.stablePoolResetSize / 1e18

    console.log(
      exchange.exchangeId.padEnd(colWidths.exchangeId) +
        ' | ' +
        exchange.asset0.symbol.padEnd(colWidths.asset0) +
        ' | ' +
        exchange.asset1.symbol.padEnd(colWidths.asset1) +
        ' | ' +
        spreadStr +
        ' | ' +
        exchange.referenceRateFeedID.padEnd(colWidths.refRateFeed) +
        ' | ' +
        exchange.referenceRateResetFrequency
          .toFixed(1)
          .padEnd(colWidths.resetFreq) +
        ' | ' +
        exchange.minimumReports.toString().padEnd(colWidths.minReports) +
        ' | ' +
        resetSize.toLocaleString().padEnd(colWidths.resetSize)
    )
  }

  console.log('='.repeat(totalWidth))
  console.log(`Total exchanges: ${exchangeData.length}`)
}
