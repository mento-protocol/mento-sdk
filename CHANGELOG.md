# Changelog

## 3.2.0

### Improvements

- **Borrow ownership helpers**: Added `getOwnedTroveCount()` and sender-aware `findNextAvailableOwnerIndex()` for safe trove opening. `getNextOwnerIndex()` is now a compatibility alias for current NFT-owned trove count, and borrow docs now clarify that `getUserTroves()` reflects current Trove NFT ownership.

## 3.0.0

### Breaking Changes

- **Removed Ethers.js support**: The SDK now uses [viem](https://viem.sh/) exclusively. The adapter pattern (`EthersAdapter`, `ViemAdapter`) and all Ethers.js-related code have been removed. `viem` is now the sole peer dependency.
- **New initialization API**: Replace `new Mento({ provider })` with the async factory:
  ```typescript
  const mento = await Mento.create(ChainId.CELO)
  // or with custom RPC
  const mento = await Mento.create(ChainId.CELO, 'https://your-rpc.com')
  // or with an existing viem PublicClient
  const mento = await Mento.create(ChainId.CELO, publicClient)
  ```
- **Reorganized service namespaces**: The SDK is now organized into dedicated service objects on the `Mento` instance:
  - `mento.tokens` — stable tokens and collateral assets (replaces `mento.getStableTokens()`)
  - `mento.pools` — pool discovery and details
  - `mento.routes` — route finding (direct and multi-hop)
  - `mento.quotes` — swap quotes (replaces `mento.getAmountOut()`)
  - `mento.swap` — swap transaction building (replaces `mento.swapIn()`)
  - `mento.trading` — circuit breaker and trading limit checks
  - `mento.liquidity` — add/remove liquidity, zap in/out
  - `mento.borrow` — trove management (open, adjust, close, repay)
- **Transaction building pattern**: All `build*Transaction` methods now return `CallParams` objects (`{ to, data, value }`) instead of executing transactions directly. Consumers execute transactions with their own wallet client.
- **Removed `@mento-protocol/mento-core-ts` dependency**: No longer required.

### New Features

- **BorrowService**: Full trove management — open, adjust, close, repay, borrow more, manage interest rates and batch managers.
- **LiquidityService**: Add/remove liquidity with approval handling, zap in (single token) and zap out operations.
- **TradingService**: Circuit breaker checks, trading limit queries, and full pool tradability status.
- **PoolService**: Multi-factory pool discovery (FPMM and Virtual pools) with enriched pool details.
- **RouteService**: Multi-hop route discovery (up to 2 hops) with pre-generated route cache for instant startup.
- **Bring-your-own-client**: Pass an existing viem `PublicClient` to `Mento.create()` for full control over transport configuration.
- **Pre-generated caches**: Route and token data are cached at build time for fast initialization without RPC calls.

### Improvements

- Input validation on all public methods with clear error messages.
- Custom error types: `RouteNotFoundError`, `FXMarketClosedError`, `ZapOutRouteNotViableError`.
- Retry logic with exponential backoff for RPC calls.
- `deadlineFromMinutes()` helper for transaction deadlines.
