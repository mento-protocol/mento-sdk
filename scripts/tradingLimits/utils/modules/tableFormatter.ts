import chalk from 'chalk'
import Table from 'cli-table3'
import { ScriptArgs } from '../../types'

/**
 * Create a table for displaying trading limits
 *
 * @param args - Script command line arguments
 * @returns A configured table instance
 */
export function createLimitsTable(args: ScriptArgs): Table.Table {
  // Create table configuration with clean and properly aligned headers
  const tableConfig: any = {
    head: [],
    style: {
      head: ['white'],
      border: ['gray'],
    },
    chars: {
      top: '─',
      'top-mid': '┬',
      'top-left': '┌',
      'top-right': '┐',
      bottom: '─',
      'bottom-mid': '┴',
      'bottom-left': '└',
      'bottom-right': '┘',
      left: '│',
      'left-mid': '├',
      mid: '─',
      'mid-mid': '┼',
      right: '│',
      'right-mid': '┤',
      middle: '│',
    },
  }

  // Define headers based on verbose mode
  if (args.verbose) {
    tableConfig.head = [
      'Exchange',
      'Asset',
      'Symbol',
      'Limit ID',
      'Type',
      'Timeframe',
      'Limit',
      'Netflow',
      'Utilization',
      'Max In',
      'Max Out',
      'Resets In',
      'Reset Time',
      'Status',
    ]
  } else {
    tableConfig.head = [
      'Exchange',
      'Symbol',
      'Type',
      'Timeframe',
      'Limit',
      'Netflow',
      'Utilization',
      'Max In',
      'Max Out',
      'Resets In',
      'Reset Time',
      'Status',
    ]
  }

  return new Table(tableConfig)
}

/**
 * Process assets that have no trading limits configured
 *
 * @param exchange - The exchange to process
 * @param asset - The token asset
 * @param exchangeName - Formatted exchange name
 * @param args - Script command line arguments
 * @param limitsTable - The table for displaying results
 * @param exchangeNameDisplayed - Whether the exchange name has been displayed already
 */
export function processAssetWithoutLimits(
  exchange: any,
  asset: { address: string; symbol: string },
  exchangeName: string,
  args: ScriptArgs,
  limitsTable: Table.Table,
  exchangeNameDisplayed: boolean
): void {
  // This asset has no limits configured
  const row: any[] = []

  if (args.verbose) {
    // In verbose mode, show Exchange ID and Asset
    row.push(
      !exchangeNameDisplayed ? chalk.cyan(exchange.id) : '',
      asset.address
    )
  } else {
    // In normal mode, show human-readable Exchange name
    row.push(!exchangeNameDisplayed ? chalk.cyan(exchangeName) : '')
  }

  // Symbol is always shown
  row.push(chalk.green(asset.symbol))

  // Add limit ID column in verbose mode
  if (args.verbose) {
    row.push('—')
  }

  row.push(
    '—',
    '—',
    '—',
    '—',
    '—',
    '—',
    '—',
    '—',
    '—',
    chalk.gray('No limits configured')
  )

  limitsTable.push(row)
}

/**
 * Handle exchanges that have no trading limits configured
 *
 * @param exchange - The exchange to process
 * @param tokenAssets - The token assets in the exchange
 * @param exchangeName - Formatted exchange name
 * @param args - Script command line arguments
 * @param limitsTable - The table for displaying results
 */
export function handleExchangeWithNoLimits(
  exchange: any,
  tokenAssets: Array<{ address: string; symbol: string }>,
  exchangeName: string,
  args: ScriptArgs,
  limitsTable: Table.Table
): void {
  // No limits for any assets in this exchange
  let exchangeNameDisplayed = false

  for (const asset of tokenAssets) {
    const row: any[] = []

    if (args.verbose) {
      // In verbose mode, show Exchange ID and Asset columns
      row.push(
        !exchangeNameDisplayed ? chalk.cyan(exchange.id) : '',
        asset.address
      )
    } else {
      // In normal mode, show human-readable Exchange name
      row.push(!exchangeNameDisplayed ? chalk.cyan(exchangeName) : '')
    }

    // Symbol is always shown
    row.push(chalk.green(asset.symbol))

    // Add limit ID column in verbose mode
    if (args.verbose) {
      row.push('—')
    }

    row.push(
      '—',
      '—',
      '—',
      '—',
      '—',
      '—',
      '—',
      '—',
      '—',
      chalk.gray('No limits configured')
    )

    limitsTable.push(row)
    exchangeNameDisplayed = true
  }
}

/**
 * Display summary statistics for trading limits
 *
 * @param stats - Statistics object to display
 */
export function displayStatsSummary(stats: any): void {
  console.log('\n===== System Summary =====')
  console.log(`Total Exchanges: ${stats.totalExchanges}`)
  console.log(`Exchanges with Limits: ${stats.exchangesWithLimits}`)
  console.log(`Active Exchanges: ${stats.activeExchanges}`)
  console.log(`Partially Blocked Exchanges: ${stats.partiallyBlockedExchanges}`)
  console.log(`Fully Blocked Exchanges: ${stats.fullyBlockedExchanges}`)
}
