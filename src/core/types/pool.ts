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
  poolAddress: string

  /**
   * The address of the first token in the pool
   */
  token0: string

  /**
   * The address of the second token in the pool
   */
  token1: string
}
