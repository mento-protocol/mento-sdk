/**
 * Human-friendly representation of a trading limit.
 * Used by frontends to display limit status and calculate remaining capacity.
 */
export interface TradingLimit {
  /** Token address this limit applies to */
  asset: string
  /** Maximum amount that can flow IN (raw value - V1: 0 decimals, V2: 15 decimals) */
  maxIn: bigint
  /** Maximum amount that can flow OUT (raw value - V1: 0 decimals, V2: 15 decimals) */
  maxOut: bigint
  /** Unix timestamp when this limit window resets */
  until: number
  /** Token decimals for consumer scaling */
  decimals: number
}

/**
 * Trading limits configuration for V1 (Broker/Virtual pools).
 * Uses configurable timeframes and 0 decimal precision.
 */
export interface TradingLimitsConfigV1 {
  /** Time window in seconds for L0 limit */
  timestep0: number
  /** Time window in seconds for L1 limit */
  timestep1: number
  /** L0 limit value (0 decimal precision) */
  limit0: bigint
  /** L1 limit value (0 decimal precision) */
  limit1: bigint
  /** Global limit value (0 decimal precision) */
  limitGlobal: bigint
  /** Flags bitmap: bit 0=L0, bit 1=L1, bit 2=LG */
  flags: number
}

/**
 * Trading limits state for V1 (Broker/Virtual pools).
 */
export interface TradingLimitsStateV1 {
  /** Timestamp of last L0 window reset */
  lastUpdated0: number
  /** Timestamp of last L1 window reset */
  lastUpdated1: number
  /** Current netflow for L0 (0 decimal precision) */
  netflow0: bigint
  /** Current netflow for L1 (0 decimal precision) */
  netflow1: bigint
  /** Current global netflow (0 decimal precision) */
  netflowGlobal: bigint
}

/**
 * Trading limits configuration for V2 (FPMM pools).
 * Uses fixed timeframes (5 min for L0, 1 day for L1) and 15 decimal precision.
 */
export interface TradingLimitsConfigV2 {
  /** L0 limit value (15 decimal precision) */
  limit0: bigint
  /** L1 limit value (15 decimal precision) */
  limit1: bigint
  /** Token decimals */
  decimals: number
}

/**
 * Trading limits state for V2 (FPMM pools).
 */
export interface TradingLimitsStateV2 {
  /** Timestamp of last L0 window reset */
  lastUpdated0: number
  /** Timestamp of last L1 window reset */
  lastUpdated1: number
  /** Current netflow for L0 (15 decimal precision) */
  netflow0: bigint
  /** Current netflow for L1 (15 decimal precision) */
  netflow1: bigint
}

/**
 * Combined tradability status for a pool.
 * Separates circuit breaker and trading limits for distinct UI messaging.
 */
export interface PoolTradabilityStatus {
  /** Overall tradability (circuitBreakerOk AND limitsOk) */
  tradable: boolean

  /** Circuit breaker status - true if not tripped */
  circuitBreakerOk: boolean
  /** Raw trading mode value (0 = BIDIRECTIONAL, non-zero = suspended) */
  tradingMode: number

  /** Trading limits status - true if limits not exhausted */
  limitsOk: boolean
  /** Detailed limit info for UI display */
  limits: TradingLimit[]
}
