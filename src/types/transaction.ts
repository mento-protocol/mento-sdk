/**
 * Transaction types for write operations
 *
 * Normalized transaction types for consistent handling across
 * Ethers v5, Ethers v6, and Viem provider adapters.
 */

/**
 * Transaction log (event) emitted during transaction execution
 *
 * Represents an event log emitted by a smart contract during
 * transaction execution.
 */
export interface TransactionLog {
  /**
   * Contract address that emitted the log
   */
  readonly address: string

  /**
   * Indexed event topics
   * topics[0] is the event signature hash
   */
  readonly topics: readonly string[]

  /**
   * Non-indexed event data (hex-encoded)
   */
  readonly data: string

  /**
   * Log index in transaction
   */
  readonly logIndex: number

  /**
   * Block number
   */
  readonly blockNumber: bigint

  /**
   * Block hash
   */
  readonly blockHash: string

  /**
   * Transaction hash
   */
  readonly transactionHash: string

  /**
   * Transaction index in block
   */
  readonly transactionIndex: number

  /**
   * Whether log was removed (chain reorganization)
   */
  readonly removed: boolean
}

/**
 * Transaction receipt (confirmed transaction outcome)
 *
 * Represents the on-chain outcome of a confirmed transaction.
 * Contains execution status, gas used, and event logs.
 */
export interface TransactionReceipt {
  /**
   * Transaction hash
   */
  readonly hash: string

  /**
   * Block number where transaction was included
   */
  readonly blockNumber: bigint

  /**
   * Block hash where transaction was included
   */
  readonly blockHash: string

  /**
   * Transaction execution status
   * - 'success': Transaction executed successfully
   * - 'failed': Transaction reverted
   */
  readonly status: 'success' | 'failed'

  /**
   * Actual gas used by transaction
   */
  readonly gasUsed: bigint

  /**
   * Effective gas price paid (baseFee + priorityFee)
   */
  readonly effectiveGasPrice: bigint

  /**
   * Cumulative gas used in block up to this transaction
   */
  readonly cumulativeGasUsed: bigint

  /**
   * Transaction index in block
   */
  readonly transactionIndex: number

  /**
   * From address (signer)
   */
  readonly from: string

  /**
   * To address (contract)
   */
  readonly to: string

  /**
   * Contract address if this was a deployment
   */
  readonly contractAddress?: string

  /**
   * Event logs emitted by transaction
   */
  readonly logs: readonly TransactionLog[]

  /**
   * Revert reason if status === 'failed'
   * Extracted from error data or logs
   */
  readonly revertReason?: string
}

/**
 * Transaction response (submitted transaction)
 *
 * Represents a submitted transaction with methods to track its status
 * and wait for confirmation.
 */
export interface TransactionResponse {
  /**
   * Transaction hash (unique identifier)
   */
  readonly hash: string

  /**
   * Chain ID where transaction was submitted
   */
  readonly chainId: bigint

  /**
   * From address (signer address)
   */
  readonly from: string

  /**
   * To address (contract address)
   */
  readonly to: string

  /**
   * Transaction nonce
   */
  readonly nonce: bigint

  /**
   * Gas limit for this transaction
   */
  readonly gasLimit: bigint

  /**
   * Data payload (encoded function call)
   */
  readonly data: string

  /**
   * Transaction value in wei
   */
  readonly value: bigint

  /**
   * Wait for transaction to be confirmed
   *
   * @param confirmations - Number of blocks to wait (default: 1)
   * @returns Transaction receipt when confirmed
   * @throws ExecutionError if transaction reverts
   * @throws NetworkError if RPC fails
   *
   * @example
   * ```typescript
   * const tx = await adapter.writeContract({...});
   * const receipt = await tx.wait(); // Wait for 1 confirmation
   * ```
   *
   * @example
   * ```typescript
   * const tx = await adapter.writeContract({...});
   * const receipt = await tx.wait(3); // Wait for 3 confirmations
   * ```
   */
  wait(confirmations?: number): Promise<TransactionReceipt>

  /**
   * Get current transaction receipt if available
   *
   * @returns Receipt if transaction is mined, null if still pending
   * @throws NetworkError if RPC fails
   *
   * @example
   * ```typescript
   * const tx = await adapter.writeContract({...});
   *
   * // Poll for receipt
   * while (true) {
   *   const receipt = await tx.getReceipt();
   *   if (receipt) {
   *     console.log('Transaction mined!', receipt.blockNumber);
   *     break;
   *   }
   *   await new Promise(resolve => setTimeout(resolve, 1000));
   * }
   * ```
   */
  getReceipt(): Promise<TransactionReceipt | null>
}
