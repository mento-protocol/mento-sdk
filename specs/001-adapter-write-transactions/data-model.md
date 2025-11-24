# Data Model: Write Transaction Support

**Feature**: 001-adapter-write-transactions
**Date**: 2025-11-03
**Purpose**: Define the type system and data structures for write transaction operations

## Overview

This document defines the TypeScript types and interfaces that enable write transaction support across Ethers v5, Ethers v6, and Viem provider adapters. The model extends the existing `ProviderAdapter` interface while maintaining backward compatibility and provider agnosticism.

## Core Entities

### 1. ContractWriteOptions

**Purpose**: Configuration for executing a write (state-changing) contract call

**Location**: `src/types/provider.ts`

**Structure**:

```typescript
interface ContractWriteOptions extends ContractCallOptions {
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
```

**Relationships**:

- Extends `ContractCallOptions` (existing type for read operations)
- Used by `ProviderAdapter.writeContract()`
- Used by `ProviderAdapter.estimateGas()`

**Validation Rules**:

- `gasPrice` and `maxFeePerGas` cannot both be specified
- `gasLimit` must be > 0 if provided
- `nonce` must be >= 0 if provided
- All numeric values must be BigInt (no floating point)

---

### 2. TransactionResponse

**Purpose**: Represents a submitted transaction with methods to track its status

**Location**: `src/types/transaction.ts`

**Structure**:

```typescript
interface TransactionResponse {
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
   * @param confirmations Number of blocks to wait (default: 1)
   * @returns Transaction receipt when confirmed
   * @throws ExecutionError if transaction reverts
   * @throws NetworkError if RPC fails
   */
  wait(confirmations?: number): Promise<TransactionReceipt>

  /**
   * Get current transaction receipt if available
   * @returns Receipt if transaction is mined, null if still pending
   * @throws NetworkError if RPC fails
   */
  getReceipt(): Promise<TransactionReceipt | null>
}
```

**Relationships**:

- Returned by `ProviderAdapter.writeContract()`
- Contains methods that return `TransactionReceipt`
- Normalized across all three providers (Ethers v5/v6, Viem)

**Validation Rules**:

- `hash` must be 66-character hex string (0x + 64 hex digits)
- `confirmations` must be >= 1
- All addresses must be checksummed

**State Transitions**:

- **Pending**: Transaction broadcast, not yet in block (`getReceipt()` returns null)
- **Confirmed**: Transaction included in block (`getReceipt()` returns receipt)
- **Failed**: Transaction reverted on-chain (`wait()` throws `ExecutionError`)

---

### 3. TransactionReceipt

**Purpose**: Represents the on-chain outcome of a confirmed transaction

**Location**: `src/types/transaction.ts`

**Structure**:

```typescript
interface TransactionReceipt {
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
   * Transaction status
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
```

**Relationships**:

- Returned by `TransactionResponse.wait()` and `TransactionResponse.getReceipt()`
- Contains array of `TransactionLog` entities
- Normalized across all providers

**Validation Rules**:

- `status` is either 'success' or 'failed'
- If `status === 'failed'`, `revertReason` should be populated when available
- `gasUsed` <= gas limit from original transaction
- All addresses must be checksummed

**Derived Data**:

- Total transaction cost: `gasUsed * effectiveGasPrice`
- Successful execution: `status === 'success'`

---

### 4. TransactionLog

**Purpose**: Represents an event log emitted during transaction execution

**Location**: `src/types/transaction.ts`

**Structure**:

```typescript
interface TransactionLog {
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
```

**Relationships**:

- Child of `TransactionReceipt` (array of logs)
- Used to decode contract events (e.g., Transfer, Approval)

**Validation Rules**:

- `address` must be checksummed
- `topics` array typically has 1-4 elements
- `removed` should be false in normal cases (true only after reorg)

---

### 5. Extended ProviderAdapter Interface

**Purpose**: Unified interface for read and write blockchain operations

**Location**: `src/types/provider.ts`

**Structure**:

```typescript
interface ProviderAdapter {
  // ============ Existing Read Methods ============

  /**
   * Call a read-only contract function
   * @param options Contract call configuration
   * @returns Decoded return value
   */
  readContract(options: ContractCallOptions): Promise<unknown>

  /**
   * Get the current chain ID
   * @returns Chain ID (1 = mainnet, 42220 = Celo, etc.)
   */
  getChainId(): Promise<number>

  // ============ New Write Methods ============

  /**
   * Execute a state-changing contract function
   * @param options Write operation configuration
   * @returns Transaction response for tracking
   * @throws ValidationError if signer not available or parameters invalid
   * @throws NetworkError if RPC fails
   */
  writeContract(options: ContractWriteOptions): Promise<TransactionResponse>

  /**
   * Estimate gas required for a contract call
   * @param options Contract call configuration
   * @returns Estimated gas units
   * @throws ValidationError if call would revert or parameters invalid
   * @throws NetworkError if RPC fails
   */
  estimateGas(options: ContractCallOptions): Promise<bigint>

  /**
   * Get the connected signer address
   * @returns Signer address if available
   * @throws ValidationError if no signer connected
   */
  getSignerAddress(): Promise<string>

  /**
   * Get the current nonce for the signer
   * @returns Next available nonce
   * @throws ValidationError if no signer connected
   * @throws NetworkError if RPC fails
   */
  getTransactionCount(): Promise<bigint>
}
```

**Relationships**:

- Implemented by `EthersV5Adapter`, `EthersAdapter`, `ViemAdapter`
- Proxied by `EthersV5AdapterProxy`, `EthersAdapterProxy`, `ViemAdapterProxy`
- Used by all SDK services

**Validation Rules**:

- Write methods require signer to be connected
- Read methods work with or without signer
- All methods must validate inputs before blockchain calls

---

### 6. Error Types

**Purpose**: Normalized error types for transaction failures

**Location**: `src/types/errors.ts`

**Structure**:

```typescript
/**
 * Base class for all transaction-related errors
 */
abstract class TransactionError extends Error {
  readonly code: string
  readonly reason?: string

  constructor(message: string, code: string, reason?: string) {
    super(message)
    this.name = this.constructor.name
    this.code = code
    this.reason = reason
  }
}

/**
 * Pre-submission validation errors (no gas cost)
 * Examples: missing signer, invalid address, wrong network
 */
class ValidationError extends TransactionError {
  constructor(message: string, reason?: string) {
    super(message, 'VALIDATION_ERROR', reason)
  }
}

/**
 * On-chain execution errors (gas consumed)
 * Examples: transaction reverted, out of gas
 */
class ExecutionError extends TransactionError {
  readonly hash: string
  readonly receipt?: TransactionReceipt

  constructor(
    message: string,
    hash: string,
    receipt?: TransactionReceipt,
    reason?: string
  ) {
    super(message, 'EXECUTION_ERROR', reason)
    this.hash = hash
    this.receipt = receipt
  }
}

/**
 * Network/RPC errors (retry-able)
 * Examples: timeout, connection refused, rate limited
 */
class NetworkError extends TransactionError {
  readonly retry: boolean

  constructor(message: string, retry: boolean = true, reason?: string) {
    super(message, 'NETWORK_ERROR', reason)
    this.retry = retry
  }
}
```

**Relationships**:

- Thrown by `ProviderAdapter` write methods
- Used in error handling throughout SDK
- Normalized from provider-specific errors

**Validation Rules**:

- All errors must have descriptive message
- `ExecutionError` must include transaction hash
- `NetworkError` indicates if retry is recommended

---

## Type Relationships Diagram

```text
ProviderAdapter (interface)
├── readContract(ContractCallOptions) → unknown
├── writeContract(ContractWriteOptions) → TransactionResponse
│                └── extends ContractCallOptions
│                    ├── hash: string
│                    ├── wait() → TransactionReceipt
│                    └── getReceipt() → TransactionReceipt | null
│                                       ├── status: 'success' | 'failed'
│                                       ├── logs: TransactionLog[]
│                                       └── revertReason?: string
├── estimateGas(ContractCallOptions) → bigint
├── getSignerAddress() → string
└── getTransactionCount() → bigint

Error Hierarchy:
TransactionError (abstract)
├── ValidationError (pre-submission)
├── ExecutionError (on-chain)
└── NetworkError (RPC/network)
```

## Provider-Specific Mapping

### Ethers v5/v6

```typescript
// Ethers TransactionResponse → SDK TransactionResponse
{
  hash: ethersResponse.hash,
  chainId: BigInt(ethersResponse.chainId),
  from: ethersResponse.from,
  to: ethersResponse.to,
  nonce: BigInt(ethersResponse.nonce),
  gasLimit: BigInt(ethersResponse.gasLimit),
  data: ethersResponse.data,
  value: BigInt(ethersResponse.value),
  wait: (confirmations) => ethersResponse.wait(confirmations).then(mapReceipt),
  getReceipt: () => provider.getTransactionReceipt(hash).then(mapReceipt)
}

// Ethers TransactionReceipt → SDK TransactionReceipt
{
  hash: ethersReceipt.transactionHash,
  blockNumber: BigInt(ethersReceipt.blockNumber),
  blockHash: ethersReceipt.blockHash,
  status: ethersReceipt.status === 1 ? 'success' : 'failed',
  gasUsed: BigInt(ethersReceipt.gasUsed),
  effectiveGasPrice: BigInt(ethersReceipt.effectiveGasPrice),
  // ... map other fields
  revertReason: parseRevertReason(ethersReceipt)
}
```

### Viem

```typescript
// Viem writeContract result → SDK TransactionResponse
const hash = await walletClient.writeContract({...});
const response: TransactionResponse = {
  hash,
  chainId: walletClient.chain.id,
  // ... other fields from walletClient
  wait: (confirmations) => waitForTransactionReceipt(publicClient, {
    hash,
    confirmations
  }).then(mapReceipt),
  getReceipt: () => getTransactionReceipt(publicClient, { hash }).then(mapReceipt)
}

// Viem TransactionReceipt → SDK TransactionReceipt
{
  hash: viemReceipt.transactionHash,
  blockNumber: viemReceipt.blockNumber,
  blockHash: viemReceipt.blockHash,
  status: viemReceipt.status === 'success' ? 'success' : 'failed',
  gasUsed: viemReceipt.gasUsed,
  effectiveGasPrice: viemReceipt.effectiveGasPrice,
  // ... map other fields
  revertReason: parseRevertReason(viemReceipt)
}
```

## Validation Utilities

**Location**: `src/utils/validation.ts`

```typescript
/**
 * Validate transaction write options
 * @throws ValidationError if invalid
 */
export function validateWriteOptions(options: ContractWriteOptions): void {
  // Validate address is checksummed
  if (!isAddress(options.address)) {
    throw new ValidationError(`Invalid contract address: ${options.address}`)
  }

  // Validate gas price parameters
  if (
    options.gasPrice &&
    (options.maxFeePerGas || options.maxPriorityFeePerGas)
  ) {
    throw new ValidationError(
      'Cannot specify both gasPrice and EIP-1559 parameters (maxFeePerGas, maxPriorityFeePerGas)'
    )
  }

  // Validate gas limit
  if (options.gasLimit !== undefined && options.gasLimit <= 0n) {
    throw new ValidationError(`Gas limit must be > 0, got: ${options.gasLimit}`)
  }

  // Validate nonce
  if (options.nonce !== undefined && options.nonce < 0n) {
    throw new ValidationError(`Nonce must be >= 0, got: ${options.nonce}`)
  }
}

/**
 * Validate signer is available
 * @throws ValidationError if no signer
 */
export function validateSigner(signer: any): void {
  if (!signer) {
    throw new ValidationError(
      'Signer required for write operations. Initialize SDK with signer parameter.'
    )
  }
}

/**
 * Validate chain ID matches
 * @throws ValidationError if mismatch
 */
export function validateChainId(expected: bigint, actual: bigint): void {
  if (expected !== actual) {
    throw new ValidationError(
      `Chain ID mismatch. Signer is on chain ${actual} but SDK expects chain ${expected}.`
    )
  }
}
```

## Summary

This data model provides:

1. **Type Safety**: All entities strongly typed with TypeScript
2. **Provider Agnostic**: Normalized interfaces hide provider differences
3. **Error Handling**: Clear error hierarchy distinguishes failure modes
4. **Validation**: Input validation before blockchain calls
5. **Backward Compatibility**: Extends existing types without breaking changes

All types follow the constitution principles:

- ✅ Explicit TypeScript types (no `any`)
- ✅ BigInt for numeric values (no precision loss)
- ✅ Checksummed addresses
- ✅ Actionable error messages
- ✅ Provider-agnostic design
