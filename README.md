# Mento SDK

A TypeScript SDK for interacting with the Mento protocol. This SDK provides a simple interface to interact with Mento's smart contracts, supporting both Ethers.js and Viem providers.

## Installation

```bash
npm install @mento/sdk
# or
yarn add @mento/sdk
# or
pnpm add @mento/sdk
```

## Quick Start

### Initialize with Viem

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

### Initialize with Ethers.js

```typescript
import { JsonRpcProvider } from 'ethers'
import { Mento } from '@mento/sdk'

// Create Ethers provider
const provider = new JsonRpcProvider('YOUR_RPC_URL')

// Initialize Mento SDK
const mento = new Mento({ provider })

// Use the SDK
const collateralAssets = await mento.collateral.getCollateralAssets()
console.log('Collateral Assets:', collateralAssets)
```

## Development Setup

### Project Setup

1. Clone the repository

```bash
git clone git@github.com:mento-protocol/mento-sdk.git
cd mento-sdk
```

2. Install dependencies

```bash
pnpm install
```

### Development Workflow

#### Build

```bash
pnpm build
```

#### Running Tests

```bash
# Run all tests
pnpm test
```

### Project Structure

```bash
├── src/
│   ├── abis/           # Contract ABIs
│   ├── adapters/       # Provider adapters (Ethers, Viem)
│   ├── constants/      # Constants and addresses
│   ├── services/       # Core services
│   ├── types/          # TypeScript type definitions
|   ├── utils/          # Utility functions
│   └── index.ts        # Main entry point
├── tests/
│   ├── unit/          # Unit tests
│   └── integration/   # Integration tests
```

## Features

### Read Operations

#### Stable Tokens

Query Mento stable tokens:

```typescript
// Get all stable tokens
const tokens = await mento.getStableTokens()
```

#### Collateral Assets

Retrieve collateral assets:

```typescript
// Get all collateral assets
const assets = await mento.getCollateralAssets()
```

### Write Operations

The SDK supports write transactions for submitting state-changing operations to the blockchain. Write operations require a signer (Ethers) or wallet client (Viem).

#### Setup for Write Operations

**With Viem:**

```typescript
import { createPublicClient, createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { celo } from 'viem/chains'
import { Mento } from '@mento/sdk'

// Create account from private key
const account = privateKeyToAccount('0x...')

// Create public and wallet clients
const publicClient = createPublicClient({
  chain: celo,
  transport: http('https://forno.celo.org'),
})

const walletClient = createWalletClient({
  account,
  chain: celo,
  transport: http('https://forno.celo.org'),
})

// Initialize SDK with write support
const mento = await Mento.create({
  provider: publicClient,
  signer: walletClient  // Add wallet client for write operations
})
```

**With Ethers v6:**

```typescript
import { JsonRpcProvider, Wallet } from 'ethers'
import { Mento } from '@mento/sdk'

// Create provider and signer
const provider = new JsonRpcProvider('https://forno.celo.org')
const signer = new Wallet('0x...', provider)

// Initialize SDK with write support
const mento = await Mento.create({
  provider,
  signer  // Add signer for write operations
})
```

#### Token Approval

Approve tokens for Mento protocol interactions:

```typescript
// Get the adapter (provider-agnostic)
const adapter = mento.getAdapter()

// Approve USDC for Mento Broker
const tx = await adapter.writeContract({
  address: '0x765DE816845861e75A25fCA122bb6898B8B1282a', // USDC on Celo
  abi: ['function approve(address spender, uint256 amount) returns (bool)'],
  functionName: 'approve',
  args: [
    '0x...',  // Spender address (e.g., Mento Broker)
    1000000n  // Amount (1 USDC with 6 decimals)
  ]
})

console.log('Transaction hash:', tx.hash)
console.log('From:', tx.from)
console.log('To:', tx.to)

// Wait for confirmation
const receipt = await tx.wait()
console.log('Transaction confirmed in block:', receipt.blockNumber)
console.log('Status:', receipt.status) // 'success' or 'failed'
```

#### Transaction Status Tracking

Monitor transaction status and confirmations:

```typescript
// Submit transaction
const tx = await adapter.writeContract({...})

// Check if transaction is mined (returns null if pending)
const receipt = await tx.getReceipt()
if (receipt) {
  console.log('Transaction mined!', receipt.blockNumber)
}

// Wait for specific number of confirmations
const confirmedReceipt = await tx.wait(3)  // Wait for 3 confirmations
console.log('Transaction confirmed after 3 blocks')
```

#### Gas Estimation

Estimate gas before submitting transactions:

```typescript
// Estimate gas for an approval
const estimatedGas = await adapter.estimateGas({
  address: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
  abi: ['function approve(address spender, uint256 amount) returns (bool)'],
  functionName: 'approve',
  args: ['0x...', 1000000n]
})

console.log('Estimated gas:', estimatedGas)  // Returns BigInt
```

#### Custom Gas Parameters

Customize gas parameters for transactions:

```typescript
// Legacy gas price (Type 0/1 transactions)
const tx = await adapter.writeContract({
  address: '0x...',
  abi: [...],
  functionName: 'approve',
  args: [...],
  gasLimit: 100000n,       // Custom gas limit
  gasPrice: 5000000000n,   // 5 gwei
})

// EIP-1559 (Type 2 transactions)
const tx = await adapter.writeContract({
  address: '0x...',
  abi: [...],
  functionName: 'approve',
  args: [...],
  gasLimit: 100000n,
  maxFeePerGas: 10000000000n,        // 10 gwei max
  maxPriorityFeePerGas: 2000000000n, // 2 gwei priority
})

// Custom nonce (for transaction ordering)
const tx = await adapter.writeContract({
  address: '0x...',
  abi: [...],
  functionName: 'approve',
  args: [...],
  nonce: 42n,  // Explicit nonce
})
```

#### Error Handling

The SDK provides detailed error information:

```typescript
import { ValidationError, ExecutionError, NetworkError } from '@mento/sdk'

try {
  const tx = await adapter.writeContract({...})
  const receipt = await tx.wait()
} catch (error) {
  if (error instanceof ValidationError) {
    // Pre-submission validation errors (no gas cost)
    console.error('Invalid parameters:', error.message)
  } else if (error instanceof ExecutionError) {
    // Transaction reverted on-chain (gas was consumed)
    console.error('Transaction failed:', error.message)
    console.error('Revert reason:', error.revertReason)
  } else if (error instanceof NetworkError) {
    // RPC/network errors
    console.error('Network error:', error.message)
    if (error.retry) {
      console.log('This error is retryable')
    }
  }
}
```

#### Utility Methods

Additional helper methods for write operations:

```typescript
// Get signer/wallet address
const address = await adapter.getSignerAddress()
console.log('Wallet address:', address)

// Get current nonce
const nonce = await adapter.getTransactionCount(address)
console.log('Next nonce:', nonce)
```

## Contributing

Contributions are welcome! Please read our contributing guidelines for details.

## License

MIT

---

For more detailed documentation and examples, visit our [documentation site](https://docs.mento.org).
