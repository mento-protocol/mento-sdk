# Project Patterns

## Purpose

This document provides AI coding assistants with core contextual knowledge about the Mento SDK project. It aims to enable autonomous or semi-autonomous agents to understand key concepts, adhere to established patterns, avoid common mistakes, and contribute effectively to the codebase.

## Coding Standards

- **Language:** TypeScript is the primary language for this project.
- **Formatting & Linting:**
  - Formatting is enforced by Prettier. Configuration can be found in `.prettierrc.json`.
  - Linting is handled by ESLint. Configuration can be found in `.eslintrc.json`.
  - Ensure code is formatted and linted before committing.
- **Naming Conventions:**
  - Use PascalCase for class names and interfaces (e.g., `MyClass`, `MyInterface`).
  - Use camelCase for functions, methods, and variables (e.g., `myFunction`, `myVariable`).
  - Constants should be in SCREAMING_SNAKE_CASE (e.g., `MY_CONSTANT`).
  - File names should be in kebab-case (e.g., `my-module.ts`).
- **Style Guidance:**
  - Follow idiomatic TypeScript best practices.
  - Prefer modern JavaScript features (ES6+).
  - Strive for clarity and readability. Add comments where necessary to explain complex logic.
  - Prioritize strong typing; avoid `any` where possible. Define clear interfaces and types.

## Common Reusable Components

This section lists core classes, services, and adapters that AI assistants should be aware of when working with the Mento SDK.

- **`Mento` Class:**

  - **Description:** The main entry point for interacting with the Mento SDK. It initializes the necessary provider adapter and services.
  - **Location:** `src/index.ts`
  - **Usage:** Instantiate via the static `Mento.create(config: MentoConfig)` method. The `config` object requires a `provider` (Ethers v5, Ethers v6, or Viem).

- **Provider Adapters:**

  - **Description:** Abstract the differences between various Ethereum provider libraries (Ethers v5, Ethers v6, Viem) to offer a consistent interface for the SDK.
  - **Components:**
    - `EthersV5Adapter`: Adapts Ethers v5 providers.
    - `EthersAdapter`: Adapts Ethers v6 providers.
    - `ViemAdapter`: Adapts Viem public clients.
  - **Location:** `src/adapters/`
  - **Interface:** `ProviderAdapter` (defined in `src/types/index.ts`)

- **Services:**

  - **Description:** Encapsulate specific areas of functionality within the Mento Protocol.
  - **Components:**
    - `StableTokenService`: Handles operations related to Mento stable tokens.
    - `CollateralAssetService`: Handles operations related to collateral assets.
  - **Location:** `src/services/`
  - **Usage:** Accessed via an instance of the `Mento` class (e.g., `mento.getStableTokens()`).

- **Utility Functions:**

  - **Description:** Various helper functions used throughout the SDK.
  - **Location:** `src/utils/`

- **Constants:**

  - **Description:** Includes predefined values like chain IDs and contract addresses.
  - **Location:** `src/constants/` (e.g., `ChainId` in `src/constants/chainId.ts`, `addresses` in `src/constants/addresses.ts`)

- **Types and Interfaces:**

  - **Description:** Defines the data structures and shapes used throughout the SDK.
  - **Location:** `src/types/` (e.g., `StableToken`, `CollateralAsset`, `ProviderAdapter`, `MentoConfig`)

- **ABIs:**
  - **Description:** Application Binary Interfaces for interacting with smart contracts.
  - **Location:** `src/abis/`

## Architectural Decisions

This section outlines key architectural choices and patterns adopted in the Mento SDK.

- **Provider Abstraction:**

  - **Decision:** To support multiple popular Ethereum JavaScript libraries (Ethers v5, Ethers v6, Viem), an adapter pattern is used. This allows users to integrate the SDK with their existing provider without needing to switch.
  - **Implementation:** The `ProviderAdapter` interface (`src/types/index.ts`) defines a common set of methods that each adapter (`EthersV5Adapter`, `EthersAdapter`, `ViemAdapter` in `src/adapters/`) implements. The `Mento` class uses type guards (`isEthersV5Provider`, `isEthersV6Provider`, `isViemProvider` in `src/index.ts`) to instantiate the correct adapter based on the provided provider.

- **Service-Oriented Design:**

  - **Decision:** Core functionalities are separated into dedicated services (e.g., `StableTokenService`, `CollateralAssetService`).
  - **Rationale:** This promotes separation of concerns, makes the codebase easier to understand and maintain, and allows for more focused testing.
  - **Location:** Services are located in `src/services/`.

- **Modularity:** The project aims for a modular design, with distinct features or functionalities encapsulated in their own directories under `src/` (e.g., `adapters/`, `services/`, `types/`, `utils/`, `constants/`, `abis/`). This is further reinforced by the `export * from './...'` statements in `src/index.ts`, which clearly define the public API of each module.

- **Configuration via `MentoConfig`:**

  - **Decision:** The SDK is initialized using a `MentoConfig` object, with the `provider` being a mandatory field.
  - **Rationale:** This provides a clear and explicit way to configure the SDK upon creation.

- **Asynchronous Operations:**

  - **Decision:** Most interactions with the blockchain are asynchronous. The SDK extensively uses Promises (`async/await`) for these operations (e.g., `Mento.create()`, `getStableTokens()`, `getCollateralAssets()`).

- **Type Safety:**

  - **Decision:** TypeScript is used to ensure type safety throughout the codebase. This helps catch errors at compile time and improves code reliability.
  - **Implementation:** Clear interfaces and types are defined in `src/types/` and used consistently.

- **Testing:** Unit and integration tests are crucial. Jest is the configured testing framework (see `jest.config.ts`). Tests are located in the `tests/` directory.

- **Dependency Management:** pnpm is used for managing project dependencies (see `pnpm-lock.yaml`).

## Do's and Don'ts

- **Do:**
  - **Write comprehensive tests** for new features and bug fixes.
  - **Adhere strictly to the linting and formatting rules.**
  - **Keep dependencies up-to-date** and audit for vulnerabilities.
  - **Document new components and architectural changes** in the relevant `ai_docs/` files.
  - **Use descriptive names** for variables, functions, classes, and files.
- **Don't:**
  - **Introduce breaking changes** to public APIs without proper versioning and documentation.
  - **Commit commented-out code.** Remove it or use version control to track its history.
  - **Write overly complex or "clever" code.** Prioritize readability and maintainability.
  - **Ignore linter or test failures.**

## Examples

### Good Example: Defining an Interface

```typescript
// src/interfaces/user.ts

export interface UserProfile {
  userId: string
  username: string
  email: string
  isActive: boolean
  lastLogin?: Date // Optional property
}
```

### Bad Example: Using `any` excessively

```typescript
// Avoid this:
function processData(data: any): any {
  // ...logic that is hard to reason about and prone to runtime errors
  return data.processed
}

// Prefer this:
interface RawData {
  id: number
  value: string
  // ...other properties
}

interface ProcessedData {
  processedId: string
  transformedValue: string
}

function processData(data: RawData): ProcessedData {
  // ...type-safe logic
  return {
    processedId: `item-${data.id}`,
    transformedValue: data.value.toUpperCase(),
  }
}
```
