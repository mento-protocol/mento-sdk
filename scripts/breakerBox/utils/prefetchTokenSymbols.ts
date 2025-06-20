import { ethers } from 'ethers'
import ora from 'ora'
import { Exchange } from '../../../src/mento'
import { batchProcess } from '../../shared/batchProcessor'

const tokenSymbolCache: { [address: string]: string } = {}

/**
 * Pre-fetch token symbols for caching
 * This reduces repeated calls for the same token
 *
 * @param exchanges - List of exchanges (with id and providerAddr)
 * @param provider - The ethers provider
 */
export async function prefetchTokenSymbols(
  exchanges: Exchange[],
  provider: ethers.providers.Provider
): Promise<void> {
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

    // Fetch all token symbols in batches to avoid overwhelming RPC endpoint
    await batchProcess(
      Array.from(uniqueTokenAddresses),
      async (address) => {
        await getSymbolFromTokenAddress(address, provider)
      },
      15 // Process 15 tokens concurrently
    )

    spinner.succeed(`Prefetched ${uniqueTokenCount} token symbols`)
  } catch (error) {
    spinner.fail('Failed to prefetch token symbols')
    console.log(
      'Warning: Token symbol prefetching failed, will fetch symbols on demand'
    )
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
  if (tokenSymbolCache[address]) {
    return tokenSymbolCache[address]
  }

  try {
    // Import the SDK's getSymbolFromTokenAddress function
    const { getSymbolFromTokenAddress: sdkGetSymbol } = await import(
      '../../../src/utils'
    )

    // Use the SDK implementation
    const symbol = await sdkGetSymbol(address, provider)

    // Store in cache
    tokenSymbolCache[address] = symbol
    return symbol
  } catch (error) {
    const fallbackSymbol = `Unknown (${address.substring(0, 6)}...)`
    // Cache failed lookups too
    tokenSymbolCache[address] = fallbackSymbol
    return fallbackSymbol
  }
}
