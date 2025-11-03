<!--
Sync Impact Report:
- Version change: INITIAL → 1.0.0
- New principles added:
  1. Type Safety & Code Quality
  2. Provider Agnostic Architecture
  3. Comprehensive Testing
  4. Performance & Reliability
  5. Developer Experience & Documentation
  6. Blockchain Best Practices
- New sections added:
  - Core Principles (6 principles)
  - Quality Standards
  - Development Workflow
  - Governance
- Templates updated:
  ✅ plan-template.md - Added Constitution Check section with all 6 principles
  ✅ spec-template.md - Added Non-Functional Requirements section referencing constitution
  ✅ tasks-template.md - Updated to require tests per constitution, aligned file paths with TypeScript, added constitution compliance to Polish phase
- No command files to update (none exist)
- Follow-up TODOs: None
-->

# Mento SDK Constitution

## Core Principles

### I. Type Safety & Code Quality

The Mento SDK MUST maintain the highest standards of type safety and code quality to ensure reliability in blockchain interactions.

**Non-negotiable rules:**
- TypeScript strict mode MUST be enabled for all source code
- All exported functions, classes, and methods MUST have explicit type annotations
- No `any` types permitted in public APIs (internal use requires documented justification)
- ESLint and Prettier MUST pass with zero warnings on all code
- All code MUST follow the established architectural patterns (adapters, services, types)
- Path aliases MUST be used consistently (`@adapters/*`, `@services/*`, `@types/*`, etc.)

**Rationale**: Blockchain SDKs handle financial transactions and asset management. Type errors can lead to loss of funds. Strict typing catches errors at compile time, provides superior IDE support, and creates self-documenting code that users can trust.

### II. Provider Agnostic Architecture

The SDK MUST remain completely agnostic to the underlying provider implementation, supporting multiple provider ecosystems equally.

**Non-negotiable rules:**
- All blockchain interactions MUST go through the `ProviderAdapter` interface
- Direct provider-specific calls MUST NOT appear in services or business logic
- New provider support MUST be addable by implementing `ProviderAdapter` only
- Adapters MUST handle provider-specific conversions (ABI formats, address formats, etc.)
- Each supported provider (Ethers v5, Ethers v6, Viem) MUST have equal feature parity
- Provider detection and initialization MUST be automatic and type-safe

**Rationale**: The Ethereum/blockchain ecosystem has multiple competing provider libraries. Users should be able to integrate Mento SDK into existing projects without forcing a provider change. This adapter pattern ensures maintainability and allows the SDK to evolve independently of provider library changes.

### III. Comprehensive Testing

Testing MUST be comprehensive, covering all critical paths, provider integrations, and blockchain interactions.

**Non-negotiable rules:**
- All services MUST have unit tests covering core business logic
- Each provider adapter MUST have integration tests verifying blockchain interactions
- Shared test suites MUST be used to ensure consistent behavior across providers
- Code coverage MUST be tracked and maintained above 80% for services
- Tests MUST NOT be skipped without documented justification in PR description
- Integration tests MUST use real blockchain data (mainnet fork or testnet)
- Breaking changes MUST include test updates demonstrating the change

**Test organization:**
- `tests/unit/` - Fast, isolated tests for pure functions and business logic
- `tests/integration/` - Provider-specific tests against real blockchain state
- `tests/integration/shared/` - Reusable test suites ensuring provider parity

**Rationale**: Blockchain SDKs interact with immutable smart contracts and handle real assets. Comprehensive testing is the only way to ensure reliability. Shared test suites prevent provider-specific bugs and ensure users get consistent behavior regardless of their provider choice.

### IV. Performance & Reliability

The SDK MUST be performant and reliable, minimizing unnecessary blockchain calls and handling errors gracefully.

**Non-negotiable rules:**
- Blockchain calls MUST be batched when possible to reduce RPC load
- Retry logic with exponential backoff MUST be implemented for transient failures
- All async operations MUST have proper error handling with meaningful error messages
- No synchronous blocking operations permitted in async code paths
- Network timeouts MUST be configurable or have sensible defaults
- Contract addresses and ABIs MUST be cached and statically defined
- Large data operations MUST be performed iteratively to avoid memory issues

**Performance targets:**
- SDK initialization: < 100ms (excluding network calls)
- Single contract read: < 500ms on mainnet
- Batch operations: Proportional to item count, no O(n²) operations

**Rationale**: Users often integrate SDKs into time-sensitive applications (trading bots, dashboards, DeFi protocols). Slow or unreliable SDKs lead to poor user experience or lost opportunities. Blockchain RPC nodes have rate limits, so efficient call patterns are essential.

### V. Developer Experience & Documentation

The SDK MUST provide an exceptional developer experience through clear APIs, comprehensive documentation, and helpful error messages.

**Non-negotiable rules:**
- All public APIs MUST have JSDoc comments with usage examples
- README MUST include quick start guides for each supported provider
- Breaking changes MUST be clearly documented with migration guides
- Error messages MUST be actionable (tell users what went wrong AND how to fix it)
- TypeScript types MUST be exported and available to SDK consumers
- Examples MUST be tested and kept up-to-date with API changes

**Documentation requirements:**
- Each service MUST document its purpose and primary use cases
- Complex functions MUST include `@dev` comments with implementation notes
- Public types MUST have property-level documentation
- README MUST be updated when adding/removing features

**Rationale**: SDK adoption depends on how quickly developers can get started and how easily they can debug issues. Good documentation and developer experience reduces support burden and increases user satisfaction.

### VI. Blockchain Best Practices

The SDK MUST follow blockchain and Web3 best practices to ensure security and compatibility.

**Non-negotiable rules:**
- All contract addresses MUST be checksummed and validated
- Chain IDs MUST be verified to prevent cross-chain replay attacks
- ABIs MUST match deployed contracts (verified against on-chain bytecode when possible)
- Gas estimation MUST be available for state-changing operations
- Event subscriptions MUST handle reorganizations gracefully
- Numeric values MUST use BigNumber/BigInt to prevent precision loss
- Contract calls MUST specify exact function signatures to prevent ambiguity

**Security considerations:**
- Never trust user input - validate all addresses, amounts, and parameters
- Never expose private keys or sensitive data in logs or errors
- Follow principle of least privilege for contract interactions

**Rationale**: Blockchain development has unique security considerations. Incorrect address formats, chain ID mismatches, or floating-point arithmetic can lead to loss of funds. Following established best practices prevents common vulnerabilities.

## Quality Standards

### Code Organization
- One class per file, filename matches class name
- Related functionality grouped in services
- Shared types centralized in `@types/*`
- ABIs separated by contract in `@abis/*`
- Constants organized by concern (addresses, chain IDs, etc.)

### Dependency Management
- Peer dependencies for provider libraries (optional to allow user choice)
- Minimal production dependencies (current: only BigNumber.js)
- Dev dependencies pinned to prevent build inconsistencies
- Node.js >= 18 and pnpm >= 9 required

### Version Management
- Semantic versioning (MAJOR.MINOR.PATCH)
- MAJOR: Breaking API changes, provider support changes
- MINOR: New features, new chains, backward-compatible additions
- PATCH: Bug fixes, documentation, dependency updates

## Development Workflow

### Pull Request Requirements
- All tests MUST pass (unit + integration)
- ESLint and Prettier checks MUST pass
- Code coverage MUST not decrease (exceptions require justification)
- At least one approval from core maintainer
- Meaningful commit messages following conventional commits

### Testing Workflow
1. Write tests first for new features (test-driven development encouraged)
2. Ensure tests fail before implementation
3. Implement feature
4. Verify all tests pass
5. Check coverage report

### Review Checklist
- [ ] TypeScript strict mode compliance
- [ ] All provider adapters maintain feature parity
- [ ] JSDoc comments on public APIs
- [ ] Error messages are actionable
- [ ] Tests cover new functionality
- [ ] README updated if adding/changing public API
- [ ] No hardcoded values (use constants)
- [ ] Async operations have error handling

## Governance

### Constitution Authority
This constitution supersedes all other development practices, guidelines, or preferences. When conflicts arise between this constitution and other documentation, the constitution takes precedence.

### Amendment Process
1. Proposed changes MUST be documented with rationale
2. Changes MUST have approval from at least 2 core maintainers
3. Version MUST be bumped according to change significance:
   - MAJOR: Removing/changing core principles
   - MINOR: Adding new principles or sections
   - PATCH: Clarifications, typos, non-semantic changes
4. All dependent templates MUST be updated for consistency
5. A sync impact report MUST be included with the amendment

### Compliance Review
- All PRs MUST verify alignment with these principles
- New complexity or architectural patterns MUST be justified against simplicity
- Violations require documented rationale and core maintainer approval
- Constitution review recommended quarterly or after major features

### Conflict Resolution
When principles conflict in practice:
1. Security and correctness take precedence over performance
2. User experience takes precedence over implementation simplicity
3. Type safety takes precedence over brevity
4. Consult core maintainers for guidance on edge cases

**Version**: 1.0.0 | **Ratified**: 2025-11-03 | **Last Amended**: 2025-11-03
