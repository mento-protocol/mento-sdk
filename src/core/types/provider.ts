// TODO: Review and rename this file to something more descriptive

export interface ContractCallOptions {
  address: string
  abi: string[] | unknown[]
  functionName: string
  args?: unknown[]
}

/**
 * Contract write options for building call parameters
 *
 * Configuration for building transaction call parameters for write operations.
 * These parameters can be used by consumers to execute transactions themselves.
 */
export interface ContractWriteOptions extends ContractCallOptions {
  /**
   * Optional gas limit override
   * If not provided, will be estimated automatically
   */
  gasLimit?: bigint

  /**
   * Transaction value in wei
   * For payable functions only
   */
  value?: bigint
}

/**
 * Call parameters for executing a contract transaction
 *
 * Contains all the data needed to execute a contract call.
 * Consumers can use these parameters with their own wallet/signer to execute transactions.
 */
export interface CallParams {
  /**
   * Contract address to call
   */
  to: string

  /**
   * Encoded function call data (hex string)
   */
  data: string

  /**
   * Transaction value in wei (hex string with 0x prefix)
   */
  value: string

  /**
   * Optional gas limit (hex string with 0x prefix)
   */
  gasLimit?: string
}
