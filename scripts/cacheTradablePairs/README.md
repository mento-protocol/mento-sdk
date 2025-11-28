# Cache Tradable Pairs Script

This script generates cached tradable pair data for the Mento SDK by fetching exchange data from the blockchain and computing spread information.

## Purpose

The cached pairs provide:

- Instant access to tradable pairs without blockchain queries
- Pre-computed spread data for optimal route selection
- Support for both direct and multi-hop trading routes

## Usage

### Cache all networks

```bash
pnpm cacheTradablePairs
```

### Cache specific network

```bash
# By network name
pnpm cacheTradablePairs --network celo
pnpm cacheTradablePairs -n celo-sepolia

# By chain ID
pnpm cacheTradablePairs --chainId 42220
pnpm cacheTradablePairs -c 11142220
```

### Control batch size

```bash
# Adjust concurrent request batch size (default: 10)
pnpm cacheTradablePairs --batchSize 5
pnpm cacheTradablePairs -b 20
```

## Supported Networks

| Network      | Chain ID   |
| ------------ | ---------- |
| Celo Mainnet | 42220      |
| Celo Sepolia | 11142220   |

## Output

The script generates TypeScript files in `src/constants/`:

- `tradablePairs.42220.ts` - Celo mainnet pairs
- `tradablePairs.11142220.ts` - Celo Sepolia testnet pairs

Each file exports a `TradablePairWithSpread[]` array containing:

- Pair ID (e.g., "cEUR-cUSD")
- Token assets with addresses and symbols
- Exchange path (hops for routing)
- Spread data (total percentage and per-hop breakdown)

## How It Works

1. **Fetch exchanges** from BiPoolManager via ExchangeService
2. **Generate all routes** including direct and 2-hop paths
3. **Fetch spread data** from pool configurations
4. **Deduplicate routes** removing symmetric duplicates
5. **Sort by spread** (lowest/best first)
6. **Write cache file** in TypeScript format

## When to Regenerate

Run this script when:

- New exchanges are added to the protocol
- Pool spreads are updated
- Supporting a new network
- Releasing a new SDK version
