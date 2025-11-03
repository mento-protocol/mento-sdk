# Feature Specification: Adapter Write Transaction Support

**Feature Branch**: `001-adapter-write-transactions`
**Created**: 2025-11-03
**Status**: Draft
**Input**: User description: "implement write transactions on the adapter implementations"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Token Approval for Protocol Interactions (Priority: P1)

A developer needs to enable users to approve the Mento protocol contracts to spend their tokens on their behalf. This is required before users can perform swaps, deposits, or other protocol interactions.

**Why this priority**: Token approvals are the foundational write operation required for all Mento protocol interactions. Without the ability to approve Mento contracts to spend tokens, no higher-level protocol features (swaps, liquidity operations) can function. This is the minimal viable write transaction feature that enables the entire protocol ecosystem.

**Independent Test**: Can be tested by executing an approval transaction and verifying the allowance increased using a read operation. Enables testing of the approval workflow independent of protocol interactions.

**Acceptance Scenarios**:

1. **Given** a user wants to interact with a Mento protocol contract, **When** they approve the contract to spend their tokens, **Then** the approval transaction succeeds and the allowance is set correctly
2. **Given** a user has previously approved a contract, **When** they want to increase or modify the allowance, **Then** they can submit a new approval transaction with the updated amount
3. **Given** a user attempts to approve a token they don't own, **When** they initiate the approval, **Then** the transaction succeeds on-chain (as approvals don't require token ownership) but the system provides appropriate guidance

---

### User Story 2 - Transaction Status Tracking (Priority: P2)

A developer needs to provide real-time feedback to users about their transaction status. They need to detect when transactions are pending, confirmed, or failed, and provide appropriate UI updates.

**Why this priority**: While developers can technically poll the blockchain manually, transaction status tracking is essential for production-ready applications. Users need real-time feedback when approving tokens or executing protocol operations. This builds on P1 by making write transactions production-ready rather than just functional.

**Independent Test**: Can be tested by submitting an approval transaction (P1) and verifying status updates are received at each stage (pending, confirmed, failed). Demonstrates robust transaction lifecycle management.

**Acceptance Scenarios**:

1. **Given** a user has submitted a transaction, **When** the transaction is broadcast to the network, **Then** they receive a pending status with the transaction hash
2. **Given** a transaction is pending, **When** it is included in a block, **Then** the user receives a confirmation with the block number
3. **Given** a transaction fails on-chain, **When** the failure is detected, **Then** the user receives the revert reason if available

---

### User Story 3 - Gas Estimation and Transaction Customization (Priority: P3)

A developer needs to provide users with accurate gas cost estimates before submitting transactions. Users need the ability to customize gas limits and gas prices for urgent transactions or cost optimization.

**Why this priority**: Gas estimation and customization improve the developer and end-user experience by providing cost transparency and control. While transactions work with provider defaults, production applications benefit from showing users estimated costs upfront and allowing gas price adjustments during network congestion. This completes the write transaction infrastructure.

**Independent Test**: Can be tested by requesting gas estimates for approval transactions (P1) and verifying the estimates are within 20% of actual gas consumed. Enables users to make informed decisions about transaction costs before submitting.

**Acceptance Scenarios**:

1. **Given** a user is preparing to submit a transaction, **When** they request a gas estimate, **Then** the system returns an accurate estimate of the gas units required
2. **Given** a user wants to speed up transaction confirmation, **When** they customize the gas price, **Then** the transaction is submitted with their specified gas settings
3. **Given** a user sets a gas limit too low, **When** they submit the transaction, **Then** the transaction fails with a clear message about insufficient gas before spending their fees

---

### Edge Cases

- **What happens when a user's wallet is locked or disconnected?** System should detect the missing signer and provide a clear error message before attempting any blockchain interaction, preventing confusing RPC errors.

- **How does the system handle nonce conflicts?** When a user submits multiple transactions rapidly or from multiple applications, the provider's nonce management should handle sequencing, but the system should provide clear error messages if nonce conflicts occur.

- **What happens when gas prices spike during transaction submission?** Transaction may fail or be delayed. System should allow users to replace pending transactions with higher gas prices (where provider supports it).

- **How does the system handle network switching?** If a user switches networks in their wallet after initializing the SDK but before submitting a transaction, the system should detect the chain ID mismatch and reject the transaction with a clear error.

- **What happens with contract revert errors?** System must parse and surface the revert reason from the blockchain in a user-friendly format, not just a generic "transaction failed" message.

- **How are failed transactions handled regarding gas costs?** Users should be informed that even failed transactions consume gas fees, and error messages should clearly distinguish between validation errors (pre-submission, no gas cost) and on-chain failures (gas consumed).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST extend the ProviderAdapter interface to support write operations while maintaining backward compatibility with existing read operations
- **FR-002**: System MUST support transaction execution for EthersV5, EthersV6 (Ethers), and Viem provider libraries with equal feature parity
- **FR-003**: System MUST accept both Provider+Signer pairs (for Ethers) and WalletClient (for Viem) during SDK initialization
- **FR-004**: System MUST provide a method to execute write contract calls that returns a transaction hash and allows waiting for confirmation
- **FR-005**: System MUST provide a method to estimate gas costs for transactions before execution
- **FR-006**: System MUST support both human-readable (string) and JSON ABI formats for write operations, matching current read operation behavior
- **FR-007**: System MUST verify the connected wallet's chain ID matches the expected network before submitting transactions
- **FR-008**: System MUST parse and surface contract revert reasons when transactions fail on-chain
- **FR-009**: System MUST distinguish between pre-submission validation errors (no gas cost) and on-chain transaction failures (gas consumed)
- **FR-010**: System MUST handle numeric transaction parameters using BigInt to prevent precision loss
- **FR-011**: System MUST validate that contract addresses are properly checksummed before use in transactions
- **FR-012**: System MUST detect when a signer/wallet is not available and provide clear error messages before attempting write operations
- **FR-013**: System MUST provide transaction receipt information including block number, gas used, and transaction status
- **FR-014**: System MUST maintain the existing virtual proxy pattern for lazy loading of provider-specific implementations
- **FR-015**: Users MUST be able to execute token approval operations for protocol contract interactions using a consistent API across all supported providers
- **FR-016**: Users MUST be able to customize gas limit and gas price parameters when submitting transactions (where provider supports it)
- **FR-017**: System MUST retry failed transactions due to transient network errors using the existing retry mechanism
- **FR-018**: System MUST provide clear error messages when users have insufficient token balance or allowance for an operation

### Non-Functional Requirements (Per Constitution)

*Reference: [Mento SDK Constitution](../.specify/memory/constitution.md)*

- **NFR-001**: All write transaction methods MUST have TypeScript type definitions and comprehensive JSDoc comments with usage examples
- **NFR-002**: Write transaction support MUST work with all supported providers (Ethers v5, Ethers v6, Viem) with identical feature sets
- **NFR-003**: Code coverage MUST be maintained above 80% for all new adapter write methods
- **NFR-004**: All transaction operations MUST include error handling with actionable error messages explaining both the problem and potential solutions
- **NFR-005**: All transaction operations MUST use BigInt for numeric values (amounts, gas, nonces) to prevent precision errors
- **NFR-006**: All contract addresses used in write operations MUST be checksummed and validated before transaction submission
- **NFR-007**: Write transaction implementation MUST NOT introduce provider-specific code in service layers; all provider differences MUST be abstracted in adapters
- **NFR-008**: Each provider adapter MUST be tested with a shared test suite to ensure behavioral consistency across implementations
- **NFR-009**: Transaction errors MUST be normalized across providers to provide consistent error types and messages regardless of underlying library
- **NFR-010**: Write transaction feature MUST maintain the virtual proxy pattern allowing users to install only the providers they use
- **NFR-011**: Documentation MUST include migration examples showing how to add write transaction support to existing applications for each provider library

### Key Entities *(include if feature involves data)*

- **Transaction Request**: Represents a write operation to be submitted to the blockchain, containing target contract address, function signature, parameters, and optional gas settings (limit, price, nonce)

- **Transaction Response**: Represents a submitted transaction with its hash, allowing tracking and waiting for confirmation, contains methods to retrieve transaction status and receipt

- **Transaction Receipt**: Represents a confirmed transaction's on-chain outcome, containing block number, gas used, status (success/failure), logs/events, and revert reason if failed

- **Signer/Wallet**: Represents the user's wallet capable of signing transactions, wraps either an Ethers Signer or Viem WalletClient, provides account address and chain ID

- **Write Options**: Configuration for a write contract call, including contract address, function name/signature, parameters, ABI format, and optional gas customization

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Developers can submit token approval transactions through any supported provider with a consistent API requiring no provider-specific code in their application
- **SC-002**: Developers can execute a complete approval workflow (estimate gas, submit transaction, track status) with no more than 3 method calls regardless of provider choice
- **SC-003**: Transaction error messages clearly identify whether the error occurred before submission (validation error, no gas cost) or on-chain (execution error, gas consumed)
- **SC-004**: When a transaction fails with a contract revert, developers receive the specific revert reason (e.g., "insufficient allowance", "execution reverted") not a generic failure message
- **SC-005**: Developers can estimate gas costs for approval transactions with an accuracy within 20% of actual gas consumed when transaction succeeds
- **SC-006**: All three provider implementations (EthersV5, EthersV6, Viem) pass an identical shared test suite demonstrating behavioral consistency
- **SC-007**: Applications using only read operations continue to work without requiring wallet/signer, maintaining backward compatibility
- **SC-008**: New write transaction methods maintain the same TypeScript type safety standards as existing read methods, with comprehensive JSDoc documentation
- **SC-009**: Transaction status tracking allows developers to detect pending, confirmed, and failed states without manually polling the blockchain
- **SC-010**: Existing SDK services can be extended with write capabilities by adding methods that use the adapter interface without breaking changes
