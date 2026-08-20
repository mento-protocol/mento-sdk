# Token Caching Script

This script fetches token metadata from the blockchain for all unique tokens available on Mento Protocol and caches them in static TypeScript files. It dynamically generates a type-safe TokenSymbol enum, address mappings, and helper functions.

## Purpose

- **Synchronous Access**: Enables synchronous access to token data without async blockchain calls
- **Type Safety**: Dynamically generates type-safe `TokenSymbol` enum and `TOKEN_ADDRESSES_BY_CHAIN` mapping
- **Performance**: Eliminates network calls for token metadata
- **Offline Support**: Token data available without network connection
- **Zero Hardcoding**: Everything auto-generated from blockchain data

## Usage

### Cache tokens for all supported chains

```bash
pnpm cacheTokens
```

### Cache tokens for specific chains

```bash
pnpm cacheTokens --chain-ids=42220,11142220
```

## Output

The script generates a single consolidated file, `src/cache/tokens.ts`, containing:

- `TokenSymbol` enum - All unique token symbols across all chains
- `cachedTokens` - `readonly Token[]` per chain ID
- `TOKEN_ADDRESSES_BY_CHAIN` - Address mapping by chain and symbol
- `getCachedTokens()` - Tokens for a chain, or an empty array if it has none
- `getCachedTokensSync()` - Tokens for a chain, throwing if it has none
- `getTokenAddress()` - Helper to get token address by symbol
- `findTokenBySymbol()` - Helper to find token by symbol

All of these are synchronous - the cache is a static module, so nothing is loaded
at runtime.

## What Gets Generated

Everything is computed dynamically from blockchain data:

✅ **Token enum** - Unique symbols across all chains (e.g., `TokenSymbol.CELO`, `TokenSymbol.cUSD`)  
✅ **Address mappings** - Complete `TOKEN_ADDRESSES_BY_CHAIN` for all chains  
✅ **Helper functions** - Type-safe address lookups and token search  
✅ **Chain support** - Auto-detects supported chains from network config  
✅ **Error messages** - Dynamic list of supported chains in error messages

## Configuration

RPC URLs for every supported chain are configured in `scripts/shared/network.ts`,
each overridable through an environment variable (`CELO_RPC_URL`,
`BASE_SEPOLIA_RPC_URL`, and so on). Running the script with no `--network`,
`--chainId`, or `--chain-ids` flag caches every chain listed there.

## Failure Handling

The script is fail-closed. If any requested chain fails - a partial pool
discovery, or a failure to discover any pools at all - the run reports the
failing chain, leaves `src/cache/tokens.ts` untouched, and exits non-zero.
Without that guard a transient RPC error would write an empty token array for
that chain and drop its symbols from the `TokenSymbol` enum, and the cache
files ship in the npm package.

Chains that were not requested are seeded from the existing cache, so a
single-chain run only replaces that chain's tokens.

## When to Regenerate

Regenerate cached tokens when:

- New tokens are added to the Mento Protocol
- Existing tokens are removed from the Mento Protocol
- Token metadata changes (symbol, name, decimals)
- New chains are added to the protocol

## Example Output

```bash
📡 Cache tokens for chain(s): 42220, 11142220

🔄 Fetching tokens for chain 42220...
📡 Fetching direct routes from blockchain...
📡 Fetching token metadata for 20 unique tokens...
✅ Fetched 20 unique tokens

🔄 Fetching tokens for chain 11142220...
📡 Fetching direct routes from blockchain...
📡 Fetching token metadata for 20 unique tokens...
✅ Fetched 20 unique tokens

🔄 Generating consolidated tokens cache file...
✅ Successfully cached 40 tokens across 2 chains to src/cache/tokens.ts
```
