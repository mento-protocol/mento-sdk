import {
	Contract,
	Interface,
	Provider as EthersProvider,
	Signer,
	TransactionReceipt,
	TransactionResponse as EthersTransactionResponse,
} from 'ethers';
import {
	ContractCallOptions,
	ContractWriteOptions,
	ProviderAdapter,
} from '../../types';
import type { TransactionResponse } from '../../types/transaction';
import { validateSigner, validateWriteOptions } from '../../utils/validation';
import { normalizeError } from '../utils/transactionErrors';

/**
 * Ethers v6 adapter implementation
 *
 * Provides read and write operations using Ethers v6 provider and signer.
 */
export class EthersAdapter implements ProviderAdapter {
	constructor(
		private provider: EthersProvider,
		private signer?: Signer,
	) {}

	async readContract(options: ContractCallOptions): Promise<unknown> {
		const contract = new Contract(
			options.address,
			options.abi as string[] | Interface,
			this.provider,
		);
		return await contract[options.functionName](...(options.args || []));
	}

	async getChainId(): Promise<number> {
		const network = await this.provider.getNetwork();
		return Number(network.chainId);
	}

	/**
	 * Execute a write transaction on a contract
	 *
	 * @param options - Contract write options including address, ABI, function name, args, and gas parameters
	 * @returns TransactionResponse with transaction hash and wait() method
	 * @throws ValidationError if signer is missing or parameters are invalid
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
			// Validate signer exists
			validateSigner(this.signer);

			// Validate write options
			validateWriteOptions(options);

			// Create contract instance with signer
			const contract = new Contract(
				options.address,
				options.abi as string[] | Interface,
				this.signer!,
			);

			// Build transaction overrides
			const overrides: any = {};

			if (options.gasLimit !== undefined) {
				overrides.gasLimit = options.gasLimit;
			}

			if (options.gasPrice !== undefined) {
				overrides.gasPrice = options.gasPrice;
			}

			if (options.maxFeePerGas !== undefined) {
				overrides.maxFeePerGas = options.maxFeePerGas;
			}

			if (options.maxPriorityFeePerGas !== undefined) {
				overrides.maxPriorityFeePerGas = options.maxPriorityFeePerGas;
			}

			if (options.nonce !== undefined) {
				overrides.nonce = options.nonce;
			}

			if (options.value !== undefined) {
				overrides.value = options.value;
			}

			// Execute transaction
			const tx = await contract[options.functionName](
				...(options.args || []),
				overrides,
			);

			// Return normalized transaction response
			return this.normalizeTransactionResponse(tx);
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
			// Create contract instance (can use provider for estimation)
			const contract = new Contract(
				options.address,
				options.abi as string[] | Interface,
				this.signer || this.provider,
			);

			// Estimate gas
			const estimate = await contract[options.functionName].estimateGas(
				...(options.args || []),
			);

			// Convert to BigInt
			return BigInt(estimate.toString());
		} catch (error) {
			throw normalizeError(error, 'estimateGas');
		}
	}

	/**
	 * Get the signer's address
	 *
	 * @returns Signer address as checksummed string
	 * @throws ValidationError if no signer is configured
	 *
	 * @example
	 * ```typescript
	 * const address = await adapter.getSignerAddress();
	 * console.log('Signer:', address); // '0x1234...'
	 * ```
	 */
	async getSignerAddress(): Promise<string> {
		try {
			validateSigner(this.signer);
			return await this.signer!.getAddress();
		} catch (error) {
			throw normalizeError(error, 'getSignerAddress');
		}
	}

	/**
	 * Get the signer's transaction count (nonce)
	 *
	 * @returns Transaction count as BigInt
	 * @throws ValidationError if no signer is configured
	 *
	 * @example
	 * ```typescript
	 * const nonce = await adapter.getTransactionCount();
	 * console.log('Current nonce:', nonce); // e.g., 42n
	 * ```
	 */
	async getTransactionCount(): Promise<bigint> {
		try {
			validateSigner(this.signer);
			const address = await this.signer!.getAddress();
			const count = await this.provider.getTransactionCount(address);
			return BigInt(count);
		} catch (error) {
			throw normalizeError(error, 'getTransactionCount');
		}
	}

	/**
	 * Normalize Ethers v6 TransactionResponse to our TransactionResponse interface
	 */
	private normalizeTransactionResponse(
		tx: EthersTransactionResponse,
	): TransactionResponse {
		return {
			hash: tx.hash,
			chainId: BigInt(tx.chainId),
			from: tx.from,
			to: tx.to || '',
			nonce: BigInt(tx.nonce),
			gasLimit: BigInt(tx.gasLimit.toString()),
			data: tx.data,
			value: BigInt(tx.value.toString()),
			wait: async (confirmations?: number) => {
				const receipt = await tx.wait(confirmations);
				if (!receipt) {
					throw new Error('Transaction receipt is null');
				}
				return this.normalizeTransactionReceipt(receipt);
			},
			getReceipt: async () => {
				try {
					const receipt = await this.provider.getTransactionReceipt(tx.hash);
					if (!receipt) return null;
					return this.normalizeTransactionReceipt(receipt);
				} catch (error) {
					throw normalizeError(error, 'getReceipt');
				}
			},
		};
	}

	/**
	 * Normalize Ethers v6 TransactionReceipt to our TransactionReceipt interface
	 */
	private normalizeTransactionReceipt(receipt: TransactionReceipt): any {
		return {
			hash: receipt.hash,
			blockNumber: BigInt(receipt.blockNumber),
			blockHash: receipt.blockHash,
			status: receipt.status === 1 ? 'success' : 'failed',
			gasUsed: BigInt(receipt.gasUsed.toString()),
			effectiveGasPrice: BigInt(receipt.gasPrice?.toString() || '0'),
			cumulativeGasUsed: BigInt(receipt.cumulativeGasUsed.toString()),
			transactionIndex: receipt.index,
			from: receipt.from,
			to: receipt.to || '',
			contractAddress: receipt.contractAddress || undefined,
			logs: receipt.logs.map((log) => ({
				address: log.address,
				topics: log.topics,
				data: log.data,
				logIndex: log.index,
				blockNumber: BigInt(log.blockNumber),
				blockHash: log.blockHash,
				transactionHash: log.transactionHash,
				transactionIndex: log.transactionIndex,
				removed: log.removed || false,
			})),
			revertReason: receipt.status === 0 ? 'Transaction reverted' : undefined,
		};
	}
}
