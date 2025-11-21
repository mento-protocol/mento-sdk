# Implementation Plan: Exchange & Pool Discovery

**Branch**: `002-exchange-pool-discovery` | **Date**: 2025-11-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-exchange-pool-discovery/spec.md`

## Summary

This feature ports exchange and pool discovery functionality from v1 to v3, enabling developers to discover all available exchanges, find direct trading pairs, generate multi-hop routes, and look up exchanges by token pair. The implementation uses the existing adapter infrastructure to interact with Broker and ExchangeProvider contracts, implements two-level caching (in-memory + static files), and follows v1's proven route optimization heuristics (spread > direct > stablecoin).

**Technical Approach**: Create a new `ExchangeService` class that uses the adapter pattern for contract interactions, implements graph-based route finding for 2-hop paths, and provides instance-level caching with support for pre-generated static cache files.

## Technical Context

**Language/Version**: TypeScript 5.x with strict mode enabled, targeting ES2020+
**Primary Dependencies**: Existing adapter pattern (Ethers v6, Viem), contract ABIs (Broker, ExchangeProvider, ERC-20)
**Storage**: In-memory caching (instance lifetime) + static cache files (pre-generated, committed to repo)
**Testing**: Jest for unit tests, integration tests with real blockchain data (mainnet fork), shared test suites for provider parity
**Target Platform**: Node.js >= 18, browser (via bundlers)
**Project Type**: SDK library (single project structure)
**Performance Goals**: Cached queries <500ms, fresh queries <10s, route generation O(V²) where V = token count
**Constraints**: Read-only operations (no signer required), maximum 2-hop routes, >80% code coverage
**Scale/Scope**: ~50-100 tokens on Celo mainnet, ~200-500 direct pairs, ~1000-2000 2-hop routes

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

Review against [Mento SDK Constitution](../.specify/memory/constitution.md):

- [x] **Type Safety & Code Quality** - All code follows TypeScript strict mode, explicit types for all public APIs, ESLint/Prettier compliance
- [x] **Provider Agnostic Architecture** - ExchangeService uses ProviderAdapter interface, no direct provider calls in business logic
- [x] **Comprehensive Testing** - Unit tests for services and route utils, integration tests for both providers, >80% coverage target
- [x] **Performance & Reliability** - Contract calls batched where possible, instance caching to minimize RPC calls, route generation O(V²) complexity
- [x] **Developer Experience & Documentation** - JSDoc on all public methods with examples, README updated, descriptive error messages
- [x] **Blockchain Best Practices** - Addresses checksummed via adapter, token symbols fetched on-chain, BigInt for numeric values (if applicable)

_All principles met. No violations requiring justification._

## Project Structure

### Documentation (this feature)

```
specs/002-exchange-pool-discovery/
├── spec.md              # Feature specification
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output - v1 analysis, architecture decisions
├── data-model.md        # Phase 1 output - Entity definitions and relationships
├── quickstart.md        # Phase 1 output - Usage examples and code samples
├── contracts/           # Phase 1 output - API contracts
│   ├── README.md        # Contract directory guide
│   └── ExchangeService.md # Public API specification
├── checklists/          # Quality validation checklists
│   └── requirements.md  # Spec quality checklist (created by /speckit.specify)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created yet)
```

### Source Code (repository root)

```
src/
├── abis/
│   ├── Broker.ts        # [NEW] Broker contract ABI
│   ├── ExchangeProvider.ts # [NEW] Exchange provider ABI
│   └── erc20.ts         # [EXISTS] ERC-20 ABI (already in v3)
├── adapters/
│   ├── interface.ts     # [EXISTS] ProviderAdapter interface
│   ├── implementations/
│   │   ├── ethersAdapter.ts # [EXISTS] Ethers v6 adapter
│   │   └── viemAdapter.ts   # [EXISTS] Viem adapter
│   └── utils/           # [EXISTS] Adapter utilities
├── constants/
│   ├── addresses.ts     # [UPDATE] Add Broker addresses if missing
│   ├── index.ts         # [EXISTS] Constant exports
│   └── tradablePairs/   # [NEW] Static cache files
│       ├── 42220.ts     # Celo mainnet cached pairs
│       ├── 44787.ts     # Alfajores cached pairs
│       └── index.ts     # Cache loader utility
├── services/
│   ├── ExchangeService.ts # [NEW] Main exchange discovery service
│   ├── StableTokenService.ts # [EXISTS] Stable token service
│   └── CollateralService.ts  # [EXISTS] Collateral service
├── types/
│   ├── exchange.ts      # [NEW] Exchange, TradablePair, Asset types
│   ├── adapter.ts       # [EXISTS] Adapter types
│   └── index.ts         # [UPDATE] Export new types
├── utils/
│   ├── routeUtils.ts    # [NEW] Route finding and graph algorithms
│   ├── retry.ts         # [EXISTS] Retry logic utility
│   └── validation.ts    # [EXISTS] Validation utilities
└── index.ts             # [UPDATE] Export ExchangeService

tests/
├── unit/
│   ├── services/
│   │   └── ExchangeService.test.ts # [NEW] Unit tests for service logic
│   └── utils/
│       └── routeUtils.test.ts      # [NEW] Unit tests for route finding
└── integration/
    ├── adapters/
    │   ├── ethersExchangeDiscovery.test.ts # [NEW] Ethers v6 integration tests
    │   └── viemExchangeDiscovery.test.ts   # [NEW] Viem integration tests
    └── shared/
        └── exchangeDiscovery.test.ts       # [NEW] Shared test suite for provider parity
```

**Structure Decision**: Single project structure (SDK library). New `ExchangeService` follows existing v3 pattern (services use adapters). Route finding logic separated into `utils/routeUtils.ts` for testability and reusability. Static cache files in `constants/tradablePairs/` for consistency with v1 location.

## Complexity Tracking

_No Constitution violations to justify._

## Architecture Overview

### Service Layer

**ExchangeService** (new)

- **Purpose**: Discover exchanges, trading pairs, and routing paths
- **Dependencies**: ProviderAdapter (injected), Broker ABI, ExchangeProvider ABI, ERC-20 ABI
- **State**: In-memory cache for exchanges and token symbols (instance lifetime)
- **Public Methods**: 7 methods covering all 4 user stories
  - `getExchanges()` - US1: Get all exchanges
  - `getExchangesForProvider(providerAddr)` - US1: Filter by provider
  - `getExchangeById(exchangeId)` - US1: Lookup by ID
  - `getExchangeForTokens(token0, token1)` - US2: Find direct exchange
  - `getDirectPairs()` - US2: Get all direct pairs
  - `getTradablePairs(options?)` - US3: Get all pairs (direct + multi-hop)
  - `findPairForTokens(tokenIn, tokenOut)` - US4: Lookup pair by tokens

### Utility Layer

**routeUtils.ts** (new)

- **Purpose**: Graph-based route finding and optimization
- **Key Functions**:
  - `buildConnectivityStructures(directPairs)` - Build token graph
  - `generateAllRoutes(connectivity)` - Generate direct + 2-hop routes
  - `selectOptimalRoutes(allRoutes, returnAllRoutes, addrToSymbol)` - Route optimization
  - `selectBestRoute(candidates)` - Apply heuristics (spread > direct > stablecoin)
- **Algorithm**: DFS-like traversal for 2-hop paths, O(V²) complexity where V = token count

### Type Definitions

**types/exchange.ts** (new)

```typescript
// Core types
export interface Exchange {
  providerAddr: Address
  id: string
  assets: Address[] // Always exactly 2 assets
}

export interface Asset {
  address: Address
  symbol: string
}

export type TradablePairID = `${string}-${string}` // Sorted symbol pair

export interface TradablePair {
  id: TradablePairID
  assets: [Asset, Asset] // Alphabetically sorted by symbol
  path: Array<{
    providerAddr: Address
    id: string
    assets: [Address, Address]
  }>
}

// Extended type with spread data (for cached pairs)
export interface TradablePairWithSpread extends TradablePair {
  spreadData: {
    totalSpreadPercent: number
    hops: Array<{
      exchangeId: string
      spreadPercent: number
    }>
  }
}

// Internal connectivity graph (not exported)
interface ConnectivityData {
  addrToSymbol: Map<Address, string>
  tokenGraph: Map<Address, Set<Address>>
  directPathMap: Map<string, Exchange>
  directPairs: TradablePair[]
}
```

### Contract Integration

**Broker Contract**

- **Purpose**: Registry of exchange providers
- **Key Methods**: `getExchangeProviders()` returns address[]
- **Usage**: Called once per SDK initialization to get provider list

**ExchangeProvider Contract**

- **Purpose**: Manages exchanges under one provider (e.g., BiPoolManager)
- **Key Methods**: `getExchanges()` returns array of exchange data
- **Usage**: Called once per provider to get all exchanges

**ERC-20 Contract**

- **Purpose**: Fetch token symbol for pair identification
- **Key Methods**: `symbol()` returns string
- **Usage**: Called once per unique token address, cached in-memory

### Caching Strategy

**Two-Level Caching**:

1. **Instance Cache** (in-memory)

   - Exchanges: Cached after first `getExchanges()` call
   - Token symbols: Cached as fetched, keyed by address
   - Lifetime: SDK instance lifetime
   - Invalidation: Never (exchanges relatively static)

2. **Static Cache** (pre-generated files)
   - Location: `src/constants/tradablePairs/{chainId}.ts`
   - Content: Complete `TradablePairWithSpread[]` with spread data
   - Generation: Offline script (separate from SDK)
   - Usage: Loaded via `getTradablePairs({ cached: true })`
   - Fallback: If cache missing, generate fresh from blockchain

### Route Optimization

**Heuristic Order** (applied when multiple routes exist for same pair):

1. **Spread-based** (if spread data available): Lowest total spread wins
2. **Direct preference**: Single-hop routes preferred over 2-hop
3. **Major stablecoin routing**: Routes through CELO, cUSD preferred
4. **First available**: Fallback if no other criteria differentiate

**Example**:

```
Routes for cEUR-cREAL:
  A: cEUR → CELO → cREAL (spread: 0.15%)
  B: cEUR → cUSD → cREAL (spread: 0.12%)  ← Selected (lowest spread)

Routes for cKES-cGHS (no spread data):
  C: cKES → CELO → cGHS  ← Selected (routes through major coin)
  D: cKES → cUSD → cGHS  ← Also valid but C preferred
```

## Data Flow

### User Story 1: Query All Exchanges

```
Developer calls: mento.exchanges.getExchanges()
  ↓
1. Check instance cache
   If cached → return immediately
  ↓
2. Fetch broker address from constants
  ↓
3. Call broker.getExchangeProviders() via adapter
  ↓
4. For each provider address:
   - Create ExchangeProvider contract instance
   - Call provider.getExchanges() via adapter
   - Validate: each exchange has exactly 2 assets
  ↓
5. Aggregate all exchanges, cache in instance
  ↓
6. Return Exchange[]
```

### User Story 2: Discover Direct Trading Pairs

```
Developer calls: mento.exchanges.getDirectPairs()
  ↓
1. Get exchanges via getExchanges() (uses cache if available)
  ↓
2. For each exchange:
   - Fetch token symbols for both assets (cached per instance)
   - Create canonical pair ID (alphabetically sorted symbols)
  ↓
3. Group exchanges by pair ID (handles duplicates)
  ↓
4. Create TradablePair objects with single-hop paths
  ↓
5. Return TradablePair[]
```

### User Story 3: Discover Multi-Hop Trading Paths

```
Developer calls: mento.exchanges.getTradablePairs({ cached: true })
  ↓
1. If cached=true:
   Try load from static cache file
   If exists → return TradablePairWithSpread[]
  ↓
2. Get direct pairs via getDirectPairs()
  ↓
3. Build connectivity structures:
   - addrToSymbol map
   - tokenGraph (adjacency list)
   - directPathMap (pair → exchange mapping)
  ↓
4. Generate all routes:
   - Add all direct pairs
   - For each token T1:
     - For each neighbor T2 of T1:
       - For each neighbor T3 of T2 (where T3 ≠ T1):
         - Create 2-hop route: T1 → T2 → T3
  ↓
5. For each pair with multiple routes:
   Apply route optimization heuristic
  ↓
6. Return TradablePair[] (optimal route per pair)
```

### User Story 4: Find Exchange for Specific Token Pair

```
Developer calls: mento.exchanges.findPairForTokens(tokenIn, tokenOut)
  ↓
1. Get all tradable pairs via getTradablePairs()
  ↓
2. Normalize token addresses (alphabetically sorted)
  ↓
3. Filter pairs matching the token pair
  ↓
4. If found → return TradablePair
   If not found → throw descriptive error
```

## Error Handling

### Exchange Not Found Errors

```typescript
class ExchangeNotFoundError extends Error {
  constructor(exchangeId: string) {
    super(`Exchange with ID "${exchangeId}" not found`)
    this.name = 'ExchangeNotFoundError'
  }
}
```

### Pair Not Found Errors

```typescript
class TradablePairNotFoundError extends Error {
  constructor(symbolA: string, symbolB: string) {
    super(`No tradable pair found between ${symbolA} and ${symbolB}`)
    this.name = 'TradablePairNotFoundError'
  }
}
```

### Invalid Exchange Data Errors

```typescript
class InvalidExchangeDataError extends Error {
  constructor(providerAddr: Address, reason: string) {
    super(`Invalid exchange data from provider ${providerAddr}: ${reason}`)
    this.name = 'InvalidExchangeDataError'
  }
}
```

**Handling Strategy**:

- Invalid exchanges: Skip with warning log, continue processing others
- Missing cache: Fall back to fresh generation, log cache miss
- Symbol fetch failures: Use address as fallback, log warning
- No providers: Return empty array, log warning

## Testing Strategy

### Unit Tests (tests/unit/)

**ExchangeService.test.ts**

- Test exchange caching behavior
- Test deduplication logic
- Test pair ID normalization (alphabetical sorting)
- Test error handling (not found, invalid data)
- Mock adapter to avoid blockchain calls

**routeUtils.test.ts**

- Test connectivity graph building
- Test 2-hop route generation
- Test route optimization heuristics
- Test circular route prevention
- Use fixture data (no blockchain calls)

### Integration Tests (tests/integration/)

**Shared Test Suite (shared/exchangeDiscovery.test.ts)**

- Test all 7 public methods
- Test with real Celo mainnet data
- Verify performance targets (<500ms cached, <10s fresh)
- Test edge cases (no providers, empty exchanges, missing symbols)

**Provider-Specific Tests**

- ethersExchangeDiscovery.test.ts: Run shared suite with Ethers v6 adapter
- viemExchangeDiscovery.test.ts: Run shared suite with Viem adapter
- Verify provider parity (identical results)

**Coverage Targets**:

- ExchangeService: >90% (high coverage for core logic)
- routeUtils: >95% (critical for correctness)
- Overall: >80% (constitution requirement)

## Migration from V1

### API Compatibility

**V1 → V3 Method Mapping**:

```
V1 Method                      → V3 Method
mento.getExchanges()          → exchangeService.getExchanges()
mento.getExchangesForProvider → exchangeService.getExchangesForProvider()
mento.getExchangeForTokens()  → exchangeService.getExchangeForTokens()
mento.getExchangeById()       → exchangeService.getExchangeById()
mento.getDirectPairs()        → exchangeService.getDirectPairs()
mento.getTradablePairs()      → exchangeService.getTradablePairs()
mento.getTradablePairsWithPath() → exchangeService.getTradablePairs()
mento.findPairForTokens()     → exchangeService.findPairForTokens()
```

**Breaking Changes**: None for data structures. Access pattern changes from `mento.method()` to `mento.exchanges.method()` (service-based).

### Data Structure Compatibility

All core types (Exchange, TradablePair, Asset) maintain v1 structure. No breaking changes to data formats.

## Performance Considerations

### Time Complexity

- `getExchanges()`: O(P × E) where P = providers, E = avg exchanges per provider
- `getDirectPairs()`: O(E × S) where E = exchanges, S = symbol fetch time
- `getTradablePairs()`: O(V²) where V = unique tokens (route generation)
- `findPairForTokens()`: O(1) amortized (after initial pair generation)

### Space Complexity

- Exchange cache: O(E) where E = total exchanges (~100-200 on Celo)
- Symbol cache: O(T) where T = unique tokens (~50-100 on Celo)
- Token graph: O(V + E) for adjacency list
- Route storage: O(V²) for all 2-hop routes (~1000-2000 on Celo)

### Optimization Strategies

1. **Lazy Loading**: Don't fetch exchanges until first call
2. **Symbol Batching**: Consider batch symbol fetching (future enhancement)
3. **Cache Preloading**: Static cache files avoid route generation
4. **Graph Pruning**: Only build connectivity graph when needed

## Implementation Phases

### Phase 0: Research & Architecture ✅ COMPLETE

- [x] Analyze v1 implementation
- [x] Design v3 adapter integration
- [x] Define service structure
- [x] Document route finding algorithm
- [x] Create research.md

### Phase 1: Design & Contracts ✅ COMPLETE

- [x] Define data model entities
- [x] Create API contracts
- [x] Write usage examples (quickstart.md)
- [x] Update agent context

### Phase 2: Tasks & Implementation (Next Phase)

- [ ] Generate detailed task breakdown (/speckit.tasks command)
- [ ] Implement types and ABIs
- [ ] Implement ExchangeService
- [ ] Implement routeUtils
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Update README with examples
- [ ] Generate static cache files

## Success Metrics

From spec success criteria:

- **SC-001**: ✓ Single API call for all exchanges
- **SC-002**: ✓ Single API call for all pairs
- **SC-003**: ✓ <500ms for cached queries (target: ~10-50ms)
- **SC-004**: ✓ <10s for fresh queries (target: ~2-5s)
- **SC-005**: ✓ Direct route preference in optimization
- **SC-006**: ✓ 100% coverage of 2-hop routes
- **SC-007**: ✓ Shared test suite ensures provider parity
- **SC-008**: ✓ Read-only operations (no signer in constructor)
- **SC-009**: ✓ Static cache includes spread data
- **SC-010**: ✓ Empty array handling for no providers

## Next Steps

1. **Run `/speckit.tasks`** to generate detailed task breakdown
2. **Review generated tasks** for completeness and ordering
3. **Begin implementation** starting with Phase 1 (types/ABIs)
4. **Checkpoint after each user story** for independent validation
5. **Integration test early** to validate adapter usage
6. **Generate cache files** once core functionality complete

## Artifacts Generated

- ✅ [research.md](./research.md) - V1 analysis, architecture decisions, algorithm details
- ✅ [data-model.md](./data-model.md) - Entity definitions, validation rules, relationships
- ✅ [quickstart.md](./quickstart.md) - Usage examples, code samples, best practices
- ✅ [contracts/ExchangeService.md](./contracts/ExchangeService.md) - API specification, method contracts
- ✅ [contracts/README.md](./contracts/README.md) - Contract directory guide

**Status**: Ready for task generation via `/speckit.tasks` command.
