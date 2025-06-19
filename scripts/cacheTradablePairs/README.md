# Cache Tradable Pairs

This directory contains the modular implementation of the `cacheTradablePairs` script, which generates and caches trading route data with spread calculations.

## Architecture

The script has been refactored into a clean modular structure:

### Core Files

- **`index.ts`** - Main orchestration logic and entry point
- **`config.ts`** - Configuration constants, network mappings, and type definitions
- **`cli.ts`** - Command line argument parsing and usage help
- **`spread.ts`** - Exchange spread fetching and calculation logic
- **`fileGenerator.ts`** - TypeScript cache file generation utilities
- **`statistics.ts`** - Route distribution and spread analysis

### Key Features

- **Multiple Routes**: Retains all available trading routes (not just optimal ones)
- **Fallback Options**: Provides alternative routes when primary routes become unavailable
- **Spread Data**: Includes comprehensive spread calculations for informed route selection
- **Sorted by Performance**: Routes sorted by spread percentage (best routes first)
- **Rich Statistics**: Detailed analysis of route distribution and spread metrics

## Usage

The script can be run via the original entry point for backward compatibility:

```bash
# Cache all networks
yarn cacheTradablePairs

# Cache specific network
yarn cacheTradablePairs --network alfajores
yarn cacheTradablePairs --network celo

# Cache specific chain ID
yarn cacheTradablePairs --chainId 42220
```

Or directly via the modular entry point:

```bash
npx ts-node scripts/cacheTradablePairs/index.ts --network alfajores
```

## Output

The script generates TypeScript files in `src/constants/` with the format:

- `tradablePairs.42220.ts` (Celo mainnet)
- `tradablePairs.44787.ts` (Alfajores testnet)
- `tradablePairs.62320.ts` (Baklava testnet)

Each file contains:

- Array of `TradablePairWithSpread` objects
- Spread data for each trading route
- Multiple route options per trading pair
- Routes sorted by performance (lowest spread first)

## Benefits of Modular Structure

- **Maintainability**: Clear separation of concerns
- **Reusability**: Individual modules can be imported and used independently
- **Testability**: Each module can be unit tested in isolation
- **Extensibility**: Easy to add new features or modify existing ones
- **Readability**: Main orchestration logic is clean and focused
