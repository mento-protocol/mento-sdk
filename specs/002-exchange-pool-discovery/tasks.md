# Tasks: Exchange & Pool Discovery

**Input**: Design documents from `/specs/002-exchange-pool-discovery/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/ExchangeService.md

**Tests**: Per the [Mento SDK Constitution](../../.specify/memory/constitution.md), comprehensive testing is REQUIRED:
- All services MUST have unit tests
- All provider integrations MUST have integration tests
- Shared test suites MUST ensure provider parity
- Code coverage MUST be maintained above 80%

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure needed for exchange discovery

- [ ] T001 Verify existing adapter infrastructure is functional in src/adapters/
- [ ] T002 [P] Verify Broker ABI exists or extend in src/abis/broker.ts with getExchangeProviders() method
- [ ] T003 [P] Create ExchangeProvider ABI in src/abis/exchangeProvider.ts with getExchanges() method
- [ ] T004 [P] Verify ERC-20 ABI in src/abis/erc20.ts includes symbol() method

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core type definitions and utilities that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 [P] Create Exchange type definition in src/types/exchange.ts (providerAddr, id, assets[])
- [ ] T006 [P] Create Asset type definition in src/types/exchange.ts (address, symbol)
- [ ] T007 [P] Create TradablePair type definition in src/types/exchange.ts (id, assets, path)
- [ ] T008 [P] Create TradablePairWithSpread type definition in src/types/exchange.ts (extends TradablePair with spreadData)
- [ ] T009 [P] Create TradablePairID type alias in src/types/exchange.ts
- [ ] T010 Export all new types from src/types/index.ts
- [ ] T011 [P] Create internal ConnectivityData interface in src/utils/routeUtils.ts (not exported)
- [ ] T012 [P] Create internal ExchangeDetails interface in src/utils/routeUtils.ts (not exported)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Query All Available Exchanges (Priority: P1) 🎯 MVP

**Goal**: Enable developers to discover all exchanges in the Mento protocol with single API call

**Independent Test**: Initialize SDK with Celo mainnet provider, call getExchanges(), verify returned array contains exchange objects with provider addresses, IDs, and asset pairs grouped by provider

### Tests for User Story 1 (REQUIRED per Constitution) ⚠️

**NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T013 [P] [US1] Create unit test file tests/unit/services/ExchangeService.test.ts with test skeleton
- [ ] T014 [P] [US1] Add unit test: getExchanges() returns cached results on second call
- [ ] T015 [P] [US1] Add unit test: getExchanges() validates exchange has exactly 2 assets
- [ ] T016 [P] [US1] Add unit test: getExchanges() skips invalid exchanges with warning
- [ ] T017 [P] [US1] Add unit test: getExchangesForProvider() filters by provider address
- [ ] T018 [P] [US1] Add unit test: getExchangeById() returns exchange or throws ExchangeNotFoundError
- [ ] T019 [P] [US1] Add unit test: getExchangeById() throws if multiple exchanges found (assertion)
- [ ] T020 [P] [US1] Create integration test file tests/integration/adapters/ethersExchangeDiscovery.test.ts
- [ ] T021 [P] [US1] Create integration test file tests/integration/adapters/viemExchangeDiscovery.test.ts
- [ ] T022 [P] [US1] Create shared test suite tests/integration/shared/exchangeDiscovery.test.ts with getExchanges() test
- [ ] T023 [US1] Run tests to confirm they FAIL (implementation doesn't exist yet)

### Implementation for User Story 1

- [ ] T024 [US1] Create ExchangeService class in src/services/ExchangeService.ts with constructor accepting ProviderAdapter
- [ ] T025 [US1] Add private exchanges cache property to ExchangeService (Map or Array)
- [ ] T026 [US1] Implement getExchanges() method: fetch providers from Broker, fetch exchanges from each provider, validate and cache
- [ ] T027 [US1] Add address checksumming for all provider and asset addresses using adapter
- [ ] T028 [US1] Add validation: assert each exchange has exactly 2 assets, skip invalid with warning log
- [ ] T029 [US1] Implement getExchangesForProvider(providerAddr) method: filter cached exchanges by provider
- [ ] T030 [US1] Implement getExchangeById(exchangeId) method: search cached exchanges, throw ExchangeNotFoundError if not found
- [ ] T031 [US1] Add retry logic using existing src/utils/retry.ts for adapter calls
- [ ] T032 [US1] Add JSDoc comments to all public methods with @param, @returns, @throws, and usage examples
- [ ] T033 [US1] Add error classes: ExchangeNotFoundError in src/types/errors.ts or inline
- [ ] T034 [US1] Ensure TypeScript strict mode compliance across all new code
- [ ] T035 [US1] Export ExchangeService from src/services/index.ts
- [ ] T036 [US1] Export ExchangeService from src/index.ts
- [ ] T037 [US1] Run tests to verify User Story 1 passes independently

**Checkpoint**: At this point, User Story 1 should be fully functional - developers can discover all exchanges

---

## Phase 4: User Story 2 - Discover Direct Trading Pairs (Priority: P2)

**Goal**: Enable developers to find all direct (single-hop) trading pairs without routing through intermediate tokens

**Independent Test**: Initialize SDK, call getDirectPairs(), verify returned pairs contain exactly one exchange hop in path, verify no duplicate pairs exist, verify all pairs use alphabetically sorted symbols

### Tests for User Story 2 (REQUIRED per Constitution) ⚠️

- [ ] T038 [P] [US2] Add unit test to tests/unit/services/ExchangeService.test.ts: getDirectPairs() returns TradablePair array
- [ ] T039 [P] [US2] Add unit test: getDirectPairs() deduplicates multiple exchanges for same pair
- [ ] T040 [P] [US2] Add unit test: getDirectPairs() sorts pair assets alphabetically by symbol
- [ ] T041 [P] [US2] Add unit test: getDirectPairs() creates canonical pair IDs (symbol sorting)
- [ ] T042 [P] [US2] Add unit test: getDirectPairs() fetches token symbols and caches them
- [ ] T043 [P] [US2] Add unit test: getExchangeForTokens() returns exchange for direct pair or throws
- [ ] T044 [P] [US2] Add unit test: getExchangeForTokens() handles bidirectional token order
- [ ] T045 [P] [US2] Add shared test suite case: getDirectPairs() returns identical results across providers
- [ ] T046 [P] [US2] Add shared test suite case: getExchangeForTokens() works identically across providers
- [ ] T047 [US2] Run tests to confirm they FAIL

### Implementation for User Story 2

- [ ] T048 [US2] Add private token symbol cache to ExchangeService (Map<address, symbol>)
- [ ] T049 [US2] Implement helper method: fetchTokenSymbol(address) using ERC-20 ABI, with fallback to address if fetch fails
- [ ] T050 [US2] Implement getDirectPairs() method: get exchanges, fetch symbols in parallel, group by sorted pair ID, create TradablePair objects
- [ ] T051 [US2] Implement pair ID generation: sort symbols alphabetically, join with hyphen
- [ ] T052 [US2] Implement getExchangeForTokens(token0, token1): search exchanges for matching pair, throw ExchangeNotFoundError if none
- [ ] T053 [US2] Add validation: throw if multiple exchanges found for same pair (assertion check)
- [ ] T054 [US2] Add batch symbol fetching using Promise.all() for performance
- [ ] T055 [US2] Add JSDoc comments to new methods with usage examples
- [ ] T056 [US2] Handle symbol fetch failures gracefully: use address as fallback, log warning
- [ ] T057 [US2] Run tests to verify User Story 2 passes independently

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Discover Multi-Hop Trading Paths (Priority: P3)

**Goal**: Enable developers to discover all tradable pairs including multi-hop routes (e.g., cUSD → CELO → cEUR) to enable trading between tokens without direct exchanges

**Independent Test**: Initialize SDK, call getTradablePairs(), verify returned pairs include both direct and multi-hop routes, verify multi-hop routes have 2 exchanges in path, verify route optimization selects best path when multiple routes exist

### Tests for User Story 3 (REQUIRED per Constitution) ⚠️

- [ ] T058 [P] [US3] Create unit test file tests/unit/utils/routeUtils.test.ts with test skeleton
- [ ] T059 [P] [US3] Add unit test: buildConnectivityStructures() creates token graph and maps correctly
- [ ] T060 [P] [US3] Add unit test: generateAllRoutes() finds all 2-hop routes via graph traversal
- [ ] T061 [P] [US3] Add unit test: generateAllRoutes() prevents circular routes (A→B→A)
- [ ] T062 [P] [US3] Add unit test: selectOptimalRoutes() prefers lowest spread when available
- [ ] T063 [P] [US3] Add unit test: selectOptimalRoutes() prefers direct over multi-hop
- [ ] T064 [P] [US3] Add unit test: selectOptimalRoutes() prefers major stablecoin routes
- [ ] T065 [P] [US3] Add unit test: selectBestRoute() applies 4-tier heuristic correctly
- [ ] T066 [P] [US3] Add unit test to ExchangeService.test.ts: getTradablePairs() returns both direct and 2-hop pairs
- [ ] T067 [P] [US3] Add unit test: getTradablePairs({cached: true}) loads from static cache
- [ ] T068 [P] [US3] Add unit test: getTradablePairs({cached: false}) generates fresh from blockchain
- [ ] T069 [P] [US3] Add unit test: getTradablePairs() falls back to fresh if cache missing
- [ ] T070 [P] [US3] Add shared test suite case: getTradablePairs() returns identical results across providers
- [ ] T071 [US3] Run tests to confirm they FAIL

### Implementation for User Story 3

- [ ] T072 [P] [US3] Implement buildConnectivityStructures(directPairs) in src/utils/routeUtils.ts: create addrToSymbol map
- [ ] T073 [P] [US3] Add tokenGraph creation (adjacency list with bidirectional edges) to buildConnectivityStructures()
- [ ] T074 [P] [US3] Add directPathMap creation (sorted pair ID to exchange mapping) to buildConnectivityStructures()
- [ ] T075 [US3] Implement generateAllRoutes(connectivity) in src/utils/routeUtils.ts: add all direct pairs
- [ ] T076 [US3] Add 2-hop route discovery to generateAllRoutes(): for each token A, for each neighbor B, for each neighbor C (C ≠ A), create route A→B→C
- [ ] T077 [US3] Add route grouping by canonical pair ID in generateAllRoutes()
- [ ] T078 [P] [US3] Implement selectOptimalRoutes(allRoutes, returnAllRoutes, addrToSymbol) in src/utils/routeUtils.ts
- [ ] T079 [P] [US3] Implement selectBestRoute(candidates) helper in src/utils/routeUtils.ts with 4-tier heuristic
- [ ] T080 [US3] Add Tier 1 optimization: select lowest totalSpreadPercent if spreadData available
- [ ] T081 [US3] Add Tier 2 optimization: prefer single-hop over multi-hop routes
- [ ] T082 [US3] Add Tier 3 optimization: prefer routes through major stablecoins (cUSD, cEUR, USDC, USDT)
- [ ] T083 [US3] Add Tier 4 fallback: use first available route
- [ ] T084 [US3] Implement getTradablePairs(options) in src/services/ExchangeService.ts with cached option
- [ ] T085 [US3] Add cache loading logic: try loadCachedPairs(chainId), fallback to fresh generation with warning
- [ ] T086 [US3] Implement fresh pair generation: call getDirectPairs(), buildConnectivity, generateAllRoutes, selectOptimal
- [ ] T087 [US3] Create placeholder cached pair loader (returns empty or throws for now - actual cache files come later)
- [ ] T088 [US3] Add JSDoc comments to all route utility functions and getTradablePairs()
- [ ] T089 [US3] Export route utility functions that need to be tested (or keep internal if only used by service)
- [ ] T090 [US3] Run tests to verify User Story 3 passes independently

**Checkpoint**: All core user stories should now be independently functional

---

## Phase 6: User Story 4 - Find Exchange for Specific Token Pair (Priority: P4)

**Goal**: Enable developers to look up exchange details for a specific token pair to validate trading possibilities before price quotes

**Independent Test**: Initialize SDK, call findPairForTokens(tokenIn, tokenOut), verify returns TradablePair with routing path, verify throws descriptive error if pair doesn't exist

### Tests for User Story 4 (REQUIRED per Constitution) ⚠️

- [ ] T091 [P] [US4] Add unit test to ExchangeService.test.ts: findPairForTokens() returns pair for valid tokens
- [ ] T092 [P] [US4] Add unit test: findPairForTokens() throws PairNotFoundError if no route exists
- [ ] T093 [P] [US4] Add unit test: findPairForTokens() handles bidirectional token order (A→B vs B→A)
- [ ] T094 [P] [US4] Add unit test: findPairForTokens() returns optimal route when multiple exist
- [ ] T095 [P] [US4] Add shared test suite case: findPairForTokens() works identically across providers
- [ ] T096 [US4] Run tests to confirm they FAIL

### Implementation for User Story 4

- [ ] T097 [US4] Implement findPairForTokens(tokenIn, tokenOut) in src/services/ExchangeService.ts
- [ ] T098 [US4] Call getTradablePairs() to get all routes
- [ ] T099 [US4] Normalize token addresses (checksum and alphabetically sort)
- [ ] T100 [US4] Filter pairs matching the token pair (bidirectional search)
- [ ] T101 [US4] Throw PairNotFoundError with message "No pair found for tokens {tokenIn} and {tokenOut}. They may not have a tradable path." if not found
- [ ] T102 [US4] Add PairNotFoundError class in src/types/errors.ts or inline
- [ ] T103 [US4] Add JSDoc comments with usage example
- [ ] T104 [US4] Run tests to verify User Story 4 passes independently

**Checkpoint**: All user stories complete - full exchange discovery functionality available

---

## Phase 7: Integration & Provider Parity

**Purpose**: Ensure all providers (Ethers v6, Viem) work identically

- [ ] T105 [P] Run Ethers v6 integration tests in tests/integration/adapters/ethersExchangeDiscovery.test.ts
- [ ] T106 [P] Run Viem integration tests in tests/integration/adapters/viemExchangeDiscovery.test.ts
- [ ] T107 Compare results from both providers for all methods (getExchanges, getDirectPairs, getTradablePairs, findPairForTokens)
- [ ] T108 Verify identical exchange counts, pair IDs, and route structures across providers
- [ ] T109 Fix any provider-specific discrepancies found
- [ ] T110 [P] Run shared test suite against both providers to verify 100% parity

---

## Phase 8: Static Cache Generation (Optional Enhancement)

**Purpose**: Create pre-generated cached pairs for instant query resolution

**NOTE**: Can be deferred to post-MVP if time-constrained

- [ ] T111 Create script scripts/generateCachedPairs.ts to generate cached pairs
- [ ] T112 Script fetches all exchanges from Celo mainnet (chain ID 42220)
- [ ] T113 Script generates all tradable pairs including 2-hop routes
- [ ] T114 Script adds spread data (mock or from historical data source)
- [ ] T115 Script writes output to src/constants/tradablePairs/42220.ts as TradablePairWithSpread[]
- [ ] T116 [P] Repeat for Alfajores testnet (chain ID 44787) in src/constants/tradablePairs/44787.ts
- [ ] T117 Create cache loader utility in src/constants/tradablePairs/index.ts
- [ ] T118 Update getTradablePairs() to use real cache loader instead of placeholder
- [ ] T119 Add cache files to git (committed as source code, not generated at build time)
- [ ] T120 Test cached pair loading for both chains

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T121 [P] Add comprehensive JSDoc comments to ExchangeService with detailed examples in src/services/ExchangeService.ts
- [ ] T122 [P] Add quickstart examples to README.md showing common usage patterns
- [ ] T123 [P] Update CLAUDE.md with new technologies and commands used in this feature
- [ ] T124 Verify all addresses are checksummed using adapter normalization
- [ ] T125 Verify all numeric values use BigInt where applicable (may not apply to this feature)
- [ ] T126 [P] Run ESLint across src/services/ExchangeService.ts and src/utils/routeUtils.ts
- [ ] T127 [P] Run Prettier across all modified files
- [ ] T128 Verify code coverage meets 80% threshold: run coverage report
- [ ] T129 Performance optimization: verify Promise.all() used for parallel symbol fetching
- [ ] T130 Performance optimization: verify no O(n²) operations except intentional route generation
- [ ] T131 Constitution compliance review: verify all 6 principles followed
- [ ] T132 Security audit: validate no injection vulnerabilities, addresses validated
- [ ] T133 Error message review: ensure all errors have actionable messages
- [ ] T134 [P] Create or update API documentation from JSDoc comments

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4)
- **Integration (Phase 7)**: Depends on all user stories being complete
- **Cache Generation (Phase 8)**: Depends on User Story 3 (getTradablePairs) - can be deferred
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Uses US1's getExchanges() but independently testable
- **User Story 3 (P3)**: Depends on User Story 2 (needs getDirectPairs()) - Must complete US2 first
- **User Story 4 (P4)**: Depends on User Story 3 (needs getTradablePairs()) - Must complete US3 first

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Type definitions before service methods
- Core methods before helper methods
- Implementation before JSDoc polish
- Story complete and tested before moving to next priority

### Parallel Opportunities

**Setup Phase (Phase 1)**:
- T002, T003, T004 can all run in parallel (different ABI files)

**Foundational Phase (Phase 2)**:
- T005, T006, T007, T008, T009 can run in parallel (different type definitions)
- T011, T012 can run in parallel (different interfaces in utils file)

**User Story 1 Tests**:
- T013-T019 can run in parallel (different test cases in same or different files)
- T020, T021, T022 can run in parallel (different integration test files)

**User Story 2 Tests**:
- T038-T046 can run in parallel (different test cases)

**User Story 3 Tests**:
- T058-T071 can run in parallel (different test cases in different files)

**User Story 3 Implementation**:
- T072, T073, T074 can run in parallel if careful (same file but different functions)
- T078, T079 can run in parallel (different functions)

**User Story 4 Tests**:
- T091-T095 can run in parallel (different test cases)

**Cache Generation (Phase 8)**:
- T116 can run in parallel with T115 (different chain IDs)

**Polish (Phase 9)**:
- T121, T122, T123 can run in parallel (different documentation files)
- T126, T127 can run in parallel (different tools)

---

## Parallel Example: User Story 1 Implementation

```bash
# After tests are written and failing, launch parallel implementation tasks:

# Types can be created in parallel (Phase 2):
Task T005: "Create Exchange type in src/types/exchange.ts"
Task T006: "Create Asset type in src/types/exchange.ts"
Task T007: "Create TradablePair type in src/types/exchange.ts"

# Later, these service methods can be implemented in sequence:
Task T026: "Implement getExchanges() method" (core method)
Task T029: "Implement getExchangesForProvider()" (uses T026's cache)
Task T030: "Implement getExchangeById()" (uses T026's cache)
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Query exchanges)
4. **VALIDATE**: Test User Story 1 independently
5. Complete Phase 4: User Story 2 (Direct pairs)
6. **VALIDATE**: Test User Stories 1 and 2 together
7. Complete Phase 7: Integration & Provider Parity
8. Complete Phase 9: Polish
9. **STOP and DEPLOY**: MVP with exchange and direct pair discovery

### Full Feature (All User Stories)

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently
3. Add User Story 2 → Test independently
4. Add User Story 3 → Test independently (enables multi-hop routing!)
5. Add User Story 4 → Test independently
6. Complete Integration & Provider Parity
7. **OPTIONAL**: Add Static Cache (Phase 8) for production performance
8. Complete Polish
9. Deploy full feature

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (P1)
   - Developer B: Can start User Story 2 (P2) in parallel
3. After US2 complete:
   - Developer A or B: User Story 3 (P3) - depends on US2
4. After US3 complete:
   - Developer A or B: User Story 4 (P4) - depends on US3
5. Both: Integration testing and polish together

---

## Task Metrics

**Total Tasks**: 134
- Setup: 4 tasks
- Foundational: 8 tasks
- User Story 1: 24 tasks (13 tests + 11 implementation)
- User Story 2: 20 tasks (10 tests + 10 implementation)
- User Story 3: 33 tasks (14 tests + 19 implementation)
- User Story 4: 8 tasks (6 tests + 2 implementation)
- Integration: 6 tasks
- Cache Generation: 10 tasks (optional)
- Polish: 14 tasks

**Parallel Opportunities**: ~40 tasks marked [P] can run in parallel within their phases

**Suggested MVP Scope**: Phases 1-4, 7, 9 (User Stories 1-2 only) = ~70 tasks

**Independent Test Criteria**:
- US1: Can fetch and display all exchanges from Mento protocol ✅
- US2: Can discover all direct trading pairs with deduplicated exchange groups ✅
- US3: Can discover multi-hop routes and select optimal paths ✅
- US4: Can lookup any token pair and get routing information ✅

---

## Notes

- [P] tasks = different files or independent units, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Tests written FIRST (TDD approach) - they should fail before implementation
- Commit after each logical task group or story completion
- Stop at any checkpoint to validate story independently
- User Story 3 depends on US2, User Story 4 depends on US3 (sequential dependencies)
- Cache generation (Phase 8) is optional and can be deferred post-MVP
- Constitution requires >80% code coverage - verify after each story
- Provider parity is critical - test both Ethers v6 and Viem implementations
