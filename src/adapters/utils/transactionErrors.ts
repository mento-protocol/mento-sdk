/**
 * Error normalization utilities for provider adapters
 *
 * Converts provider-specific errors (Ethers v5, Ethers v6, Viem) into
 * normalized TransactionError types for consistent error handling.
 */

import {
	ValidationError,
	ExecutionError,
	NetworkError,
} from '../../types/errors';

/**
 * Normalize a provider error into a TransactionError
 *
 * Takes any error from a provider library and converts it into one of:
 * - ValidationError: Pre-submission validation failures
 * - ExecutionError: On-chain transaction reverts
 * - NetworkError: RPC/network issues
 *
 * @param error - Error from provider library
 * @param context - Optional context about the operation
 * @returns Normalized transaction error
 *
 * @example
 * ```typescript
 * try {
 *   await ethersContract.transfer(...);
 * } catch (error) {
 *   throw normalizeError(error, 'writeContract');
 * }
 * ```
 */
export function normalizeError(
	error: unknown,
	context?: string,
): ValidationError | ExecutionError | NetworkError {
	// Handle already-normalized errors
	if (
		error instanceof ValidationError ||
		error instanceof ExecutionError ||
		error instanceof NetworkError
	) {
		return error;
	}

	// Cast to any for provider-specific error inspection
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const err = error as any;

	// Extract common error properties
	const message = err?.message || String(error);
	const code = err?.code;
	const reason = err?.reason;
	const transactionHash = err?.transactionHash || err?.hash;

	// Detect error type based on error properties and patterns
	const errorType = detectErrorType(err, code, message);

	switch (errorType) {
		case 'validation':
			return createValidationError(message, reason, code, context);

		case 'execution':
			return createExecutionError(
				message,
				transactionHash,
				reason,
				code,
				context,
			);

		case 'network':
			return createNetworkError(message, code, reason, context);

		default:
			// Unknown error type - default to network error (retry-able)
			return new NetworkError(
				`Unknown error during ${context || 'transaction'}: ${message}`,
				true,
				reason || code,
			);
	}
}

/**
 * Detect error type from provider error
 */
type ErrorType = 'validation' | 'execution' | 'network';

function detectErrorType(
	err: any,
	code: string | undefined,
	message: string,
): ErrorType {
	// Execution errors (transaction reverted on-chain)
	if (
		code === 'CALL_EXCEPTION' ||
		code === 'TRANSACTION_REPLACED' ||
		err?.receipt?.status === 0 ||
		err?.receipt?.status === 'failed' ||
		message.includes('transaction failed') ||
		message.includes('reverted')
	) {
		return 'execution';
	}

	// Validation errors (pre-submission)
	if (
		code === 'INVALID_ARGUMENT' ||
		code === 'MISSING_ARGUMENT' ||
		code === 'UNEXPECTED_ARGUMENT' ||
		code === 'NUMERIC_FAULT' ||
		code === 'INSUFFICIENT_FUNDS' ||
		code === 'NONCE_EXPIRED' ||
		code === 'REPLACEMENT_UNDERPRICED' ||
		message.includes('invalid address') ||
		message.includes('invalid argument') ||
		message.includes('missing argument') ||
		message.includes('insufficient funds') ||
		message.includes('nonce too low') ||
		message.includes('replacement transaction underpriced')
	) {
		return 'validation';
	}

	// Network errors (RPC/connectivity issues)
	if (
		code === 'NETWORK_ERROR' ||
		code === 'TIMEOUT' ||
		code === 'SERVER_ERROR' ||
		code === 'UNKNOWN_ERROR' ||
		code === 'NOT_IMPLEMENTED' ||
		message.includes('network') ||
		message.includes('timeout') ||
		message.includes('connection') ||
		message.includes('502') ||
		message.includes('503') ||
		message.includes('504')
	) {
		return 'network';
	}

	// Default to network (most recoverable)
	return 'network';
}

/**
 * Create a normalized ValidationError
 */
function createValidationError(
	message: string,
	reason: string | undefined,
	code: string | undefined,
	context: string | undefined,
): ValidationError {
	// Extract actionable message
	let actionableMessage = message;

	// Add context if available
	if (context) {
		actionableMessage = `${context}: ${actionableMessage}`;
	}

	// Add helpful guidance for common errors
	if (message.includes('insufficient funds')) {
		actionableMessage += ' Ensure wallet has enough native tokens for gas fees.';
	} else if (message.includes('nonce too low')) {
		actionableMessage +=
			' Your transaction nonce is outdated. Try removing the nonce parameter for automatic management.';
	} else if (message.includes('replacement transaction underpriced')) {
		actionableMessage +=
			' Increase gas price to replace pending transaction.';
	} else if (message.includes('invalid address')) {
		actionableMessage += ' Use a checksummed Ethereum address (0x...).';
	}

	return new ValidationError(actionableMessage, reason || code);
}

/**
 * Create a normalized ExecutionError
 */
function createExecutionError(
	message: string,
	transactionHash: string | undefined,
	reason: string | undefined,
	code: string | undefined,
	context: string | undefined,
): ExecutionError {
	// Require transaction hash for execution errors
	const hash =
		transactionHash || '0x0000000000000000000000000000000000000000000000000000000000000000';

	let actionableMessage = message;
	if (context) {
		actionableMessage = `${context} failed: ${actionableMessage}`;
	}

	// Extract revert reason if available
	let revertReason = reason;

	// Try to extract revert reason from message
	const revertMatch = message.match(/reverted with reason string '(.+?)'/);
	if (revertMatch) {
		revertReason = revertMatch[1];
	}

	// Add gas consumption warning
	actionableMessage +=
		' Note: Gas fees were consumed by this failed transaction.';

	return new ExecutionError(actionableMessage, hash, revertReason || code);
}

/**
 * Create a normalized NetworkError
 */
function createNetworkError(
	message: string,
	code: string | undefined,
	reason: string | undefined,
	context: string | undefined,
): NetworkError {
	let actionableMessage = message;
	if (context) {
		actionableMessage = `${context}: ${actionableMessage}`;
	}

	// Determine if retry-able
	const retry = isRetryableNetworkError(code, message);

	// Add retry guidance
	if (retry) {
		actionableMessage += ' This error may be transient. Retry recommended.';
	} else {
		actionableMessage +=
			' This error is not retry-able. Check your RPC endpoint configuration.';
	}

	return new NetworkError(actionableMessage, retry, reason || code);
}

/**
 * Check if a network error is retry-able
 */
function isRetryableNetworkError(
	code: string | undefined,
	message: string,
): boolean {
	// Non-retry-able codes
	const nonRetryable = ['INVALID_ARGUMENT', 'UNSUPPORTED_OPERATION'];
	if (code && nonRetryable.includes(code)) {
		return false;
	}

	// Retry-able codes
	const retryableCodes = ['NETWORK_ERROR', 'TIMEOUT', 'SERVER_ERROR'];
	if (code && retryableCodes.includes(code)) {
		return true;
	}

	// Retry-able patterns in message
	const retryable = [
		'timeout',
		'ETIMEDOUT',
		'ECONNREFUSED',
		'ECONNRESET',
		'502',
		'503',
		'504',
		'rate limit',
		'too many requests',
		'network',
		'connection',
	];

	return retryable.some((pattern) =>
		message.toLowerCase().includes(pattern.toLowerCase()),
	);
}

/**
 * Extract revert reason from transaction receipt
 *
 * Attempts to decode revert reason from receipt logs or error data.
 *
 * @param receipt - Transaction receipt
 * @param errorData - Optional error data from provider
 * @returns Revert reason string if available
 */
export function extractRevertReason(
	receipt: { status?: number | string; logs?: any[] },
	errorData?: string,
): string | undefined {
	// Check receipt status
	if (receipt.status === 0 || receipt.status === 'failed') {
		if (errorData && typeof errorData === 'string') {
			// Return the full error data
			return errorData;
		}

		// No revert reason found
		return 'Transaction reverted without reason';
	}

	return undefined;
}

/**
 * Check if error indicates missing signer
 *
 * @param error - Error to check
 * @returns true if error indicates missing signer
 */
export function isMissingSignerError(error: unknown): boolean {
	if (error instanceof ValidationError) {
		return (
			error.message.includes('Signer required') ||
			error.message.includes('no signer')
		);
	}

	const message = error instanceof Error ? error.message : String(error);
	return (
		message.includes('signer') ||
		message.includes('wallet') ||
		message.includes('account')
	);
}

/**
 * Check if error indicates chain mismatch
 *
 * @param error - Error to check
 * @returns true if error indicates wrong chain
 */
export function isChainMismatchError(error: unknown): boolean {
	if (error instanceof ValidationError) {
		return error.message.includes('Chain ID mismatch');
	}

	const message = error instanceof Error ? error.message : String(error);
	return message.includes('chain') || message.includes('network');
}
