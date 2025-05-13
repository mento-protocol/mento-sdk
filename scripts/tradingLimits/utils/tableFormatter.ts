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
      'Timeframe',
      'Limit',
      'Netflow',
      'Utilization',
      'Max In',
      'Max Out',
      'Resets In',
      'Reset Time',
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

  // Show human-readable Exchange name
  row.push(!exchangeNameDisplayed ? chalk.cyan(exchangeName) : '')

  // Symbol is always shown
  row.push(chalk.green(asset.symbol))

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

    // Show human-readable Exchange name
    row.push(!exchangeNameDisplayed ? chalk.cyan(exchangeName) : '')

    // Symbol is always shown
    row.push(chalk.green(asset.symbol))

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
