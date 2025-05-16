# Mento SDK v2 Documentation

## 1. Objective

The Mento SDK provides a high-level, developer-friendly interface for interacting with the Mento Protocol's smart contracts. It aims to simplify the development of decentralized applications (DApps) and integrations by abstracting away the complexities of low-level blockchain operations. This SDK enables developers to easily query protocol information, manage assets, and interact with governance mechanisms.

## 2. User Stories

- **As a DApp developer, I want to easily query the current list of stable tokens and their metadata so I can display them in my application.**
- **As a protocol integrator, I want to programmatically access reserve information and manage collateral assets to build automated management tools.**
- **As a DeFi developer, I want to interact with the Mento broker to facilitate token exchanges within my application.**
- **As a governance participant, I want to use the SDK to query proposal information and potentially cast votes (if supported by the SDK).**
- **As a developer new to Mento, I want clear examples and documentation to quickly understand how to initialize and use the SDK with different blockchain providers.**

## 3. Functional Requirements

The Mento SDK provides the following core functionalities:

### 3.1. Stable Token Management

- Query available stable tokens.
- Get metadata for specific stable tokens.

### 3.2. Reserve Management

- Query total reserve value.
- List collateral assets held in the reserve.
- Get details for specific collateral assets.

### 3.3. Broker Interactions

- Facilitate token exchanges through the Mento broker.
- Get exchange rates and slippage information.

### 3.4. Governance Features

- Query governance proposals.
- (Future) Interact with governance voting mechanisms.

### 3.5. Blockchain Access via Proxy Adapter Pattern

The SDK utilizes a Virtual Proxy pattern for its provider adapters, allowing for lazy loading of blockchain provider dependencies (e.g., ethers.js, viem). This offers flexibility and a better user experience.

- **Purpose**: Users can choose their preferred provider without installing all supported provider libraries, minimizing package size and avoiding version conflicts. The actual adapter implementation is only loaded when a method requiring blockchain interaction is called.
- **Mechanism**: Each proxy implements the `ProviderAdapter` interface and dynamically imports the actual adapter (e.g., `EthersV5Adapter`, `EthersAdapter`, `ViemAdapter`) upon first use.
- **Error Handling**: Clear error messages are provided if a user attempts to use functionality requiring a provider that is not installed.

#### Relevant Files and Interfaces:

- **Contract Addresses**: `src/constants/addresses.ts` contains the deployed addresses of the Mento Protocol smart contracts.
- **Contract Address Types**: `src/types/contractAddresses.ts` defines the TypeScript types for the contract addresses.
- **Provider Interface**: `src/types/provider.ts` defines the `ProviderAdapter` interface that all provider adapters (and their proxies) must implement.
  ```typescript
  export interface ProviderAdapter {
    readContract(options: ContractCallOptions): Promise<unknown>
    getChainId(): Promise<number>
  }
  ```
- **Ethers.js v6 Adapter Implementation**: `src/adapters/implementations/ethersAdapter.ts` contains the concrete implementation for interacting with the blockchain using ethers.js v6.
- **Ethers.js v6 Adapter Proxy**: `src/adapters/proxies/ethersAdapterProxy.ts` is the virtual proxy for the ethers.js v6 adapter. It defers loading the `ethersAdapter.ts` until a method is called.

#### Proxy Logic Explanation (from `src/adapters/proxies/README.md`):

The Virtual Proxy pattern defers loading the actual adapter implementation until it's needed:

- If a user only imports the SDK but never calls any methods, the provider libraries are never loaded.
- Memory efficiency as unused adapters are not initialized.
- Faster initial SDK initialization.
- Users can initialize the SDK without worrying about which provider dependencies are installed.
- Clear error messages when trying to use functionality with missing dependencies.
- Type safety is maintained through TypeScript interfaces.
- Proxy handles all initialization complexity.
- Simplified provider configuration.

Each proxy follows this basic structure:

```typescript
export class EthersAdapterProxy implements ProviderAdapter { // Example for ethers v6
  private adapter: ProviderAdapter | null = null;
  private initPromise: Promise<void>;

  constructor(provider: /* Ethers v6 Provider Type */) {
    this.initPromise = this.initialize(provider);
  }

  private async initialize(provider: /* Ethers v6 Provider Type */) {
    try {
      // Dynamically import the actual adapter
      const { EthersAdapter } = await import(
        '../implementations/ethersAdapter' // Path to the concrete implementation
      );
      this.adapter = new EthersAdapter(provider);
    } catch (error) {
      throw new Error(
        'ethers v6 is not installed. Please install ethers@6 to use this adapter.' // Example error
      );
    }
  }

  // Proxy methods will await initPromise and then delegate to this.adapter
  async getChainId(): Promise<number> {
    await this.initPromise;
    if (!this.adapter) {
      throw new Error('Adapter not initialized');
    }
    return this.adapter.getChainId();
  }
  // ... other ProviderAdapter methods
}
```

## 4. Non-Functional Requirements

- **RPC Availability**: The SDK assumes the user provides a valid and accessible RPC endpoint for the target blockchain network (e.g., Celo).
- **Performance**: Interactions with the blockchain are subject to network latency. The SDK should strive to minimize unnecessary calls and optimize data fetching. Lazy loading of providers contributes to faster initial SDK load times.
- **Extensibility**: The SDK should be designed to easily support new blockchain providers or additional Mento Protocol features in the future. The proxy adapter pattern is a key enabler for this.
- **Optional Peer Dependencies**: Provider libraries (ethers.js v5/v6, viem) are optional peer dependencies. Users only need to install the library for the provider they intend to use. The SDK should handle cases where a chosen provider's library is not installed gracefully.

## 5. Proposed Implementation Steps (for AI)

These steps outline how an AI agent could extend, test, or refactor the SDK:

### 5.1. Adding a New Provider Adapter:

1.  **Understand `ProviderAdapter`**: Analyze `src/types/provider.ts` to understand the required methods (`readContract`, `getChainId`, etc.).
2.  **Create Implementation**: In `src/adapters/implementations/`, create `newProviderAdapter.ts`. Implement the `ProviderAdapter` interface using the new provider's specific APIs.
3.  **Create Proxy**: In `src/adapters/proxies/`, create `newProviderAdapterProxy.ts`.
    - Implement the `ProviderAdapter` interface.
    - Use dynamic `import()` to lazy-load `newProviderAdapter.ts`.
    - Include constructor logic to accept the new provider's instance.
    - Add error handling for cases where the new provider's library isn't installed.
4.  **Update Adapter Index**: Modify `src/adapters/index.ts` to export the new proxy (`NewProviderAdapterProxy`).
5.  **Add Peer Dependency**: Update `package.json` to include the new provider library as an optional peer dependency.
6.  **Documentation**: Update documentation (including this file and `src/adapters/proxies/README.md`) to reflect the new provider support.
7.  **Testing**: Add unit and integration tests for the new adapter and proxy.

### 5.2. Adding a New Contract Interaction:

1.  **Add ABI**: If a new contract is involved, add its ABI to `src/abis/`.
2.  **Update Addresses**: Add the new contract's address to `src/constants/addresses.ts` and its type to `src/types/contractAddresses.ts`.
3.  **Create Wrapper Function**: In the relevant service module (e.g., `src/services/StableTokenService.ts`), create a new method.
    - This method will use the `ProviderAdapter`'s `readContract` (or `writeContract` if applicable) method.
    - Construct the `ContractCallOptions` object with the contract address, ABI, function name, and arguments.
4.  **Expose via SDK Facade**: Expose the new function through the main `Mento` class in `src/index.ts`.
5.  **Testing**: Add unit tests, potentially using mock providers, and integration tests against a testnet or local node.

### 5.3. Refactoring an Existing Module:

1.  **Identify Scope**: Clearly define the module or functionality to be refactored.
2.  **Analyze Dependencies**: Understand how the target module interacts with other parts of the SDK, especially provider adapters and contract wrappers.
3.  **Ensure Test Coverage**: Verify that existing tests adequately cover the functionality being refactored. Add more tests if necessary.
4.  **Perform Refactoring**: Apply changes, keeping the `ProviderAdapter` interface and other core abstractions in mind.
5.  **Run Tests**: Continuously run tests to ensure no regressions are introduced.
6.  **Review**: If possible, have the changes reviewed by another developer or a senior AI.

## 6. Acceptance Criteria

The Mento SDK is considered properly implemented and usable when:

- [x] It can be initialized with supported providers (ethers.js v5/v6, viem) using the proxy adapter pattern.
- [x] Initialization fails gracefully with a clear error message if a required provider library is not installed.
- [x] Core read-only functionalities (querying stable tokens, collateral assets) work as expected with each supported provider.
- [ ] **Key write transactions (e.g., swap in, swap out) are implemented and functional within the new service-layer architecture.**
- [ ] **Swap methods are compatible with and successfully execute across all supported provider adapters (ethers.js v5/v6, viem).**
- [ ] The SDK successfully abstracts low-level contract calls for both read and key write operations.
- [ ] All public methods, including new swap functions, are well-documented with TypeDoc comments.
- [ ] Unit and integration tests cover a significant portion of the SDK's functionality, **with specific, robust integration tests for swap-in and swap-out operations across all providers.**
- [x] The SDK can connect to and interact with Mento Protocol smart contracts on a designated network (e.g., Celo mainnet or Alfajores testnet) for both read and write operations.
- [x] The proxy adapters correctly lazy-load their respective provider implementations.
- [ ] **A V2 Release Candidate, incorporating the functional swap methods, is successfully merged to the `main` branch.**
- [ ] **Gas estimation for swap transactions is handled appropriately for each provider, or a clear strategy for manual gas input is provided.**
- [ ] Error handling for swap transactions is robust, providing clear feedback to the developer for common issues (e.g., insufficient balance, slippage, network errors).

## 7. Validation

Validation of the SDK's functionality and correctness can be achieved through several methods:

- **CLI Commands for Testing**:
  - `pnpm test`: Runs all unit and integration tests.
  - `pnpm test:unit`: Runs only unit tests.
  - `pnpm test:integration`: Runs only integration tests (requires a configured environment, often a local node or testnet RPC).
- **Logging**: Incorporate logging within the SDK (potentially optional/configurable) to trace calls and diagnose issues during development or for advanced users.
- **Mock-Based Tests**: Unit tests should heavily rely on mock providers and mock contract call responses to isolate functionality and ensure deterministic test outcomes. Examples can be found in `tests/unit/`.
- **Real Provider Interaction (Integration Tests)**: Integration tests should use real provider instances (ethers.js, viem) to connect to a testnet (e.g., Celo Alfajores) or a local development node. This validates the end-to-end interaction with actual smart contracts.
  - Ensure test accounts have sufficient funds for transactions if testing write operations.
- **Example Code Snippets**: Maintain and test example code snippets (like the Quick Start below) to ensure they are functional and up-to-date.

### Quick Start Examples (from `README.md`)

#### Initialize with Viem

```typescript
import { createPublicClient, http } from 'viem'
import { celo } from 'viem/chains'
import { Mento } from '@mento/sdk'

// Create Viem client
const provider = createPublicClient({
  chain: celo,
  transport: http(),
})

// Initialize Mento SDK
const mento = new Mento({ provider })

// Use the SDK
const stableTokens = await mento.stable.getStableTokens()
console.log('Stable Tokens:', stableTokens)
```

#### Initialize with Ethers.js

```typescript
import { JsonRpcProvider } from 'ethers'
import { Mento } from '@mento/sdk'

// Create Ethers provider
const provider = new JsonRpcProvider('YOUR_RPC_URL') // Replace with your Celo RPC URL

// Initialize Mento SDK
const mento = new Mento({ provider })

// Use the SDK
const collateralAssets = await mento.collateral.getCollateralAssets()
console.log('Collateral Assets:', collateralAssets)
```
