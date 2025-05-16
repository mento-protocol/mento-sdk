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

### Swap Functionality

The SDK provides comprehensive swap functionality, supporting exchanges between collateral assets and stable tokens:

#### Provider-Specific Setup for Write Operations

Before executing swaps, ensure your provider is set up with the appropriate signing capabilities:

**With Ethers v6:**
```typescript
import { JsonRpcProvider, Wallet } from 'ethers'
import { Mento } from '@mento/sdk'

// Create a provider with a signer
const provider = new JsonRpcProvider('YOUR_RPC_URL')
const wallet = new Wallet('YOUR_PRIVATE_KEY', provider)

// Initialize Mento SDK with the provider+signer
const mento = await Mento.create({ provider: wallet })
```

**With Ethers v5:**
```typescript
import { providers, Wallet } from 'ethers-v5'
import { Mento } from '@mento/sdk'

// Create a provider with a signer
const provider = new providers.JsonRpcProvider('YOUR_RPC_URL')
const wallet = new Wallet('YOUR_PRIVATE_KEY', provider)

// Initialize Mento SDK with the provider+signer
const mento = await Mento.create({ provider: wallet })
```

**With Viem:**
```typescript
import { createPublicClient, createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { celo } from 'viem/chains'
import { Mento } from '@mento/sdk'

// Create public client
const publicClient = createPublicClient({
  chain: celo,
  transport: http('YOUR_RPC_URL')
})

// Create wallet client
const account = privateKeyToAccount('0x' + 'YOUR_PRIVATE_KEY')
const walletClient = createWalletClient({
  account,
  chain: celo,
  transport: http('YOUR_RPC_URL')
})

// Initialize Mento SDK
const mento = await Mento.create({ 
  provider: publicClient,
  viemAdapterConfig: { walletClient, account }
})
```

#### Swap In (Fixed Input)

Exchange a specific amount of input token for at least a minimum amount of output token:

```typescript
// Get estimated swap amounts
const amountOut = await mento.getAmountOut(
  celoAddress,
  cUsdAddress,
  '1000000000000000000' // 1 CELO with 18 decimals
)
console.log(`Expected amount out: ${amountOut}`)

// Calculate slippage (0.5% in this example)
const minAmountOut = (BigInt(amountOut) * BigInt(995)) / BigInt(1000)

// Execute the swap
const tx = await mento.swapIn(
  celoAddress, // tokenIn (CELO)
  cUsdAddress, // tokenOut (cUSD)
  '1000000000000000000', // amountIn (fixed)
  minAmountOut.toString(), // minimum acceptable output
  { gasLimit: '300000' } // Optional gas settings
)

// Wait for confirmation
const receipt = await tx.wait()
console.log('Swap completed!', receipt)
```

#### Swap Out (Fixed Output)

Get a specific amount of output token by spending at most a maximum amount of input token:

```typescript
// Get required input amount
const amountIn = await mento.getAmountIn(
  celoAddress,
  cUsdAddress,
  '1000000000000000000' // 1 cUSD with 18 decimals
)
console.log(`Required amount in: ${amountIn}`)

// Calculate slippage (0.5% in this example)
const maxAmountIn = (BigInt(amountIn) * BigInt(1005)) / BigInt(1000)

// Execute the swap
const tx = await mento.swapOut(
  celoAddress, // tokenIn (CELO)
  cUsdAddress, // tokenOut (cUSD)
  '1000000000000000000', // amountOut (fixed)
  maxAmountIn.toString(), // maximum acceptable input
  { gasLimit: '350000' } // Optional gas settings
)

// Wait for confirmation
const receipt = await tx.wait()
console.log('Swap completed!', receipt)
```

#### Gas Estimation

Estimate gas costs for a swap operation:

```typescript
const estimatedGas = await mento.estimateGas(
  'swapIn', // or 'swapOut'
  [celoAddress, cUsdAddress, '1000000000000000000', minAmountOut.toString()]
)
console.log(`Estimated gas: ${estimatedGas}`)

// Use the estimated gas in your transaction
const tx = await mento.swapIn(
  celoAddress,
  cUsdAddress,
  '1000000000000000000',
  minAmountOut.toString(),
  { gasLimit: estimatedGas }
)
```

## Agentic Coding with Claude Code

This project supports agentic coding practices using Claude Code to accelerate development and maintain high-quality standards. Follow these steps to get started:

1.  **Prerequisites:**

    - Ensure you have [Claude Code](https://docs.anthropic.com/en/docs/claude-code/overview) installed and configured globally.
    - Familiarize yourself with the project's coding standards and architectural patterns documented in `ai_docs/project-patterns.md`.

2.  **Workflow:**

    - **Start Claude Code:** Launch your Claude Code interface.
    - **Prime Context:**
      - In Claude Code, type `/prime`.
      - When prompted (or if your tool allows inline commands), execute the command defined in `.claude/commands/context_prime`. This will provide the AI with essential background information about the Mento SDK project.
    - **Generate Feature Specification:**
      - To create a new feature, first generate a detailed specification.
      - In Claude Code, type `/spec` and select the "generate spec" command/prompt.
      - Provide a clear description of the feature you want to implement. The AI will use the templates and examples in the `specs/` directory as a guide.
      - **Review and Refine:** Carefully review the generated spec. Edit and refine it to ensure it accurately and comprehensively captures the feature requirements, edge cases, and acceptance criteria.
    - **Implement Feature from Specification:**
      - Once the spec is finalized, instruct the AI to write the code.
      - In Claude Code, type `/spec` again, but this time select the "generate code from spec" command/prompt.
      - Provide the filename of the spec you just created (e.g., `specs/my-new-feature.md`). You might be able to provide this inline with the command or when prompted by the AI.
    - **Review Generated Code:**
      - Thoroughly review the code generated by the AI. Check for correctness, adherence to coding standards (`ai_docs/project-patterns.md`), and completeness against the spec.
      - Iterate with the AI if necessary, providing feedback for corrections or improvements.
    - **Create a Pull Request (PR):**
      - Once you are satisfied with the code, ask Claude Code to help you create a Pull Request.
      - Ensure the PR description is clear and links to the relevant spec.
      - The PR should then be reviewed by another team member before merging.

By following this workflow, you can leverage AI to handle boilerplate, draft implementations, and ensure consistency, allowing you to focus on the more complex and strategic aspects of development.

## Contributing

Contributions are welcome! Please read our contributing guidelines for details.

## License

MIT

---

For more detailed documentation and examples, visit our [documentation site](https://docs.mento.org).
