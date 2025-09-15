import { ethers } from 'ethers'
import { getSymbolFromTokenAddress as sdkGetSymbol } from '../../src/utils'
import { batchProcess } from './batchProcessor'

// Global cache for token symbols to avoid repeated calls
const tokenSymbolCache: Record<string, string> = {}

/**
 * Get token symbol from token address with caching
 * This wraps the SDK's getSymbolFromTokenAddress function with caching
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
  if (tokenSymbolCache[address]) {
    return tokenSymbolCache[address]
  }

  try {
    // Use the SDK implementation
    const symbol = await sdkGetSymbol(address, provider)

    // Store in cache
    tokenSymbolCache[address] = symbol
    return symbol
  } catch (error) {
    const fallbackSymbol = `Unknown (${address.substring(0, 6)}...)`
    // Cache failed lookups too to avoid retrying
    tokenSymbolCache[address] = fallbackSymbol
    return fallbackSymbol
  }
}

/**
 * Pre-fetch token symbols for caching to reduce repeated calls
 *
 * @param tokenAddresses - Set or array of token addresses to prefetch
 * @param provider - The ethers provider
 * @param showSpinner - Whether to show a progress spinner
 */
export async function prefetchTokenSymbols(
  tokenAddresses: Set<string> | string[],
  provider: ethers.providers.Provider,
  showSpinner = true
): Promise<void> {
  const addressArray = Array.from(tokenAddresses)
  const uniqueTokenCount = addressArray.length

  if (uniqueTokenCount === 0) {
    return
  }
  const ora = (await import('ora')).default;

  let spinner: ReturnType<typeof ora> | undefined
  if (showSpinner) {
    spinner = ora({
      text: `Prefetching ${uniqueTokenCount} token symbols...`,
      color: 'cyan',
    }).start()
  }

  try {
    // Fetch all token symbols in batches to avoid overwhelming RPC endpoint
    await batchProcess(
      addressArray,
      async (address) => {
        await getSymbolFromTokenAddress(address, provider)
      },
      15 // Process 15 tokens concurrently
    )

    if (spinner) {
      spinner.succeed(`Prefetched ${uniqueTokenCount} token symbols`)
    }
  } catch (error) {
    if (spinner) {
      spinner.fail('Failed to prefetch token symbols')
    }
    console.log(
      'Warning: Token symbol prefetching failed, will fetch symbols on demand'
    )
  }
}

/**
 * Clear the token symbol cache
 * Useful for testing or when switching networks
 */
export function clearTokenSymbolCache(): void {
  Object.keys(tokenSymbolCache).forEach((key) => {
    delete tokenSymbolCache[key]
  })
}

/**
 * Get the current size of the token symbol cache
 */
export function getTokenSymbolCacheSize(): number {
  return Object.keys(tokenSymbolCache).length
}

/**
 * Pre-fetch token symbols for Exchange objects (from breakerBox/poolConfigs)
 * This is a specialized version that extracts token addresses from Exchange objects
 *
 * @param exchanges - Array of Exchange objects with providerAddr and id
 * @param provider - The ethers provider
 */
export async function prefetchTokenSymbolsFromExchanges(
  exchanges: Array<{ providerAddr: string; id: string }>,
  provider: ethers.providers.Provider
): Promise<void> {
  const ora = (await import('ora')).default;
  const spinner = ora({
    text: 'Pre-fetching token symbols...',
    color: 'cyan',
  }).start()

  try {
    // First we need to fetch exchange configs to get asset addresses
    const { BiPoolManager__factory } = await import(
      '@mento-protocol/mento-core-ts'
    )

    // Extract unique token addresses from all exchanges by fetching their configs
    const uniqueTokenAddresses = new Set<string>()

    // Process exchanges in batches to get their asset addresses
    await batchProcess(
      exchanges,
      async (exchange) => {
        try {
          const biPoolManager = BiPoolManager__factory.connect(
            exchange.providerAddr,
            provider
          )
          const exchangeConfig = await biPoolManager.getPoolExchange(
            exchange.id
          )
          uniqueTokenAddresses.add(exchangeConfig.asset0)
          uniqueTokenAddresses.add(exchangeConfig.asset1)
        } catch (error) {
          // Silently skip exchanges that fail
          console.log(
            `Warning: Failed to get assets for exchange ${exchange.id}`
          )
        }
      },
      8 // Process 8 exchanges concurrently for asset discovery
    )

    const uniqueTokenCount = uniqueTokenAddresses.size
    if (uniqueTokenCount === 0) {
      spinner.succeed('No tokens to prefetch')
      return
    }

    spinner.text = `Prefetching ${uniqueTokenCount} token symbols...`

    // Fetch all token symbols in batches using the shared prefetch function
    await prefetchTokenSymbols(uniqueTokenAddresses, provider, false)

    spinner.succeed(`Prefetched ${uniqueTokenCount} token symbols`)
  } catch (error) {
    spinner.fail('Failed to prefetch token symbols')
    console.log(
      'Warning: Token symbol prefetching failed, will fetch symbols on demand'
    )
  }
}
