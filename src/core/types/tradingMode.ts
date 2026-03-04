/**
 * Trading modes for rate feeds in the BreakerBox circuit breaker.
 *
 * The BreakerBox uses a bitmask approach where multiple breakers can
 * contribute to the final trading mode. In practice:
 * - 0 = Bidirectional (trading enabled)
 * - Any non-zero value = Trading suspended
 *
 * For SDK consumers, use isTradingEnabled() helper to check if trading
 * is allowed.
 */
export enum TradingMode {
  /** Bidirectional trading is enabled (normal operation) */
  BIDIRECTIONAL = 0,
  /** Trading is suspended (circuit breaker tripped) - any non-zero value */
  SUSPENDED = 1,
}

/**
 * Check if trading is enabled for a given trading mode.
 * @param mode - The trading mode value from BreakerBox
 * @returns true if trading is enabled (mode === 0)
 */
export function isTradingEnabled(mode: number): boolean {
  return mode === TradingMode.BIDIRECTIONAL
}
