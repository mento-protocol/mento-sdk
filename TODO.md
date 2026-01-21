# Mento SDK - Technical Debt & Improvement Tracker

> **Generated**: 2026-01-20
> **Last Updated**: 2026-01-21
> **Status**: 10/20 items resolved for beta 7

This document tracks remaining issues, technical debt, and planned improvements for the Mento SDK.

---

## 📊 Summary Statistics

- **High Issues**: 1 remaining
- **Medium Issues**: 1 remaining
- **Low Issues**: 6
- **Informational**: 2
- **Total Remaining**: 10 issues

---

## 🟠 HIGH SEVERITY

### 6. Silent Failures in Supply Calculations

- **Status**: 🟠 Open
- **Priority**: P1
- **Location**: [src/services/tokens/supply/multisigSupplyCalculator.ts:23](src/services/tokens/supply/multisigSupplyCalculator.ts#L23)
- **Impact**: Token supply data could be incorrect, affecting financial decisions

- **Current TODO**:

  ```typescript
  // TODO: Failures are silent here which could lead to
  ```

- **Recommended Fix**:
  - Add explicit error handling
  - Log failures with token address and error details
  - Consider returning partial results with error metadata
  - Add monitoring/alerting for supply calculation failures

- **Acceptance Criteria**:
  - [ ] Review and document acceptable failure modes
  - [ ] Add explicit error logging
  - [ ] Consider exposing calculation status in response
  - [ ] Add tests for failure scenarios

---

## 🟡 MEDIUM SEVERITY

### 9. Missing Comprehensive Error Handling Documentation

- **Status**: 🟡 Open
- **Priority**: P2
- **Location**: [src/services/routes/RouteService.ts:72-73](src/services/routes/RouteService.ts#L72)

- **Current TODO**:

  ```typescript
  // TODO: Consider error handling across the codebase for better consumer experience.
  ```

- **Recommended Fix**:
  - Document all possible errors in JSDoc
  - Create error catalog in documentation
  - Use custom error types for different scenarios
  - Add error handling guide for SDK consumers

- **Acceptance Criteria**:
  - [ ] Create `docs/ERROR_HANDLING.md`
  - [ ] Document all errors in JSDoc `@throws` tags
  - [ ] Create custom error types (extend base `MentoError`)
  - [ ] Add examples of error handling in README

---

## 🟢 LOW SEVERITY

### 13. Outdated TODOs Indicating Future Work

- **Status**: 🟢 Open
- **Priority**: P3
- **Locations**:
  - [src/services/pools/PoolService.ts:7](src/services/pools/PoolService.ts#L7) - "Update to enrich pools with more data as needed"
  - [src/services/pools/PoolService.ts:36-38](src/services/pools/PoolService.ts#L36) - "Update to use router.factoryRegistry.poolFactories()"
  - [src/services/pools/PoolService.ts:119-120](src/services/pools/PoolService.ts#L119) - "When new virtual pool factory is deployed"
  - [src/services/tokens/tokenService.ts:105-106](src/services/tokens/tokenService.ts#L105) - "Cached mapping of stableToken -> addressRegistry"
  - [src/core/constants/addresses.ts:20](src/core/constants/addresses.ts#L20) - "Find and remove references"

- **Acceptance Criteria**:
  - [ ] Review all TODOs in codebase
  - [ ] Create GitHub issues for valid future work
  - [ ] Remove stale/completed TODOs
  - [ ] Create ROADMAP.md for larger features

---

### 14. Inconsistent Code Formatting Standards

- **Status**: 🟢 Open
- **Priority**: P3
- **Location**: Codebase-wide, notably [src/utils/routeUtils.ts](src/utils/routeUtils.ts)

- **Acceptance Criteria**:
  - [ ] Create CONTRIBUTING.md with code style guide
  - [ ] Document when to use detailed vs. minimal comments
  - [ ] Enforce with linting rules where possible

---

### 15. No Explicit Deadline Bounds Validation

- **Status**: 🟢 Open
- **Priority**: P3
- **Location**: [src/services/swap/SwapService.ts:183](src/services/swap/SwapService.ts#L183)
- **Impact**: Users could set past deadlines causing immediate reverts

- **Acceptance Criteria**:
  - [ ] Validate deadline is in the future
  - [ ] Add reasonable maximum (e.g., 24h)
  - [ ] Add tests for deadline validation
  - [ ] Document deadline requirements

---

### 16. Missing Cache Invalidation Strategy

- **Status**: 🟢 Open
- **Priority**: P3
- **Location**: [src/services/pools/PoolService.ts:14,32-34](src/services/pools/PoolService.ts#L14)
- **Impact**: Long-running processes could miss new pools

- **Acceptance Criteria**:
  - [ ] Add TTL-based cache invalidation
  - [ ] Add manual cache refresh method
  - [ ] Make TTL configurable
  - [ ] Document cache behavior

---

### 17. Test Files Not Properly Linted

- **Status**: 🟢 Open
- **Priority**: P3
- **Location**: [.eslintrc.json:17](/.eslintrc.json#L17)
- **Impact**: Test code quality not enforced

- **Acceptance Criteria**:
  - [ ] Remove tests from ignorePatterns
  - [ ] Add test-specific rule overrides
  - [ ] Fix any new linting errors
  - [ ] Document test coding standards

---

### 18. No Retry Logic in Quote/Swap Services

- **Status**: 🟢 Open
- **Priority**: P3
- **Locations**:
  - [src/services/quotes/QuoteService.ts:45-63](src/services/quotes/QuoteService.ts#L45)
  - [src/services/swap/SwapService.ts](src/services/swap/SwapService.ts)
- **Impact**: Transient RPC failures cause immediate errors

- **Acceptance Criteria**:
  - [ ] Add retry logic to quote operations
  - [ ] Add retry logic to allowance checks
  - [ ] Make retry config customizable
  - [ ] Add tests for retry behavior

---

## ℹ️ INFORMATIONAL

### 19. Missing JSDoc for Complex Algorithm Functions

- **Status**: ℹ️ Open
- **Priority**: P4
- **Location**: [src/utils/routeUtils.ts:205-253](src/utils/routeUtils.ts#L205)

- **Acceptance Criteria**:
  - [ ] Add inline comments for complex loop logic
  - [ ] Consider extracting nested loops into named functions
  - [ ] Add visual diagrams in comments for algorithm explanation

---

### 20. No Performance Benchmarks

- **Status**: ℹ️ Open
- **Priority**: P4
- **Impact**: Unknown scalability limits

- **Acceptance Criteria**:
  - [ ] Create performance test suite
  - [ ] Benchmark route generation with 50, 100, 200 pools
  - [ ] Document performance characteristics
  - [ ] Set up CI performance regression testing


**Last Reviewed**: 2026-01-21
