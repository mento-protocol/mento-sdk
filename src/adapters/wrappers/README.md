# Provider Adapter Wrappers

## Overview

The wrapper classes in this directory implement a lazy loading pattern for provider adapters. This pattern is crucial for the SDK's flexibility and user experience.

## Why Wrappers?

### 1. Optional Peer Dependencies

The SDK supports multiple providers (ethers v5/v6, viem) but doesn't force users to install all of them. Each provider is marked as an optional peer dependency in package.json. This means:

- Users can choose which provider they want to use
- Package size is minimized by only installing necessary dependencies
- No version conflicts between different ethers versions

### 2. Lazy Loading

Wrappers defer loading the actual adapter implementation until it's needed. This provides several benefits:

- If a user only imports the SDK but never calls any methods, the provider libraries are never loaded
- Memory efficiency as unused adapters are not initialized
- Faster initial SDK initialization
- Better tree-shaking in build tools

### 3. Better Developer Experience

Users can initialize the SDK without worrying about which provider dependencies are installed:

- Clear error messages when trying to use functionality with missing dependencies
- Type safety is maintained through TypeScript interfaces
- No need to catch import errors at the application level
- Simplified provider configuration

## Implementation Pattern

Each wrapper follows the same pattern:

### Basic Structure
```typescript
export class EthersAdapterWrapper implements ProviderAdapter {
  private adapter: ProviderAdapter | null = null;
  
  constructor(provider: EthersProvider) {
    const loadAdapter = async () => {
      try {
        const { EthersAdapter } = await import('../implementations/ethersAdapter');
        this.adapter = new EthersAdapter(provider);
      } catch (error) {
        throw new Error('ethers is not installed. Please install ethers to use this adapter');
      }
    };
    
    loadAdapter();
  }
}
```

### Key Components

1. **Interface Implementation**
   - Each wrapper implements the `ProviderAdapter` interface
   - Ensures type safety and consistent API across all adapters

2. **Dynamic Imports**
   - Uses `import()` syntax for lazy loading
   - Wrapped in try-catch for graceful error handling
   - Clear error messages guide users to install missing dependencies

3. **Error Handling**
   - Initialization errors are caught and reported
   - Runtime checks ensure adapter is loaded before use
   - Descriptive error messages help troubleshoot issues

## Example Usage

### Basic Initialization
```typescript
import { Mento } from '@mento-protocol/mento-sdk';
import { providers } from 'ethers';

// Works even if viem or ethers v5 aren't installed
const provider = new providers.JsonRpcProvider('YOUR_RPC_URL');
const mento = new Mento({ provider });
```

### Error Handling
```typescript
// If ethers v5 isn't installed but code tries to use v5-specific features:
try {
  await mento.someEthersV5SpecificMethod();
} catch (error) {
  console.error('Need to install ethers v5:', error.message);
}
```

## Available Wrappers

- `EthersAdapter` - For ethers v6
- `EthersV5Adapter` - For ethers v5
- `ViemAdapter` - For viem

## Implementation Files

- `ethersWrapper.ts` - Ethers v6 adapter wrapper
- `ethersV5Wrapper.ts` - Ethers v5 adapter wrapper
- `viemWrapper.ts` - Viem adapter wrapper

## Best Practices

1. **Dependency Installation**
   ```bash
   
   # Install only what you need
   npm install ethers    # For ethers v6
   # OR
   npm install ethers@5  # For ethers v5
   # OR
   npm install viem      # For viem
   ```

2. **Error Handling**
   - Always catch potential initialization errors
   - Check for specific provider availability before using provider-specific features
   - Use typescript to catch type errors at compile time

3. **Performance Optimization**
   - Initialize providers early in your application
   - Reuse provider instances when possible
   - Let the lazy loading handle dependency availability

## Contributing

When adding new provider support:

1. Create a new wrapper class following the existing pattern
2. Add appropriate error messages for missing dependencies
3. Update the main adapter index to export the new wrapper
4. Add corresponding peer dependencies to package.json