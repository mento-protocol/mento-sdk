# Provider Adapter Proxies

## Overview

The proxy classes in this directory implement the Virtual Proxy pattern for provider adapters. This pattern makes the SDK flexibile and provides a better user experience, allowing lazy loading of blockchain provider dependencies.

## Why Virtual Proxy Pattern?

### 1. Optional Peer Dependencies

The SDK supports multiple providers (ethers v5/v6, viem) but doesn't force users to install all of them. Each provider is marked as an optional peer dependency in package.json. This means:

- Users can choose which provider they want to use
- Package size is minimized by only installing necessary dependencies
- No version conflicts between different ethers versions

### 2. Lazy Loading Through Virtual Proxy

The Virtual Proxy pattern defers loading the actual adapter implementation until it's needed:

- If a user only imports the SDK but never calls any methods, the provider libraries are never loaded
- Memory efficiency as unused adapters are not initialized
- Faster initial SDK initialization

### 3. Better Developer Experience

Users can initialize the SDK without worrying about which provider dependencies are installed:

- Clear error messages when trying to use functionality with missing dependencies
- Type safety is maintained through TypeScript interfaces
- Proxy handles all initialization complexity
- Simplified provider configuration

## Implementation Pattern

Each proxy follows the Virtual Proxy pattern:

### Basic Structure

```typescript
export class EthersV5AdapterProxy implements ProviderAdapter {
  private adapter: ProviderAdapter | null = null
  private initPromise: Promise<void>

  constructor(provider: EthersV5Providers.Provider) {
    this.initPromise = this.initialize(provider)
  }

  private async initialize(provider: EthersV5Providers.Provider) {
    try {
      const { EthersV5Adapter } = await import(
        '../implementations/ethersV5Adapter'
      )
      this.adapter = new EthersV5Adapter(provider)
    } catch (error) {
      throw new Error(
        'ethers v5 is not installed. Please install ethers@5 to use this adapter'
      )
    }
  }
}
```

### Key Components

1. **Interface Implementation**

   - Each proxy implements the `ProviderAdapter` interface
   - Acts as a surrogate for the real adapter
   - Maintains the same contract as the real adapter

2. **Dynamic Imports in Virtual Proxy**

   - Uses `import()` syntax for lazy loading
   - Proxy handles the initialization logic
   - Only loads the real implementation when methods are called

3. **Error Handling**
   - Initialization errors are caught and reported
   - Runtime checks ensure adapter is loaded before use
   - Descriptive error messages help troubleshoot issues

## Example Usage

### Basic Initialization

```typescript
import { Mento } from '@mento-protocol/mento-sdk'
import { providers } from 'ethers'

// Create SDK instance with proxy-wrapped provider
const mento = await Mento.create({
  provider: new providers.JsonRpcProvider('YOUR_RPC_URL'),
})

// First call will trigger lazy loading
const stableTokens = await mento.getStableTokens()
```

## Available Proxies

- `EthersAdapterProxy` - Virtual proxy for ethers v6 adapter
- `EthersV5AdapterProxy` - Virtual proxy for ethers v5 adapter
- `ViemAdapterProxy` - Virtual proxy for viem adapter

## Implementation Classes

- `ethersAdapter.ts` - Ethers v6 adapter
- `ethersV5Adapter.ts` - Ethers v5 adapter
- `viemAdapter.ts` - Viem adapter

## Contributing

When adding new provider support:

1. Create the actual adapter implementation in `implementations/`
2. Create a proxy class following the Virtual Proxy pattern
3. Add appropriate error messages for missing dependencies
4. Update the main adapter index to export the proxy instead of the implementation
5. Add corresponding peer dependencies to package.json
