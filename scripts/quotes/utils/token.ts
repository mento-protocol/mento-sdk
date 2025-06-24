import { Contract } from 'ethers'
import { TradablePair } from '../../../src/mento'
import {
  DEFAULT_DECIMALS,
  MAX_DECIMAL_PLACES,
  TOKEN_ABI_FRAGMENT,
} from '../config'
import { createProvider } from './provider'

/**
 * Validates that the provided token symbols exist in the available trading pairs.
 * Performs case-insensitive matching and returns the actual token addresses.
 * Includes special handling for USDT to accept plain "USDT" without special characters.
 *
 * @param allPairs - All available trading pairs from Mento
 * @param fromSymbol - Input token symbol (case-insensitive)
 * @param toSymbol - Output token symbol (case-insensitive)
 * @returns Object with validated token addresses
 * @throws Error if either token symbol is not found
 */
export function validateTokens(
  allPairs: readonly TradablePair[],
  fromSymbol: string,
  toSymbol: string
): { fromAddress: string; toAddress: string } {
  // Create a lookup map for case-insensitive symbol matching
  const symbolToAddress = new Map<string, string>()

  // Build lookup table from all available assets
  for (const pair of allPairs) {
    for (const asset of pair.assets) {
      symbolToAddress.set(asset.symbol.toLowerCase(), asset.address)
    }
  }

  // Special case: Allow plain "USDT" to map to any USDT variant (like "USD₮")
  // This provides user-friendly access to USDT without requiring special characters
  if (!symbolToAddress.has('usdt')) {
    // Look for any USD + Tether symbol variant in the symbol map
    for (const [symbol, address] of symbolToAddress.entries()) {
      // Check for "USD₮" or other USDT variants
      const normalizedSymbol = symbol.replace(/[^\w]/g, '').toLowerCase()
      if (normalizedSymbol === 'usdt' || symbol === 'usd₮') {
        symbolToAddress.set('usdt', address)
        break
      }
    }
  }

  // Find addresses for both tokens (case-insensitive)
  const fromAddress = symbolToAddress.get(fromSymbol.toLowerCase())
  const toAddress = symbolToAddress.get(toSymbol.toLowerCase())

  // Validate that both tokens were found
  if (!fromAddress) {
    throw new Error(`Token "${fromSymbol}" not found in available pairs`)
  }

  if (!toAddress) {
    throw new Error(`Token "${toSymbol}" not found in available pairs`)
  }

  return { fromAddress, toAddress }
}

/**
 * Retrieves the decimal precision for a token from the blockchain.
 * Uses the ERC20 standard decimals() function with fallback to 18 decimals.
 *
 * @param tokenAddress - The token contract address
 * @param provider - Ethereum provider for blockchain calls
 * @returns Number of decimal places for the token
 */
export async function getTokenDecimals(
  tokenAddress: string,
  provider: ReturnType<typeof createProvider>
): Promise<number> {
  try {
    const tokenContract = new Contract(
      tokenAddress,
      TOKEN_ABI_FRAGMENT,
      provider
    )
    const decimals = await tokenContract.decimals()
    return decimals
  } catch (error) {
    // Fallback to 18 decimals if the call fails
    console.warn(
      `Failed to get decimals for token ${tokenAddress}, using default ${DEFAULT_DECIMALS}`
    )
    return DEFAULT_DECIMALS
  }
}

/**
 * Rounds a number string to the maximum allowed decimal places.
 * Prevents display of excessive precision while preserving accuracy.
 *
 * @param value - Numeric string to round
 * @returns Rounded string with max decimal places
 */
export function roundToMaxDecimals(value: string): string {
  const num = parseFloat(value)

  // Handle edge cases
  if (isNaN(num)) return '0'
  if (num === 0) return '0'

  // Round to maximum decimal places and remove trailing zeros
  return num.toFixed(MAX_DECIMAL_PLACES).replace(/\.?0+$/, '')
}
