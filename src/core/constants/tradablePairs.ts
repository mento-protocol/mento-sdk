import type { TradablePair, TradablePairWithSpread } from '../types'

// Re-export the type for convenience
export type { TradablePairWithSpread }

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
    case 11142220:
      return await import('./tradablePairs.11142220').then(
        (module) => module.tradablePairs11142220
      )
    default:
      return undefined
  }
}
