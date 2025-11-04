/**
 * API Contract: ProviderAdapter Interface with Write Transaction Support
 *
 * This file defines the complete TypeScript interface that all provider adapters
 * (Ethers v5, Ethers v6, Viem) must implement. It includes both existing read
 * operations and new write transaction capabilities.
 *
 * @version 2.0.0 (adds write transaction support)
 * @status Draft - for planning purposes
 */

import type {
  ContractCallOptions,
  ContractWriteOptions,
  TransactionResponse,
  TransactionReceipt,
} from '../types';

/**
 * Unified interface for blockchain provider operations
 *
 * Supports both read-only operations (no signer required) and
 * write operations (signer required).
 *
 * **Backward Compatibility**: Existing code using only `readContract()`
 * and `getChainId()` continues to work without providing a signer.
 *
 * **Provider Parity**: All three provider implementations (Ethers v5,
 * Ethers v6, Viem) MUST provide identical behavior for all methods.
 */
export interface ProviderAdapter {
  // ==================== READ OPERATIONS (Existing) ====================

  /**
   * Call a read-only (view/pure) contract function
   *
   * @param options - Contract call configuration
   * @returns Decoded return value from contract function
   * @throws {ValidationError} If address invalid or function not found in ABI
   * @throws {NetworkError} If RPC call fails
   *
   * @example
   * ```typescript
   * // Read token balance
   * const balance = await adapter.readContract({
   *   address: '0x...',
   *   abi: ['function balanceOf(address) view returns (uint256)'],
   *   functionName: 'balanceOf',
   *   args: [userAddress]
   * });
   * ```
   */
  readContract(options: ContractCallOptions): Promise<unknown>;

  /**
   * Get the chain ID of the connected network
   *
   * @returns Chain ID (1 = Ethereum mainnet, 42220 = Celo, etc.)
   * @throws {NetworkError} If RPC call fails
   *
   * @example
   * ```typescript
   * const chainId = await adapter.getChainId();
   * // Returns: 42220 (for Celo mainnet)
   * ```
   */
  getChainId(): Promise<number>;

  // ==================== WRITE OPERATIONS (New) ====================

  /**
   * Execute a state-changing contract function
   *
   * Submits a transaction to the blockchain that modifies contract state.
   * Requires a signer to be connected.
   *
   * @param options - Write operation configuration
   * @returns Transaction response with methods to track confirmation
   * @throws {ValidationError} If signer not connected, address invalid, or parameters invalid
   * @throws {NetworkError} If RPC call fails or transaction cannot be broadcast
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
   * console.log('Transaction hash:', tx.hash);
   *
   * // Wait for confirmation
   * const receipt = await tx.wait();
   * if (receipt.status === 'success') {
   *   console.log('Approval confirmed!');
   * }
   * ```
   *
   * @example
   * ```typescript
   * // With custom gas parameters
   * const tx = await adapter.writeContract({
   *   address: '0x...',
   *   abi: [...],
   *   functionName: 'approve',
   *   args: [spender, amount],
   *   gasLimit: 100000n,  // Optional: override estimated gas
   *   maxFeePerGas: 50000000000n,  // Optional: 50 gwei
   *   maxPriorityFeePerGas: 2000000000n  // Optional: 2 gwei tip
   * });
   * ```
   */
  writeContract(options: ContractWriteOptions): Promise<TransactionResponse>;

  /**
   * Estimate gas required for a contract call
   *
   * Returns the estimated gas units needed to execute a contract function.
   * Can be used with both read and write functions (though read functions
   * typically use negligible gas).
   *
   * **Important**: Estimation may fail if the transaction would revert.
   *
   * @param options - Contract call configuration (same as readContract)
   * @returns Estimated gas units required
   * @throws {ValidationError} If call would revert or parameters invalid
   * @throws {NetworkError} If RPC call fails
   *
   * @example
   * ```typescript
   * // Estimate gas for approval
   * const estimatedGas = await adapter.estimateGas({
   *   address: '0x...',
   *   abi: ['function approve(address spender, uint256 amount)'],
   *   functionName: 'approve',
   *   args: [spenderAddress, amount]
   * });
   *
   * console.log(`Estimated gas: ${estimatedGas}`);
   * // Use with buffer: gasLimit = estimatedGas * 120n / 100n (add 20%)
   * ```
   */
  estimateGas(options: ContractCallOptions): Promise<bigint>;

  /**
   * Get the address of the connected signer/wallet
   *
   * @returns Checksummed Ethereum address of the signer
   * @throws {ValidationError} If no signer connected
   *
   * @example
   * ```typescript
   * const signerAddress = await adapter.getSignerAddress();
   * console.log('Signer:', signerAddress);
   * // Returns: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
   * ```
   */
  getSignerAddress(): Promise<string>;

  /**
   * Get the current transaction count (nonce) for the signer
   *
   * Returns the next available nonce for submitting transactions.
   * Useful for advanced use cases like transaction replacement or
   * batching.
   *
   * @returns Next available nonce for the signer
   * @throws {ValidationError} If no signer connected
   * @throws {NetworkError} If RPC call fails
   *
   * @example
   * ```typescript
   * const nonce = await adapter.getTransactionCount();
   * console.log('Next nonce:', nonce);
   *
   * // Use explicit nonce for transaction
   * const tx = await adapter.writeContract({
   *   // ... other options
   *   nonce: nonce  // Explicitly set nonce
   * });
   * ```
   */
  getTransactionCount(): Promise<bigint>;
}

/**
 * Provider adapter initialization options
 *
 * Adapters can be initialized in read-only mode (Provider/PublicClient only)
 * or write-capable mode (with Signer/WalletClient).
 */
export interface ProviderAdapterOptions {
  /**
   * Blockchain provider for read operations
   *
   * - Ethers v5: `ethers.providers.Provider`
   * - Ethers v6: `ethers.Provider`
   * - Viem: `PublicClient` or `WalletClient`
   */
  provider: any;

  /**
   * Signer for write operations (optional)
   *
   * - Ethers v5: `ethers.Signer`
   * - Ethers v6: `ethers.Signer`
   * - Viem: Use `WalletClient` as provider instead
   *
   * **Note**: Viem does not separate provider and signer. Use `WalletClient`
   * for both read and write operations.
   */
  signer?: any;
}

/**
 * Contract call configuration (read operations)
 */
export interface ContractCallOptions {
  /**
   * Contract address (must be checksummed)
   */
  address: string;

  /**
   * Contract ABI
   *
   * Supports both human-readable (string array) and JSON formats:
   * - String: `['function balanceOf(address) view returns (uint256)']`
   * - JSON: `[{ type: 'function', name: 'balanceOf', ... }]`
   */
  abi: any[] | string[];

  /**
   * Function name to call
   */
  functionName: string;

  /**
   * Function arguments (in order)
   */
  args?: any[];
}

/**
 * Contract write configuration (extends read options)
 */
export interface ContractWriteOptions extends ContractCallOptions {
  /**
   * Optional gas limit override
   *
   * If not provided, gas will be estimated automatically.
   * Recommended to add 10-20% buffer to estimated gas.
   */
  gasLimit?: bigint;

  /**
   * Legacy gas price (pre-EIP-1559)
   *
   * **Mutually exclusive** with `maxFeePerGas` and `maxPriorityFeePerGas`.
   * Use this for networks that don't support EIP-1559.
   */
  gasPrice?: bigint;

  /**
   * EIP-1559 maximum fee per gas
   *
   * Total fee per gas unit you're willing to pay.
   * Use on networks that support EIP-1559 (Ethereum mainnet, Polygon, etc.)
   */
  maxFeePerGas?: bigint;

  /**
   * EIP-1559 priority fee (miner tip)
   *
   * Additional fee per gas to incentivize miners/validators.
   * Use with `maxFeePerGas` on EIP-1559 networks.
   */
  maxPriorityFeePerGas?: bigint;

  /**
   * Explicit transaction nonce
   *
   * If not provided, will be determined automatically.
   * Use for transaction replacement or batching.
   */
  nonce?: bigint;

  /**
   * Transaction value in wei
   *
   * Only for payable functions. Default: 0
   */
  value?: bigint;
}

/**
 * Transaction response (normalized across providers)
 */
export interface TransactionResponse {
  /**
   * Transaction hash (unique identifier)
   */
  readonly hash: string;

  /**
   * Chain ID where transaction was submitted
   */
  readonly chainId: bigint;

  /**
   * From address (signer address)
   */
  readonly from: string;

  /**
   * To address (contract address)
   */
  readonly to: string;

  /**
   * Transaction nonce
   */
  readonly nonce: bigint;

  /**
   * Gas limit for this transaction
   */
  readonly gasLimit: bigint;

  /**
   * Data payload (encoded function call)
   */
  readonly data: string;

  /**
   * Transaction value in wei
   */
  readonly value: bigint;

  /**
   * Wait for transaction to be confirmed
   *
   * @param confirmations - Number of blocks to wait (default: 1)
   * @returns Transaction receipt when confirmed
   * @throws {ExecutionError} If transaction reverts on-chain
   * @throws {NetworkError} If RPC fails
   */
  wait(confirmations?: number): Promise<TransactionReceipt>;

  /**
   * Get current transaction receipt if available
   *
   * @returns Receipt if transaction is mined, null if still pending
   * @throws {NetworkError} If RPC fails
   */
  getReceipt(): Promise<TransactionReceipt | null>;
}

/**
 * Transaction receipt (normalized across providers)
 */
export interface TransactionReceipt {
  /**
   * Transaction hash
   */
  readonly hash: string;

  /**
   * Block number where transaction was included
   */
  readonly blockNumber: bigint;

  /**
   * Block hash where transaction was included
   */
  readonly blockHash: string;

  /**
   * Transaction execution status
   */
  readonly status: 'success' | 'failed';

  /**
   * Actual gas used by transaction
   */
  readonly gasUsed: bigint;

  /**
   * Effective gas price paid
   */
  readonly effectiveGasPrice: bigint;

  /**
   * Cumulative gas used in block
   */
  readonly cumulativeGasUsed: bigint;

  /**
   * Transaction index in block
   */
  readonly transactionIndex: number;

  /**
   * From address (signer)
   */
  readonly from: string;

  /**
   * To address (contract)
   */
  readonly to: string;

  /**
   * Contract address if deployment
   */
  readonly contractAddress?: string;

  /**
   * Event logs emitted
   */
  readonly logs: readonly TransactionLog[];

  /**
   * Revert reason if status === 'failed'
   */
  readonly revertReason?: string;
}

/**
 * Transaction log (event)
 */
export interface TransactionLog {
  readonly address: string;
  readonly topics: readonly string[];
  readonly data: string;
  readonly logIndex: number;
  readonly blockNumber: bigint;
  readonly blockHash: string;
  readonly transactionHash: string;
  readonly transactionIndex: number;
  readonly removed: boolean;
}
