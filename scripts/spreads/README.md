# Mento Spreads Visualizer

A CLI tool for visualizing all spread configurations across the Mento protocol's trading pairs.
image.png
## Features

- Displays all exchanges/pools and their spread configurations in a tabular format
- Shows information for both assets in each exchange
- Provides filtering by token symbol or exchange ID
- Shows spread percentages in a clear, readable format
- Color-coded spread values
- Displays additional pool configuration parameters:
  - Reference rate feed ID
  - Bucket reset frequency
  - Minimum required oracle reports
  - Stable pool reset size

## Usage

```bash
# Basic usage
yarn spreads

# Filter by token symbol
yarn spreads --token cUSD
yarn spreads --token=cUSD
yarn spreads -t cUSD

# Filter by exchange ID
yarn spreads --exchange BiPoolManager
yarn spreads --exchange=BiPoolManager
yarn spreads -e BiPoolManager

# Combine options
yarn spreads --token cUSD --exchange BiPoolManager

# Connect to a specific RPC endpoint
RPC_URL=https://your-rpc-url.com yarn spreads
```

## Understanding Spreads

In the Mento protocol, spreads are used to determine the fees charged for trading between assets. The spread is stored as a FixidityLib.Fraction with 24 decimal places, where 1.0 represents 100%. The term spread can be a bit misleading here because it is charged on each trade and the resulting roundtrip-spread would hence be 2 x spread.

## Output Explanation

The script produces a table with the following columns:

| Column | Description |
|--------|-------------|
| Exchange ID | The unique identifier for the exchange |
| Asset 0 | The first asset in the trading pair |
| Asset 1 | The second asset in the trading pair |
| Spread (%) | The fee percentage charged on each trade |
| Ref Rate Feed | The oracle rateFeedID used as reference rate |
| Reset Freq (h) | How often the buckets reset to reference rate (in hours) |
| Min Reports | Minimum required oracle reports to trust reference rate |
| Reset Size | Value that bucket0 resets to during bucket updates |

The tool uses color-coded spread values to make them easily distinguishable in the output:
- Green: Spread ≤ 0.5%
- Yellow: 0.5% < Spread ≤ 1%
- Red: Spread > 1%

## Project Structure

```
scripts/spreads/
├── index.ts                   # Main script entry point
├── types.ts                   # Type definitions
├── spreadsOrchestrator.ts     # Main processing orchestration
├── utils/
│   ├── parseCommandLineArgs.ts  # Command line parsing
│   └── prefetchTokenSymbols.ts  # Symbol prefetching for performance
```

## Development

The code is organized modularly to improve maintainability:

- **Exchange Processing** - Functions for handling exchanges and their assets
- **Spread Processing** - Logic for processing spread configurations
- **Table Formatting** - Functions for creating and formatting the output table
- **Error Handling** - Centralized error handling utilities

## Technical Details

The script uses the following key components:

1. **BiPoolManager Contract** - Directly interacts with the BiPoolManager contract to fetch spread configurations
2. **FixidityLib** - Handles the conversion of spread values from the contract's 24-decimal format to percentages
3. **Token Symbol Resolution** - Resolves token addresses to their human-readable symbols
4. **Table Formatting** - Creates a clean, readable table output with proper column alignment and delimiters 