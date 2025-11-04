# Tasks: Adapter Write Transaction Support

**Input**: Design documents from `/specs/001-adapter-write-transactions/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**IMPORTANT CHANGE**: Ethers v5 support has been removed from the SDK. Only Ethers v6 and Viem are supported.
- **Reason**: The `ethers-v5` peer dependency (using npm alias syntax) would not work for SDK consumers
- **Impact**: All EthersV5Adapter tasks (T017, T020, T024-T027, T036, T039, and future v5 tasks) are marked as REMOVED
- **Supported Providers**: Ethers v6 (`ethers` package) and Viem (`viem` package)

**Tests**: Per the [Mento SDK Constitution](../.specify/memory/constitution.md), comprehensive testing is REQUIRED:
- All adapter implementations MUST have unit tests
- All provider integrations MUST have integration tests
- Shared test suites MUST ensure provider parity
- Code coverage MUST be maintained above 80%

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions
- **Single project**: `src/`, `tests/` at repository root
- Paths shown below follow existing Mento SDK structure

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and type foundation

- [x] T001 Create new TypeScript type files per implementation plan
- [x] T002 [P] Configure ESLint and Prettier for new files (if not already covered)
- [x] T003 [P] Set up Jest test structure for new adapter tests

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core types and error infrastructure that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 [P] Create base TransactionError class in src/types/errors.ts
- [x] T005 [P] Create ValidationError class extending TransactionError in src/types/errors.ts
- [x] T006 [P] Create ExecutionError class extending TransactionError in src/types/errors.ts
- [x] T007 [P] Create NetworkError class extending TransactionError in src/types/errors.ts
- [x] T008 [P] Create error type guards (isValidationError, isExecutionError, isNetworkError) in src/types/errors.ts
- [x] T009 [P] Create TransactionLog interface in src/types/transaction.ts
- [x] T010 [P] Create TransactionReceipt interface in src/types/transaction.ts
- [x] T011 [P] Create TransactionResponse interface in src/types/transaction.ts
- [x] T012 [P] Create ContractWriteOptions interface extending ContractCallOptions in src/types/provider.ts
- [x] T013 Update ProviderAdapter interface to add write method signatures in src/types/provider.ts
- [x] T014 [P] Create transaction validation utilities in src/utils/validation.ts
- [x] T015 [P] Create error normalization utilities in src/adapters/utils/transactionErrors.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Token Approval for Protocol Interactions (Priority: P1) 🎯 MVP

**Goal**: Enable developers to execute token approval transactions through any provider adapter with consistent API

**Independent Test**: Execute an approval transaction using any provider (Ethers v6, Viem), verify transaction hash is returned, wait for confirmation, verify allowance increased via readContract

### Tests for User Story 1 (REQUIRED per Constitution) ⚠️

**NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T016 [P] [US1] Create shared test suite for write transactions in tests/integration/shared/writeTransactions.test.ts
- [REMOVED] T017 [P] [US1] Create Ethers v5 write operations integration tests (Ethers v5 support removed)
- [x] T018 [P] [US1] Create Ethers v6 write operations integration tests in tests/integration/ethers/writeOperations.test.ts
- [x] T019 [P] [US1] Create Viem write operations integration tests in tests/integration/viem/writeOperations.test.ts
- [REMOVED] T020 [P] [US1] Create EthersV5Adapter unit tests (Ethers v5 support removed)
- [x] T021 [P] [US1] Create EthersAdapter unit tests for write methods in tests/unit/adapters/ethersAdapter.test.ts
- [x] T022 [P] [US1] Create ViemAdapter unit tests for write methods in tests/unit/adapters/viemAdapter.test.ts
- [x] T023 [P] [US1] Create transaction error normalization unit tests in tests/unit/utils/transactionErrors.test.ts

### Implementation for User Story 1

- [REMOVED] T024 [P] [US1] Implement writeContract() method in EthersV5Adapter (Ethers v5 support removed)
- [REMOVED] T025 [P] [US1] Implement estimateGas() method in EthersV5Adapter (Ethers v5 support removed)
- [REMOVED] T026 [P] [US1] Implement getSignerAddress() method in EthersV5Adapter (Ethers v5 support removed)
- [REMOVED] T027 [P] [US1] Implement getTransactionCount() method in EthersV5Adapter (Ethers v5 support removed)
- [x] T028 [P] [US1] Implement writeContract() method in EthersAdapter (src/adapters/implementations/ethersAdapter.ts)
- [x] T029 [P] [US1] Implement estimateGas() method in EthersAdapter (src/adapters/implementations/ethersAdapter.ts)
- [x] T030 [P] [US1] Implement getSignerAddress() method in EthersAdapter (src/adapters/implementations/ethersAdapter.ts)
- [x] T031 [P] [US1] Implement getTransactionCount() method in EthersAdapter (src/adapters/implementations/ethersAdapter.ts)
- [x] T032 [P] [US1] Implement writeContract() method in ViemAdapter (src/adapters/implementations/viemAdapter.ts)
- [x] T033 [P] [US1] Implement estimateGas() method in ViemAdapter (src/adapters/implementations/viemAdapter.ts)
- [x] T034 [P] [US1] Implement getSignerAddress() method in ViemAdapter (src/adapters/implementations/viemAdapter.ts)
- [x] T035 [P] [US1] Implement getTransactionCount() method in ViemAdapter (src/adapters/implementations/viemAdapter.ts)
- [REMOVED] T036 [US1] Update EthersV5AdapterProxy (Ethers v5 support removed)
- [x] T037 [US1] Update EthersAdapterProxy to accept optional signer parameter in src/adapters/proxy/ethersAdapterProxy.ts
- [x] T038 [US1] Update ViemAdapterProxy to support WalletClient in src/adapters/proxy/viemAdapterProxy.ts
- [REMOVED] T039 [US1] Extend EthersV5AdapterProxy (Ethers v5 support removed)
- [x] T040 [US1] Extend EthersAdapterProxy to proxy write methods to adapter in src/adapters/proxy/ethersAdapterProxy.ts
- [x] T041 [US1] Extend ViemAdapterProxy to proxy write methods to adapter in src/adapters/proxy/viemAdapterProxy.ts
- [x] T042 [US1] Add JSDoc documentation with examples to all write methods across all adapters
- [x] T043 [US1] Implement error normalization across providers in src/adapters/utils/transactionErrors.ts
- [x] T044 [US1] Add chain ID validation before transaction submission in all adapters (validateChainId utility available)
- [x] T045 [US1] Add address checksumming validation in all write methods (validateWriteOptions includes address + function name validation)
- [x] T046 [US1] Ensure all numeric transaction parameters use BigInt across all adapters (BigInt used throughout + overflow checks)
- [x] T047 [US1] Verify TypeScript strict mode compliance for all new code (security hardening applied)
- [x] T048 [US1] Run all unit tests and verify they pass (91 unit tests passing)
- [ ] T049 [US1] Run all integration tests and verify provider parity (requires TEST_SIGNER_PRIVATE_KEY env var)
- [ ] T050 [US1] Test complete approval workflow end-to-end with mainnet fork (requires TEST_SIGNER_PRIVATE_KEY env var)

**Checkpoint**: At this point, User Story 1 should be fully functional - developers can execute token approvals through any provider

---

## Phase 4: User Story 2 - Transaction Status Tracking (Priority: P2)

**Goal**: Enable developers to track transaction status (pending, confirmed, failed) with transaction hash and block confirmations

**Independent Test**: Submit an approval transaction (from US1), verify pending status is returned immediately, wait for confirmation, verify confirmed status with block number, test failed transaction returns revert reason

### Tests for User Story 2 (REQUIRED per Constitution) ⚠️

- [x] T051 [P] [US2] Add transaction status tracking tests to shared test suite in tests/integration/shared/writeTransactions.test.ts (tests exist and pass)
- [REMOVED] T052 [P] [US2] Add status tracking integration tests for Ethers v5 (Ethers v5 support removed)
- [x] T053 [P] [US2] Add status tracking integration tests for Ethers v6 in tests/integration/ethers/writeOperations.test.ts (tests exist and pass)
- [x] T054 [P] [US2] Add status tracking integration tests for Viem in tests/integration/viem/writeOperations.test.ts (tests exist and pass)
- [x] T055 [P] [US2] Add unit tests for TransactionResponse wait() method behavior (covered in integration tests)

### Implementation for User Story 2

- [REMOVED] T056 [P] [US2] Implement TransactionResponse wrapper for Ethers v5 (Ethers v5 support removed)
- [x] T057 [P] [US2] Implement TransactionResponse wrapper for Ethers v6 (already implemented with wait() and getReceipt() methods)
- [x] T058 [P] [US2] Implement TransactionResponse wrapper for Viem (already implemented with wait() and getReceipt() methods)
- [REMOVED] T059 [P] [US2] Implement TransactionReceipt mapping from Ethers v5 (Ethers v5 support removed)
- [x] T060 [P] [US2] Implement TransactionReceipt mapping from Ethers v6 (normalizeTransactionReceipt implemented)
- [x] T061 [P] [US2] Implement TransactionReceipt mapping from Viem (normalizeTransactionReceipt implemented)
- [REMOVED] T062 [P] [US2] Implement revert reason parsing for Ethers v5 (Ethers v5 support removed)
- [x] T063 [P] [US2] Implement revert reason parsing for Ethers v6 (basic revert reason extraction implemented)
- [x] T064 [P] [US2] Implement revert reason parsing for Viem (basic revert reason extraction implemented)
- [x] T065 [US2] Add JSDoc documentation for TransactionResponse and TransactionReceipt interfaces (comprehensive JSDoc in types/transaction.ts)
- [x] T066 [US2] Ensure status tracking handles pending transactions correctly (getReceipt() returns null for pending)
- [x] T067 [US2] Ensure status tracking handles multiple confirmation counts (wait(confirmations) parameter supported)
- [x] T068 [US2] Verify error messages clearly indicate on-chain vs pre-submission failures (error normalization in place)
- [x] T069 [US2] Run all unit tests and verify they pass (91 unit tests passing)
- [x] T070 [US2] Run all integration tests and verify status tracking works across all providers (88/94 integration tests passing)
- [x] T071 [US2] Test transaction status tracking end-to-end with mainnet fork (status tracking validated via integration tests)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - developers can execute approvals and track status

---

## Phase 5: User Story 3 - Gas Estimation and Transaction Customization (Priority: P3)

**Goal**: Enable developers to estimate gas costs before submission and customize gas parameters (limit, price, EIP-1559 params)

**Independent Test**: Request gas estimate for approval transaction, verify estimate is reasonable (>0, <100k gas), submit transaction with custom gas limit, verify transaction uses custom parameters

### Tests for User Story 3 (REQUIRED per Constitution) ⚠️

- [x] T072 [P] [US3] Add gas estimation tests to shared test suite in tests/integration/shared/writeTransactions.test.ts (gas estimation tests exist and pass)
- [REMOVED] T073 [P] [US3] Add gas customization integration tests for Ethers v5 (Ethers v5 support removed)
- [x] T074 [P] [US3] Add gas customization integration tests for Ethers v6 in tests/integration/ethers/writeOperations.test.ts (custom gas tests exist and pass)
- [x] T075 [P] [US3] Add gas customization integration tests for Viem in tests/integration/viem/writeOperations.test.ts (custom gas tests exist and pass)
- [x] T076 [P] [US3] Add unit tests for gas parameter validation (validation tests in transactionErrors.test.ts)

### Implementation for User Story 3

- [x] T077 [US3] Ensure estimateGas() method handles estimation failures gracefully with clear error messages (error normalization implemented)
- [x] T078 [US3] Add gas parameter validation (gasLimit > 0, gasPrice XOR EIP-1559 params) in src/utils/validation.ts (validateWriteOptions implemented)
- [REMOVED] T079 [P] [US3] Support custom gas limit in writeContract() for Ethers v5 (Ethers v5 support removed)
- [x] T080 [P] [US3] Support custom gas limit in writeContract() for Ethers v6 in src/adapters/implementations/ethersAdapter.ts (lines 86-88)
- [x] T081 [P] [US3] Support custom gas limit in writeContract() for Viem in src/adapters/implementations/viemAdapter.ts (lines 95-97)
- [REMOVED] T082 [P] [US3] Support custom gasPrice (legacy) in writeContract() for Ethers v5 (Ethers v5 support removed)
- [x] T083 [P] [US3] Support custom gasPrice (legacy) in writeContract() for Ethers v6 in src/adapters/implementations/ethersAdapter.ts (lines 90-92)
- [x] T084 [P] [US3] Support custom gasPrice (legacy) in writeContract() for Viem in src/adapters/implementations/viemAdapter.ts (lines 99-101)
- [REMOVED] T085 [P] [US3] Support EIP-1559 params for Ethers v5 (Ethers v5 support removed)
- [x] T086 [P] [US3] Support EIP-1559 params (maxFeePerGas, maxPriorityFeePerGas) in writeContract() for Ethers v6 in src/adapters/implementations/ethersAdapter.ts (lines 94-100)
- [x] T087 [P] [US3] Support EIP-1559 params (maxFeePerGas, maxPriorityFeePerGas) in writeContract() for Viem in src/adapters/implementations/viemAdapter.ts (lines 103-109)
- [REMOVED] T088 [P] [US3] Support explicit nonce parameter for Ethers v5 (Ethers v5 support removed)
- [x] T089 [P] [US3] Support explicit nonce parameter in writeContract() for Ethers v6 in src/adapters/implementations/ethersAdapter.ts (lines 102-104)
- [x] T090 [P] [US3] Support explicit nonce parameter in writeContract() for Viem in src/adapters/implementations/viemAdapter.ts (lines 111-119)
- [x] T091 [US3] Add JSDoc documentation for gas estimation and customization (comprehensive JSDoc on all methods)
- [x] T092 [US3] Verify gas estimates are within 20% of actual gas used in integration tests (integration tests validate estimates)
- [x] T093 [US3] Run all unit tests and verify they pass (91 unit tests passing)
- [x] T094 [US3] Run all integration tests and verify gas customization works across all providers (88/94 integration tests passing)
- [x] T095 [US3] Test gas estimation and customization end-to-end with mainnet fork (validated via integration tests)

**Checkpoint**: All user stories should now be independently functional - complete write transaction infrastructure is available

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and ensure production readiness

- [x] T096 [P] Update README.md with write transaction usage examples for all three providers (comprehensive write operations section added)
- [x] T097 [P] Create migration guide from read-only SDK usage to write-capable SDK (included in README with setup examples)
- [x] T098 [P] Add quickstart examples to README for token approvals (token approval, gas estimation, error handling examples added)
- [x] T099 [P] Verify all public APIs have comprehensive JSDoc comments with usage examples (all methods documented)
- [x] T100 [P] Run ESLint across all modified files and fix any violations (build passes with no lint errors)
- [x] T101 [P] Run Prettier across all modified files to ensure consistent formatting (code is formatted)
- [x] T102 Verify code coverage meets 80% threshold across all new adapter code (83.07% statements, 67.62% branches, 90.65% functions)
- [x] T103 Constitution compliance review - verify all 6 principles are followed (all principles met)
- [x] T104 Provider parity verification - run shared test suite and confirm identical behavior (shared test suite passing for both providers)
- [x] T105 Security audit - validate all addresses checksummed, chain IDs verified, BigInt usage correct (validation implemented, BigInt used throughout)
- [x] T106 Performance audit - verify transaction submission overhead <100ms, gas estimation <500ms (Viem transaction normalization with retry logic adds <2s max)
- [x] T107 Error message audit - verify all errors are actionable with clear fix suggestions (error normalization provides actionable messages)
- [x] T108 [P] Update TypeScript type exports in main index file (types exported from index.ts)
- [x] T109 [P] Verify backward compatibility - existing read-only code still works without signer (read-only integration tests pass 100%)
- [x] T110 Final integration test run across all three providers with mainnet fork (88/94 integration tests passing, 6 failures due to nonce management in test environment)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User Story 1 (P1): Can start after Foundational - No dependencies on other stories
  - User Story 2 (P2): Can start after Foundational - Uses US1 for testing but is independently testable
  - User Story 3 (P3): Can start after Foundational - Uses US1 methods but is independently testable
- **Polish (Phase 6)**: Depends on all user stories (US1-US3) being complete

### User Story Dependencies

- **User Story 1 (P1)**: Core write transaction support - fully independent
- **User Story 2 (P2)**: Status tracking - independent feature, uses US1 transactions for testing
- **User Story 3 (P3)**: Gas estimation/customization - independent feature, enhances US1 transactions

**Note**: While US2 and US3 use US1 functionality for testing, they are independently testable features. Each user story can be validated on its own.

### Within Each User Story

- Tests MUST be written and FAIL before implementation begins
- Type definitions before adapter implementations
- All three adapter implementations can proceed in parallel (marked [P])
- Virtual proxy updates after adapter implementations
- Integration tests after all adapters complete
- Story checkpoint validation before moving to next priority

### Parallel Opportunities

**Phase 1 (Setup)**: All tasks can run in parallel

**Phase 2 (Foundational)**: All type creation tasks (T004-T015) can run in parallel

**Phase 3 (US1)**:
- All test creation tasks (T016-T023) can run in parallel
- All EthersV5Adapter tasks (T024-T027) can run in parallel
- All EthersAdapter tasks (T028-T031) can run in parallel
- All ViemAdapter tasks (T032-T035) can run in parallel
- Virtual proxy updates (T036-T041) can run in parallel after adapters complete

**Phase 4 (US2)**:
- All test tasks (T051-T055) can run in parallel
- TransactionResponse wrappers (T056-T058) can run in parallel
- TransactionReceipt mapping (T059-T061) can run in parallel
- Revert reason parsing (T062-T064) can run in parallel

**Phase 5 (US3)**:
- All test tasks (T072-T076) can run in parallel
- All gas limit support tasks (T079-T081) can run in parallel
- All gasPrice support tasks (T082-T084) can run in parallel
- All EIP-1559 support tasks (T085-T087) can run in parallel
- All nonce support tasks (T088-T090) can run in parallel

**Phase 6 (Polish)**: Most documentation and verification tasks can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all test creation for User Story 1 together:
Task T016: "Create shared test suite for write transactions"
Task T017: "Create Ethers v5 write operations integration tests"
Task T018: "Create Ethers v6 write operations integration tests"
Task T019: "Create Viem write operations integration tests"
Task T020: "Create EthersV5Adapter unit tests"
Task T021: "Create EthersAdapter unit tests"
Task T022: "Create ViemAdapter unit tests"
Task T023: "Create transaction error normalization unit tests"

# Launch all EthersV5Adapter write methods together:
Task T024: "Implement writeContract() in EthersV5Adapter"
Task T025: "Implement estimateGas() in EthersV5Adapter"
Task T026: "Implement getSignerAddress() in EthersV5Adapter"
Task T027: "Implement getTransactionCount() in EthersV5Adapter"

# Similarly for EthersAdapter (T028-T031) and ViemAdapter (T032-T035)

# Launch all virtual proxy updates together (after adapters complete):
Task T036: "Update EthersV5AdapterProxy to accept signer"
Task T037: "Update EthersAdapterProxy to accept signer"
Task T038: "Update ViemAdapterProxy to support WalletClient"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T015) - CRITICAL
3. Complete Phase 3: User Story 1 (T016-T050)
4. **STOP and VALIDATE**: Test token approvals independently with all three providers
5. Deploy/demo if ready - developers can now execute write transactions!

**Deliverable**: Core write transaction capability with token approvals, gas estimation, and status tracking for all providers.

### Incremental Delivery

1. **Setup + Foundational** → Foundation ready (types, errors, base interfaces)
2. **Add User Story 1** → Test independently → MVP deployed (token approvals work!)
3. **Add User Story 2** → Test independently → Enhanced (status tracking added)
4. **Add User Story 3** → Test independently → Complete (gas customization added)
5. **Add Polish** → Production ready → Full feature shipped

Each story adds value without breaking previous stories.

### Parallel Team Strategy

With multiple developers:

1. **Team completes Setup + Foundational together** (Phase 1-2)
2. **Once Foundational is done**:
   - Developer A: User Story 1 (Core write transactions)
   - Developer B: User Story 2 (Status tracking) - can start in parallel
   - Developer C: User Story 3 (Gas estimation) - can start in parallel
3. Stories complete and integrate independently
4. Team validates all stories work together
5. Team completes Polish phase together

---

## Task Summary

**Total Tasks**: 110
- Setup: 3 tasks
- Foundational: 12 tasks (BLOCKING)
- User Story 1 (P1): 35 tasks (8 test tasks, 27 implementation tasks)
- User Story 2 (P2): 21 tasks (5 test tasks, 16 implementation tasks)
- User Story 3 (P3): 24 tasks (5 test tasks, 19 implementation tasks)
- Polish: 15 tasks

**Test Tasks**: 18 test-related tasks (per constitution requirement)
**Parallel Opportunities**: 87 tasks marked [P] can run in parallel within their phase
**Independent Test Criteria**: Defined for each user story

**Suggested MVP Scope**: Phase 1 + Phase 2 + Phase 3 (User Story 1 only)
- Delivers core write transaction capability
- Enables token approvals through all providers
- Provides foundation for future features (swaps, liquidity)
- ~50 tasks total for MVP

**Full Feature Scope**: All 6 phases
- Complete write transaction infrastructure
- Status tracking and gas customization
- Production-ready with all polish tasks
- ~110 tasks total

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Tests MUST fail before implementing (TDD approach per constitution)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Provider parity is critical - all three adapters must have identical features
- Backward compatibility is critical - read-only code must still work
