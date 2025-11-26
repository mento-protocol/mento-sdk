/**
 * Trading modes for rate feeds in the BreakerBox
 */
export enum TradingMode {
  /**
   * Bidirectional trading is enabled
   */
  BIDIRECTIONAL = 0,
  /**
   * Trading is temporarily halted (circuit breaker tripped)
   */
  HALTED = 1,
  /**
   * Trading is permanently disabled
   */
  DISABLED = 2,
}

