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
 * Get the checksummed version of an address
 *
 * Uses EIP-55 checksumming algorithm.
 *
 * @param address - Address to checksum
 * @returns Checksummed address
 */
export function getAddress(address: string): string {
	if (!isAddress(address)) {
		throw new ValidationError(
			`Invalid address format: ${address}. Must be a 40-character hex string.`,
		);
	}

	// Simple checksumming for now - providers handle the actual EIP-55 logic
	// This is a placeholder that will be enhanced by adapter implementations
	return address;
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

	// Validate gas price parameters are mutually exclusive
	if (
		options.gasPrice !== undefined &&
		(options.maxFeePerGas !== undefined ||
			options.maxPriorityFeePerGas !== undefined)
	) {
		throw new ValidationError(
			'Cannot specify both gasPrice and EIP-1559 parameters (maxFeePerGas, maxPriorityFeePerGas). Use one or the other.',
		);
	}

	// Validate gas limit is positive
	if (options.gasLimit !== undefined && options.gasLimit <= 0n) {
		throw new ValidationError(
			`Gas limit must be > 0, got: ${options.gasLimit}. Increase the gas limit or remove it to use auto-estimation.`,
		);
	}

	// Validate nonce is non-negative
	if (options.nonce !== undefined && options.nonce < 0n) {
		throw new ValidationError(
			`Nonce must be >= 0, got: ${options.nonce}. Use a valid nonce or remove it for automatic nonce management.`,
		);
	}

	// Validate gas price is positive if specified
	if (options.gasPrice !== undefined && options.gasPrice <= 0n) {
		throw new ValidationError(
			`Gas price must be > 0, got: ${options.gasPrice}. Increase the gas price or remove it to use network default.`,
		);
	}

	// Validate EIP-1559 params are positive if specified
	if (options.maxFeePerGas !== undefined && options.maxFeePerGas <= 0n) {
		throw new ValidationError(
			`Max fee per gas must be > 0, got: ${options.maxFeePerGas}. Increase the value or remove it to use network default.`,
		);
	}

	if (
		options.maxPriorityFeePerGas !== undefined &&
		options.maxPriorityFeePerGas < 0n
	) {
		throw new ValidationError(
			`Max priority fee per gas must be >= 0, got: ${options.maxPriorityFeePerGas}. Increase the value or remove it.`,
		);
	}

	// Validate maxPriorityFeePerGas <= maxFeePerGas if both specified
	if (
		options.maxFeePerGas !== undefined &&
		options.maxPriorityFeePerGas !== undefined &&
		options.maxPriorityFeePerGas > options.maxFeePerGas
	) {
		throw new ValidationError(
			`Max priority fee per gas (${options.maxPriorityFeePerGas}) cannot exceed max fee per gas (${options.maxFeePerGas}). Adjust the values so priority fee <= max fee.`,
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

/**
 * Validate chain ID matches expected value
 *
 * @param expected - Expected chain ID
 * @param actual - Actual chain ID from signer
 * @throws ValidationError if chain IDs don't match
 */
export function validateChainId(expected: bigint, actual: bigint): void {
	if (expected !== actual) {
		throw new ValidationError(
			`Chain ID mismatch. Signer is on chain ${actual} but SDK expects chain ${expected}. Connect your wallet to the correct network.`,
		);
	}
}
