# Cache Tradable Pairs Script

This script generates cached tradable pair data for the Mento SDK by fetching exchange data from the blockchain and computing spread information.

## Purpose

The cached pairs provide:

- Instant access to tradable pairs without blockchain queries
- Pre-computed spread data for optimal route selection
- Support for direct, two-hop, and eligible three-hop trading routes

## Usage

### Cache all networks

```bash
pnpm cacheRoutes
```

### Cache a specific network

```bash
# By network name
pnpm cacheRoutes --network celo
pnpm cacheRoutes -n celo-sepolia

# By chain ID
pnpm cacheRoutes --chainId 42220
pnpm cacheRoutes -c 11142220
```

### Control batch size

```bash
# Adjust concurrent request batch size (default: 10)
pnpm cacheRoutes --batchSize 5
pnpm cacheRoutes -b 20
```

## Supported Networks

| Network       | Chain ID |
| ------------- | -------- |
| Celo Mainnet  | 42220    |
| Celo Sepolia  | 11142220 |
| Monad         | 143      |
| Monad Testnet | 10143    |
| Polygon       | 137      |
| Polygon Amoy  | 80002    |
| Base Sepolia  | 84532    |

## Output

The script generates `src/cache/routes.ts`.

The cache contains routes for every supported chain. A route entry includes:

- Pair ID (for example, `cEUR-cUSD`)
- Endpoint tokens with addresses and symbols
- Ordered exchange path with one to three hops
- Spread data with total and per-hop percentages

## How It Works

1. **Discover pools** through `PoolService`
2. **Generate all routes** with a maximum of three hops
   - A three-hop route is eligible only when no direct or two-hop path connects
     the same endpoint pair in the discovered pool graph.
   - Paths cannot repeat a token or pool.
   - A path and its reverse are cached once.
3. **Deduplicate routes** before pool-cost reads
4. **Fetch spread data** from pool configurations
5. **Sort by spread** (lowest/best first)
6. **Write the cache file** in TypeScript format

Pool-cost reads are memoized for one chain-generation run. A failed read is
removed from the memo so a retry pass can fetch it again. Pool discovery and
cost failures remain fail-closed: the script refuses to write a partial route
set.

## When to Regenerate

Run this script when:

- New exchanges are added to the protocol
- Pool spreads are updated
- Supporting a new network
- Releasing a new SDK version
