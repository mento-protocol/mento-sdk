/**
 * Types of liquidity pools supported in the Mento protocol
 */
export enum PoolType {
  /** FPMM (Fixed Product Market Maker) pools - v3 native pools */
  FPMM = 'FPMM',
  /** Virtual pools - wrapper around v2 BiPoolManager exchanges */
  Virtual = 'Virtual',
}

/**
 * Represents a liquidity pool between two tokens in the Mento protocol
 */
export interface Pool {
  /**
   * The address of the factory contract that was used to deploy this pool
   */
  factoryAddr: string

  /**
   * The deployed pool contract address (serves as unique identifier)
   */
  poolAddr: string

  /**
   * The address of the first token in the pool
   */
  token0: string

  /**
   * The address of the second token in the pool
   */
  token1: string

  /**
   * The type of pool (FPMM or Virtual)
   */
  poolType: `${PoolType}`

  /**
   * The exchange ID from BiPoolManager (Virtual pools only).
   */
  exchangeId?: string
}

/**
 * Pricing and oracle data for an FPMM pool
 */
export interface FPMMPricing {
  /** Raw oracle price numerator from contract */
  oraclePriceNum: bigint
  /** Raw oracle price denominator from contract */
  oraclePriceDen: bigint
  /** Oracle price as a decimal number (num / den) */
  oraclePrice: number

  /** Raw reserve/pool price numerator from contract */
  reservePriceNum: bigint
  /** Raw reserve/pool price denominator from contract */
  reservePriceDen: bigint
  /** Reserve/pool price as a decimal number (num / den) */
  reservePrice: number

  /** Price difference in basis points (raw from contract) */
  priceDifferenceBps: bigint
  /** Price difference as a percentage (bps / 100, e.g. 12 bps → 0.12%) */
  priceDifferencePercent: number

  /** Whether the reserve/pool price is above the oracle price */
  reservePriceAboveOraclePrice: boolean
}

/**
 * Fee configuration for an FPMM pool
 */
export interface FPMMFees {
  /** LP fee in basis points (raw) */
  lpFeeBps: bigint
  /** LP fee as a percentage (e.g. 0.25 = 0.25%) */
  lpFeePercent: number

  /** Protocol fee in basis points (raw) */
  protocolFeeBps: bigint
  /** Protocol fee as a percentage */
  protocolFeePercent: number

  /** Total fee (lpFee + protocolFee) as a percentage */
  totalFeePercent: number
}

/**
 * Rebalancing state and configuration for an FPMM pool
 */
export interface FPMMRebalancing {
  /** Rebalance incentive in basis points (raw) */
  rebalanceIncentiveBps: bigint
  /** Rebalance incentive as a percentage */
  rebalanceIncentivePercent: number

  /** Threshold above oracle price in basis points (raw) */
  rebalanceThresholdAboveBps: bigint
  /** Threshold above as a percentage */
  rebalanceThresholdAbovePercent: number

  /** Threshold below oracle price in basis points (raw) */
  rebalanceThresholdBelowBps: bigint
  /** Threshold below as a percentage */
  rebalanceThresholdBelowPercent: number

  /** Whether the current price is within rebalancing thresholds (null when pricing unavailable) */
  inBand: boolean | null

  /** The active liquidity strategy address for this pool, or null if none */
  liquidityStrategy: string | null
}

/**
 * Enriched details for an FPMM pool including pricing, fees, and rebalancing state
 */
export interface FPMMPoolDetails extends Pool {
  poolType: 'FPMM'
  /** Scaling factor for token0 (10^tokenDecimals) */
  decimals0: bigint
  /** Scaling factor for token1 (10^tokenDecimals) */
  decimals1: bigint
  /** Reserve of token0 (raw) */
  reserve0: bigint
  /** Reserve of token1 (raw) */
  reserve1: bigint
  /** Block timestamp of last reserve update */
  blockTimestampLast: bigint
  /** Pricing and oracle data (null when FX market is closed) */
  pricing: FPMMPricing | null
  /** Fee configuration */
  fees: FPMMFees
  /** Rebalancing state */
  rebalancing: FPMMRebalancing
}

/**
 * Enriched details for a Virtual pool including reserves and spread
 */
export interface VirtualPoolDetails extends Pool {
  poolType: 'Virtual'
  /** Scaling factor for token0 (10^tokenDecimals) */
  decimals0: bigint
  /** Scaling factor for token1 (10^tokenDecimals) */
  decimals1: bigint
  /** Reserve (bucket) of token0 (raw) */
  reserve0: bigint
  /** Reserve (bucket) of token1 (raw) */
  reserve1: bigint
  /** Block timestamp of last reserve update */
  blockTimestampLast: bigint
  /** Spread/fee in basis points (raw) */
  spreadBps: bigint
  /** Spread as a percentage (e.g. 0.5 = 0.5%) */
  spreadPercent: number
}

/**
 * Discriminated union of enriched pool details.
 * Use `poolType` to narrow the type.
 */
export type PoolDetails = FPMMPoolDetails | VirtualPoolDetails
