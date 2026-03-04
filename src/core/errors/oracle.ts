import { MentoError } from './base'

/**
 * Error thrown when the FX market is closed and oracle prices are unavailable.
 * The OracleAdapter reverts with FXMarketClosed() (sig 0xa407143a) during market closure.
 */
export class FXMarketClosedError extends MentoError {
  constructor() {
    super('FX market is currently closed. Swap quotes are unavailable until the market reopens.')
  }
}
