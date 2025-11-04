# Research: Adapter Write Transaction Support

**Feature**: 001-adapter-write-transactions
**Date**: 2025-11-03
**Purpose**: Technical research and decisions for implementing write transaction support across Ethers v5, Ethers v6, and Viem provider adapters

## Overview

This research document consolidates technical decisions, provider-specific patterns, and best practices for extending the Mento SDK's `ProviderAdapter` interface to support write transactions. The goal is to enable token approvals, transaction status tracking, and gas estimation while maintaining provider agnosticism and backward compatibility.

## Key Research Areas

### 1. Signer/Wallet Integration Patterns

**Decision**: Support both read-only (Provider/PublicClient) and write-capable (Provider+Signer, WalletClient) initialization modes

**Rationale**:
- Ethers v5/v6 separate concerns: Provider (read) + Signer (write)
- Viem unified approach: PublicClient (read) vs WalletClient (read+write)
- Must maintain backward compatibility for existing read-only usage
- Users should be able to initialize SDK once and use for both reads and writes

**Implementation Approach**:

**Ethers v5/v6**:

```typescript
// Current (read-only)
const sdk = Mento.create({ provider: ethersProvider });

// New (write-capable)
const sdk = Mento.create({
  provider: ethersProvider,
  signer: ethersSigner  // Optional
});
```

**Viem**:

```typescript
// Current (read-only)
const sdk = Mento.create({ provider: publicClient });

// New (write-capable)
const sdk = Mento.create({
  provider: walletClient  // Can do both read + write
});
```

**Key Considerations**:
- Adapters must detect if signer/wallet is available before attempting writes
- Clear error messages when write operations called without signer
- Signer must be on same network as provider (chain ID validation)

**Alternatives Considered**:
- **Require signer upfront**: Rejected - breaks backward compatibility, forces all users to provide wallet even for read-only usage
- **Separate adapter instances**: Rejected - creates confusing API where users need two SDK instances
- **Dynamic signer injection**: Rejected - adds complexity, makes initialization unpredictable

---

### 2. Transaction Response Pattern

**Decision**: Return lightweight transaction response object that allows waiting for confirmation asynchronously

**Rationale**:
- Transaction submission and confirmation are separate concerns
- Users need control over when/how they wait for confirmations
- Must support both "fire and forget" and "wait for receipt" patterns
- Different providers have different response objects that need normalization

**Implementation Approach**:

```typescript
interface TransactionResponse {
  hash: string;                    // Transaction hash
  wait(confirmations?: number): Promise<TransactionReceipt>;  // Wait for inclusion
  getReceipt(): Promise<TransactionReceipt | null>;          // Check current status
}

interface TransactionReceipt {
  hash: string;
  blockNumber: bigint;
  blockHash: string;
  status: 'success' | 'failed';
  gasUsed: bigint;
  effectiveGasPrice: bigint;
  logs: Array<{ address: string; topics: string[]; data: string }>;
  revertReason?: string;           // If status === 'failed'
}
```

**Provider-Specific Mapping**:
- **Ethers v5**: Wrap `TransactionResponse` and delegate `wait()` to provider's implementation
- **Ethers v6**: Similar to v5 with updated types
- **Viem**: Use `waitForTransactionReceipt()` and `getTransactionReceipt()`

**Key Considerations**:
- Normalize bigint vs BigNumber across providers
- Parse revert reasons from receipt logs when available
- Handle pending transactions (receipt not yet available)
- Support multiple confirmation counts (1, 3, 5, etc.)

**Alternatives Considered**:
- **Immediate wait**: Rejected - blocks execution, doesn't allow "submit and continue"
- **Callback-based**: Rejected - less composable than Promise-based, harder to test
- **Event-based**: Rejected - overkill for simple transaction tracking, adds complexity

---

### 3. Gas Estimation Strategy

**Decision**: Provide separate `estimateGas()` method that returns estimated gas units, allow optional gas overrides in write operations

**Rationale**:
- Users need gas estimates before submitting transactions (show cost to users)
- Providers have different gas estimation APIs that need normalization
- Some users want to customize gas limit/price for urgent transactions
- Gas estimation can fail if transaction would revert

**Implementation Approach**:

```typescript
interface ProviderAdapter {
  // ... existing methods

  estimateGas(options: ContractCallOptions): Promise<bigint>;

  writeContract(options: ContractWriteOptions): Promise<TransactionResponse>;
}

interface ContractWriteOptions extends ContractCallOptions {
  gasLimit?: bigint;      // Override estimated gas
  gasPrice?: bigint;      // Legacy (EIP-1559 not used)
  maxFeePerGas?: bigint;  // EIP-1559
  maxPriorityFeePerGas?: bigint;  // EIP-1559
  nonce?: bigint;         // Explicit nonce
}
```

**Provider-Specific Implementation**:
- **Ethers v5**: `contract.estimateGas.functionName()`
- **Ethers v6**: `contract.functionName.estimateGas()`
- **Viem**: `publicClient.estimateContractGas()`

**Key Considerations**:
- Estimation may fail if transaction would revert (surface error clearly)
- Add buffer to estimation (e.g., 10-20% more) to account for state changes
- Support both legacy (gasPrice) and EIP-1559 (maxFeePerGas) transactions
- Validate gas parameters are reasonable (not 0, not absurdly high)

**Alternatives Considered**:
- **Auto-estimate on every write**: Rejected - extra RPC call, users may want to batch estimates
- **No gas customization**: Rejected - advanced users need control for time-sensitive transactions
- **Separate gas service**: Rejected - gas is transaction-specific, belongs in adapter

---

### 4. Error Handling and Normalization

**Decision**: Normalize provider-specific errors into consistent error types, distinguish pre-submission vs on-chain failures

**Rationale**:
- Each provider throws different error types for same conditions
- Users need to know if error occurred before submission (no gas cost) or on-chain (gas spent)
- Error messages must be actionable (explain what happened + how to fix)
- Revert reasons from contracts must be surfaced

**Implementation Approach**:

```typescript
// Error type hierarchy
class TransactionError extends Error {
  code: string;
  reason?: string;
}

class ValidationError extends TransactionError {
  // Pre-submission errors (no gas cost)
  // Examples: invalid address, missing signer, wrong network
}

class ExecutionError extends TransactionError {
  // On-chain errors (gas consumed)
  hash: string;
  revertReason?: string;
}

class NetworkError extends TransactionError {
  // RPC/network issues (retry-able)
  retry: boolean;
}
```

**Error Normalization Map**:

| Condition | Ethers Error | Viem Error | Normalized Error |
|-----------|--------------|------------|------------------|
| No signer | `missing provider` | `account required` | `ValidationError: "Signer required for write operations. Initialize SDK with signer parameter."` |
| Wrong network | `network mismatch` | `chain mismatch` | `ValidationError: "Chain ID mismatch. Signer is on chain X but SDK expects chain Y."` |
| Invalid address | `invalid address` | `address invalid` | `ValidationError: "Invalid contract address: must be checksummed Ethereum address."` |
| Insufficient gas | `gas too low` | `gas too low` | `ValidationError: "Gas limit too low. Estimated: X, provided: Y."` |
| Transaction reverted | `execution reverted` | `execution reverted` | `ExecutionError: "Transaction reverted: [reason]" (includes hash)` |
| RPC timeout | `timeout` | `timeout` | `NetworkError: "RPC request timed out. Retry recommended."` |

**Key Considerations**:
- Parse revert reasons from hex-encoded error data
- Include transaction hash in all on-chain errors
- Suggest fixes in error messages (e.g., "Increase gas limit to X")
- Mark transient errors as retry-able

**Alternatives Considered**:
- **Pass through provider errors**: Rejected - inconsistent UX across providers
- **Generic error wrapper**: Rejected - loses information, not actionable
- **Error codes only**: Rejected - humans read messages, codes are secondary

---

### 5. ABI Format Handling

**Decision**: Support both human-readable (string) and JSON ABI formats, same as existing read operations

**Rationale**:
- Existing `readContract()` supports both formats
- Users have ABIs in different forms (Ethers uses strings, Viem uses JSON)
- Consistency across read and write operations

**Implementation Approach**:

**Ethers** (supports human-readable):

```typescript
// Human-readable
writeContract({
  address: '0x...',
  abi: ['function approve(address spender, uint256 amount)'],
  functionName: 'approve',
  args: [spenderAddress, amount]
});

// JSON
writeContract({
  address: '0x...',
  abi: [{ type: 'function', name: 'approve', inputs: [...] }],
  functionName: 'approve',
  args: [spenderAddress, amount]
});
```

**Viem** (prefers JSON but accepts both):

```typescript
// Same interface, adapter handles conversion
```

**Key Considerations**:
- Validate function exists in ABI before calling
- Support function overloading (multiple functions with same name, different parameters)
- Use exact function signatures to avoid ambiguity

**Alternatives Considered**:
- **JSON only**: Rejected - breaks from existing pattern, less developer-friendly for simple cases
- **String only**: Rejected - Viem ecosystem uses JSON, would require unnecessary conversion
- **Separate methods**: Rejected - API bloat, confusing for users

---

### 6. Virtual Proxy Pattern Integration

**Decision**: Extend existing virtual proxy classes to lazy-load both provider AND signer/wallet

**Rationale**:
- Existing pattern allows users to install only the providers they use
- Write support should follow same pattern (no extra dependencies)
- Initialization cost deferred until first use (read or write)

**Implementation Approach**:

**Current Pattern**:

```typescript
class EthersAdapterProxy implements ProviderAdapter {
  private adapter: EthersAdapter | null = null;
  private provider: any;

  constructor(provider: any) {
    this.provider = provider;
  }

  private ensureAdapter() {
    if (!this.adapter) {
      const { EthersAdapter } = require('./implementations/ethersAdapter');
      this.adapter = new EthersAdapter(this.provider);
    }
    return this.adapter;
  }

  readContract(options) {
    return this.ensureAdapter().readContract(options);
  }
}
```

**Extended Pattern**:

```typescript
class EthersAdapterProxy implements ProviderAdapter {
  private adapter: EthersAdapter | null = null;
  private provider: any;
  private signer?: any;  // NEW

  constructor(provider: any, signer?: any) {  // NEW parameter
    this.provider = provider;
    this.signer = signer;
  }

  private ensureAdapter() {
    if (!this.adapter) {
      const { EthersAdapter } = require('./implementations/ethersAdapter');
      this.adapter = new EthersAdapter(this.provider, this.signer);  // Pass signer
    }
    return this.adapter;
  }

  // Existing
  readContract(options) {
    return this.ensureAdapter().readContract(options);
  }

  // NEW
  writeContract(options) {
    return this.ensureAdapter().writeContract(options);
  }

  estimateGas(options) {
    return this.ensureAdapter().estimateGas(options);
  }
}
```

**Key Considerations**:
- Signer parameter is optional (backward compatibility)
- Lazy loading still applies (ethers/viem not loaded until first use)
- Error if write methods called without signer

**Alternatives Considered**:
- **Separate proxy for write**: Rejected - duplicates code, confusing API
- **Eager loading with signer**: Rejected - breaks lazy loading benefit
- **No proxy for write**: Rejected - forces users to install all providers

---

### 7. Testing Strategy

**Decision**: Shared test suite pattern to ensure provider parity, integration tests against forked mainnet

**Rationale**:
- Three providers must have identical behavior from user perspective
- Shared tests prevent provider-specific bugs
- Integration tests verify actual blockchain interactions
- Forked mainnet provides realistic state without gas costs

**Implementation Approach**:

**Shared Test Suite** (`tests/integration/shared/writeTransactions.test.ts`):

```typescript
export function runWriteTransactionTests(
  name: string,
  createAdapter: () => ProviderAdapter
) {
  describe(`${name} - Write Transactions`, () => {
    let adapter: ProviderAdapter;

    beforeEach(() => {
      adapter = createAdapter();
    });

    it('should submit approval transaction', async () => {
      const tx = await adapter.writeContract({
        address: TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [SPENDER, AMOUNT]
      });

      expect(tx.hash).toMatch(/^0x[a-f0-9]{64}$/);

      const receipt = await tx.wait();
      expect(receipt.status).toBe('success');
    });

    it('should estimate gas for approval', async () => {
      const gas = await adapter.estimateGas({
        address: TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [SPENDER, AMOUNT]
      });

      expect(gas).toBeGreaterThan(0n);
      expect(gas).toBeLessThan(100000n); // Reasonable upper bound
    });

    it('should throw ValidationError when signer missing', async () => {
      const readOnlyAdapter = createReadOnlyAdapter();

      await expect(
        readOnlyAdapter.writeContract({...})
      ).rejects.toThrow(ValidationError);
    });

    // ... more shared tests
  });
}
```

**Provider-Specific Test Files**: Import and run shared suite

```typescript
// tests/integration/ethers/writeOperations.test.ts
import { runWriteTransactionTests } from '../shared/writeTransactions.test';

runWriteTransactionTests('Ethers v6', () => {
  const provider = /* ... */;
  const signer = /* ... */;
  return new EthersAdapterProxy(provider, signer);
});
```

**Test Coverage Requirements**:
- ✅ Successful transaction submission and confirmation
- ✅ Gas estimation accuracy
- ✅ Error handling (no signer, wrong network, reverted transaction)
- ✅ Transaction receipt parsing
- ✅ Revert reason extraction
- ✅ Multiple confirmations
- ✅ Custom gas parameters
- ✅ Both ABI formats (string and JSON)

**Key Considerations**:
- Use mainnet fork to avoid testnet faucet dependencies
- Test with real Mento contracts (approvals, swaps when available)
- Verify gas estimates within 20% of actual usage
- Test error messages are actionable

**Alternatives Considered**:
- **Mock-based tests only**: Rejected - don't verify actual blockchain interaction
- **Separate tests per provider**: Rejected - misses parity issues, duplicates code
- **Testnet only**: Rejected - slow, requires faucets, less realistic state

---

## Summary of Key Decisions

| Area | Decision | Rationale |
|------|----------|-----------|
| **Signer Integration** | Optional signer parameter in adapter constructors | Backward compatibility, supports both read-only and write modes |
| **Transaction Response** | Lightweight response with async `wait()` method | Allows "submit and continue" or "submit and wait" patterns |
| **Gas Estimation** | Separate `estimateGas()` method, optional gas overrides | Users control when to estimate, advanced users can customize |
| **Error Handling** | Normalized error types (Validation, Execution, Network) | Consistent UX across providers, actionable messages |
| **ABI Format** | Support both string and JSON, same as reads | Consistency, developer choice |
| **Virtual Proxy** | Extend existing pattern to include signer | Maintains lazy loading benefit, no forced dependencies |
| **Testing** | Shared test suites + forked mainnet | Ensures provider parity, realistic testing |

## Open Questions / Future Considerations

**None** - All technical decisions have been made. Implementation can proceed to Phase 1 (design).

## References

- [Ethers v5 Documentation - Signers](https://docs.ethers.org/v5/api/signer/)
- [Ethers v6 Documentation - Signers](https://docs.ethers.org/v6/api/providers/#Signer)
- [Viem Documentation - Wallet Client](https://viem.sh/docs/clients/wallet.html)
- [Existing Mento SDK Adapter Pattern](../../src/adapters/README.md)
- [Mento SDK Constitution](../../.specify/memory/constitution.md)
