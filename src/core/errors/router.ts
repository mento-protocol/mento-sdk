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
