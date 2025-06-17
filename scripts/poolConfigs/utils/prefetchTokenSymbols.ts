import { ethers } from 'ethers'
import { Exchange } from '../../../src/mento'

const tokenSymbolCache: { [address: string]: string } = {}

export async function prefetchTokenSymbols(
  exchanges: Exchange[],
  provider: ethers.providers.Provider
): Promise<void> {
  const uniqueTokens = new Set<string>()
  exchanges.forEach((exchange) => {
    exchange.assets.forEach((asset) => uniqueTokens.add(asset))
  })

  const erc20Abi = [
    'function symbol() view returns (string)',
    'function name() view returns (string)',
  ]

  for (const tokenAddress of uniqueTokens) {
    if (!tokenSymbolCache[tokenAddress]) {
      try {
        const contract = new ethers.Contract(tokenAddress, erc20Abi, provider)
        const symbol = await contract.symbol()
        tokenSymbolCache[tokenAddress] = symbol
      } catch (error) {
        // If symbol() fails, try name()
        try {
          const contract = new ethers.Contract(tokenAddress, erc20Abi, provider)
          const name = await contract.name()
          tokenSymbolCache[tokenAddress] = name
        } catch (error) {
          // If both fail, use the address
          tokenSymbolCache[tokenAddress] = tokenAddress.slice(0, 6) + '...'
        }
      }
    }
  }
}

export function getTokenSymbol(tokenAddress: string): string {
  return tokenSymbolCache[tokenAddress] || tokenAddress.slice(0, 6) + '...'
}
