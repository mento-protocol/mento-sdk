# Research: Exchange & Pool Discovery

**Feature**: 002-exchange-pool-discovery
**Date**: 2025-11-04
**Status**: Complete

## Executive Summary

This document analyzes the v1 exchange and pool discovery implementation to inform the v3 port using the adapter pattern. The v1 implementation provides a sophisticated route finding system with caching, multi-hop routing, and route optimization. The v3 port will maintain this functionality while leveraging the new adapter infrastructure.

## V1 Architecture Analysis

### Core Components

**Location**: `src/mento.ts` and `src/routeUtils.ts` (main branch)

#### 1. Exchange Discovery (`mento.ts`)

The v1 implementation provides these key methods:

```typescript
// Fetch all exchanges from broker
async getExchanges(): Promise<Exchange[]>

// Fetch exchanges for specific provider
async getExchangesForProvider(providerAddr: Address): Promise<Exchange[]>

// Get exchange for specific token pair
async getExchangeForTokens(token0: Address, token1: Address): Promise<Exchange>

// Get exchange by ID
async getExchangeById(exchangeId: string): Promise<Exchange>
```

**Implementation Details**:

- Uses Broker contract's `getExchangeProviders()` to fetch all provider addresses
- For each provider, connects to `IExchangeProvider` contract and calls `getExchanges()`
- Validates each exchange has exactly 2 assets (assertion check)
- Caches results in memory for SDK instance lifetime (`this.exchanges`)
- Direct Ethers v5 contract factory usage (needs adapter conversion)

#### 2. Tradable Pair Discovery (`mento.ts`)

**Direct Pairs**:

```typescript
async getDirectPairs(): Promise<TradablePair[]>
```

- Fetches all exchanges
- Groups exchanges by token pair (alphabetically sorted symbols)
- Fetches token symbols on-chain using `getSymbolFromTokenAddress()`
- Returns deduplicated pairs (multiple exchanges for same pair grouped together)
- Each pair includes canonical ID (sorted symbols) and path with exchange hops

**Multi-Hop Pairs**:

```typescript
async getTradablePairsWithPath({
  cached = true,
  returnAllRoutes = false
}): Promise<readonly (TradablePair | TradablePairWithSpread)[]>
```

- First attempts to load cached pairs if `cached=true`
- Falls back to generating pairs from scratch:
  1. Gets direct pairs
  2. Builds connectivity structures
  3. Generates all routes (direct + 2-hop)
  4. Selects optimal routes

**Pair Lookup**:

```typescript
async findPairForTokens(tokenIn: Address, tokenOut: Address): Promise<TradablePair>
```

- Searches all tradable pairs for matching token addresses
- Handles bidirectional matching (A→B or B→A)
- Throws descriptive error if no pair found

#### 3. Route Finding Algorithm (`routeUtils.ts`)

The v1 implementation uses a sophisticated graph-based approach:

**Step 1: Build Connectivity Structures**

```typescript
buildConnectivityStructures(directPairs: TradablePair[]): ConnectivityData
```

- Creates `addrToSymbol` map for fast symbol lookups
- Creates `directPathMap` mapping sorted token pairs to exchange details
- Creates `tokenGraph` adjacency list (bidirectional edges)
- Preserves original `directPairs` for reference

**Step 2: Generate All Routes**

```typescript
generateAllRoutes(connectivityData: ConnectivityData): Map<TradablePairID, TradablePair[]>
```

- Adds all direct pairs (single-hop)
- Uses graph traversal to find 2-hop routes:
  - For each token A in graph
  - For each neighbor B of A (first hop)
  - For each neighbor C of B (second hop)
  - If C ≠ A, creates route A→B→C
- Groups all routes by canonical pair ID
- Multiple routes for same pair collected in arrays

**Step 3: Select Optimal Routes**

```typescript
selectOptimalRoutes(
  allRoutes: Map<TradablePairID, TradablePair[]>,
  returnAllRoutes: boolean,
  addrToSymbol: Map<Address, TokenSymbol>
): (TradablePair | TradablePairWithSpread)[]
```

- Single route: use directly
- Multiple routes + `returnAllRoutes=true`: return all with unique keys
- Multiple routes + `returnAllRoutes=false`: apply optimization

**Route Selection Heuristics** (multi-tier):

1. **Tier 1 - Spread-based**: Prefer routes with lowest `totalSpreadPercent` (from cached data)
2. **Tier 2 - Direct route**: Prefer single-hop over multi-hop (lower gas, less risk)
3. **Tier 3 - Stablecoin routing**: Prefer routes through major stablecoins (cUSD, cEUR, USDC, USDT)
4. **Tier 4 - First available**: Use first route if no other heuristic applies

### Caching Strategy

**Static Cache Files**:

- Pre-generated cached pairs with spread data stored in `src/constants/tradablePairs`
- Loaded via `getCachedTradablePairs(chainId)`
- Contains `TradablePairWithSpread` objects including `spreadData.totalSpreadPercent`
- Enables instant query resolution without blockchain calls
- Used for optimal route selection (Tier 1 heuristic)

**In-Memory Cache**:

- Exchanges cached in `this.exchanges` array for SDK instance lifetime
- Prevents redundant blockchain queries
- Cleared only when new Mento instance created

### Contract Interactions

**V1 Contracts Used**:

1. **Broker** (`IBroker`):

   - `getExchangeProviders()` → returns array of provider addresses

2. **ExchangeProvider** (`IExchangeProvider`):

   - `getExchanges()` → returns array of exchanges with `{ exchangeId, assets[] }`

3. **ERC-20 Token**:
   - `symbol()` → returns token symbol string

**V1 Usage Pattern**:

```typescript
// Direct factory usage (needs conversion to adapter pattern)
const broker = IBroker__factory.connect(brokerAddress, signerOrProvider)
const exchangeProvider = IExchangeProvider__factory.connect(
  providerAddr,
  signerOrProvider
)
```

## V3 Adapter Integration Approach

### Adapter Pattern Benefits

The v3 adapter system (`src/adapters/`) provides:

- **Provider agnostic**: Single interface for Ethers v6, Viem
- **Type safety**: Strict TypeScript types
- **Error handling**: Standardized error messages with retry logic
- **Consistent API**: `readContract()` method with unified options

### Migration Strategy

**Replace Direct Contract Calls**:

```typescript
// V1 approach (direct Ethers v5)
const broker = IBroker__factory.connect(address, provider)
const result = await broker.getExchangeProviders()

// V3 approach (adapter pattern)
const result = await this.adapter.readContract({
  address: brokerAddress,
  abi: BROKER_ABI,
  functionName: 'getExchangeProviders',
  args: [],
})
```

**Contract Call Batching**:

- Use `Promise.all()` to batch multiple adapter calls
- Reduces RPC load (constitution requirement)
- Example: Fetching symbols for multiple tokens simultaneously

**Retry Logic**:

- Leverage existing `retryOperation()` utility from `src/utils/retry.ts`
- Wraps adapter calls for transient failure handling
- Exponential backoff already implemented

### Service Organization Decision

**Chosen Approach**: Single `ExchangeService` class

**Rationale**:

- All exchange/pair operations are closely related
- Share common state (cached exchanges)
- Natural method grouping:
  - Exchange queries: `getExchanges()`, `getExchangeById()`, `getExchangeForTokens()`
  - Pair discovery: `getDirectPairs()`, `getTradablePairs()`
  - Route utilities: `findPairForTokens()`
- Follows existing v3 patterns (`TokenMetadataService`, `StableTokenService`)
- Avoids service fragmentation and circular dependencies

**Alternative Rejected**: Separate `ExchangeService` and `PairDiscoveryService`

- Would require sharing exchange cache between services
- Unnecessary complexity for closely related operations
- Violates constitution principle of simplicity

### Type Definitions Needed

**Core Types** (create in `src/types/exchange.ts`):

```typescript
// Already exists (needs update for v3 compatibility)
export interface Exchange {
  providerAddr: string
  id: string
  assets: string[] // Will keep as string[] (v3 uses string for addresses)
}

export interface Asset {
  address: string
  symbol: string
}

export type TradablePairID = `${string}-${string}`

export interface TradablePair {
  id: TradablePairID
  assets: [Asset, Asset]
  path: Array<{
    providerAddr: string
    id: string
    assets: [string, string]
  }>
}

export interface TradablePairWithSpread extends TradablePair {
  spreadData: {
    totalSpreadPercent: number
  }
}
```

**Internal Types** (route utilities):

```typescript
export interface ConnectivityData {
  addrToSymbol: Map<string, string>
  tokenGraph: Map<string, Set<string>>
  directPathMap: Map<TradablePairID, ExchangeDetails>
  directPairs: TradablePair[]
}

interface ExchangeDetails {
  providerAddr: string
  id: string
  assets: [string, string]
}
```

### ABIs Required

**New ABIs to Add** (in `src/abis/`):

1. **`broker.ts`** (extend existing):

```typescript
export const BROKER_ABI = [
  // existing...
  'function getExchangeProviders() view returns (address[])',
]
```

2. **`exchangeProvider.ts`** (new file):

```typescript
export const EXCHANGE_PROVIDER_ABI = [
  'function getExchanges() view returns (tuple(bytes32 exchangeId, address[] assets)[])',
]
```

3. **`erc20.ts`** (already exists, verify symbol method):

```typescript
export const ERC20_ABI = [
  // existing...
  'function symbol() view returns (string)',
]
```

## Performance Considerations

### Query Performance Targets (from spec NFR-007, NFR-008)

- **Cached queries**: < 2 seconds (target: < 500ms)
- **Fresh blockchain queries**: < 10 seconds

### Optimization Strategies

1. **In-Memory Caching**:

   - Cache exchanges for instance lifetime
   - Cache token symbols for tokens already queried
   - Prevents redundant RPC calls

2. **Batch Operations**:

   - Parallel provider queries: `Promise.all(providers.map(getExchangesForProvider))`
   - Parallel symbol fetching: `Promise.all(tokens.map(getSymbol))`
   - Reduces total query time

3. **Static Cache Support**:

   - Pre-generated pairs with spread data
   - Near-instant results for supported chains
   - Fallback to fresh generation if cache miss

4. **Lazy Computation**:
   - Only generate multi-hop routes when `getTradablePairs()` called
   - Direct pairs available without route computation
   - On-demand pair lookup vs full generation

## Data Validation

### Exchange Validation (from v1)

```typescript
// Assert exactly 2 assets per exchange
assert(exchange.assets.length === 2, 'Exchange must have 2 assets')
```

### Address Validation

- All addresses checksummed before storage
- Use existing `validateAddress()` utility
- Consistent with constitution Blockchain Best Practices

### Symbol Fallback

If token symbol fetch fails:

- Use address as fallback identifier
- Log warning for debugging
- Continue processing (graceful degradation)

## Error Handling

### V1 Error Messages (maintain in v3)

```typescript
// Exchange not found
throw Error(`No exchange found for ${token0} and ${token1}`)

// Multiple exchanges (assertion)
assert(
  exchanges.length === 1,
  `More than one exchange found for ${token0} and ${token1}`
)

// Pair not found
throw new Error(
  `No pair found for tokens ${tokenIn} and ${tokenOut}. They may not have a tradable path.`
)

// No exchanges for ID
throw Error(`No exchange found for id ${exchangeId}`)
```

### V3 Enhancements

- Use typed error classes from `src/types/errors.ts`
- Include actionable context (suggested fix or next step)
- Preserve original error for debugging

## Testing Strategy

### Unit Tests (route utilities)

**Test Cases for Route Finding**:

1. Direct pair generation from exchanges
2. Two-hop route discovery via graph traversal
3. Route deduplication (multiple routes for same pair)
4. Optimal route selection (all 4 tiers)
5. Canonical pair ID generation (alphabetical sorting)
6. Symbol caching and reuse

**Mock Data**:

- Predefined exchange sets
- Known token symbols
- Expected route outputs

### Integration Tests (adapter usage)

**Provider Parity Tests** (shared test suite):

1. Fetch exchanges from broker (Ethers vs Viem)
2. Query exchange providers
3. Get token symbols
4. Verify identical results across adapters

**Blockchain Tests** (against testnet/fork):

1. Real broker contract interaction
2. Validate exchange structure
3. Verify route finding with real liquidity
4. Performance benchmarks (cached vs fresh)

## Migration Checklist

- [ ] Create `ExchangeService` class with adapter injection
- [ ] Port exchange query methods (getExchanges, getExchangeById, etc.)
- [ ] Port direct pair discovery (getDirectPairs)
- [ ] Port route finding utilities (buildConnectivity, generateRoutes, selectOptimal)
- [ ] Port multi-hop pair discovery (getTradablePairs)
- [ ] Add Broker ABI extensions
- [ ] Add ExchangeProvider ABI
- [ ] Update Exchange type for v3 compatibility
- [ ] Add TradablePair types
- [ ] Create ConnectivityData types
- [ ] Add in-memory exchange cache
- [ ] Add static cache support (tradablePairs)
- [ ] Add retry logic for adapter calls
- [ ] Implement parallel batching for performance
- [ ] Add unit tests for route utilities
- [ ] Add integration tests for adapter calls
- [ ] Add shared provider parity tests
- [ ] Update public API exports

## Open Questions

1. **Cache location**: Should static tradablePairs cache remain in `src/constants/` or move to separate cache directory?

   - **Decision**: Keep in `src/constants/tradablePairs` for consistency with v1

2. **Symbol caching**: Should token symbols be cached globally or per-service instance?

   - **Decision**: Global cache (module-level) since token symbols are immutable once deployed. No risk of stale data, and more efficient than per-instance caching. Cache should be keyed by `chainId-address` to handle multi-chain scenarios.

3. **Route utilities location**: Separate file `src/utils/routeUtils.ts` or inline in service?

   - **Decision**: Separate file for testability and reusability

4. **Error types**: Create specific error classes (`ExchangeNotFoundError`, `PairNotFoundError`) or use generic?
   - **Decision**: Use existing error infrastructure, add specific messages

## References

- V1 Implementation: `src/mento.ts` (lines 74-800)
- V1 Route Utils: `src/routeUtils.ts` (full file)
- V3 Adapter Pattern: `src/adapters/index.ts`
- V3 Service Example: `src/services/tokenMetadataService.ts`
- Constitution: `.specify/memory/constitution.md`
- Feature Spec: `specs/002-exchange-pool-discovery/spec.md`
