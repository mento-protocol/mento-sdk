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

The script generates TypeScript files in two locations:

**Individual token files (per chain) in `src/cache/`:**

- `tokens.42220.ts` - Celo Mainnet tokens (readonly Token[])
- `tokens.11142220.ts` - Celo Sepolia Testnet tokens (readonly Token[])

**Main index file in `src/utils/`:**

- `tokens.ts` - Contains:
  - `TokenSymbol` enum - All unique token symbols across all chains
  - `TOKEN_ADDRESSES_BY_CHAIN` - Address mapping by chain and symbol
  - `getCachedTokens()` - Async token loading function
  - `getCachedTokensSync()` - Synchronous token loading function
  - `getTokenAddress()` - Helper to get token address by symbol
  - `findTokenBySymbol()` - Helper to find token by symbol

## What Gets Generated

Everything is computed dynamically from blockchain data:

✅ **Token enum** - Unique symbols across all chains (e.g., `TokenSymbol.CELO`, `TokenSymbol.cUSD`)  
✅ **Address mappings** - Complete `TOKEN_ADDRESSES_BY_CHAIN` for all chains  
✅ **Helper functions** - Type-safe address lookups and token search  
✅ **Chain support** - Auto-detects supported chains from network config  
✅ **Error messages** - Dynamic list of supported chains in error messages

## Configuration

RPC URLs are configured in `scripts/shared/network.ts`:

- Celo Mainnet (42220): `https://forno.celo.org`
- Celo Sepolia (11142220): `https://forno.celo-sepolia.celo-testnet.org`

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
📡 Fetching tokens from blockchain...
✅ Fetched 20 unique tokens

🔄 Fetching tokens for chain 11142220...
📡 Fetching tokens from blockchain...
✅ Fetched 20 unique tokens

🔄 Generating tokens.ts index file...
✅ Successfully generated tokens index file at src/utils/tokens.ts

🔄 Generating per-chain cache files...
✅ Successfully cached 20 tokens to tokens.42220.ts
✅ Successfully cached 20 tokens to tokens.11142220.ts
```
