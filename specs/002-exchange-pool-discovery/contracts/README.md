# API Contracts

**Feature**: 002-exchange-pool-discovery
**Date**: 2025-11-04

## Overview

This directory contains the formal API contracts for the Exchange & Pool Discovery feature. These contracts define the public interface, input/output types, error cases, and behavior guarantees for all exposed methods.

## Purpose

API contracts serve as:
1. **Implementation specification** - Exact behavior developers must implement
2. **Documentation source** - Basis for auto-generated API docs
3. **Testing guide** - Defines test cases and expected outcomes
4. **Contract guarantee** - Promises to SDK consumers (semantic versioning applies)

## Contents

### ExchangeService.md

The complete API contract for the `ExchangeService` class, including:

- **Constructor**: Service instantiation with provider adapter
- **Exchange Query Methods**:
  - `getExchanges()` - Fetch all exchanges
  - `getExchangesForProvider()` - Filter by provider
  - `getExchangeById()` - Lookup by ID
  - `getExchangeForTokens()` - Find direct exchange for token pair
- **Pair Discovery Methods**:
  - `getDirectPairs()` - All single-hop trading pairs
  - `getTradablePairs()` - All pairs including multi-hop routes
  - `findPairForTokens()` - Lookup optimal pair for any token pair
- **Type Definitions**: All input/output types
- **Error Handling**: Error types, messages, and handling patterns
- **Performance Characteristics**: Time/space complexity, optimization strategies
- **Best Practices**: Usage patterns and anti-patterns
- **Testing**: Coverage requirements and example tests

## Contract Principles

### Stability Guarantees

**MUST NOT change** (breaking):
- Method signatures (name, parameters, return types)
- Error types and conditions
- Core behavior and semantics
- Type definitions (removing fields, changing types)

**CAN change** (non-breaking):
- Internal implementation
- Performance characteristics (if improved)
- Error messages (wording improvements)
- Adding optional parameters with defaults
- Adding new methods
- Extending types with new optional fields

### Semantic Versioning

Changes to these contracts follow semantic versioning:

- **MAJOR** (breaking changes):
  - Removing methods
  - Changing method signatures
  - Changing error behavior
  - Removing type fields

- **MINOR** (backward-compatible additions):
  - Adding new methods
  - Adding optional parameters
  - Adding new error types
  - Extending types with optional fields

- **PATCH** (bug fixes, documentation):
  - Fixing incorrect behavior to match contract
  - Improving error messages
  - Documentation clarifications
  - Performance improvements

## Testing Requirements

### Contract Compliance Tests

Every public method MUST have tests verifying:

1. **Happy path**: Normal successful operation
2. **Error cases**: All documented error conditions
3. **Edge cases**: Boundary conditions, empty results
4. **Type safety**: Input validation, output structure
5. **Performance**: Meets stated performance targets
6. **Caching**: Cache behavior as documented

### Provider Parity Tests

All methods MUST produce identical results across supported providers:
- Ethers v6
- Viem

Shared test suites ensure consistent behavior regardless of provider choice.

## Implementation Checklist

When implementing these contracts:

- [ ] Create `ExchangeService` class with specified methods
- [ ] Implement constructor accepting `ProviderAdapter`
- [ ] Implement all exchange query methods
- [ ] Implement all pair discovery methods
- [ ] Define all types in `src/types/exchange.ts`
- [ ] Create error classes with specified messages
- [ ] Add JSDoc comments matching contract documentation
- [ ] Implement caching as specified
- [ ] Write unit tests for all methods
- [ ] Write integration tests for blockchain interactions
- [ ] Write provider parity tests
- [ ] Verify performance targets are met
- [ ] Update main exports (`src/index.ts`)
- [ ] Generate API documentation from JSDoc

## Breaking Change Process

If a breaking change is absolutely necessary:

1. **Document rationale**: Why is breaking change unavoidable?
2. **Create migration guide**: How do users update their code?
3. **Deprecation period**: Mark old API deprecated in MINOR release
4. **Version bump**: Increment MAJOR version when removing
5. **Changelog entry**: Clear description of breaking change
6. **Update examples**: All code examples reflect new API

## Related Documents

- [Research](../research.md) - Implementation approach and v1 analysis
- [Data Model](../data-model.md) - Complete data structure definitions
- [Quickstart](../quickstart.md) - Usage examples and patterns
- [Feature Spec](../spec.md) - Requirements and user stories
- [Constitution](../../../.specify/memory/constitution.md) - Development principles

## Questions or Changes

For questions about these contracts or to propose changes:
1. Review constitution and feature spec first
2. Check if change is breaking (semantic versioning)
3. Document rationale and alternatives considered
4. Get approval from core maintainers
5. Update all related documentation
6. Update implementation and tests

---

**Maintained by**: Mento SDK Core Team
**Last Updated**: 2025-11-04
**Version**: 1.0.0 (initial contracts)
