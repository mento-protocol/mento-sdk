# API Contract: ExchangeService

**Feature**: 002-exchange-pool-discovery
**Date**: 2025-11-04

## Overview

The `ExchangeService` provides methods to discover exchanges and tradable pairs in the Mento protocol. All methods are read-only and do not require a signer.

## Class Definition

```typescript
class ExchangeService {
  constructor(adapter: ProviderAdapter)
}
```

### Constructor Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `adapter` | `ProviderAdapter` | Yes | Provider adapter (Ethers v6 or Viem) for blockchain interactions |

**Example**:
```typescript
import { EthersAdapter } from '@mento-labs/mento-sdk/adapters'
import { ExchangeService } from '@mento-labs/mento-sdk/services'

const adapter = new EthersAdapter(provider)
const exchangeService = new ExchangeService(adapter)
```

---

## Exchange Query Methods

### getExchanges()

Fetches all exchanges from all registered providers in the Mento protocol.

```typescript
getExchanges(): Promise<Exchange[]>
```

**Parameters**: None

**Returns**: `Promise<Exchange[]>`
- Array of all exchanges across all providers
- Results are cached in memory for service instance lifetime
- Subsequent calls return cached data without blockchain queries

**Throws**:
- `NetworkError` - If RPC call fails
- `ValidationError` - If exchange data is invalid (logged as warning, not thrown)

**Example**:
```typescript
const exchanges = await exchangeService.getExchanges()
console.log(`Found ${exchanges.length} exchanges`)

exchanges.forEach(exchange => {
  console.log(`${exchange.id}: ${exchange.assets[0]} ↔ ${exchange.assets[1]}`)
})
```

**Performance**:
- First call: ~5-8 seconds (queries blockchain)
- Cached calls: < 10ms

**Caching Behavior**:
- Exchanges cached after first successful query
- Cache persists for service instance lifetime
- Create new service instance to refresh cache

**Error Scenarios**:
- No providers registered → Returns empty array with warning log
- Provider query fails → Skips provider, continues with others
- Invalid exchange data (≠ 2 assets) → Skips exchange, logs warning

---

### getExchangesForProvider()

Fetches all exchanges from a specific exchange provider contract.

```typescript
getExchangesForProvider(providerAddress: string): Promise<Exchange[]>
```

**Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `providerAddress` | `string` | Yes | Checksummed address of the exchange provider contract |

**Returns**: `Promise<Exchange[]>`
- Array of exchanges from the specified provider
- Empty array if provider has no exchanges or doesn't exist

**Throws**:
- `ValidationError` - If provider address is invalid format
- `NetworkError` - If RPC call fails
- `ContractError` - If provider contract doesn't implement required interface

**Example**:
```typescript
const providerAddr = '0x1234567890123456789012345678901234567890'
const exchanges = await exchangeService.getExchangesForProvider(providerAddr)

console.log(`Provider has ${exchanges.length} exchanges`)
```

**Validation**:
- Address MUST be valid Ethereum address format
- Address will be checksummed automatically
- Invalid exchange data (≠ 2 assets) logged as warning and skipped

---

### getExchangeById()

Looks up a specific exchange by its unique identifier.

```typescript
getExchangeById(exchangeId: string): Promise<Exchange>
```

**Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `exchangeId` | `string` | Yes | Unique exchange identifier (typically bytes32 hex string) |

**Returns**: `Promise<Exchange>`
- The exchange with the specified ID
- Exactly one exchange (uniqueness guaranteed by protocol)

**Throws**:
- `ExchangeNotFoundError` - If no exchange with given ID exists
  - Message: `"No exchange found for id {exchangeId}"`
- `ValidationError` - If multiple exchanges found (assertion failure)
  - Message: `"More than one exchange found with id {exchangeId}"`

**Example**:
```typescript
try {
  const exchange = await exchangeService.getExchangeById('0xabcd...')
  console.log('Found exchange:', exchange)
} catch (error) {
  if (error.message.includes('No exchange found')) {
    console.log('Exchange does not exist')
  }
}
```

**Notes**:
- Queries cached exchanges first (no blockchain call if cache warm)
- Exchange IDs are globally unique across all providers
- Multiple exchanges can exist for same token pair (different IDs)

---

### getExchangeForTokens()

Finds the exchange for a specific token pair (direct exchange only).

```typescript
getExchangeForTokens(token0: string, token1: string): Promise<Exchange>
```

**Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `token0` | `string` | Yes | Address of first token (order doesn't matter) |
| `token1` | `string` | Yes | Address of second token (order doesn't matter) |

**Returns**: `Promise<Exchange>`
- The direct exchange between the two tokens
- Exactly one exchange (multiple exchanges for same pair is assertion error)

**Throws**:
- `ExchangeNotFoundError` - If no direct exchange exists for the token pair
  - Message: `"No exchange found for {token0} and {token1}"`
- `ValidationError` - If multiple exchanges found (assertion failure)
  - Message: `"More than one exchange found for {token0} and {token1}"`
- `ValidationError` - If token addresses are invalid format

**Example**:
```typescript
const cUSD = '0x765DE816845861e75A25fCA122bb6898B8B1282a'
const CELO = '0x471EcE3750Da237f93B8E339c536989b8978a438'

try {
  const exchange = await exchangeService.getExchangeForTokens(cUSD, CELO)
  console.log('Direct exchange exists:', exchange)
} catch (error) {
  console.log('No direct exchange, check for multi-hop route')
}
```

**Notes**:
- Only finds DIRECT exchanges (single-hop)
- Order of token0/token1 doesn't matter (bidirectional search)
- For multi-hop routes, use `findPairForTokens()` instead
- Queries cached exchanges (no blockchain call if cache warm)

---

## Pair Discovery Methods

### getDirectPairs()

Generates all direct (single-hop) trading pairs from available exchanges.

```typescript
getDirectPairs(): Promise<TradablePair[]>
```

**Parameters**: None

**Returns**: `Promise<TradablePair[]>`
- Array of direct trading pairs with single-hop paths
- Pairs are deduplicated (multiple exchanges for same pair grouped)
- Assets sorted alphabetically by symbol for canonical IDs

**Throws**:
- `NetworkError` - If RPC calls fail
- `ValidationError` - If exchange data is invalid

**Example**:
```typescript
const directPairs = await exchangeService.getDirectPairs()

console.log(`Found ${directPairs.length} direct pairs`)

const directOnly = directPairs.filter(pair => pair.path.length === 1)
console.log(`All pairs are direct: ${directOnly.length === directPairs.length}`)
```

**Behavior**:
- Fetches all exchanges (using cache if available)
- Fetches token symbols on-chain for each unique token
- Groups exchanges by canonical pair ID (sorted symbols)
- Multiple exchanges for same pair included in path array

**Performance**:
- First call: ~6-9 seconds (fetches exchanges + symbols)
- Cached exchanges: ~2-3 seconds (only symbols need fetching)
- Symbol queries run in parallel for performance

**Data Structure**:
```typescript
{
  id: 'CELO-cUSD',  // Alphabetically sorted
  assets: [
    { address: '0x471E...', symbol: 'CELO' },  // Alphabetically sorted
    { address: '0x765D...', symbol: 'cUSD' }
  ],
  path: [
    {
      providerAddr: '0x1234...',
      id: '0xabcd...',
      assets: ['0x471E...', '0x765D...']  // Original order from exchange
    },
    // Multiple exchanges if available
  ]
}
```

---

### getTradablePairs()

Discovers all tradable pairs including multi-hop routes (up to 2 hops).

```typescript
getTradablePairs(options?: {
  cached?: boolean
}): Promise<readonly (TradablePair | TradablePairWithSpread)[]>
```

**Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `options.cached` | `boolean` | No | `true` | Whether to use pre-generated cached pairs |

**Returns**: `Promise<readonly (TradablePair | TradablePairWithSpread)[]>`
- Array of all tradable pairs (direct + two-hop routes)
- Cached pairs include `TradablePairWithSpread` with spread data
- Fresh pairs are basic `TradablePair` without spread data
- Results are read-only (immutable array)

**Throws**:
- `NetworkError` - If RPC calls fail (cached: false only)
- `CacheNotFoundError` - If cached data unavailable for current chain
  - Falls back to fresh generation automatically
  - Logs cache miss warning

**Example**:
```typescript
// Fast: use pre-generated cache
const cachedPairs = await exchangeService.getTradablePairs({ cached: true })
console.log(`Loaded ${cachedPairs.length} pairs from cache`)

// Check for spread data
if ('spreadData' in cachedPairs[0]) {
  console.log('Spread data available for optimization')
}

// Slow but fresh: generate from blockchain
const freshPairs = await exchangeService.getTradablePairs({ cached: false })
console.log(`Generated ${freshPairs.length} pairs from live data`)
```

**Behavior**:

**When cached = true**:
1. Attempts to load pre-generated pairs for current chain
2. If cache hit: Returns cached pairs with spread data (~100-500ms)
3. If cache miss: Falls back to fresh generation with warning

**When cached = false**:
1. Fetches direct pairs from blockchain
2. Builds connectivity graph
3. Generates all two-hop routes via graph traversal
4. Selects optimal routes using heuristics
5. Returns generated pairs without spread data (~8-10s)

**Route Generation Algorithm**:
1. Direct pairs (single-hop exchanges)
2. Two-hop pairs discovered via graph traversal:
   - For each token A → neighbors B
   - For each B → neighbors C
   - If C ≠ A, route A→B→C is valid

**Route Optimization** (when multiple routes exist):
- **Tier 1**: Lowest spread (cached data only)
- **Tier 2**: Direct route over multi-hop
- **Tier 3**: Route through major stablecoins (cUSD, cEUR, USDC, USDT)
- **Tier 4**: First available route

**Performance**:
- Cached: 100-500ms (file load + parse)
- Fresh: 8-10 seconds (blockchain queries + computation)
- Cached is ~20-50x faster

**Memory Usage**:
- Cached: ~100-200 KB (JSON file)
- Fresh: ~50-100 KB (in-memory structures)

---

### findPairForTokens()

Looks up the tradable pair between two tokens (direct or multi-hop).

```typescript
findPairForTokens(tokenIn: string, tokenOut: string): Promise<TradablePair>
```

**Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `tokenIn` | `string` | Yes | Input token address (direction matters for routing) |
| `tokenOut` | `string` | Yes | Output token address (direction matters for routing) |

**Returns**: `Promise<TradablePair>`
- The optimal tradable pair connecting the two tokens
- May be direct (1 hop) or two-hop route
- Direction-aware: path optimized for tokenIn → tokenOut

**Throws**:
- `PairNotFoundError` - If no tradable route exists between tokens
  - Message: `"No pair found for tokens {tokenIn} and {tokenOut}. They may not have a tradable path."`
- `ValidationError` - If token addresses are invalid format
- `NetworkError` - If RPC calls fail

**Example**:
```typescript
const cUSD = '0x765DE816845861e75A25fCA122bb6898B8B1282a'
const cBRL = '0xE4D5...'

try {
  const pair = await exchangeService.findPairForTokens(cUSD, cBRL)

  if (pair.path.length === 1) {
    console.log('Direct route available')
  } else {
    console.log('Two-hop route:', pair.path)
  }
} catch (error) {
  if (error.message.includes('No pair found')) {
    console.log('Tokens are not connected in Mento protocol')
  }
}
```

**Behavior**:
- Queries all tradable pairs (uses cache by default)
- Searches for matching token addresses (bidirectional)
- Returns first matching pair found
- Path order optimized for tokenIn → tokenOut direction

**Direction Handling**:
```typescript
// Both queries return the same pair (canonical ID)
const pair1 = await findPairForTokens(tokenA, tokenB)
const pair2 = await findPairForTokens(tokenB, tokenA)

// But pair IDs are canonical (alphabetical)
console.log(pair1.id === pair2.id)  // true: 'A-B' or 'B-A' depending on symbols

// Path direction may differ for execution
console.log(pair1.path[0].assets)  // Optimized for A → B
console.log(pair2.path[0].assets)  // Optimized for B → A (may be reversed)
```

**Performance**:
- Uses cached pairs: ~100-500ms
- Fresh generation: ~8-10 seconds
- Linear search through pairs: O(n) where n = ~50-100 pairs

---

## Type Definitions

### Exchange

```typescript
interface Exchange {
  providerAddr: string  // Checksummed address of provider contract
  id: string           // Unique exchange identifier (bytes32)
  assets: string[]     // Exactly 2 token addresses (checksummed)
}
```

### Asset

```typescript
interface Asset {
  address: string  // Checksummed token address
  symbol: string   // Token symbol (e.g., 'cUSD', 'CELO')
}
```

### TradablePair

```typescript
type TradablePairID = `${string}-${string}`

interface TradablePair {
  id: TradablePairID          // Canonical ID: sorted symbols (e.g., 'cEUR-cUSD')
  assets: [Asset, Asset]       // Two tokens, alphabetically sorted by symbol
  path: Array<{                // Exchange hops (length 1 or 2)
    providerAddr: string
    id: string
    assets: [string, string]
  }>
}
```

### TradablePairWithSpread

```typescript
interface TradablePairWithSpread extends TradablePair {
  spreadData: {
    totalSpreadPercent: number  // Total spread cost (lower is better)
  }
}
```

---

## Error Handling

### Error Types

All errors follow the SDK's standard error hierarchy:

```typescript
class ExchangeNotFoundError extends Error {
  name: 'ExchangeNotFoundError'
  message: string
  exchangeId?: string
  tokens?: [string, string]
}

class PairNotFoundError extends Error {
  name: 'PairNotFoundError'
  message: string
  tokenIn: string
  tokenOut: string
}

class ValidationError extends Error {
  name: 'ValidationError'
  message: string
  field: string
  value: unknown
}

class NetworkError extends Error {
  name: 'NetworkError'
  message: string
  cause: Error
}

class CacheNotFoundError extends Error {
  name: 'CacheNotFoundError'
  message: string
  chainId: number
}
```

### Error Messages

All error messages are descriptive and actionable:

```typescript
// Exchange not found
"No exchange found for id 0xabcd1234..."
"No exchange found for 0x765D... and 0x471E..."

// Pair not found
"No pair found for tokens 0x765D... and 0xE4D5.... They may not have a tradable path."

// Validation errors
"Invalid address format: {address}"
"Exchange must have exactly 2 assets, got {n}"
"More than one exchange found for {token0} and {token1}"

// Cache errors
"No cached pairs available for chain ID {chainId}"

// Network errors
"Failed to query Broker contract: {cause}"
"Failed to fetch token symbol for {address}: {cause}"
```

### Error Handling Examples

```typescript
// Handle specific error types
try {
  const exchange = await exchangeService.getExchangeById(id)
} catch (error) {
  if (error instanceof ExchangeNotFoundError) {
    console.log('Exchange does not exist')
  } else if (error instanceof NetworkError) {
    console.log('Network issue, retry later')
  } else {
    throw error  // Unexpected error
  }
}

// Handle pair lookup failures
try {
  const pair = await exchangeService.findPairForTokens(tokenA, tokenB)
} catch (error) {
  if (error instanceof PairNotFoundError) {
    console.log(`No route between ${tokenA} and ${tokenB}`)
    // Maybe try alternative tokens or notify user
  }
}

// Graceful cache fallback (automatic)
const pairs = await exchangeService.getTradablePairs({ cached: true })
// If cache miss, automatically falls back to fresh generation
// No explicit error handling needed
```

---

## Performance Characteristics

### Time Complexity

| Method | First Call | Cached | Complexity |
|--------|------------|--------|------------|
| `getExchanges()` | 5-8s | < 10ms | O(p × e) |
| `getExchangesForProvider()` | 1-2s | N/A | O(e) |
| `getExchangeById()` | < 10ms | < 1ms | O(n) |
| `getExchangeForTokens()` | < 10ms | < 1ms | O(n) |
| `getDirectPairs()` | 6-9s | 2-3s | O(e + t) |
| `getTradablePairs()` cached | 100-500ms | N/A | O(1) |
| `getTradablePairs()` fresh | 8-10s | N/A | O(t²) |
| `findPairForTokens()` | 100-500ms | N/A | O(n) |

Where:
- p = number of providers (~3-5)
- e = exchanges per provider (~10-20)
- t = unique tokens (~50-100)
- n = total items to search (~50-100)

### Space Complexity

| Data Structure | Memory Usage |
|----------------|--------------|
| Exchange cache | ~20-40 KB |
| Symbol cache | ~5-10 KB |
| Connectivity graph | ~50-100 KB |
| Cached pairs file | ~100-200 KB |
| **Total** | **~200-400 KB** |

### Optimization Strategies

1. **In-Memory Caching**:
   - Exchanges cached after first query
   - Eliminates redundant blockchain calls
   - Persists for service instance lifetime

2. **Parallel Batching**:
   - Provider queries run in parallel
   - Symbol fetches batched with `Promise.all()`
   - Reduces wall-clock time significantly

3. **Static Cache Files**:
   - Pre-generated pairs with spread data
   - Near-instant load (~100-500ms)
   - Fallback to fresh if unavailable

4. **Lazy Computation**:
   - Route generation only when needed
   - Direct pairs available without multi-hop computation
   - On-demand vs full generation

---

## Best Practices

### Service Instantiation

```typescript
// ✅ Good: Reuse service instance
const service = new ExchangeService(adapter)
await service.getExchanges()  // Queries blockchain
await service.getExchanges()  // Uses cache

// ❌ Bad: Loses cache
await new ExchangeService(adapter).getExchanges()  // Queries
await new ExchangeService(adapter).getExchanges()  // Queries again
```

### Cache Usage

```typescript
// ✅ Good: Use cached by default
const pairs = await service.getTradablePairs({ cached: true })

// ✅ Good: Fresh when needed
const freshPairs = await service.getTradablePairs({ cached: false })

// ❌ Bad: Always fresh (slow)
const pairs = await service.getTradablePairs({ cached: false })
```

### Error Handling

```typescript
// ✅ Good: Specific error handling
try {
  const pair = await service.findPairForTokens(tokenA, tokenB)
} catch (error) {
  if (error instanceof PairNotFoundError) {
    // Handle gracefully
    return null
  }
  throw error
}

// ❌ Bad: Silent failures
const pair = await service.findPairForTokens(tokenA, tokenB).catch(() => null)
```

### Query Optimization

```typescript
// ✅ Good: Parallel independent queries
const [exchanges, pairs] = await Promise.all([
  service.getExchanges(),
  service.getDirectPairs()
])

// ❌ Bad: Sequential queries
const exchanges = await service.getExchanges()
const pairs = await service.getDirectPairs()  // Could run in parallel
```

---

## Testing

### Unit Test Coverage

- Exchange query methods (mocked blockchain)
- Pair generation logic (pure functions)
- Route optimization algorithm
- Caching behavior
- Error handling and validation

### Integration Test Coverage

- Real blockchain queries (testnet/fork)
- Provider parity (Ethers vs Viem)
- Contract interaction validation
- Performance benchmarks

### Example Test

```typescript
describe('ExchangeService', () => {
  it('should fetch all exchanges', async () => {
    const service = new ExchangeService(adapter)
    const exchanges = await service.getExchanges()

    expect(exchanges).toBeInstanceOf(Array)
    expect(exchanges.length).toBeGreaterThan(0)

    exchanges.forEach(exchange => {
      expect(exchange.assets).toHaveLength(2)
      expect(exchange.providerAddr).toMatch(/^0x[a-fA-F0-9]{40}$/)
    })
  })

  it('should throw when pair not found', async () => {
    const service = new ExchangeService(adapter)
    const invalidToken = '0x0000000000000000000000000000000000000000'

    await expect(
      service.findPairForTokens(invalidToken, cUSD)
    ).rejects.toThrow(PairNotFoundError)
  })
})
```

---

## Version History

- **v3.0.0** (2025-11-04): Initial v3 implementation with adapter pattern
- Ported from v1 with API compatibility where possible
- Enhanced error handling and type safety
- Added spread-based route optimization
