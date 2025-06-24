import { TradablePair } from '../mento'

// Extended TradablePair with spread data
export interface TradablePairWithSpread extends TradablePair {
  spreadData: {
    totalSpreadPercent: number
    hops: Array<{
      exchangeId: string
      spreadPercent: number
    }>
  }
}

/**
 * Gets cached tradable pairs for a specific chain ID
 * @param chainId - The chain ID to get cached pairs for
 * @returns Promise resolving to the cached tradable pairs or undefined if not available
 */
export async function getCachedTradablePairs(
  chainId: number
): Promise<readonly (TradablePair | TradablePairWithSpread)[] | undefined> {
  switch (chainId) {
    case 42220:
      return await import('./tradablePairs.42220').then(
        (module) => module.tradablePairs42220
      )
    case 44787:
      return await import('./tradablePairs.44787').then(
        (module) => module.tradablePairs44787
      )
    default:
      return undefined
  }
}
