/**
 * API Contract: Transaction Error Types
 *
 * Normalized error hierarchy for write transaction operations.
 * All provider-specific errors are mapped to these types for consistent
 * error handling across Ethers v5, Ethers v6, and Viem.
 *
 * @version 2.0.0 (adds transaction errors)
 * @status Draft - for planning purposes
 */

/**
 * Base class for all transaction-related errors
 *
 * All transaction errors extend this base class and include:
 * - `code`: Machine-readable error code
 * - `reason`: Optional additional context
 * - `message`: Human-readable error message
 */
export abstract class TransactionError extends Error {
  /**
   * Machine-readable error code
   *
   * Examples:
   * - `VALIDATION_ERROR`
   * - `EXECUTION_ERROR`
   * - `NETWORK_ERROR`
   */
  readonly code: string;

  /**
   * Optional additional context about the error
   *
   * May contain provider-specific details or technical information
   * for debugging.
   */
  readonly reason?: string;

  /**
   * @param message - Human-readable error message
   * @param code - Machine-readable error code
   * @param reason - Optional additional context
   */
  constructor(message: string, code: string, reason?: string) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.reason = reason;

    // Maintain proper stack trace for debugging
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Pre-submission validation errors (no gas cost)
 *
 * These errors occur before a transaction is submitted to the blockchain,
 * meaning no gas fees are consumed.
 *
 * **Common Causes**:
 * - Missing signer/wallet
 * - Invalid address format
 * - Chain ID mismatch
 * - Invalid function parameters
 * - Gas limit too low
 *
 * @example
 * ```typescript
 * try {
 *   await adapter.writeContract({...});
 * } catch (error) {
 *   if (error instanceof ValidationError) {
 *     console.log('Validation failed (no gas cost):', error.message);
 *     // Error message includes fix suggestion
 *   }
 * }
 * ```
 */
export class ValidationError extends TransactionError {
  /**
   * @param message - Human-readable error with suggested fix
   * @param reason - Optional technical details
   *
   * @example
   * ```typescript
   * throw new ValidationError(
   *   'Signer required for write operations. Initialize SDK with signer parameter.',
   *   'No signer provided during initialization'
   * );
   * ```
   */
  constructor(message: string, reason?: string) {
    super(message, 'VALIDATION_ERROR', reason);
  }
}

/**
 * On-chain execution errors (gas consumed)
 *
 * These errors occur after a transaction is submitted and included in a block,
 * but the transaction reverted during execution. **Gas fees are consumed.**
 *
 * **Common Causes**:
 * - Contract require() statement failed
 * - Insufficient token balance/allowance
 * - Slippage tolerance exceeded
 * - Contract-specific business logic failure
 * - Out of gas during execution
 *
 * @example
 * ```typescript
 * try {
 *   const tx = await adapter.writeContract({...});
 *   const receipt = await tx.wait();
 * } catch (error) {
 *   if (error instanceof ExecutionError) {
 *     console.log('Transaction reverted (gas consumed):', error.message);
 *     console.log('Transaction hash:', error.hash);
 *     console.log('Revert reason:', error.revertReason);
 *   }
 * }
 * ```
 */
export class ExecutionError extends TransactionError {
  /**
   * Transaction hash of the failed transaction
   *
   * Can be used to view transaction on block explorer
   */
  readonly hash: string;

  /**
   * Transaction receipt (if available)
   *
   * Contains full details of the failed transaction including
   * gas used, block number, and logs.
   */
  readonly receipt?: TransactionReceipt;

  /**
   * Revert reason from contract (if available)
   *
   * Extracted from error data or transaction logs.
   * May be a custom error message from the contract.
   */
  readonly revertReason?: string;

  /**
   * @param message - Human-readable error message
   * @param hash - Transaction hash of failed transaction
   * @param receipt - Optional transaction receipt
   * @param revertReason - Optional revert reason from contract
   *
   * @example
   * ```typescript
   * throw new ExecutionError(
   *   'Transaction reverted: Insufficient allowance',
   *   '0x123...',
   *   receipt,
   *   'ERC20: insufficient allowance'
   * );
   * ```
   */
  constructor(
    message: string,
    hash: string,
    receipt?: TransactionReceipt,
    revertReason?: string
  ) {
    super(message, 'EXECUTION_ERROR', revertReason);
    this.hash = hash;
    this.receipt = receipt;
    this.revertReason = revertReason;
  }
}

/**
 * Network/RPC errors (retry-able)
 *
 * These errors occur due to network issues or RPC provider problems.
 * Many are transient and can be resolved by retrying the operation.
 *
 * **Common Causes**:
 * - RPC timeout
 * - Connection refused
 * - Rate limiting
 * - Temporary node unavailability
 * - Network congestion
 *
 * @example
 * ```typescript
 * try {
 *   await adapter.writeContract({...});
 * } catch (error) {
 *   if (error instanceof NetworkError && error.retry) {
 *     console.log('Network error, retrying...');
 *     // Use existing retry mechanism
 *     await retryOperation(() => adapter.writeContract({...}));
 *   }
 * }
 * ```
 */
export class NetworkError extends TransactionError {
  /**
   * Whether this error is retry-able
   *
   * - `true`: Transient error, retry recommended
   * - `false`: Permanent error (e.g., invalid RPC endpoint)
   */
  readonly retry: boolean;

  /**
   * @param message - Human-readable error message
   * @param retry - Whether retry is recommended (default: true)
   * @param reason - Optional technical details
   *
   * @example
   * ```typescript
   * // Transient error (retry recommended)
   * throw new NetworkError(
   *   'RPC request timed out. Retry recommended.',
   *   true,
   *   'Connection timeout after 30s'
   * );
   *
   * // Permanent error (do not retry)
   * throw new NetworkError(
   *   'Invalid RPC endpoint URL.',
   *   false,
   *   'URL must start with http:// or https://'
   * );
   * ```
   */
  constructor(message: string, retry: boolean = true, reason?: string) {
    super(message, 'NETWORK_ERROR', reason);
    this.retry = retry;
  }
}

/**
 * Type guard to check if error is a transaction error
 */
export function isTransactionError(error: unknown): error is TransactionError {
  return error instanceof TransactionError;
}

/**
 * Type guard to check if error is a validation error
 */
export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

/**
 * Type guard to check if error is an execution error
 */
export function isExecutionError(error: unknown): error is ExecutionError {
  return error instanceof ExecutionError;
}

/**
 * Type guard to check if error is a network error
 */
export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError;
}

/**
 * Error code constants for programmatic error handling
 */
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  EXECUTION_ERROR: 'EXECUTION_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
} as const;

/**
 * Common validation error messages
 *
 * These provide consistent, actionable error messages across the SDK
 */
export const VALIDATION_ERRORS = {
  NO_SIGNER: 'Signer required for write operations. Initialize SDK with signer parameter.',
  INVALID_ADDRESS: (address: string) =>
    `Invalid contract address: ${address}. Address must be a checksummed Ethereum address.`,
  CHAIN_MISMATCH: (expected: bigint, actual: bigint) =>
    `Chain ID mismatch. Signer is on chain ${actual} but SDK expects chain ${expected}.`,
  INVALID_GAS_LIMIT: (gasLimit: bigint) =>
    `Gas limit must be > 0, got: ${gasLimit}.`,
  INVALID_NONCE: (nonce: bigint) =>
    `Nonce must be >= 0, got: ${nonce}.`,
  GAS_PRICE_CONFLICT:
    'Cannot specify both gasPrice and EIP-1559 parameters (maxFeePerGas, maxPriorityFeePerGas).',
  FUNCTION_NOT_FOUND: (functionName: string) =>
    `Function "${functionName}" not found in contract ABI.`,
} as const;

/**
 * Common network error messages
 */
export const NETWORK_ERRORS = {
  TIMEOUT: 'RPC request timed out. Retry recommended.',
  CONNECTION_REFUSED: 'RPC connection refused. Check provider endpoint.',
  RATE_LIMITED: 'RPC rate limit exceeded. Retry with backoff.',
  UNKNOWN: 'Unknown network error occurred.',
} as const;

// Re-export TransactionReceipt type for error contract
export interface TransactionReceipt {
  readonly hash: string;
  readonly blockNumber: bigint;
  readonly blockHash: string;
  readonly status: 'success' | 'failed';
  readonly gasUsed: bigint;
  readonly effectiveGasPrice: bigint;
  readonly cumulativeGasUsed: bigint;
  readonly transactionIndex: number;
  readonly from: string;
  readonly to: string;
  readonly contractAddress?: string;
  readonly logs: readonly any[];
  readonly revertReason?: string;
}
