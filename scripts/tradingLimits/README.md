# Mento Trading Limits Visualizer

A CLI tool for visualizing all trading limit configurations and their current states across the Mento protocol.

## Features

- Displays all exchanges/pools and their trading limits in a tabular format
- Shows information for both assets in each exchange (including those without limits)
- Provides filtering by token symbol or exchange ID
- Shows netflow and utilization metrics with visual bars
- Color-coded status indicators (green/yellow/red)

## Usage

```bash
# Basic usage
yarn tradingLimits

# Filter by token symbol
yarn tradingLimits --token USDm
yarn tradingLimits --token=USDm
yarn tradingLimits -t USDm

# Filter by exchange ID
yarn tradingLimits --exchange BiPoolManager
yarn tradingLimits --exchange=BiPoolManager
yarn tradingLimits -e BiPoolManager

# Show verbose output with Limit IDs
yarn tradingLimits --verbose
yarn tradingLimits -v

# Combine options
yarn tradingLimits --token USDm --exchange BiPoolManager --verbose

# Connect to a specific RPC endpoint
RPC_URL=https://your-rpc-url.com yarn tradingLimits
```

## Display Modes

### Normal Mode

In normal mode, the tool shows a simplified view focused on usability:

- Exchange column shows human-readable format (e.g., "USDm <-> CELO")
- Technical details like Exchange IDs, Asset addresses, and Limit IDs are hidden

### Verbose Mode

Use the `--verbose` or `-v` flag to enable verbose output:

```bash
yarn tradingLimits --verbose
```

In verbose mode, the tool displays additional technical information:

- **Limit ID** column: Shows the unique identifier for each trading limit (a hex string generated from the exchange ID and asset address using XOR operation)

## Understanding Trading Limits

Mento uses a multi-tiered trading limit system:

- **L0** (short time window): Typically 5 minutes for most assets
- **L1** (medium time window): Typically 1 day (24 hours) for most assets
- **LG** (global limit): Doesn't reset automatically, requires manual intervention

Each limit has a maximum inflow and outflow value. When either is reached, trading in that direction is blocked until the time window resets.

## Output Explanation

The script produces a table with the following columns:

| Column      | Description                                                            |
| ----------- | ---------------------------------------------------------------------- |
| Exchange    | The exchange pair (shown only once per exchange)                       |
| Symbol      | The token symbol                                                       |
| Limit Type  | L0 (short-term), L1 (medium-term), or LG (global)                      |
| Timeframe   | The time window for this limit                                         |
| Limit       | The maximum configured limit value                                     |
| Netflow     | Current usage (positive for inflows, negative for outflows)            |
| Utilization | Visual representation of limit usage                                   |
| Max In      | Maximum allowed inflow remaining                                       |
| Max Out     | Maximum allowed outflow remaining                                      |
| Resets In   | Time until limit window resets                                         |
| Reset Time  | Unix timestamp when limit resets                                       |
| Status      | Current status (ACTIVE, INFLOWS BLOCKED, OUTFLOWS BLOCKED, or BLOCKED) |
| Limit ID    | Unique identifier for the trading limit (visible in verbose mode only) |

The tool uses color-coded statuses to indicate the current state of each trading limit:

- **ACTIVE** (green): Trading is fully enabled in both directions
- **INFLOWS BLOCKED** (yellow): Deposits are blocked, but withdrawals are still allowed
- **OUTFLOWS BLOCKED** (yellow): Withdrawals are blocked, but deposits are still allowed
- **BLOCKED** (red): All trading is blocked until the time window resets

## Project Structure

```text
scripts/tradingLimits/
├── index.ts                   # Main script entry point
├── types.ts                   # Type definitions
├── tradingLimitsOrchestrator.ts # Main processing orchestration
├── utils/
│   ├── assetLimitProcessor.ts   # Asset limit processing
│   ├── errorHandler.ts          # Error handling utilities
│   ├── exchangeLimitProcessor.ts # Exchange limit processing
│   ├── exchangeProcessor.ts     # Exchange handling functions
│   ├── getSymbolFromTokenAddress.ts # Token symbol utilities
│   ├── parseCommandLineArgs.ts  # Command line parsing
│   ├── prefetchTokenSymbols.ts  # Symbol prefetching for performance
│   ├── tableFormatter.ts        # Table creation and formatting
│   └── typeExtensions.ts        # TypeScript extensions
```

## Development

The code is organized modularly to improve maintainability:

- **Exchange Processing** - Functions for handling exchanges and their assets
- **Limit Processing** - Logic for processing trading limits
- **Table Formatting** - Functions for creating and formatting the output table
- **Error Handling** - Centralized error handling utilities
