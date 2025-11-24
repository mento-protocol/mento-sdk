# Quickstart: Write Transaction Support

This guide shows how to use the Mento SDK's write transaction capabilities across Ethers v5, Ethers v6, and Viem providers.

## Installation

```bash
# Install Mento SDK
pnpm add @mento-protocol/mento-sdk

# Install your preferred provider (choose one or more)
pnpm add ethers@5  # For Ethers v5
pnpm add ethers@6  # For Ethers v6
pnpm add viem      # For Viem
```

## Basic Usage

### With Ethers v6

```typescript
import { Mento } from '@mento-protocol/mento-sdk'
import { ethers } from 'ethers'

// Setup provider and signer
const provider = new ethers.JsonRpcProvider('https://forno.celo.org')
const signer = new ethers.Wallet(privateKey, provider)

// Initialize SDK with write support
const mento = Mento.create({
  provider,
  signer, // Add signer for write operations
})

// Execute token approval
const tx = await mento.writeContract({
  address: '0x...', // Token address
  abi: ['function approve(address spender, uint256 amount)'],
  functionName: 'approve',
  args: [brokerAddress, ethers.parseUnits('100', 18)],
})

console.log('Transaction submitted:', tx.hash)

// Wait for confirmation
const receipt = await tx.wait()
if (receipt.status === 'success') {
  console.log('Approval confirmed!')
}
```

### With Ethers v5

```typescript
import { Mento } from '@mento-protocol/mento-sdk'
import { ethers } from 'ethers'

// Setup provider and signer
const provider = new ethers.providers.JsonRpcProvider('https://forno.celo.org')
const signer = new ethers.Wallet(privateKey, provider)

// Initialize SDK (same API as v6)
const mento = Mento.create({
  provider,
  signer,
})

// Execute approval (same API as v6)
const tx = await mento.writeContract({
  address: tokenAddress,
  abi: ['function approve(address spender, uint256 amount)'],
  functionName: 'approve',
  args: [brokerAddress, ethers.utils.parseUnits('100', 18)],
})

const receipt = await tx.wait()
```

### With Viem

```typescript
import { Mento } from '@mento-protocol/mento-sdk'
import { createWalletClient, http } from 'viem'
import { celoAlfajores } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'

// Setup wallet client (combines provider + signer)
const account = privateKeyToAccount(privateKey)
const walletClient = createWalletClient({
  account,
  chain: celoAlfajores,
  transport: http(),
})

// Initialize SDK with wallet client
const mento = Mento.create({
  provider: walletClient, // WalletClient has both read and write
})

// Execute approval
const tx = await mento.writeContract({
  address: tokenAddress,
  abi: [
    {
      type: 'function',
      name: 'approve',
      inputs: [
        { name: 'spender', type: 'address' },
        { name: 'amount', type: 'uint256' },
      ],
    },
  ],
  functionName: 'approve',
  args: [brokerAddress, 100000000000000000000n], // 100 tokens (18 decimals)
})

const receipt = await tx.wait()
```

## Common Patterns

### 1. Gas Estimation

```typescript
// Estimate gas before submitting
const estimatedGas = await mento.estimateGas({
  address: tokenAddress,
  abi: ['function approve(address spender, uint256 amount)'],
  functionName: 'approve',
  args: [spenderAddress, amount],
})

console.log(`Estimated gas: ${estimatedGas}`)

// Add 20% buffer and submit
const tx = await mento.writeContract({
  address: tokenAddress,
  abi: ['function approve(address spender, uint256 amount)'],
  functionName: 'approve',
  args: [spenderAddress, amount],
  gasLimit: (estimatedGas * 120n) / 100n, // Add 20% buffer
})
```

### 2. Custom Gas Parameters

```typescript
// Legacy gas price (pre-EIP-1559)
const tx = await mento.writeContract({
  address: tokenAddress,
  abi: ['function approve(address spender, uint256 amount)'],
  functionName: 'approve',
  args: [spenderAddress, amount],
  gasPrice: 5000000000n, // 5 gwei
})

// EIP-1559 (Ethereum mainnet, Polygon, etc.)
const tx = await mento.writeContract({
  address: tokenAddress,
  abi: ['function approve(address spender, uint256 amount)'],
  functionName: 'approve',
  args: [spenderAddress, amount],
  maxFeePerGas: 50000000000n, // 50 gwei max
  maxPriorityFeePerGas: 2000000000n, // 2 gwei tip
})
```

### 3. Transaction Status Tracking

```typescript
// Submit transaction
const tx = await mento.writeContract({...});

console.log('Transaction hash:', tx.hash);

// Option 1: Wait for specific confirmations
const receipt = await tx.wait(3);  // Wait for 3 confirmations
console.log('Confirmed in block:', receipt.blockNumber);

// Option 2: Poll for receipt
while (true) {
  const receipt = await tx.getReceipt();
  if (receipt) {
    console.log('Transaction mined!');
    break;
  }
  await new Promise(resolve => setTimeout(resolve, 1000));
}
```

### 4. Error Handling

```typescript
import {
  ValidationError,
  ExecutionError,
  NetworkError
} from '@mento-protocol/mento-sdk';

try {
  const tx = await mento.writeContract({...});
  const receipt = await tx.wait();

  if (receipt.status === 'failed') {
    console.error('Transaction reverted:', receipt.revertReason);
  }
} catch (error) {
  if (error instanceof ValidationError) {
    // Pre-submission error (no gas cost)
    console.error('Validation failed:', error.message);
    console.error('Fix:', error.reason);
  } else if (error instanceof ExecutionError) {
    // On-chain error (gas consumed)
    console.error('Transaction reverted:', error.message);
    console.error('Transaction hash:', error.hash);
    console.error('Revert reason:', error.revertReason);
  } else if (error instanceof NetworkError) {
    // Network error (may be retry-able)
    if (error.retry) {
      console.log('Network error, retrying...');
      // Implement retry logic
    }
  }
}
```

### 5. Read-Only Mode (Backward Compatible)

```typescript
// Initialize without signer (read-only mode)
const mento = Mento.create({
  provider: ethersProvider  // No signer
});

// Read operations work
const balance = await mento.readContract({
  address: tokenAddress,
  abi: ['function balanceOf(address) view returns (uint256)'],
  functionName: 'balanceOf',
  args: [userAddress]
});

// Write operations throw ValidationError
try {
  await mento.writeContract({...});
} catch (error) {
  console.error(error.message);
  // "Signer required for write operations. Initialize SDK with signer parameter."
}
```

## Complete Example: Token Approval Workflow

```typescript
import {
  Mento,
  ValidationError,
  ExecutionError,
} from '@mento-protocol/mento-sdk'
import { ethers } from 'ethers'

async function approveToken(
  tokenAddress: string,
  spenderAddress: string,
  amount: bigint
) {
  // Setup
  const provider = new ethers.JsonRpcProvider('https://forno.celo.org')
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider)

  const mento = Mento.create({ provider, signer })

  const abi = ['function approve(address spender, uint256 amount)']

  try {
    // Step 1: Estimate gas
    console.log('Estimating gas...')
    const estimatedGas = await mento.estimateGas({
      address: tokenAddress,
      abi,
      functionName: 'approve',
      args: [spenderAddress, amount],
    })

    console.log(`Estimated gas: ${estimatedGas}`)

    // Step 2: Submit transaction with gas buffer
    console.log('Submitting transaction...')
    const tx = await mento.writeContract({
      address: tokenAddress,
      abi,
      functionName: 'approve',
      args: [spenderAddress, amount],
      gasLimit: (estimatedGas * 120n) / 100n, // 20% buffer
    })

    console.log(`Transaction submitted: ${tx.hash}`)
    console.log(`View on explorer: https://celoscan.io/tx/${tx.hash}`)

    // Step 3: Wait for confirmation
    console.log('Waiting for confirmation...')
    const receipt = await tx.wait()

    if (receipt.status === 'success') {
      console.log('✅ Approval confirmed!')
      console.log(`Block: ${receipt.blockNumber}`)
      console.log(`Gas used: ${receipt.gasUsed}`)
      console.log(`Cost: ${receipt.gasUsed * receipt.effectiveGasPrice} wei`)
      return receipt
    } else {
      console.error('❌ Transaction failed:', receipt.revertReason)
      throw new Error('Approval failed')
    }
  } catch (error) {
    if (error instanceof ValidationError) {
      console.error('❌ Validation error:', error.message)
      console.error('Suggestion:', error.reason)
    } else if (error instanceof ExecutionError) {
      console.error('❌ Transaction reverted:', error.revertReason)
      console.error('Transaction hash:', error.hash)
    } else {
      console.error('❌ Unexpected error:', error)
    }
    throw error
  }
}

// Usage
approveToken(
  '0x...', // cUSD token address
  '0x...', // Broker contract address
  ethers.parseUnits('100', 18) // 100 tokens
)
```

## Provider Comparison

| Feature                  | Ethers v5         | Ethers v6         | Viem            |
| ------------------------ | ----------------- | ----------------- | --------------- |
| **Initialization**       | Provider + Signer | Provider + Signer | WalletClient    |
| **BigInt Support**       | BigNumber         | BigInt (native)   | BigInt (native) |
| **ABI Format**           | String or JSON    | String or JSON    | JSON preferred  |
| **Gas Estimation**       | ✅                | ✅                | ✅              |
| **Custom Gas**           | ✅                | ✅                | ✅              |
| **Transaction Tracking** | ✅                | ✅                | ✅              |
| **Error Normalization**  | ✅                | ✅                | ✅              |

**All providers have identical SDK APIs** - switch providers by changing initialization code only!

## Best Practices

1. **Always estimate gas** before submitting transactions in production
2. **Add a buffer** (10-20%) to estimated gas to account for state changes
3. **Handle all error types** (Validation, Execution, Network)
4. **Wait for confirmations** (1+ blocks) before considering transaction final
5. **Validate inputs** (addresses, amounts) before submission
6. **Log transaction hashes** for debugging and user tracking
7. **Use read-only mode** when signer not needed (saves initialization cost)
8. **Check receipt status** - successful submission doesn't mean successful execution

## Next Steps

- See [data-model.md](data-model.md) for complete type definitions
- See [contracts/](contracts/) for full API contracts
- See [research.md](research.md) for technical decisions and patterns
- See main SDK README for complete feature documentation

## Migration Guide

### From Read-Only SDK

```typescript
// Before (read-only)
const mento = Mento.create({ provider });
const balance = await mento.readContract({...});

// After (with write support)
const mento = Mento.create({ provider, signer });  // Add signer
const balance = await mento.readContract({...});    // Still works
const tx = await mento.writeContract({...});         // New capability
```

### From Direct Provider Usage

```typescript
// Before (direct ethers usage)
const contract = new ethers.Contract(address, abi, signer)
const tx = await contract.approve(spender, amount)
await tx.wait()

// After (Mento SDK)
const mento = Mento.create({ provider, signer })
const tx = await mento.writeContract({
  address,
  abi,
  functionName: 'approve',
  args: [spender, amount],
})
await tx.wait()

// Benefits:
// - Provider-agnostic (works with Ethers v5/v6, Viem)
// - Normalized errors across providers
// - Built-in retry logic
// - Consistent API with read operations
```
