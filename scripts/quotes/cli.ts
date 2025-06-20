import yargsParser from 'yargs-parser'
import { CHAIN_NAME_TO_ID, DEFAULT_CHAIN_ID } from './config'
import { SwapInfoArgs } from './types'

/**
 * Parses and validates command line arguments for the quotes tool.
 * Handles token symbols, amounts, chain selection, and various display options.
 *
 * @returns Parsed and validated command line arguments
 * @throws Exits process if required arguments are missing or invalid
 */
export function parseCommandLineArgs(): SwapInfoArgs {
  // Parse command line arguments with proper aliases and defaults
  const argv = yargsParser(process.argv.slice(2), {
    string: ['from', 'to', 'amount', 'chainId', 'chain'],
    boolean: ['all', 'verbose'],
    alias: {
      f: 'from',
      t: 'to',
      a: 'amount',
      c: 'chain',
      A: 'all',
      v: 'verbose',
    },
    default: {
      chainId: DEFAULT_CHAIN_ID.toString(),
      all: false,
      verbose: false,
    },
  })

  // Validate that required token arguments are provided
  if (!argv.from || !argv.to) {
    displayUsage()
    process.exit(1)
  }

  return {
    from: transformTokenSymbol(argv.from),
    to: transformTokenSymbol(argv.to),
    amount: argv.amount,
    chainId: resolveChainId(argv.chain, argv.chainId),
    chain: argv.chain,
    all: argv.all,
    verbose: argv.verbose,
  }
}

/**
 * Resolves chain identifier to numeric chain ID.
 * Supports both chain names ('celo', 'alfajores') and direct chain IDs.
 *
 * @param chainArg - Chain name argument
 * @param chainIdArg - Direct chain ID argument
 * @returns Numeric chain ID
 */
function resolveChainId(chainArg?: string, chainIdArg?: string): number {
  if (chainArg) {
    const chainName = chainArg.toLowerCase()
    const chainId = CHAIN_NAME_TO_ID[chainName]
    if (!chainId) {
      console.error(
        `Invalid chain name "${chainArg}". Available chains: ${Object.keys(
          CHAIN_NAME_TO_ID
        ).join(', ')}`
      )
      process.exit(1)
    }
    return chainId
  }
  return chainIdArg ? Number(chainIdArg) : DEFAULT_CHAIN_ID
}

/**
 * Transforms token symbols to a consistent format.
 * Handles common token symbol variations and edge cases.
 *
 * @param symbol - Raw token symbol from command line
 * @returns Standardized token symbol
 */
function transformTokenSymbol(symbol: string): string {
  // Convert common variations to standard format
  // This helps with user experience for common tokens
  const transforms: Record<string, string> = {
    cusd: 'cUSD',
    ceur: 'cEUR',
    creal: 'cREAL',
    usdc: 'USDC',
    usdt: 'USDT',
    weth: 'WETH',
    wbtc: 'WBTC',
    axlusdc: 'axlUSDC',
    axlusdt: 'axlUSDT',
    axlweth: 'axlWETH',
    axlwbtc: 'axlWBTC',
  }

  const lowerSymbol = symbol.toLowerCase()
  return transforms[lowerSymbol] || symbol
}

/**
 * Displays usage information and available options for the CLI tool.
 * Called when required arguments are missing or --help is used.
 */
function displayUsage(): void {
  console.log(`
Usage: yarn quote [options]

Options:
  -f, --from <token>     From token symbol (required)
  -t, --to <token>       To token symbol (required)
  -a, --amount <amount>  Amount to swap (optional, for quote calculation)
  -c, --chain <chain>    Chain name (celo, alfajores) [default: celo]
  -A, --all              Show all routes instead of just the optimal one
  -v, --verbose          Show detailed route information

Examples:
  yarn quote -f USDC -t cUSD                    # Find optimal route
  yarn quote -f USDC -t cUSD -a 1000           # Get quote for 1000 USDC
  yarn quote -f USDC -t cUSD --all             # Show all available routes
  yarn quote -f USDC -t cUSD -a 1000 --all     # Show all routes with quotes
  yarn quote -f USDC -t cUSD --verbose         # Show detailed route info
  `)
}
