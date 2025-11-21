/**
 * Transaction error types for write operations
 *
 * Normalized error hierarchy for consistent error handling across
 * Ethers v5, Ethers v6, and Viem provider adapters.
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
  readonly code: string

  /**
   * Optional additional context about the error
   *
   * May contain provider-specific details or technical information
   * for debugging.
   */
  readonly reason?: string

  /**
   * @param message - Human-readable error message
   * @param code - Machine-readable error code
   * @param reason - Optional additional context
   */
  constructor(message: string, code: string, reason?: string) {
    super(message)
    this.name = this.constructor.name
    this.code = code
    this.reason = reason

    // Maintain proper stack trace for debugging
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
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
 *   }
 * }
 * ```
 */
export class ValidationError extends TransactionError {
  /**
   * @param message - Human-readable error with suggested fix
   * @param reason - Optional technical details
   */
  constructor(message: string, reason?: string) {
    super(message, 'VALIDATION_ERROR', reason)
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
 *   }
 * }
 * ```
 */
export class ExecutionError extends TransactionError {
  /**
   * Transaction hash of the failed transaction
   */
  readonly hash: string

  /**
   * Revert reason from contract (if available)
   */
  readonly revertReason?: string

  /**
   * @param message - Human-readable error message
   * @param hash - Transaction hash of failed transaction
   * @param revertReason - Optional revert reason from contract
   */
  constructor(message: string, hash: string, revertReason?: string) {
    super(message, 'EXECUTION_ERROR', revertReason)
    this.hash = hash
    this.revertReason = revertReason
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
  readonly retry: boolean

  /**
   * @param message - Human-readable error message
   * @param retry - Whether retry is recommended (default: true)
   * @param reason - Optional technical details
   */
  constructor(message: string, retry: boolean = true, reason?: string) {
    super(message, 'NETWORK_ERROR', reason)
    this.retry = retry
  }
}

/**
 * Type guard to check if error is a transaction error
 */
export function isTransactionError(error: unknown): error is TransactionError {
  return error instanceof TransactionError
}

/**
 * Type guard to check if error is a validation error
 */
export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError
}

/**
 * Type guard to check if error is an execution error
 */
export function isExecutionError(error: unknown): error is ExecutionError {
  return error instanceof ExecutionError
}

/**
 * Type guard to check if error is a network error
 */
export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError
}
