import { ethers } from 'ethers'
import { prefetchTokenSymbols as sharedPrefetchTokenSymbols } from '../../shared/tokenUtils'
import { ExchangeData } from '../types'

/**
 * Pre-fetch token symbols for caching
 * This reduces repeated calls for the same token
 *
 * @param exchanges - List of exchanges
 * @param provider - The ethers provider
 */
export async function prefetchTokenSymbols(
  exchanges: ExchangeData[],
  provider: ethers.providers.Provider
): Promise<void> {
  // Extract unique token addresses from all exchanges
  const uniqueTokenAddresses = new Set<string>()

  for (const exchange of exchanges) {
    for (const asset of exchange.assets) {
      uniqueTokenAddresses.add(asset)
    }
  }

  // Use the shared prefetch utility
  await sharedPrefetchTokenSymbols(uniqueTokenAddresses, provider, true)
}
