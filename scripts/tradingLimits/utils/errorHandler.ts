import chalk from 'chalk'
import { ExchangeData } from '../types'

/**
 * Handle errors when processing an exchange
 *
 * @param exchange - The exchange that caused the error
 * @param error - The error that occurred
 */
export function handleExchangeError(
  exchange: ExchangeData,
  error: unknown
): void {
  console.error(
    chalk.red(`Error processing exchange ${exchange.id || 'unknown'}`)
  )
  console.error(error instanceof Error ? error.message : String(error))
}

/**
 * Handle errors for missing configuration
 *
 * @param exchangeId - The exchange ID
 * @param asset - The asset address
 */
export function handleMissingConfigError(
  exchangeId: string,
  asset: string
): void {
  console.error(
    chalk.red(
      `Error: Missing configuration for asset ${asset} in exchange ${exchangeId}`
    )
  )
}

/**
 * Handle errors for limit ID calculation
 *
 * @param exchangeId - The exchange ID
 * @param asset - The asset address
 */
export function handleLimitIdError(exchangeId: string, asset: string): void {
  console.error(`Error calculating limit ID for ${exchangeId} and ${asset}`)
}
