# Mento SDK - Code Structure & File Organization

## Directory Tree (Adapters & Related)

```
mento-sdk/
├── src/
│   ├── adapters/                          # Blockchain provider adapters
│   │   ├── implementations/
│   │   │   ├── ethersAdapter.ts           # Ethers v6 implementation (25 lines)
│   │   │   ├── ethersV5Adapter.ts         # Ethers v5 implementation (25 lines)
│   │   │   └── viemAdapter.ts             # Viem implementation (26 lines)
│   │   ├── proxies/
│   │   │   ├── README.md                  # Virtual proxy pattern docs
│   │   │   ├── ethersAdapterProxy.ts      # Ethers v6 lazy loader (56 lines)
│   │   │   ├── ethersV5AdapterProxy.ts    # Ethers v5 lazy loader (58 lines)
│   │   │   └── viemAdapterProxy.ts        # Viem lazy loader (56 lines)
│   │   └── index.ts                       # Public adapter exports (9 lines)
│   │
│   ├── types/
│   │   ├── provider.ts                    # ProviderAdapter interface (12 lines)
│   │   ├── token.ts                       # Token types (30 lines)
│   │   ├── exchange.ts                    # Exchange types (6 lines)
│   │   ├── contractAddresses.ts           # Address types
│   │   └── index.ts                       # Types index
│   │
│   ├── services/
│   │   ├── stableTokenService.ts          # Reads stable token data
│   │   ├── collateralAssetService.ts      # Reads collateral asset data
│   │   ├── tokenMetadataService.ts        # Reads token metadata
│   │   ├── supplyAdjustmentService.ts     # Calculates adjusted supply
│   │   └── supply/
│   │       ├── ISupplyCalculator.ts       # Supply calc interface
│   │       ├── aaveSupplyCalculator.ts    # AAVE protocol integration
│   │       ├── uniV3SupplyCalculator.ts   # Uniswap V3 integration
│   │       ├── multisigSupplyCalculator.ts # Multisig integration
│   │       └── calculatorFactory.ts       # Calculator factory pattern
│   │
│   ├── abis/                              # Smart contract ABIs
│   │   ├── erc20.ts                       # ERC20 token ABI (7 lines)
│   │   ├── reserve.ts                     # Reserve contract ABI
│   │   ├── bipoolmanager.ts               # BiPool manager ABI (22 lines)
│   │   ├── broker.ts                      # Broker contract ABI (4 lines)
│   │   ├── pricingmodule.ts               # Pricing module ABI
│   │   ├── uniswapV3.ts                   # Uniswap V3 ABI (12 lines)
│   │   └── index.ts                       # ABI index
│   │
│   ├── constants/
│   │   ├── chainId.ts                     # Supported chain IDs
│   │   ├── addresses.ts                   # Contract addresses per chain
│   │   ├── contractNames.ts               # Contract name constants
│   │   ├── stableTokenMetadata.ts         # Token metadata
│   │   ├── mentoAddresses.ts              # Mento-specific addresses
│   │   ├── protocolAddresses.ts           # Protocol addresses
│   │   ├── aaveConfig.ts                  # AAVE configuration
│   │   └── proposalState.ts               # Governance proposal states
│   │
│   ├── utils/
│   │   ├── retry.ts                       # Retry logic with backoff
│   │   └── index.ts                       # Utilities index
│   │
│   └── index.ts                           # Main SDK entry point (156 lines)
│
├── tests/
│   ├── integration/
│   │   ├── adapters/
│   │   │   ├── ethersAdapter.test.ts      # Ethers v6 integration tests
│   │   │   └── viemAdapter.test.ts        # Viem integration tests
│   │   ├── services/
│   │   │   └── supplyAdjustmentService.test.ts
│   │   └── shared/
│   │       └── [shared test suites]
│   ├── unit/
│   │   ├── addresses.test.ts
│   │   └── services/
│   │       └── supply/
│   │           └── multisigSupplyCalculator.test.ts
│   └── config.ts                          # Test configuration
│
├── .specify/
│   ├── memory/
│   │   └── constitution.md                # SDK development principles
│   ├── templates/
│   │   └── spec-template.md               # Feature spec template
│   └── scripts/
│
├── specs/
│   └── 001-adapter-write-transactions/
│       └── spec.md                        # Feature spec (template)
│
├── package.json                           # Dependencies & config
├── tsconfig.json                          # TypeScript config
├── jest.config.ts                         # Jest test config
├── ADAPTER_ARCHITECTURE.md                # Generated architecture doc
└── README.md                              # Project README

```

## Architecture Layering

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 1: User-Facing API                                    │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Mento class (src/index.ts)                              │ │
│ │ - create(config)                                        │ │
│ │ - getStableTokens()                                     │ │
│ │ - getCollateralAssets()                                 │ │
│ │ - getContractAddress()                                  │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 2: Services (Business Logic)                          │
│ ┌──────────────────┐ ┌──────────────────────────────────┐  │
│ │ StableTokenSvc   │ │ CollateralAssetService           │  │
│ ├──────────────────┤ ├──────────────────────────────────┤  │
│ │ TokenMetadataS.  │ │ TokenMetadataService             │  │
│ ├──────────────────┤ └──────────────────────────────────┘  │
│ │ SupplyAdjustS.   │                                       │
│ │ ├─ AAVECalc      │                                       │
│ │ ├─ UniV3Calc     │                                       │
│ │ └─ MultisigCalc  │                                       │
│ └──────────────────┘                                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 3: Adapter Interface (Abstraction)                    │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ProviderAdapter (interface)                             │ │
│ │ - readContract()                                        │ │
│ │ - getChainId()                                          │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 4: Proxy Pattern (Lazy Loading)                       │
│ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────┐ │
│ │ EthersAdapterP.  │ │ EthersV5AdapterP.│ │ ViemAdapterP.│ │
│ │ (defers init)    │ │ (defers init)    │ │ (defers init)│ │
│ └──────────────────┘ └──────────────────┘ └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 5: Adapter Implementations                            │
│ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────┐ │
│ │ EthersAdapter    │ │ EthersV5Adapter  │ │ ViemAdapter  │ │
│ │ (v6 specific)    │ │ (v5 specific)    │ │ (viem spec)  │ │
│ └──────────────────┘ └──────────────────┘ └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 6: Provider Libraries (External)                      │
│ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────┐ │
│ │ ethers@v6        │ │ ethers-v5        │ │ viem@v2      │ │
│ │ (peer dep)       │ │ (peer dep)       │ │ (peer dep)   │ │
│ └──────────────────┘ └──────────────────┘ └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 7: Blockchain                                         │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Ethereum / Celo / EVM Chain (via RPC)                  │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow: Reading Contract Data

```
Service Layer
    │
    └─> readContract(options: ContractCallOptions)
            │
            ├─ address: "0x..."
            ├─ abi: [...] 
            ├─ functionName: "name"
            └─ args: [...]
                │
                ▼
            ProviderAdapter Interface
                │
                ├─ EthersAdapterProxy
                │   ├─ lazy load EthersAdapter
                │   └─ delegate to EthersAdapter
                │
                ├─ EthersV5AdapterProxy
                │   ├─ lazy load EthersV5Adapter
                │   └─ delegate to EthersV5Adapter
                │
                └─ ViemAdapterProxy
                    ├─ lazy load ViemAdapter
                    └─ delegate to ViemAdapter
                        │
                        ├─ EthersAdapter: new Contract(...).call()
                        ├─ EthersV5Adapter: new Contract(...).call()
                        └─ ViemAdapter: publicClient.readContract()
                            │
                            ▼
                        Blockchain RPC Call
                            │
                            ▼
                        Response (decoded)
                            │
                            ▼
                        Service receives result
                            │
                            ▼
                        User gets data
```

## File Size Reference

Adapter layer is surprisingly small (under 300 lines total):
- 3 implementations: ~25 lines each = 75 lines
- 3 proxies: ~56 lines each = 168 lines  
- Interface definition: ~12 lines
- Index/exports: ~9 lines
- **Total: ~264 lines**

This demonstrates the elegance of the adapter pattern - minimal code, maximum flexibility.

## Key Insights

1. **Minimal Adapter Code**: Only 264 lines covers all blockchain interactions
2. **Service-Heavy**: Most logic is in services (500+ lines), not adapters
3. **Interface-Driven**: ProviderAdapter is the single source of truth
4. **Proxy Pattern**: Lazy loading adds ~168 lines but enables optional deps
5. **ABI Centralization**: All ABIs in one place for easy maintenance
6. **Type Density**: ABIs are human-readable strings (human + machine friendly)

## Future Write Transaction Impact

Adding write transaction support would:
- Extend ProviderAdapter interface (5-10 new methods)
- Extend each adapter implementation (20-30 lines each)
- Extend proxies to support Signer/WalletClient (10-15 lines each)
- Add new services for write operations (200-300+ lines)
- Add comprehensive tests (500+ lines)
- **Estimated total addition: 800-1000+ lines**

All while maintaining:
- Provider parity (same interface)
- Type safety (no `any` types)
- Virtual proxy pattern (lazy loading)
- Constitution compliance (documentation, testing, error handling)

