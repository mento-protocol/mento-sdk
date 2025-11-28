import type { Route, RouteWithSpread } from '../types'

// Re-export the type for convenience
export type { RouteWithSpread }

/**
 * Gets cached routes for a specific chain ID
 * @param chainId - The chain ID to get cached routes for
 * @returns Promise resolving to the cached routes or undefined if not available
 */
export async function getCachedRoutes(
  chainId: number
): Promise<readonly (Route | RouteWithSpread)[] | undefined> {
  switch (chainId) {
    case 42220:
      return await import('./routes.42220').then(
        (module) => module.routes42220
      )
    case 11142220:
      return await import('./routes.11142220').then(
        (module) => module.routes11142220
      )
    default:
      return undefined
  }
}
