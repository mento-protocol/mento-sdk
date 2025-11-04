/**
 * Transaction validation utilities
 *
 * Validation functions for write transaction parameters.
 * All validations throw ValidationError with actionable messages.
 */

import { ValidationError } from '../types/errors';
import type { ContractWriteOptions } from '../types/provider';

/**
 * Check if a string is a valid Ethereum address
 *
 * @param address - Address to validate
 * @returns true if valid address format
 */
export function isAddress(address: string): boolean {
	return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validate write transaction options
 *
 * @param options - Transaction options to validate
 * @throws ValidationError if any parameter is invalid
 *
 * @example
 * ```typescript
 * try {
 *   validateWriteOptions(options);
 * } catch (error) {
 *   if (error instanceof ValidationError) {
 *     console.error('Invalid parameters:', error.message);
 *   }
 * }
 * ```
 */
export function validateWriteOptions(options: ContractWriteOptions): void {
	// Validate address is properly formatted
	if (!isAddress(options.address)) {
		throw new ValidationError(
			`Invalid contract address: ${options.address}. Address must be a checksummed Ethereum address.`,
		);
	}

	// Validate gas price parameters are mutually exclusive (legacy vs EIP-1559)
	if (
		options.gasPrice !== undefined &&
		(options.maxFeePerGas !== undefined ||
			options.maxPriorityFeePerGas !== undefined)
	) {
		throw new ValidationError(
			'Cannot specify both gasPrice (legacy) and EIP-1559 parameters (maxFeePerGas, maxPriorityFeePerGas).',
		);
	}

	// Validate gas limit is positive (if specified)
	if (options.gasLimit !== undefined && options.gasLimit <= 0n) {
		throw new ValidationError(`Gas limit must be > 0, got: ${options.gasLimit}`);
	}

	// Validate nonce is non-negative (if specified)
	if (options.nonce !== undefined && options.nonce < 0n) {
		throw new ValidationError(`Nonce must be >= 0, got: ${options.nonce}`);
	}

	// Validate gas price is positive (if specified)
	if (options.gasPrice !== undefined && options.gasPrice <= 0n) {
		throw new ValidationError(`Gas price must be > 0, got: ${options.gasPrice}`);
	}

	// Validate EIP-1559 maxFeePerGas is positive (if specified)
	if (options.maxFeePerGas !== undefined && options.maxFeePerGas <= 0n) {
		throw new ValidationError(`Max fee per gas must be > 0, got: ${options.maxFeePerGas}`);
	}

	// Validate EIP-1559 maxPriorityFeePerGas is non-negative (if specified)
	if (
		options.maxPriorityFeePerGas !== undefined &&
		options.maxPriorityFeePerGas < 0n
	) {
		throw new ValidationError(
			`Max priority fee per gas must be >= 0, got: ${options.maxPriorityFeePerGas}`,
		);
	}

	// Validate EIP-1559 invariant: priority fee <= max fee
	if (
		options.maxFeePerGas !== undefined &&
		options.maxPriorityFeePerGas !== undefined &&
		options.maxPriorityFeePerGas > options.maxFeePerGas
	) {
		throw new ValidationError(
			`Max priority fee (${options.maxPriorityFeePerGas}) cannot exceed max fee (${options.maxFeePerGas})`,
		);
	}
}

/**
 * Validate that a signer is available
 *
 * @param signer - Signer to validate
 * @throws ValidationError if signer is null/undefined
 */
export function validateSigner(signer: unknown): void {
	if (!signer) {
		throw new ValidationError(
			'Signer required for write operations. Initialize SDK with a signer parameter (Ethers Signer or Viem WalletClient).',
		);
	}
}
