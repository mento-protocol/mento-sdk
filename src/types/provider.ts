import type { TransactionResponse } from './transaction'

export interface ContractCallOptions {
  address: string
  abi: string[] | unknown[]
  functionName: string
  args?: unknown[]
}

/**
 * Contract write options extending read options with gas parameters
 *
 * Configuration for executing a write (state-changing) contract call.
 * Includes optional gas customization parameters.
 */
export interface ContractWriteOptions extends ContractCallOptions {
  /**
   * Optional gas limit override
   * If not provided, will be estimated automatically
   */
  gasLimit?: bigint

  /**
   * Legacy gas price (pre-EIP-1559)
   * Mutually exclusive with maxFeePerGas/maxPriorityFeePerGas
   */
  gasPrice?: bigint

  /**
   * EIP-1559 maximum fee per gas unit
   * Used on networks that support EIP-1559
   */
  maxFeePerGas?: bigint

  /**
   * EIP-1559 priority fee (miner tip)
   * Used on networks that support EIP-1559
   */
  maxPriorityFeePerGas?: bigint

  /**
   * Explicit transaction nonce
   * If not provided, will be determined automatically by provider
   */
  nonce?: bigint

  /**
   * Transaction value in wei
   * For payable functions only
   */
  value?: bigint
}

export interface ProviderAdapter {
  // ==================== READ OPERATIONS ====================

  /**
   * Call a read-only (view/pure) contract function
   *
   * @param options - Contract call configuration
   * @returns Decoded return value from contract function
   */
  readContract(options: ContractCallOptions): Promise<unknown>

  /**
   * Get the chain ID of the connected network
   *
   * @returns Chain ID (1 = Ethereum mainnet, 42220 = Celo, etc.)
   */
  getChainId(): Promise<number>

  // ==================== WRITE OPERATIONS ====================

  /**
   * Execute a state-changing contract function
   *
   * Submits a transaction to the blockchain that modifies contract state.
   * Requires a signer to be connected.
   *
   * @param options - Write operation configuration
   * @returns Transaction response with methods to track confirmation
   * @throws ValidationError if signer not connected or parameters invalid
   * @throws NetworkError if RPC call fails
   *
   * @example
   * ```typescript
   * // Approve token spending
   * const tx = await adapter.writeContract({
   *   address: '0x...',
   *   abi: ['function approve(address spender, uint256 amount)'],
   *   functionName: 'approve',
   *   args: [spenderAddress, amount]
   * });
   *
   * const receipt = await tx.wait();
   * ```
   */
  writeContract(options: ContractWriteOptions): Promise<TransactionResponse>

  /**
   * Estimate gas required for a contract call
   *
   * Returns the estimated gas units needed to execute a contract function.
   *
   * @param options - Contract call configuration
   * @returns Estimated gas units required
   * @throws ValidationError if call would revert or parameters invalid
   * @throws NetworkError if RPC call fails
   *
   * @example
   * ```typescript
   * const estimatedGas = await adapter.estimateGas({
   *   address: '0x...',
   *   abi: ['function approve(address spender, uint256 amount)'],
   *   functionName: 'approve',
   *   args: [spenderAddress, amount]
   * });
   * ```
   */
  estimateGas(options: ContractCallOptions): Promise<bigint>

  /**
   * Get the address of the connected signer/wallet
   *
   * @returns Checksummed Ethereum address of the signer
   * @throws ValidationError if no signer connected
   */
  getSignerAddress(): Promise<string>

  /**
   * Get the current transaction count (nonce) for the signer
   *
   * @returns Next available nonce for the signer
   * @throws ValidationError if no signer connected
   * @throws NetworkError if RPC call fails
   */
  getTransactionCount(): Promise<bigint>
}
