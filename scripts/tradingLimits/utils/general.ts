import chalk from 'chalk'
import { ethers } from 'ethers'
import yargsParser from 'yargs-parser'
import { ScriptArgs } from '../types'

// FIXME: This workaround should not be necessary much longer as native groupBy support should be in latest TS already https://github.com/microsoft/TypeScript/pull/56805
// Add TypeScript declaration for Object.groupBy
declare global {
  interface ObjectConstructor {
    groupBy<T, K extends PropertyKey>(
      items: Iterable<T>,
      keySelector: (item: T) => K
    ): Record<K, T[]>
  }
}

// Cache for token symbols to avoid repeated calls
const symbolCache: Record<string, string> = {}

/**
 * Parse command line arguments using yargs-parser
 * Supports both "--token=cGHS" and "--token cGHS" formats, as well as short flags (-t, -e, -v)
 *
 * @returns Object containing parsed arguments
 */
export function parseCommandLineArgs(): ScriptArgs {
  const argv = yargsParser(process.argv.slice(2), {
    string: ['token', 'exchange'],
    boolean: ['verbose'],
    alias: {
      t: 'token',
      e: 'exchange',
      v: 'verbose',
    },
    default: {
      token: '',
      exchange: '',
      verbose: false,
    },
    configuration: {
      'short-option-groups': true,
      'camel-case-expansion': true,
    },
  })

  return {
    token: argv.token,
    exchange: argv.exchange,
    verbose: argv.verbose,
  }
}

/**
 * Get token symbol from token address (with caching)
 *
 * @param address - Token contract address
 * @param provider - The ethers provider
 * @returns Token symbol or fallback if not available
 */
export async function getSymbolFromTokenAddress(
  address: string,
  provider: ethers.providers.Provider
): Promise<string> {
  // Check cache first
  if (symbolCache[address]) {
    return symbolCache[address]
  }

  try {
    // Import the SDK's getSymbolFromTokenAddress function
    const { getSymbolFromTokenAddress: sdkGetSymbol } = await import(
      '../../../src/utils'
    )

    // Use the SDK implementation
    const symbol = await sdkGetSymbol(address, provider)

    // Store in cache
    symbolCache[address] = symbol
    return symbol
  } catch (error) {
    console.error(
      chalk.yellow(`Warning: Could not get symbol for token ${address}`)
    )
    const fallbackSymbol = `Unknown (${address.substring(0, 6)}...)`
    // Cache failed lookups too
    symbolCache[address] = fallbackSymbol
    return fallbackSymbol
  }
}
