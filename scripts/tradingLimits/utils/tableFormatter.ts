import chalk from 'chalk'
import Table from 'cli-table3'
import { ScriptArgs } from '../types'

/**
 * Create a table for displaying trading limits
 *
 * @param args - Script command line arguments
 * @returns A configured table instance
 */
export function createLimitsTable(args: ScriptArgs): Table.Table {
  // Create table configuration with clean and properly aligned headers
  const tableConfig: any = {
    head: [
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
    ],
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
 * @param exchange - The exchange to process
 * @param tokenAssets - The token assets in the exchange
 * @param exchangeName - Formatted exchange name
 * @param args - Script command line arguments
 * @param limitsTable - The table for displaying results
 * @param exchangeNameDisplayed - Whether the exchange name has been displayed already
 */
export function handleExchangeWithNoLimits(
  exchange: any,
  tokenAssets: Array<{ address: string; symbol: string }>,
  exchangeName: string,
  args: ScriptArgs,
  limitsTable: Table.Table,
  exchangeNameDisplayed: boolean = false
): void {
  // No limits for any assets in this exchange
  let isExchangeNameDisplayed = exchangeNameDisplayed

  for (const asset of tokenAssets) {
    const row: any[] = []

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

    limitsTable.push(row)
    isExchangeNameDisplayed = true
  }
}
