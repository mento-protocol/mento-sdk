import {
	parseAbi,
	type PublicClient,
	type WalletClient,
	type Hash,
	type TransactionReceipt as ViemTransactionReceipt,
} from 'viem';
import type {
	ContractCallOptions,
	ContractWriteOptions,
	ProviderAdapter,
} from '../../types';
import type { TransactionResponse } from '../../types/transaction';
import { ValidationError } from '../../types/errors';
import { validateSigner, validateWriteOptions } from '../../utils/validation';
import { normalizeError } from '../utils/transactionErrors';

/**
 * Viem adapter implementation
 *
 * Provides read and write operations using Viem public and wallet clients.
 */
export class ViemAdapter implements ProviderAdapter {
	constructor(
		private client: PublicClient,
		private walletClient?: WalletClient,
	) {}

	async readContract(options: ContractCallOptions): Promise<unknown> {
		// Check if the abi is a string array(human readable format) or an array of objects(the normal format)
		const abi =
			Array.isArray(options.abi) && typeof options.abi[0] === 'string'
				? parseAbi(options.abi as string[])
				: options.abi;

		return await this.client.readContract({
			address: options.address as `0x${string}`,
			abi: abi,
			functionName: options.functionName,
			args: options.args,
		});
	}

	async getChainId(): Promise<number> {
		return await this.client.getChainId();
	}

	/**
	 * Execute a write transaction on a contract
	 *
	 * @param options - Contract write options including address, ABI, function name, args, and gas parameters
	 * @returns TransactionResponse with transaction hash and wait() method
	 * @throws ValidationError if wallet client is missing or parameters are invalid
	 * @throws ExecutionError if transaction reverts on-chain
	 * @throws NetworkError if RPC request fails
	 *
	 * @example
	 * ```typescript
	 * const tx = await adapter.writeContract({
	 *   address: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
	 *   abi: ['function approve(address spender, uint256 amount)'],
	 *   functionName: 'approve',
	 *   args: ['0x1234...', 1000000n],
	 *   gasLimit: 100000n
	 * });
	 *
	 * const receipt = await tx.wait();
	 * console.log('Transaction confirmed:', receipt.hash);
	 * ```
	 */
	async writeContract(
		options: ContractWriteOptions,
	): Promise<TransactionResponse> {
		try {
			// Validate wallet client exists
			validateSigner(this.walletClient);

			// Validate write options
			validateWriteOptions(options);

			// Parse ABI if needed
			const abi =
				Array.isArray(options.abi) && typeof options.abi[0] === 'string'
					? parseAbi(options.abi as string[])
					: options.abi;

			// Build transaction parameters
			const txParams: any = {
				address: options.address as `0x${string}`,
				abi: abi,
				functionName: options.functionName,
				args: options.args || [],
			};

			if (options.gasLimit !== undefined) {
				txParams.gas = options.gasLimit;
			}

			if (options.gasPrice !== undefined) {
				txParams.gasPrice = options.gasPrice;
			}

			if (options.maxFeePerGas !== undefined) {
				txParams.maxFeePerGas = options.maxFeePerGas;
			}

			if (options.maxPriorityFeePerGas !== undefined) {
				txParams.maxPriorityFeePerGas = options.maxPriorityFeePerGas;
			}

			if (options.nonce !== undefined) {
				// Viem requires nonce as number, check safe conversion from bigint
				if (options.nonce > BigInt(Number.MAX_SAFE_INTEGER)) {
					throw new ValidationError(
						`Nonce ${options.nonce} exceeds MAX_SAFE_INTEGER and cannot be safely converted to number`,
					);
				}
				txParams.nonce = Number(options.nonce);
			}

			if (options.value !== undefined) {
				txParams.value = options.value;
			}

			// Execute transaction
			const hash = await this.walletClient!.writeContract(txParams);

			// Return normalized transaction response
			return await this.normalizeTransactionResponse(hash);
		} catch (error) {
			throw normalizeError(error, 'writeContract');
		}
	}

	/**
	 * Estimate gas for a contract call
	 *
	 * @param options - Contract call options
	 * @returns Estimated gas as BigInt
	 * @throws ValidationError if parameters are invalid
	 * @throws ExecutionError if estimation fails (transaction would revert)
	 *
	 * @example
	 * ```typescript
	 * const gasEstimate = await adapter.estimateGas({
	 *   address: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
	 *   abi: ['function approve(address spender, uint256 amount)'],
	 *   functionName: 'approve',
	 *   args: ['0x1234...', 1000000n]
	 * });
	 * console.log('Estimated gas:', gasEstimate); // e.g., 46000n
	 * ```
	 */
	async estimateGas(options: ContractCallOptions): Promise<bigint> {
		try {
			// Parse ABI if needed
			const abi =
				Array.isArray(options.abi) && typeof options.abi[0] === 'string'
					? parseAbi(options.abi as string[])
					: options.abi;

			// Estimate gas using public client
			const estimate = await this.client.estimateContractGas({
				address: options.address as `0x${string}`,
				abi: abi,
				functionName: options.functionName,
				args: options.args || [],
				account: this.walletClient?.account,
			});

			return estimate;
		} catch (error) {
			throw normalizeError(error, 'estimateGas');
		}
	}

	/**
	 * Get the signer's address
	 *
	 * @returns Signer address as checksummed string
	 * @throws ValidationError if no wallet client is configured
	 *
	 * @example
	 * ```typescript
	 * const address = await adapter.getSignerAddress();
	 * console.log('Signer:', address); // '0x1234...'
	 * ```
	 */
	async getSignerAddress(): Promise<string> {
		try {
			validateSigner(this.walletClient);
			if (!this.walletClient!.account) {
				throw new Error('No account found in wallet client');
			}
			return this.walletClient!.account.address;
		} catch (error) {
			throw normalizeError(error, 'getSignerAddress');
		}
	}

	/**
	 * Get the signer's transaction count (nonce)
	 *
	 * @returns Transaction count as BigInt
	 * @throws ValidationError if no wallet client is configured
	 *
	 * @example
	 * ```typescript
	 * const nonce = await adapter.getTransactionCount();
	 * console.log('Current nonce:', nonce); // e.g., 42n
	 * ```
	 */
	async getTransactionCount(): Promise<bigint> {
		try {
			validateSigner(this.walletClient);
			if (!this.walletClient!.account) {
				throw new Error('No account found in wallet client');
			}
			const count = await this.client.getTransactionCount({
				address: this.walletClient!.account.address,
			});
			return BigInt(count);
		} catch (error) {
			throw normalizeError(error, 'getTransactionCount');
		}
	}

	/**
	 * Normalize Viem transaction hash to our TransactionResponse interface
	 */
	private async normalizeTransactionResponse(
		hash: Hash,
	): Promise<TransactionResponse> {
		// Fetch transaction details to populate fields
		// Retry a few times in case transaction is not yet in mempool
		let tx;
		let attempts = 0;
		const maxAttempts = 10;

		while (attempts < maxAttempts) {
			try {
				tx = await this.client.getTransaction({ hash });
				break;
			} catch (error) {
				attempts++;
				if (attempts >= maxAttempts) {
					throw error;
				}
				// Wait 200ms before retrying (total max 2 seconds)
				await new Promise((resolve) => setTimeout(resolve, 200));
			}
		}

		if (!tx) {
			throw new Error(`Transaction ${hash} not found after ${maxAttempts} attempts`);
		}

		return {
			hash,
			chainId: BigInt(this.client.chain?.id || 0),
			from: tx.from,
			to: tx.to || '',
			nonce: BigInt(tx.nonce),
			gasLimit: tx.gas,
			data: tx.input,
			value: tx.value,
			wait: async (confirmations?: number) => {
				const receipt = await this.client.waitForTransactionReceipt({
					hash,
					confirmations: confirmations || 1,
				});
				return this.normalizeTransactionReceipt(receipt);
			},
			getReceipt: async () => {
				try {
					const receipt = await this.client.getTransactionReceipt({ hash });
					if (!receipt) return null;
					return this.normalizeTransactionReceipt(receipt);
				} catch (error) {
					// Transaction not mined yet
					return null;
				}
			},
		};
	}

	/**
	 * Normalize Viem TransactionReceipt to our TransactionReceipt interface
	 */
	private normalizeTransactionReceipt(receipt: ViemTransactionReceipt): any {
		return {
			hash: receipt.transactionHash,
			blockNumber: BigInt(receipt.blockNumber),
			blockHash: receipt.blockHash,
			status: receipt.status === 'success' ? 'success' : 'failed',
			gasUsed: receipt.gasUsed,
			effectiveGasPrice: receipt.effectiveGasPrice,
			cumulativeGasUsed: receipt.cumulativeGasUsed,
			transactionIndex: receipt.transactionIndex,
			from: receipt.from,
			to: receipt.to || '',
			contractAddress: receipt.contractAddress || undefined,
			logs: receipt.logs.map((log) => ({
				address: log.address,
				topics: log.topics,
				data: log.data,
				logIndex: log.logIndex,
				blockNumber: BigInt(log.blockNumber),
				blockHash: log.blockHash,
				transactionHash: log.transactionHash,
				transactionIndex: log.transactionIndex,
				removed: log.removed || false,
			})),
			revertReason:
				receipt.status === 'reverted' ? 'Transaction reverted' : undefined,
		};
	}
}
