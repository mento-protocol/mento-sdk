import { MentoError } from './base'

/**
 * Error thrown when no tradable route exists between two tokens.
 */
export class RouteNotFoundError extends MentoError {
  constructor(tokenIn: string, tokenOut: string) {
    super(
      `No route found for tokens ${tokenIn} and ${tokenOut}. They may not have a tradable path.`
    )
  }
}

/**
 * Error thrown when no executable zap-out route exists for the requested amount.
 */
export class ZapOutRouteNotViableError extends MentoError {
  constructor(poolAddress: string, tokenOut: string) {
    super(
      `No viable zap-out route for pool ${poolAddress} to ${tokenOut}. ` +
        'Try reducing the amount or removing liquidity in balanced mode.'
    )
  }
}
