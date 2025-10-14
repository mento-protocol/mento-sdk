import chalk from 'chalk'
import Table from 'cli-table3'

/**
 * Create a table for displaying trading limits
 *
 * @param verbose - Whether to include the limit ID column
 * @returns A configured table instance
 */
export function createLimitsTable(verbose = false): Table.Table {
  // Create table configuration with clean and properly aligned headers
  const headers = [
    'Exchange',
    'Symbol',
    'Type',
    'Limit',
    'Netflow',
    'Utilization',
    'Timeframe',
    'Resets In',
    'Reset Time',
    'Max In',
    'Max Out',
    'Status',
  ]

  // Add Limit ID column at the end if verbose mode is enabled
  if (verbose) {
    headers.push('Limit ID')
  }

  const tableConfig: Table.TableConstructorOptions = {
    head: headers,
    style: {
      head: ['white', 'bold'],
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

  return new Table(tableConfig)
}

/**
 * Handle exchanges that have no trading limits configured
 *
 * @param tokenAssets - The token assets in the exchange
 * @param exchangeName - Formatted exchange name
 * @param limitsTable - The table for displaying results
 * @param exchangeNameDisplayed - Whether the exchange name has been displayed already
 * @param verbose - Whether to include the limit ID column
 */
export function handleExchangeWithNoLimits(
  tokenAssets: Array<{ address: string; symbol: string }>,
  exchangeName: string,
  limitsTable: Table.Table,
  exchangeNameDisplayed = false,
  verbose = false
): void {
  // No limits for any assets in this exchange
  let isExchangeNameDisplayed = exchangeNameDisplayed

  for (const asset of tokenAssets) {
    const row: string[] = []

    // Show human-readable Exchange name only once per exchange
    row.push(!isExchangeNameDisplayed ? chalk.cyan(exchangeName) : '')

    // Show symbol once for each asset
    row.push(chalk.green(asset.symbol))

    row.push(
      chalk.gray('—'), // Type
      chalk.gray('—'), // Limit
      chalk.gray('—'), // Netflow
      chalk.gray('—'), // Utilization
      chalk.gray('—'), // Timeframe
      chalk.gray('—'), // Resets In
      chalk.gray('—'), // Reset Time
      chalk.gray('—'), // Max In
      chalk.gray('—'), // Max Out
      chalk.gray('NO LIMITS CONFIGURED') // Status - changed to match the text from createPlaceholderLimitRow
    )

    // Add limit ID column if verbose mode is enabled
    if (verbose) {
      row.push(chalk.gray('—'))
    }

    limitsTable.push(row)
    isExchangeNameDisplayed = true
  }
}
