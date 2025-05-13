import chalk from 'chalk'
import { ExchangeData } from '../types'

/**
 * Error type enum for trading limits
 */
export enum ErrorType {
  EXCHANGE_ERROR = 'exchange_error',
  MISSING_CONFIG = 'missing_config',
  LIMIT_ID_ERROR = 'limit_id_error',
}

/**
 * Generic error handler for trading limits script
 *
 * @param type - The type of error
 * @param context - The context object (exchange, asset, etc)
 * @param error - The error that occurred (optional)
 */
export function handleError(
  type: ErrorType,
  context: { exchangeId?: string; asset?: string; exchange?: ExchangeData },
  error?: unknown
): void {
  const exchangeId =
    context.exchangeId || (context.exchange ? context.exchange.id : 'unknown')

  switch (type) {
    case ErrorType.EXCHANGE_ERROR:
      console.error(chalk.red(`Error processing exchange ${exchangeId}`))
      if (error) {
        console.error(error instanceof Error ? error.message : String(error))
      }
      break

    case ErrorType.MISSING_CONFIG:
      console.error(
        chalk.red(
          `Error: Missing configuration for asset ${context.asset} in exchange ${exchangeId}`
        )
      )
      break

    case ErrorType.LIMIT_ID_ERROR:
      console.error(
        chalk.red(
          `Error calculating limit ID for ${exchangeId} and ${context.asset}`
        )
      )
      break

    default:
      console.error(chalk.red('An unknown error occurred'))
      if (error) {
        console.error(error instanceof Error ? error.message : String(error))
      }
  }
}
