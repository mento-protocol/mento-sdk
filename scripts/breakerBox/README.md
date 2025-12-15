# Mento BreakerBox Visualizer

A CLI tool for visualizing all circuit breaker configurations and their current states across the Mento protocol's rate feeds.

## Features

- Displays all rate feeds and their circuit breaker configurations in a tabular format
- Shows the associated trading pairs for each rate feed
- Provides filtering by token symbol to focus on specific trading pairs
- Shows breaker status with color-coded indicators (active/tripped/disabled)
- Displays comprehensive breaker parameters:
  - Median threshold and smoothing factor
  - Value threshold and reference values
  - Cooldown periods
  - Current trading mode
- Dynamically sized table for perfect column alignment

## Usage

```bash
# Basic usage
yarn breakerBox

# Filter by token symbol
yarn breakerBox --token USDm
yarn breakerBox --token=USDm
yarn breakerBox -t USDm

# Connect to a specific RPC endpoint
RPC_URL=https://your-rpc-url.com yarn breakerBox
```

## Understanding Circuit Breakers

In the Mento protocol, circuit breakers are safety mechanisms that can temporarily halt trading when certain conditions are met. Each rate feed has two types of breakers:

1. **Median Delta Breaker**: Monitors the rate of change in the median price
2. **Value Delta Breaker**: Monitors the absolute value of price changes

The breakers can be in three states:

- **Active**: Monitoring and allowing trades
- **Tripped**: Triggered and preventing trades
- **Disabled**: Not monitoring the rate feed

## Output Explanation

The script produces a table with the following columns:

| Column        | Description                                                    |
| ------------- | -------------------------------------------------------------- |
| Rate Feed ID  | The unique identifier for the rate feed                        |
| Exchange ID   | The associated exchange identifier                             |
| Asset 0       | The first asset in the trading pair                            |
| Asset 1       | The second asset in the trading pair                           |
| Status        | Current state of the circuit breaker (active/tripped/disabled) |
| Trading Mode  | Current trading mode (0=active, 1=tripped, 2=disabled)         |
| Median Thresh | Threshold for median price changes                             |
| Median Smooth | Smoothing factor for median calculations                       |
| Median EMA    | Current Exponential Moving Average                             |
| Value Thresh  | Threshold for absolute value changes                           |
| Value Ref     | Reference value for value breaker                              |
| Cooldown      | Cooldown period in seconds                                     |

The tool uses color-coded status indicators:

- Green: Active
- Red: Tripped
- Yellow: Disabled

## Project Structure

```
scripts/breakerBox/
├── index.ts                   # Main script entry point
├── types.ts                   # Type definitions
├── utils/
│   └── parseCommandLineArgs.ts  # Command line parsing
```

## Development

The code is organized to handle:

- **Rate Feed Processing** - Functions for handling rate feeds and their configurations
- **Breaker Configuration** - Logic for processing breaker parameters
- **Table Formatting** - Functions for creating and formatting the output table
- **Error Handling** - Centralized error handling utilities

## Technical Details

The script uses the following key components:

1. **BiPoolManager Contract** - Fetches exchange configurations to map rate feeds to trading pairs
2. **IBreakerBox Contract** - Interacts with the breaker box to get breaker states for each rate feed
3. **MedianDeltaBreaker & ValueDeltaBreaker** - Fetches specific breaker parameters for each rate feed
4. **Token Symbol Resolution** - Resolves token addresses to their human-readable symbols
5. **Table Formatting** - Creates a clean, readable table output with proper column alignment
