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

### Stable Tokens

Query Mento stable tokens:

```typescript
// Get all stable tokens
const tokens = await mento.getStableTokens()
```

### Collateral Assets

Retrieve collateral assets:

```typescript
// Get all collateral assets
const assets = await mento.getCollateralAssets()
```

## Contributing

Contributions are welcome! Please read our contributing guidelines for details.

## License

MIT

---

For more detailed documentation and examples, visit our [documentation site](https://docs.mento.org).
