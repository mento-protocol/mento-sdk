# mento-sdk Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-11-03

## Active Technologies

- TypeScript 5.x with strict mode enabled, targeting ES2020+ (001-adapter-write-transactions)
- TypeScript 5.x with strict mode enabled, targeting ES2020+ + Existing adapter pattern (Ethers v6, Viem), contract ABIs (Broker, ExchangeProvider, ERC-20) (002-exchange-pool-discovery)
- In-memory caching (instance lifetime) + static cache files (pre-generated, committed to repo) (002-exchange-pool-discovery)

## Project Structure

```
src/
tests/
```

## Commands

npm test && npm run lint

## Code Style

TypeScript 5.x with strict mode enabled, targeting ES2020+: Follow standard conventions

## Recent Changes

- 002-exchange-pool-discovery: Added TypeScript 5.x with strict mode enabled, targeting ES2020+ + Existing adapter pattern (Ethers v6, Viem), contract ABIs (Broker, ExchangeProvider, ERC-20)
- 001-adapter-write-transactions: Added TypeScript 5.x with strict mode enabled, targeting ES2020+

<!-- MANUAL ADDITIONS START -->

## Code ownership

This codebase is yours: what it's for and how it's built are your call, and you'll keep building on it.
Ownership covers design and cleanup, not authority: approval rules, scope sign-off, review and no-merge rules still apply. Keep related fixes in separate commits and list them in the PR body.

<!-- MANUAL ADDITIONS END -->
