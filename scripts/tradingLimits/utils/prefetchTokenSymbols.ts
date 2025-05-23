import { ethers } from 'ethers'
import ora from 'ora'
import { ExchangeData } from '../types'
import { getSymbolFromTokenAddress } from './getSymbolFromTokenAddress'

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
  const spinner = ora({
    text: 'Pre-fetching token symbols...',
    color: 'cyan',
  }).start()

  // Extract unique token addresses from all exchanges
  const uniqueTokenAddresses = new Set<string>()

  for (const exchange of exchanges) {
    for (const asset of exchange.assets) {
      uniqueTokenAddresses.add(asset)
    }
  }

  const uniqueTokenCount = uniqueTokenAddresses.size
  spinner.text = `Prefetching ${uniqueTokenCount} token symbols...`

  // Fetch all token symbols in parallel
  await Promise.all(
    Array.from(uniqueTokenAddresses).map(async (address) => {
      await getSymbolFromTokenAddress(address, provider)
    })
  )

  spinner.succeed(`Prefetched ${uniqueTokenCount} token symbols`)
}
