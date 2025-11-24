# Data Model: Exchange & Pool Discovery

**Feature**: 002-exchange-pool-discovery
**Date**: 2025-11-04

## Overview

This document defines the data structures for exchange and pool discovery in the v3 SDK. The model maintains compatibility with v1 while adapting types for the v3 architecture.

## Core Entities

### Exchange

Represents a liquidity pool between two tokens in the Mento protocol.

```typescript
interface Exchange {
  /**
   * The address of the exchange provider contract managing this pool
   * Must be a valid checksummed Ethereum address
   */
  providerAddr: string

  /**
   * Unique identifier for this exchange within the provider
   * Typically a bytes32 hex string (e.g., '0x1234...')
   */
  id: string

  /**
   * Array of exactly 2 token addresses forming the trading pair
   * Order is not guaranteed (could be [tokenA, tokenB] or [tokenB, tokenA])
   * All addresses must be checksummed
   */
  assets: string[]
}
```

**Constraints**:

- `providerAddr` MUST be a valid checksummed Ethereum address
- `id` MUST be a non-empty string (typically bytes32 hex format)
- `assets` MUST contain exactly 2 elements
- Each address in `assets` MUST be checksummed
- No duplicate addresses in `assets` (token cannot trade with itself)

**Example**:

```typescript
{
  providerAddr: '0x1234567890123456789012345678901234567890',
  id: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
  assets: [
    '0xTokenAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',  // cUSD
    '0xTokenBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB'   // CELO
  ]
}
```

**Validation Rules**:

1. On fetch from blockchain, assert `assets.length === 2`
2. If validation fails, log warning and skip exchange (don't fail entire query)
3. Checksum all addresses using adapter's address normalization

**Relationships**:

- Multiple `Exchange` entities can exist for same token pair (different providers)
- Each `Exchange` belongs to one `ExchangeProvider` contract
- Each `Exchange` references exactly 2 `Asset` entities

---

### Asset

Represents a token with its identifying information.

```typescript
interface Asset {
  /**
   * Token contract address (checksummed)
   */
  address: string

  /**
   * Human-readable token symbol (e.g., 'cUSD', 'CELO')
   * Fetched from on-chain via ERC-20 symbol() method
   * Falls back to address if symbol fetch fails
   */
  symbol: string
}
```

**Constraints**:

- `address` MUST be a valid checksummed Ethereum address
- `symbol` MUST be a non-empty string
- `symbol` should be uppercase by convention (e.g., 'cUSD' not 'cusd')

**Example**:

```typescript
{
  address: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
  symbol: 'cUSD'
}
```

**Validation Rules**:

1. Always checksum address before creating Asset
2. If symbol fetch fails, use `address` as fallback and log warning
3. Trim whitespace from symbol
4. Cache symbol lookups to avoid redundant RPC calls

**Relationships**:

- One `Asset` can appear in multiple `Exchange` and `TradablePair` entities
- Assets are immutable once created (address + symbol pair)

---

### TradablePair

Represents a tradable route between two tokens, including the exchange path needed to execute the trade.

```typescript
type TradablePairID = `${string}-${string}`

interface TradablePair {
  /**
   * Canonical identifier: sorted symbols joined with hyphen
   * Always uses alphabetical order (e.g., 'cEUR-cUSD' not 'cUSD-cEUR')
   * Ensures consistent identification regardless of query direction
   */
  id: TradablePairID

  /**
   * The two tokens being traded, in alphabetical order by symbol
   * Always [symbolA, symbolB] where symbolA < symbolB alphabetically
   */
  assets: [Asset, Asset]

  /**
   * Array of exchange hops needed to execute the trade
   * Length 1: Direct trade (single exchange)
   * Length 2: Two-hop route via intermediate token
   * Order matters for execution
   */
  path: Array<{
    /**
     * Exchange provider contract address
     */
    providerAddr: string

    /**
     * Exchange ID within that provider
     */
    id: string

    /**
     * The two token addresses for this hop
     * Order may differ from pair assets (depends on routing direction)
     */
    assets: [string, string]
  }>
}
```

**Constraints**:

- `id` MUST use alphabetically sorted symbols (canonical form)
- `assets` MUST be sorted alphabetically by symbol
- `assets[0].symbol < assets[1].symbol` (strict alphabetical ordering)
- `path` MUST have length 1 (direct) or 2 (two-hop)
- Multi-hop paths with length > 2 are NOT supported (out of scope)
- All addresses MUST be checksummed

**Example - Direct Pair**:

```typescript
{
  id: 'CELO-cUSD',
  assets: [
    { address: '0x471EcE3750Da237f93B8E339c536989b8978a438', symbol: 'CELO' },
    { address: '0x765DE816845861e75A25fCA122bb6898B8B1282a', symbol: 'cUSD' }
  ],
  path: [
    {
      providerAddr: '0x1234567890123456789012345678901234567890',
      id: '0xabcd...',
      assets: [
        '0x471EcE3750Da237f93B8E339c536989b8978a438',  // CELO
        '0x765DE816845861e75A25fCA122bb6898B8B1282a'   // cUSD
      ]
    }
  ]
}
```

**Example - Two-Hop Pair**:

```typescript
{
  id: 'cEUR-cUSD',
  assets: [
    { address: '0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73', symbol: 'cEUR' },
    { address: '0x765DE816845861e75A25fCA122bb6898B8B1282a', symbol: 'cUSD' }
  ],
  path: [
    {
      // First hop: cUSD → CELO
      providerAddr: '0x1111111111111111111111111111111111111111',
      id: '0xaaaa...',
      assets: [
        '0x765DE816845861e75A25fCA122bb6898B8B1282a',  // cUSD
        '0x471EcE3750Da237f93B8E339c536989b8978a438'   // CELO
      ]
    },
    {
      // Second hop: CELO → cEUR
      providerAddr: '0x2222222222222222222222222222222222222222',
      id: '0xbbbb...',
      assets: [
        '0x471EcE3750Da237f93B8E339c536989b8978a438',  // CELO
        '0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73'   // cEUR
      ]
    }
  ]
}
```

**Validation Rules**:

1. Always create pair ID from sorted symbols: `[asset0.symbol, asset1.symbol].sort().join('-')`
2. Always sort assets alphabetically before creating pair
3. Validate path length is 1 or 2 only
4. For two-hop routes, ensure intermediate token connects both hops (common address)
5. Checksum all addresses in path

**Relationships**:

- One `TradablePair` references exactly 2 `Asset` entities
- One `TradablePair` references 1 or 2 `Exchange` entities (via path)
- Multiple routes can exist for same token pair (optimization selects best)

---

### TradablePairWithSpread

Extended pair with spread cost data for route optimization.

```typescript
interface TradablePairWithSpread extends TradablePair {
  /**
   * Spread cost data for this route
   * Used to select optimal route when multiple options exist
   */
  spreadData: {
    /**
     * Total cost percentage for this route
     * Lower is better (more cost-efficient)
     * Example: 0.3 means 0.3% spread cost
     */
    totalSpreadPercent: number
  }
}
```

**Constraints**:

- All `TradablePair` constraints apply
- `totalSpreadPercent` MUST be a non-negative number
- `totalSpreadPercent` typically ranges from 0.1 to 2.0 (0.1% to 2%)

**Example**:

```typescript
{
  id: 'cEUR-cUSD',
  assets: [...],
  path: [...],
  spreadData: {
    totalSpreadPercent: 0.45  // 0.45% spread cost
  }
}
```

**Usage**:

- Only present in pre-generated cached pairs
- Not generated at runtime (requires historical spread data)
- Used by route optimization (Tier 1 heuristic: select lowest spread)

**Relationships**:

- Same as `TradablePair`
- Only exists in static cache files (`src/constants/tradablePairs`)

---

## Internal Data Structures

These structures are used internally for route finding and are not exposed in the public API.

### ConnectivityData

Internal graph representation for efficient route discovery.

```typescript
interface ConnectivityData {
  /**
   * Maps token address to symbol for fast lookups
   * Avoids redundant on-chain symbol fetches
   *
   * Example:
   * '0x765D...' → 'cUSD'
   * '0x471E...' → 'CELO'
   */
  addrToSymbol: Map<string, string>

  /**
   * Adjacency list representing the token connectivity graph
   * Maps each token address to set of directly connected token addresses
   * Used for two-hop route discovery via graph traversal
   *
   * Example:
   * 'cUSD_addr' → Set(['CELO_addr', 'cKES_addr', 'cREAL_addr'])
   * 'CELO_addr' → Set(['cUSD_addr', 'cEUR_addr', 'cBRL_addr'])
   *
   * To find route cUSD → cEUR:
   * 1. Check cUSD neighbors: [CELO, cKES, cREAL]
   * 2. Check CELO neighbors: [cUSD, cEUR, cBRL] ← found cEUR!
   * 3. Route: cUSD → CELO → cEUR
   */
  tokenGraph: Map<string, Set<string>>

  /**
   * Maps sorted token pair to exchange details
   * Enables fast lookup of exchange for any token pair
   *
   * Example:
   * 'CELO_addr-cUSD_addr' → { providerAddr, id, assets }
   * 'CELO_addr-cEUR_addr' → { providerAddr, id, assets }
   *
   * Key is always sorted: [addr0, addr1].sort().join('-')
   */
  directPathMap: Map<TradablePairID, ExchangeDetails>

  /**
   * Original direct pairs (for reference and deduplication)
   */
  directPairs: TradablePair[]
}

interface ExchangeDetails {
  providerAddr: string
  id: string
  assets: [string, string]
}
```

**Purpose**:

- Built once from direct pairs
- Enables O(1) or O(n) route lookups instead of O(n²) brute force
- Reused for all route queries
- Internal only (not exposed in public API)

**Construction** (see `buildConnectivityStructures` in route utils):

1. Iterate through all direct pairs
2. Extract all unique tokens → populate `addrToSymbol`
3. For each pair, add bidirectional edges to `tokenGraph`
4. For each pair, add sorted address key to `directPathMap`

---

## Type Organization

### File Structure

```
src/types/
├── exchange.ts          # Exchange, Asset, TradablePair, TradablePairWithSpread
└── index.ts             # Re-exports
```

### Type Exports

Public types (exported from `src/types/index.ts`):

- `Exchange`
- `Asset`
- `TradablePair`
- `TradablePairID`
- `TradablePairWithSpread`

Internal types (not exported, used only within route utilities):

- `ConnectivityData`
- `ExchangeDetails`

---

## Data Flow

### Exchange Discovery Flow

```
1. Query Broker contract
   ↓ getExchangeProviders()
2. Get provider addresses: [addr1, addr2, addr3]
   ↓ For each provider...
3. Query ExchangeProvider contract
   ↓ getExchanges()
4. Get exchanges: [{ exchangeId, assets[] }, ...]
   ↓ For each exchange...
5. Validate: assets.length === 2
   ↓ Pass: create Exchange
   ↓ Fail: log warning, skip
6. Return Exchange[]
   ↓
7. Cache in memory for instance lifetime
```

### Direct Pair Discovery Flow

```
1. Get all exchanges: Exchange[]
   ↓
2. For each exchange...
   ↓ Fetch token symbols (parallel)
3. Get [symbol0, symbol1]
   ↓ Sort alphabetically
4. Create canonical pair ID: 'symbolA-symbolB'
   ↓ Group by pair ID
5. Collect all exchanges for same pair
   ↓
6. Create TradablePair with path: [exchange1, exchange2, ...]
   ↓
7. Return TradablePair[] (deduplicated)
```

### Multi-Hop Pair Discovery Flow

```
1. Check static cache
   ↓ Hit: return cached pairs
   ↓ Miss: generate from scratch
2. Get direct pairs
   ↓
3. Build connectivity structures
   ↓ addrToSymbol, tokenGraph, directPathMap
4. Generate all routes
   ↓ Direct pairs + two-hop pairs via graph traversal
5. Group routes by pair ID
   ↓ Some pairs may have multiple routes
6. Select optimal routes
   ↓ Tier 1: lowest spread
   ↓ Tier 2: direct route
   ↓ Tier 3: major stablecoin
   ↓ Tier 4: first available
7. Return TradablePair[]
```

---

## Validation Summary

### Address Validation

- All addresses MUST be checksummed
- Use adapter's built-in address normalization
- Validate format before storage

### Exchange Validation

- MUST have exactly 2 assets
- Provider address MUST be valid
- Exchange ID MUST be non-empty

### Asset Validation

- Symbol fetch failure → fallback to address with warning
- Symbols cached to avoid redundant queries

### Pair Validation

- ID uses alphabetically sorted symbols
- Assets sorted alphabetically
- Path length 1 or 2 only
- Two-hop paths MUST have valid intermediate token

---

## Performance Characteristics

### Memory Usage

**Exchange Cache**:

- ~100-200 exchanges per chain (Celo mainnet)
- ~200 bytes per exchange (addresses + ID)
- Total: ~20-40 KB

**Symbol Cache**:

- ~50-100 unique tokens
- ~100 bytes per entry (address + symbol)
- Total: ~5-10 KB

**Connectivity Structures**:

- Token graph: ~100 nodes, ~200 edges
- Direct path map: ~100 entries
- Total: ~50-100 KB

**Total Memory**: < 200 KB (negligible for modern applications)

### Query Performance

**Cached Queries** (in-memory):

- Exchange lookup by ID: O(n) where n = number of exchanges (~100)
- Direct pair generation: O(e + s) where e = exchanges, s = symbol fetches
- Multi-hop with cache: O(1) file load + parse

**Fresh Queries** (blockchain):

- Exchange fetch: O(p × e) where p = providers, e = exchanges per provider
- Symbol fetch: O(t) where t = unique tokens
- Route generation: O(t²) for two-hop discovery (graph traversal)

**Optimization**: Parallel batching reduces wall-clock time significantly

---

## Error Scenarios

### Invalid Exchange Data

**Cause**: Exchange has ≠ 2 assets
**Behavior**: Log warning, skip exchange, continue processing
**Impact**: Some exchanges unavailable, others unaffected

### Symbol Fetch Failure

**Cause**: Token contract doesn't implement symbol() or network error
**Behavior**: Use address as symbol fallback, log warning
**Impact**: Pair identified by address instead of human-readable symbol

### No Exchanges Found

**Cause**: Broker has no registered providers or all providers return empty
**Behavior**: Return empty array, log warning
**Impact**: No trading available (expected on some testnets)

### Pair Not Found

**Cause**: Requested token pair has no direct or two-hop route
**Behavior**: Throw error with descriptive message
**Impact**: Caller must handle (expected for disconnected tokens)

---

## Future Extensions (Out of Scope)

1. **Three-hop routes**: Extend path length limit, update route generation algorithm
2. **Liquidity data**: Add reserve amounts to Exchange, sort by liquidity
3. **Dynamic spread calculation**: Real-time spread measurement instead of cached
4. **Route cost estimation**: Include gas costs in route optimization
5. **Subgraph integration**: Alternative data source for faster queries
6. **Multi-provider routes**: Allow path to use different providers per hop
