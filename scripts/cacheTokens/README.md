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
yarn cacheTokens
```

### Cache tokens for specific chains

```bash
yarn cacheTokens --chain-ids=42220,11142220
```

## Output

The script generates TypeScript files in `src/constants/`:

**Individual token files (per chain):**

- `tokens.42220.ts` - Celo Mainnet tokens (readonly Token[])
- `tokens.11142220.ts` - Celo Sepolia Testnet tokens (readonly Token[])

**Main index file (dynamically generated):**

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

RPC URLs can be configured via environment variables:

- `CELO_RPC_URL` - Celo Mainnet RPC URL (default: <https://forno.celo.org>)
- `CELO_SEPOLIA_RPC_URL` - Celo Sepolia RPC URL (default: <https://forno.celo-sepolia.celo-testnet.org>)

## When to Regenerate

Regenerate cached tokens when:

- New tokens are added to the Mento Protocol
- Existing tokens are removed from the Mento Protocol
- Token metadata changes (symbol, name, decimals)
- New chains are added to the protocol

## Example Output

```bash
📡 Cache tokens for chain(s): 42220, 11142220
🔄 Generating tokens for chain 42220...
✅ Successfully cached 20 tokens to tokens.42220.ts

🔄 Generating tokens for chain 11142220...
✅ Successfully cached 20 tokens to tokens.11142220.ts

🔄 Generating tokens.ts index file...
✅ Generated tokens.ts with 23 unique token symbols
```
