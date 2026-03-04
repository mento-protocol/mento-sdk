# Mento SDK

A TypeScript SDK for interacting with the [Mento Protocol](https://www.mento.org/). Provides a simple interface for token swaps, liquidity management, borrowing, and trading status queries.

## Installation

```bash
npm install @mento-protocol/mento-sdk viem
# or
pnpm add @mento-protocol/mento-sdk viem
```

`viem` is a peer dependency required for blockchain interactions.

## Quick Start

```typescript
import { Mento, ChainId, deadlineFromMinutes } from '@mento-protocol/mento-sdk'
import { parseUnits } from 'viem'

// Initialize the SDK (uses default public RPC)
const mento = await Mento.create(ChainId.CELO)

// Or with a custom RPC URL
const mento = await Mento.create(ChainId.CELO, 'https://your-rpc-url.com')

// Or with an existing viem PublicClient
const mento = await Mento.create(ChainId.CELO, yourPublicClient)
```

## Services

The SDK is organized into service namespaces:

| Service | Description |
|---------|-------------|
| `mento.tokens` | Query stable tokens and collateral assets |
| `mento.pools` | Discover and inspect liquidity pools |
| `mento.routes` | Find trading routes (direct and multi-hop) |
| `mento.quotes` | Get expected swap output amounts |
| `mento.swap` | Build swap transactions with approvals |
| `mento.trading` | Check circuit breakers and trading limits |
| `mento.liquidity` | Add/remove liquidity, zap in/out |
| `mento.borrow` | Open, adjust, and close troves |

## Token Queries

```typescript
// Get all Mento stable tokens
const stableTokens = await mento.tokens.getStableTokens()

// Get all collateral assets
const collateral = await mento.tokens.getCollateralAssets()
```

## Swaps

```typescript
const USDm = '0x765DE816845861e75A25fCA122bb6898B8B1282a'
const CELO = '0x471EcE3750Da237f93B8E339c536989b8978a438'

// Get a quote
const amountIn = parseUnits('100', 18)
const expectedOut = await mento.quotes.getAmountOut(USDm, CELO, amountIn)

// Build a swap transaction (includes approval if needed)
const { approval, swap } = await mento.swap.buildSwapTransaction(
  USDm,
  CELO,
  amountIn,
  recipientAddress,
  ownerAddress,
  { slippageTolerance: 0.5, deadline: deadlineFromMinutes(5) }
)

// Execute with any viem wallet client
if (approval) {
  await walletClient.sendTransaction(approval)
}
await walletClient.sendTransaction(swap.params)
```

## Routes

```typescript
// Find a route between two tokens
const route = await mento.routes.findRoute(USDm, CELO)
console.log(`Hops: ${route.path.length}`)

// Get all tradable routes (uses pre-generated cache by default)
const routes = await mento.routes.getRoutes()

// Generate fresh routes from blockchain
const freshRoutes = await mento.routes.getRoutes({ cached: false })
```

## Trading Status

```typescript
// Check if a pair is tradable (circuit breaker check)
const isTradable = await mento.trading.isPairTradable(USDm, CELO)

// Get full tradability status for a pool
const pools = await mento.pools.getPools()
const status = await mento.trading.getPoolTradabilityStatus(pools[0])

if (!status.circuitBreakerOk) {
  console.log('Trading suspended by circuit breaker')
} else if (!status.limitsOk) {
  console.log('Trading limit reached')
}
```

## Liquidity

```typescript
// Add liquidity to a pool
const { approvalA, approvalB, addLiquidity } = await mento.liquidity.buildAddLiquidityTransaction({
  poolAddress,
  tokenA,
  amountA,
  tokenB,
  amountB,
  recipient,
  owner,
  options: { slippageTolerance: 0.5, deadline: deadlineFromMinutes(5) },
})

// Execute approvals if needed, then add liquidity
if (approvalA) await walletClient.sendTransaction(approvalA.params)
if (approvalB) await walletClient.sendTransaction(approvalB.params)
await walletClient.sendTransaction(addLiquidity.params)

// Zap in with a single token
const { approval: zapApproval, zapIn } = await mento.liquidity.buildZapInTransaction({
  poolAddress,
  tokenIn,
  amountIn,
  amountInSplit: 0.5, // split ratio
  recipient,
  owner,
  options: { slippageTolerance: 0.5, deadline: deadlineFromMinutes(5) },
})

if (zapApproval) await walletClient.sendTransaction(zapApproval.params)
await walletClient.sendTransaction(zapIn.params)

// Get LP token balance
const balance = await mento.liquidity.getLPTokenBalance(poolAddress, owner)
```

## Borrowing

```typescript
import { parseUnits } from 'viem'

// Open a trove (borrow against collateral)
const openTx = await mento.borrow.buildOpenTroveTransaction('USDm', {
  owner: ownerAddress,
  ownerIndex: 0,
  collAmount: parseUnits('10', 18),
  boldAmount: parseUnits('1000', 18),
  annualInterestRate: parseUnits('0.05', 18), // 5%
  maxUpfrontFee: parseUnits('100', 18),
})

// Get trove data
const trove = await mento.borrow.getTroveData('USDm', troveId)

// Get system parameters
const params = await mento.borrow.getSystemParams('USDm')

// Predict upfront fee before opening
const fee = await mento.borrow.predictOpenTroveUpfrontFee(
  'USDm',
  parseUnits('1000', 18),
  parseUnits('0.05', 18)
)
```

## Supported Chains

| Chain | Chain ID | Constant |
|-------|----------|----------|
| Celo Mainnet | 42220 | `ChainId.CELO` |
| Celo Sepolia | 11142220 | `ChainId.CELO_SEPOLIA` |

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Run tests
pnpm test

# Lint
pnpm lint
```

### Cache Generation

The SDK ships with pre-generated route and token caches for fast startup:

```bash
pnpm cacheRoutes
pnpm cacheTokens
```

Override RPC URLs via environment variables:

```bash
CELO_RPC_URL=https://your-rpc.com pnpm cacheRoutes
CELO_SEPOLIA_RPC_URL=https://your-sepolia-rpc.com pnpm cacheTokens
```

## License

MIT
