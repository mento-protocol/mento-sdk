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
