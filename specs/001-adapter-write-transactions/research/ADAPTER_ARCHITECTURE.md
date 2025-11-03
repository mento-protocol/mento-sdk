# Mento SDK Adapter Architecture & Write Transaction Analysis

## Executive Summary

The Mento SDK uses a **Virtual Proxy Pattern** for provider adapter management that supports three blockchain provider libraries: Ethers v5, Ethers v6, and Viem. Currently, the SDK is **read-only**, supporting contract read operations through a unified `ProviderAdapter` interface. Write transaction support would require extending this interface and implementing transaction building/submission capabilities across all three adapters.

---

## 1. Adapter Implementations Overview

### 1.1 Supported Adapters

The SDK supports three blockchain provider libraries with equal feature parity:

| Adapter | Library | Source |
|---------|---------|--------|
| **EthersV5Adapter** | `ethers@^5.7` | `/src/adapters/implementations/ethersV5Adapter.ts` |
| **EthersAdapter** | `ethers@^6.13.4` | `/src/adapters/implementations/ethersAdapter.ts` |
| **ViemAdapter** | `viem@^2.21.44` | `/src/adapters/implementations/viemAdapter.ts` |

All adapters are wrapped with Virtual Proxy classes for lazy loading:
- `EthersV5AdapterProxy` - `/src/adapters/proxies/ethersV5AdapterProxy.ts`
- `EthersAdapterProxy` - `/src/adapters/proxies/ethersAdapterProxy.ts`
- `ViemAdapterProxy` - `/src/adapters/proxies/viemAdapterProxy.ts`

### 1.2 Adapter Dependencies Configuration

In `package.json`, providers are configured as **optional peer dependencies**:

```json
"peerDependencies": {
  "ethers": "^6.13.4",
  "ethers-v5": "npm:ethers@^5.7",
  "viem": "^2.21.44"
},
"peerDependenciesMeta": {
  "ethers": { "optional": true },
  "ethers-v5": { "optional": true },
  "viem": { "optional": true }
}
```

This allows users to install only the provider they use, minimizing SDK footprint.

---

## 2. Current Adapter Pattern & Architecture

### 2.1 Core Interface: `ProviderAdapter`

**Location**: `/src/types/provider.ts`

```typescript
export interface ContractCallOptions {
  address: string;
  abi: string[] | unknown[];
  functionName: string;
  args?: unknown[];
}

export interface ProviderAdapter {
  readContract(options: ContractCallOptions): Promise<unknown>;
  getChainId(): Promise<number>;
}
```

**Current capabilities**: Read-only contract calls + chain ID detection

### 2.2 Virtual Proxy Pattern Implementation

The adapters use the **Virtual Proxy pattern** for lazy loading. Key benefits:

1. **Optional Dependencies**: Users only load/install providers they use
2. **Lazy Initialization**: Dependencies loaded only when first adapter method is called
3. **Better Error Messages**: Missing providers have descriptive error messages
4. **Memory Efficiency**: Unused adapters don't consume memory

**Example - EthersAdapterProxy**:
```typescript
export class EthersAdapterProxy implements ProviderAdapter {
  private adapter: ProviderAdapter | null = null;
  private initPromise: Promise<void>;

  constructor(provider: EthersV6Provider) {
    this.initPromise = this.initialize(provider);
  }

  private async initialize(provider: EthersV6Provider) {
    try {
      const { EthersAdapter } = await import('../implementations/ethersAdapter');
      this.adapter = new EthersAdapter(provider);
    } catch (error) {
      throw new Error('ethers v6 is not installed. Please install ethers@6 to use this adapter');
    }
  }

  async readContract(...args: Parameters<ProviderAdapter['readContract']>) {
    await this.initPromise;
    if (!this.adapter) throw new Error('Adapter not initialized...');
    return this.adapter.readContract(...args);
  }
}
```

### 2.3 Actual Implementation Pattern

Each adapter implements the same interface but delegates to provider-specific APIs:

**EthersV5Adapter** (`ethers-v5`):
```typescript
export class EthersV5Adapter implements ProviderAdapter {
  constructor(private provider: providers.Provider) {}

  async readContract(options: ContractCallOptions): Promise<unknown> {
    const contract = new Contract(
      options.address,
      options.abi as string[] | ContractInterface,
      this.provider
    );
    return await contract[options.functionName](...(options.args || []));
  }

  async getChainId(): Promise<number> {
    const network = await this.provider.getNetwork();
    return Number(network.chainId);
  }
}
```

**EthersAdapter** (`ethers@v6`):
```typescript
export class EthersAdapter implements ProviderAdapter {
  constructor(private provider: EthersProvider) {}

  async readContract(options: ContractCallOptions): Promise<unknown> {
    const contract = new Contract(
      options.address,
      options.abi as string[] | Interface,
      this.provider
    );
    return await contract[options.functionName](...(options.args || []));
  }

  async getChainId(): Promise<number> {
    const network = await this.provider.getNetwork();
    return Number(network.chainId);
  }
}
```

**ViemAdapter** (`viem`):
```typescript
export class ViemAdapter implements ProviderAdapter {
  constructor(private client: PublicClient) {}

  async readContract(options: ContractCallOptions): Promise<unknown> {
    // Handles both string array (human-readable) and object ABIs
    const abi = Array.isArray(options.abi) && typeof options.abi[0] === 'string'
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
}
```

---

## 3. Current Capabilities vs Missing Write Transaction Support

### 3.1 Current Read-Only Capabilities

The adapters support:

1. **Contract Reads**: `readContract(options)` - Calls view/pure functions
2. **Chain Detection**: `getChainId()` - Identifies blockchain network
3. **Multiple ABI Formats**: 
   - Human-readable format (string array) - Viem special handling
   - JSON ABI format (object array)
4. **Lazy Provider Loading**: Dependencies loaded on-demand
5. **Cross-Provider Compatibility**: Same interface across Ethers v5/v6 and Viem

### 3.2 Missing Write Transaction Capabilities

**Gap Analysis**: Write transactions currently require:

1. **Signer/Wallet Client**: 
   - Ethers v5/v6: Need `Signer` instance (e.g., `JsonRpcSigner`, `Wallet`)
   - Viem: Need `WalletClient` instance
   - Current SDK only accepts `Provider` / `PublicClient`

2. **Transaction Building**: No support for:
   - Encoding contract call data
   - Building transaction objects
   - Gas estimation
   - Nonce management

3. **Transaction Submission**: No support for:
   - Sending signed transactions
   - Awaiting transaction receipts
   - Handling transaction responses

4. **Error Handling**: No patterns for:
   - Transaction reverts
   - Insufficient gas
   - Account balance checks

### 3.3 What Write Transactions Would Enable

Users would be able to:

1. **Execute State-Changing Operations**:
   - Token transfers
   - Protocol interactions (swaps, deposits, withdrawals)
   - Governance voting
   - Smart contract function calls that modify state

2. **Build Transaction Workflows**:
   - Multi-step transactions with dependencies
   - Batch operations
   - Gas estimation and optimization

3. **Interact Fully with Mento Protocol**:
   - Currently limited to reading protocol state
   - Would enable trading, governance, and management operations

4. **Create DeFi Applications**:
   - Trading bots
   - Automated portfolio managers
   - Governance interfaces

---

## 4. Features/Methods Currently Supported by Adapters

### 4.1 Public API

| Method | Signature | Purpose |
|--------|-----------|---------|
| `readContract()` | `(options: ContractCallOptions) => Promise<unknown>` | Call view/pure contract functions |
| `getChainId()` | `() => Promise<number>` | Get current blockchain network ID |

### 4.2 Adapter Usage in Services

Adapters are used throughout the SDK by services that rely on contract reads:

**StableTokenService** (`/src/services/stableTokenService.ts`):
```typescript
// Uses readContract for: getTokens(), metadata, totalSupply
const tokenAddresses = (await this.provider.readContract({
  address: reserveAddress,
  abi: RESERVE_ABI,
  functionName: 'getTokens',
})) as string[];
```

**TokenMetadataService** (`/src/services/tokenMetadataService.ts`):
```typescript
// Uses readContract for: name(), symbol(), decimals(), balanceOf(), totalSupply()
const name = await this.provider.readContract({
  address,
  abi: ERC20_ABI,
  functionName: 'name',
});
```

**CollateralAssetService** (`/src/services/collateralAssetService.ts`):
```typescript
// Uses readContract for: getExchanges(), isCollateralAsset()
const exchanges = await this.provider.readContract({
  address: biPoolManagerAddress,
  abi: BIPOOL_MANAGER_ABI,
  functionName: 'getExchanges',
});
```

**Supply Calculators** (Various supply calculation services):
```typescript
// AAVESupplyCalculator uses readContract for: balanceOf()
const balance = await this.provider.readContract({
  address: aTokenAddress,
  abi: ERC20_ABI,
  functionName: 'balanceOf',
  args: [holderAddress],
});
```

---

## 5. Existing Patterns for Blockchain Interactions

### 5.1 Service-Based Architecture

Services encapsulate business logic and use adapters for blockchain interactions:

```
Mento (Main Class)
  ├── StableTokenService (uses ProviderAdapter)
  │   ├── TokenMetadataService
  │   └── SupplyAdjustmentService
  │       ├── AAVESupplyCalculator
  │       ├── UniV3SupplyCalculator
  │       └── MultisigSupplyCalculator
  └── CollateralAssetService
      └── TokenMetadataService
```

### 5.2 Error Handling Patterns

**Retry Logic**: `/src/utils/retry.ts` provides retry mechanisms for transient failures:
```typescript
// Services use retryOperation for unreliable RPC calls
const metadata = await retryOperation(() =>
  this.provider.readContract({...})
);
```

### 5.3 Type Safety Patterns

- All contract addresses are checksummed and validated
- Chain IDs verified to prevent cross-chain operations
- BigInt used for numeric values (no floating-point arithmetic)
- ABI definitions are exported and typed

### 5.4 Contract ABIs

ABIs are centrally defined in `/src/abis/`:

| ABI | Purpose | Functions |
|-----|---------|-----------|
| `ERC20_ABI` | Token interactions | name(), symbol(), decimals(), totalSupply(), balanceOf() |
| `RESERVE_ABI` | Mento Reserve | getTokens(), isToken(), isCollateralAsset() |
| `BIPOOL_MANAGER_ABI` | Mento Exchange Manager | getExchanges() |
| `BROKER_ABI` | Trading limits | tradingLimitsConfig(), tradingLimitsState() |
| `PRICING_MODULE_ABI` | Pricing | (minimal) |
| `UNISWAP_V3_ABI` | Uniswap integration | (complex pool interactions) |

---

## 6. Adapter Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Mento SDK Main Class                    │
│  (Orchestrates services and provides public API)             │
└───────────────────────────────┬─────────────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
        ┌───────────▼──────────┐   ┌───────▼──────────┐
        │ StableTokenService   │   │CollateralAsset   │
        │ (read-only)          │   │Service           │
        │                      │   │ (read-only)      │
        └───────────┬──────────┘   └───────┬──────────┘
                    │                       │
                    └───────────┬───────────┘
                                │
                    ┌───────────▼─────────────┐
                    │  ProviderAdapter         │
                    │  (Interface)             │
                    │  - readContract()        │
                    │  - getChainId()          │
                    └───────────┬─────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
    ┌───▼────────────┐  ┌──────▼──────────┐  ┌────────▼──────┐
    │EthersV5Adapter │  │EthersAdapter    │  │ViemAdapter    │
    │(via Proxy)     │  │(via Proxy)      │  │(via Proxy)    │
    │                │  │                 │  │               │
    │ Native:        │  │ Native:         │  │ Native:       │
    │ ethers-v5      │  │ ethers@v6       │  │ viem@v2       │
    │ Contract API   │  │ Contract API    │  │ publicClient  │
    │                │  │                 │  │ readContract  │
    └────────────────┘  └─────────────────┘  └───────────────┘
        │                       │                       │
    ethers-v5              ethers@v6              viem v2
    Provider            Provider              PublicClient
```

---

## 7. Provider Type Detection & Initialization

**Location**: `/src/index.ts` (Mento class)

The SDK auto-detects provider type and creates appropriate adapter:

```typescript
export type SupportedProvider =
  | EthersV6Provider
  | PublicClient
  | EthersV5Providers.Provider;

// Auto-detection logic
function isEthersV5Provider(provider: SupportedProvider): boolean {
  return 'getNetwork' in provider && '_network' in provider && 'formatter' in provider;
}

function isEthersV6Provider(provider: SupportedProvider): boolean {
  return 'getNetwork' in provider && 'broadcastTransaction' in provider;
}

function isViemProvider(provider: SupportedProvider): boolean {
  return !('getNetwork' in provider);
}

// In Mento.create():
if (isEthersV5Provider(config.provider)) {
  provider = new EthersV5Adapter(config.provider);
} else if (isEthersV6Provider(config.provider)) {
  provider = new EthersAdapter(config.provider);
} else if (isViemProvider(config.provider)) {
  provider = new ViemAdapter(config.provider);
}
```

---

## 8. Non-Functional Requirements (Per Constitution)

The Mento SDK Constitution defines requirements that write transactions must meet:

### 8.1 Type Safety & Code Quality
- All public APIs must have TypeScript type definitions and JSDoc
- No `any` types in public APIs
- Strict mode TypeScript

### 8.2 Provider Agnostic Architecture
- All blockchain interactions through ProviderAdapter interface
- No provider-specific code in services
- Equal feature parity across Ethers v5/v6 and Viem
- Automatic provider detection and initialization

### 8.3 Comprehensive Testing
- Unit tests for core logic
- Integration tests for each adapter
- Shared test suites ensuring provider parity
- Code coverage > 80%

### 8.4 Performance & Reliability
- Batch calls where possible
- Retry logic with exponential backoff
- Proper error handling
- Configurable timeouts

### 8.5 Developer Experience & Documentation
- JSDoc comments with examples
- Clear error messages
- Migration guides for breaking changes
- Updated README

### 8.6 Blockchain Best Practices
- Checksummed contract addresses
- Chain ID verification
- BigInt for numeric values
- Gas estimation availability

---

## 9. Integration Test Pattern

**Location**: `/tests/integration/adapters/`

Tests demonstrate adapter usage:

```typescript
// Tests use shared test suites for provider parity
describe('EthersAdapter Integration Tests', () => {
  const ethersProvider = new JsonRpcProvider(TEST_CONFIG.rpcUrl);
  const adapter = new EthersAdapter(ethersProvider);
  const stableTokenService = new StableTokenService(adapter);
  const collateralAssetService = new CollateralAssetService(adapter);

  createStableTokenTests(stableTokenService);
  createCollateralAssetTests(collateralAssetService);
});
```

Same tests run with ViemAdapter to ensure provider parity.

---

## 10. What's Needed for Write Transaction Support

### 10.1 Core Infrastructure Changes

1. **Extended ProviderAdapter Interface**:
   ```typescript
   interface ProviderAdapter {
     // Existing read-only methods
     readContract(options: ContractCallOptions): Promise<unknown>;
     getChainId(): Promise<number>;
     
     // New write transaction methods
     writeContract(options: ContractWriteOptions): Promise<TransactionResponse>;
     sendTransaction(tx: Transaction): Promise<TransactionResponse>;
     getBalance(address: string): Promise<bigint>;
     estimateGas(tx: Transaction): Promise<bigint>;
   }
   ```

2. **New Type Definitions**:
   ```typescript
   interface ContractWriteOptions extends ContractCallOptions {
     account: string;
     value?: bigint;
     gas?: bigint;
     gasPrice?: bigint;
   }
   
   interface TransactionResponse {
     hash: string;
     wait(): Promise<TransactionReceipt>;
   }
   ```

3. **Signer/Wallet Support**:
   - Extend constructor to accept Signer (Ethers) or WalletClient (Viem)
   - Maintain lazy loading pattern
   - Support both read-only Provider and signing Signer

4. **All Three Adapters Must Implement**:
   - EthersV5Adapter with `Signer`
   - EthersAdapter with `Signer`
   - ViemAdapter with `WalletClient`

### 10.2 Service Layer Changes

Services would need methods for:
- Token approvals (ERC20 approve)
- Protocol interactions (swaps, trades)
- Governance actions (voting)

### 10.3 Error Handling Requirements

- Transaction revert reasons
- Insufficient balance errors
- Gas limit exceeded
- Nonce conflicts
- RPC/network errors

### 10.4 Testing Requirements

- Unit tests for write operations
- Integration tests for each adapter
- Shared test suites for provider parity
- Testnet transaction tests

---

## 11. Architecture Summary

### Current State (Read-Only)
- Virtual Proxy pattern for lazy adapter loading
- Single interface for all providers: `ProviderAdapter`
- Three implementations: EthersV5, EthersV6, Viem
- Auto-detection of provider type
- Services use adapters for blockchain queries
- Comprehensive error handling and retry logic

### For Write Transactions
- Same Virtual Proxy and provider detection patterns
- Extended ProviderAdapter interface with write methods
- Signer/WalletClient support alongside Provider/PublicClient
- New service methods for transactions
- Full provider parity maintained
- Constitution compliance: type safety, error handling, documentation

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `/src/types/provider.ts` | ProviderAdapter interface definition |
| `/src/adapters/index.ts` | Public adapter exports |
| `/src/adapters/implementations/ethersAdapter.ts` | Ethers v6 adapter |
| `/src/adapters/implementations/ethersV5Adapter.ts` | Ethers v5 adapter |
| `/src/adapters/implementations/viemAdapter.ts` | Viem adapter |
| `/src/adapters/proxies/*.ts` | Virtual proxy implementations |
| `/src/adapters/proxies/README.md` | Virtual proxy pattern documentation |
| `/src/index.ts` | Mento class with provider detection |
| `/src/services/*.ts` | Services using adapters |
| `/.specify/memory/constitution.md` | SDK development principles |

---

## Recommendations for Write Transaction Specification

1. **Maintain Adapter Pattern**: Keep same interface approach for consistency
2. **Preserve Lazy Loading**: Virtual Proxy pattern works for Signers too
3. **Support Both Patterns**:
   - Read-only: Provider/PublicClient (current)
   - Write: Signer/WalletClient (new)
4. **Provider Parity**: Ensure Ethers v5/v6 and Viem have equal write capabilities
5. **Service-Based**: Create new services for write operations (e.g., TransactionService)
6. **Error Handling**: Comprehensive error types and messages for blockchain failures
7. **Testing**: Shared test suites for write operations across all adapters
8. **Documentation**: Clear examples for each provider library

