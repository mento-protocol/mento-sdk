# Feature Specification: Exchange & Pool Discovery

**Feature Branch**: `002-exchange-pool-discovery`
**Created**: 2025-11-04
**Status**: Draft
**Input**: User description: "add exchanges and pool discovery to the v3 code base. These should allow consumers to get all exchanges, find an exchange for a pair of tokens, get an exchange by id, query tradeable pairs, get direct pairs only, or get pairs with routing path. The functionality should be the same as what's in V1 on main but API changes are fine if they improve the code. We should also make sure we are now using the exisging infra(adapters) for this update"

**Migration Context**: This feature ports exchange and pool discovery functionality from v1 (main branch) to v3. The v3 implementation should mirror v1 behavior and data structures where possible, while leveraging the new adapter infrastructure. API improvements are acceptable where they enhance usability or align with v3 architectural patterns.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Query All Available Exchanges (Priority: P1)

Developers need to discover all exchanges available in the Mento protocol to understand what trading pairs exist before executing swaps.

**Why this priority**: This is the foundation for all other exchange-related functionality. Without being able to list exchanges, developers cannot discover trading opportunities or build trading UIs.

**Independent Test**: Initialize SDK, call getExchanges(), verify returned array contains exchange objects with provider addresses, IDs, and asset pairs. Verify exchanges are grouped by provider.

**Acceptance Scenarios**:

1. **Given** SDK initialized with Celo mainnet provider, **When** developer calls getExchanges(), **Then** system returns array of all exchanges from all registered providers
2. **Given** SDK initialized with cached data, **When** developer calls getExchanges() multiple times, **Then** system returns cached results without additional blockchain queries
3. **Given** SDK initialized, **When** developer calls getExchangesForProvider(providerAddr), **Then** system returns only exchanges from that specific provider
4. **Given** SDK initialized, **When** developer calls getExchangeById(exchangeId), **Then** system returns the specific exchange or throws error if not found

---

### User Story 2 - Discover Direct Trading Pairs (Priority: P2)

Developers need to find all direct (single-hop) trading pairs to identify which tokens can be swapped without routing through intermediate tokens.

**Why this priority**: Direct pairs are simpler, cheaper (less gas), and faster than multi-hop routes. Most common trading scenarios use direct pairs, making this the second most critical feature.

**Independent Test**: Initialize SDK, call getDirectPairs(), verify returned pairs contain exactly one exchange hop in their path, verify no duplicate pairs exist, verify all pairs use alphabetically sorted symbols.

**Acceptance Scenarios**:

1. **Given** SDK initialized, **When** developer calls getDirectPairs(), **Then** system returns array of TradablePair objects with single-hop paths
2. **Given** multiple exchanges exist for same token pair, **When** developer calls getDirectPairs(), **Then** system returns single pair with multiple exchanges in path array
3. **Given** SDK initialized, **When** developer calls getExchangeForTokens(token0, token1), **Then** system returns exchange for that direct pair or throws error if none exists

---

### User Story 3 - Discover Multi-Hop Trading Paths (Priority: P3)

Developers need to discover all tradable pairs including multi-hop routes (e.g., cUSD → CELO → cEUR) to enable trading between tokens without direct exchanges.

**Why this priority**: Multi-hop routing enables trading between any two tokens in the protocol, even without direct liquidity. This is important for completeness but less common than direct swaps.

**Independent Test**: Initialize SDK, call getTradablePairs(), verify returned pairs include both direct and multi-hop routes, verify multi-hop routes have 2 exchanges in path, verify route optimization selects best path when multiple routes exist.

**Acceptance Scenarios**:

1. **Given** SDK initialized, **When** developer calls getTradablePairs(), **Then** system returns all direct pairs plus all valid 2-hop routes
2. **Given** multiple routes exist between two tokens, **When** developer calls getTradablePairs(), **Then** system returns single optimized route per pair (using spread data if available, else heuristics)
3. **Given** developer wants all possible routes, **When** developer calls getTradablePairs({ returnAllRoutes: true }), **Then** system returns all route variations per pair
4. **Given** SDK initialized with cached data, **When** developer calls getTradablePairs({ cached: true }), **Then** system loads pre-generated cached pairs with spread data

---

### User Story 4 - Find Exchange for Specific Token Pair (Priority: P4)

Developers need to look up the exchange details for a specific token pair to validate trading possibilities before price quotes.

**Why this priority**: This is a helper method that builds on the core discovery functionality. It's useful but not essential since developers can filter the results from other methods.

**Independent Test**: Initialize SDK, call findPairForTokens(tokenIn, tokenOut), verify returns TradablePair with routing path, verify throws descriptive error if pair doesn't exist.

**Acceptance Scenarios**:

1. **Given** SDK initialized, **When** developer calls findPairForTokens(cUSD, CELO), **Then** system returns TradablePair for that token pair
2. **Given** SDK initialized, **When** developer calls findPairForTokens(tokenA, tokenB) for non-existent pair, **Then** system throws error with message "No tradable pair found between [symbolA] and [symbolB]"

---

### Edge Cases

- What happens when Broker contract has no registered exchange providers? (Return empty array with warning log)
- What happens when exchange provider returns invalid exchange data (e.g., not exactly 2 assets)? (Skip invalid exchange with warning, continue processing others)
- What happens when token symbols cannot be fetched from on-chain? (Use address as fallback identifier, log warning)
- What happens when circular routes exist in token graph? (Limit route depth to 2 hops, preventing infinite loops)
- What happens when cached data doesn't exist for current chain? (Fall back to fresh blockchain queries, log cache miss)
- What happens when developer queries exchange for reversed token pair (e.g., CELO-cUSD vs cUSD-CELO)? (Normalize to alphabetically sorted pair ID, return same exchange)

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST fetch all exchange providers from Broker contract
- **FR-002**: System MUST fetch all exchanges from each provider contract
- **FR-003**: System MUST validate each exchange contains exactly 2 assets
- **FR-004**: System MUST cache fetched exchanges in memory for SDK instance lifetime
- **FR-005**: System MUST generate direct trading pairs from all exchanges
- **FR-006**: System MUST deduplicate pairs when multiple exchanges exist for same token pair
- **FR-007**: System MUST build token connectivity graph from direct pairs
- **FR-008**: System MUST generate 2-hop trading routes using connectivity graph
- **FR-009**: System MUST limit route depth to maximum 2 hops (direct or one intermediate token)
- **FR-010**: System MUST normalize all pair IDs using alphabetically sorted token symbols
- **FR-011**: System MUST support loading pre-generated cached pairs with spread data
- **FR-012**: System MUST select optimal route when multiple routes exist (spread > direct > stablecoin heuristic)
- **FR-013**: System MUST allow developers to request all routes instead of just optimal route
- **FR-014**: System MUST use existing adapter infrastructure for all contract interactions
- **FR-015**: System MUST fetch token symbols from on-chain when building pairs
- **FR-016**: System MUST throw descriptive errors when exchange or pair not found
- **FR-017**: System MUST support filtering exchanges by provider address
- **FR-018**: System MUST support looking up exchange by unique ID

### Non-Functional Requirements (Per Constitution)

_Reference: [Mento SDK Constitution](../.specify/memory/constitution.md)_

- **NFR-001**: All public APIs MUST have TypeScript type definitions and comprehensive JSDoc comments
- **NFR-002**: Feature MUST work with all supported providers (Ethers v6, Viem) using adapter pattern
- **NFR-003**: Code coverage MUST be maintained above 80% for new services
- **NFR-004**: All async operations MUST include error handling with actionable error messages
- **NFR-005**: All contract addresses MUST be checksummed and validated
- **NFR-006**: All numeric values from blockchain MUST use BigInt for precision
- **NFR-007**: Query methods MUST complete within 2 seconds when using cached data
- **NFR-008**: Query methods MUST complete within 10 seconds when fetching fresh from blockchain
- **NFR-009**: Feature MUST maintain backward compatibility with v1 data structures where possible
- **NFR-010**: All exchange and pair discovery methods MUST be read-only operations (no signer required)

### Key Entities _(include if feature involves data)_

- **Exchange**: Represents a liquidity pool between two tokens

  - Provider address (contract managing this exchange)
  - Exchange ID (unique identifier within provider)
  - Asset pair (two token addresses)

- **TradablePair**: Represents a tradable route between two tokens

  - Pair ID (canonical identifier using sorted symbols)
  - Assets (two token objects with address and symbol)
  - Path (array of exchange hops to execute the trade)
  - Each hop contains provider address, exchange ID, and asset pair

- **Asset**: Represents a token in the protocol

  - Contract address
  - Token symbol (e.g., 'cUSD', 'CELO')

- **ConnectivityData**: Internal graph structure for route finding
  - Address-to-symbol mapping for quick lookups
  - Token graph (adjacency list of direct connections)
  - Direct path map (token pair to exchange mapping)

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Developers can discover all available exchanges with no more than 1 API call
- **SC-002**: Developers can discover all tradable pairs (direct + multi-hop) with no more than 1 API call
- **SC-003**: Exchange queries using cached data complete in under 500 milliseconds
- **SC-004**: Exchange queries without cache complete in under 10 seconds on Celo mainnet
- **SC-005**: Route optimization selects direct routes over 2-hop routes when both exist
- **SC-006**: System generates correct 2-hop routes for 100% of token pairs without direct exchanges
- **SC-007**: Pair discovery returns identical results across Ethers v6 and Viem providers
- **SC-008**: All exchange and pair methods work without requiring a signer (read-only operations)
- **SC-009**: Cached pair data includes spread information for optimal route selection
- **SC-010**: SDK correctly handles chains with 0 registered exchanges (returns empty array without errors)

## Scope

### In Scope

- Fetching exchanges from Broker and provider contracts
- Building direct trading pairs from exchanges
- Generating 2-hop trading routes
- Route optimization using spread data and heuristics
- In-memory caching of exchanges and pairs
- Static cache file support for pre-generated pairs
- Token symbol fetching for pair identification
- Exchange lookup by ID and token pair
- Provider-specific exchange queries

### Out of Scope

- Token swap execution (separate feature)
- Price quote calculations (separate feature)
- Routes with more than 2 hops (future enhancement)
- Real-time liquidity-based route optimization (future enhancement)
- Trading limit and circuit breaker integration (separate feature)
- Token approval operations (already implemented in v3)
- Dynamic spread data collection (use pre-generated cache initially)
- Exchange creation or modification (protocol governance function)

## Dependencies

### External Dependencies

- Broker contract (for provider list)
- Exchange provider contracts (for exchange list)
- ERC-20 contracts (for token symbol fetching)
- Existing adapter infrastructure (for contract interactions)

### Internal Dependencies

- Adapter pattern (Ethers v6 and Viem implementations)
- Contract ABIs (Broker, ExchangeProvider, ERC-20)
- Constants module (contract addresses)
- Error handling utilities

## Assumptions

- Broker contract maintains accurate list of exchange providers
- Exchange provider contracts return valid exchange data
- Token contracts implement ERC-20 symbol() method
- Maximum 2-hop routes are sufficient for 95%+ of trading pairs
- Pre-generated cached pair data is available for supported chains (Celo mainnet, Alfajores)
- Exchange data remains relatively static (caching for instance lifetime is safe)
- Developers understand blockchain concepts (addresses, tokens, exchanges)
- v1 route optimization heuristics (spread > direct > stablecoin) provide good defaults
