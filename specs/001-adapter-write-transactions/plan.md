# Implementation Plan: Adapter Write Transaction Support

**Branch**: `001-adapter-write-transactions` | **Date**: 2025-11-03 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-adapter-write-transactions/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This feature extends the Mento SDK's `ProviderAdapter` interface to support write transactions, enabling developers to submit state-changing blockchain operations (approvals, transactions) with consistent APIs across Ethers v5, Ethers v6, and Viem providers. The implementation maintains backward compatibility for read-only operations while adding support for Signer/WalletClient, transaction submission, gas estimation, status tracking, and transaction receipt handling. This low-level infrastructure will enable future protocol features like swaps and liquidity operations.

## Technical Context

**Language/Version**: TypeScript 5.x with strict mode enabled, targeting ES2020+

**Primary Dependencies**:

- Ethers v5 (^5.7.x) - optional peer dependency
- Ethers v6 (^6.13.x) - optional peer dependency
- Viem (^2.21.x) - optional peer dependency
- BigNumber.js - for numeric precision (existing)

**Storage**: N/A - SDK operates against blockchain state via RPC providers

**Testing**:

- Jest with ts-jest for unit tests (existing)
- Integration tests against mainnet fork (existing pattern)
- Shared test suites for provider parity verification

**Target Platform**: Node.js >= 18, browser environments (ESM and CommonJS support)

**Project Type**: Single TypeScript library with adapter pattern

**Performance Goals**:

- Transaction submission: < 100ms overhead beyond RPC latency
- Gas estimation: < 500ms on mainnet
- No blocking operations in write paths
- Maintain existing read operation performance

**Constraints**:

- Must maintain backward compatibility with read-only SDK usage
- Cannot break existing ProviderAdapter interface
- Must support lazy loading via virtual proxy pattern
- Users install only providers they use (peer dependencies)
- All three providers must have exact feature parity

**Scale/Scope**:

- 3 adapter implementations to extend (EthersV5Adapter, EthersAdapter, ViemAdapter)
- 3 virtual proxy classes to update
- ~15-20 new interface methods across adapters
- Estimated ~500 lines of new adapter code
- ~300 lines of new type definitions
- Shared test suite covering all three providers

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Review against [Mento SDK Constitution](../.specify/memory/constitution.md):

- [x] **Type Safety & Code Quality** - All adapter methods will have explicit TypeScript types, JSDoc comments, and follow strict mode. No `any` types in public APIs.
- [x] **Provider Agnostic Architecture** - Write transaction support extends `ProviderAdapter` interface only. No provider-specific code in services. All three providers (Ethers v5/v6, Viem) will have identical write capabilities.
- [x] **Comprehensive Testing** - Shared test suites will ensure consistent behavior across all providers. Integration tests will verify write operations against testnet/fork. Unit tests for transaction handling logic. Target >80% coverage.
- [x] **Performance & Reliability** - Transaction submission adds minimal overhead (<100ms). Existing retry mechanism will handle transient failures. Gas estimation cached where appropriate. No blocking operations.
- [x] **Developer Experience & Documentation** - All new methods will have JSDoc with usage examples. Error messages will distinguish pre-submission validation (no gas cost) from on-chain failures (gas consumed). README and migration guides will be updated.
- [x] **Blockchain Best Practices** - Chain ID verification before transaction submission. Addresses checksummed and validated. BigInt for all numeric transaction parameters (amounts, gas, nonces). Transaction revert reasons surfaced to developers.

*No violations. This feature aligns with all constitution principles.*

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── adapters/
│   ├── implementations/
│   │   ├── ethersV5Adapter.ts       # [EXTEND] Add write methods
│   │   ├── ethersAdapter.ts         # [EXTEND] Add write methods
│   │   └── viemAdapter.ts           # [EXTEND] Add write methods
│   ├── proxy/
│   │   ├── ethersV5AdapterProxy.ts  # [EXTEND] Lazy load signer support
│   │   ├── ethersAdapterProxy.ts    # [EXTEND] Lazy load signer support
│   │   └── viemAdapterProxy.ts      # [EXTEND] Lazy load wallet client support
│   └── utils/
│       └── transactionErrors.ts     # [NEW] Error normalization across providers
├── types/
│   ├── provider.ts                  # [EXTEND] Add write transaction types
│   ├── transaction.ts               # [NEW] Transaction request/response/receipt types
│   └── errors.ts                    # [EXTEND] Add transaction error types
├── services/
│   └── [Future: Token service for approvals will use write adapters]
└── utils/
    ├── retry.ts                     # [EXISTING] Reuse for transaction retries
    └── validation.ts                # [EXTEND] Add transaction parameter validation

tests/
├── unit/
│   ├── adapters/
│   │   ├── ethersV5Adapter.test.ts  # [EXTEND] Add write operation tests
│   │   ├── ethersAdapter.test.ts    # [EXTEND] Add write operation tests
│   │   └── viemAdapter.test.ts      # [EXTEND] Add write operation tests
│   └── utils/
│       └── transactionErrors.test.ts # [NEW] Error normalization tests
└── integration/
    ├── shared/
    │   └── writeTransactions.test.ts # [NEW] Shared test suite for all providers
    ├── ethersV5/
    │   └── writeOperations.test.ts   # [NEW] Ethers v5 write tests
    ├── ethers/
    │   └── writeOperations.test.ts   # [NEW] Ethers v6 write tests
    └── viem/
        └── writeOperations.test.ts   # [NEW] Viem write tests
```

**Structure Decision**: This is a single TypeScript library project following the existing adapter pattern. The feature extends existing adapter implementations without adding new top-level directories. All write transaction logic is encapsulated in the adapter layer (`src/adapters/`) with supporting types in `src/types/`. Testing follows the established pattern of unit tests for isolated logic and integration tests (with shared test suites) to ensure provider parity. No new services are added in this feature - services will be added in future features (swaps, etc.) that consume these write adapters.

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

**No violations identified.** This feature fully complies with all constitution principles.

