import chalk from 'chalk'
import { ethers } from 'ethers'

// Cache for token symbols to avoid repeated calls
const symbolCache: Record<string, string> = {}

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
