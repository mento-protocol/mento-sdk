import { Address } from 'viem'
import { Pool } from '../core/types'

/**
 * Route structure expected by the Router contract's getAmountsOut and swapTokensForTokens functions
 */
export interface RouterRoute {
  from: Address
  to: Address
  factory: Address
}

/**
 * Converts a route path to the format expected by the Router contract.
 * Used by both QuoteService (getAmountsOut) and SwapService (swapTokensForTokens).
 *
 * @param path - The route path (array of pools)
 * @param tokenIn - The input token address (determines swap direction)
 * @param _tokenOut - The output token address (unused but kept for API clarity)
 * @returns Array of RouterRoute objects for the contract call
 *
 * @example
 * ```typescript
 * const route = await routeService.findRoute(USDm, CELO)
 * const routerRoutes = encodeRoutePath(route.path, USDm, CELO)
 * // routerRoutes can now be passed to Router.getAmountsOut or Router.swapTokensForTokens
 * ```
 */
export function encodeRoutePath(path: Pool[], tokenIn: Address, _tokenOut: Address): RouterRoute[] {
  const routes: RouterRoute[] = []
  const tokenInLower = tokenIn.toLowerCase()

  // Check if we need to reverse the path
  // The path is stored in canonical order, but we may need to traverse it backwards
  const firstPool = path[0]
  const startsWithTokenIn =
    firstPool.token0.toLowerCase() === tokenInLower || firstPool.token1.toLowerCase() === tokenInLower

  // If tokenIn isn't in the first pool, reverse the path
  const orderedPath = startsWithTokenIn ? path : [...path].reverse()

  let currentTokenIn = tokenInLower

  for (const pool of orderedPath) {
    const token0 = pool.token0.toLowerCase()
    const token1 = pool.token1.toLowerCase()

    // Determine direction: which token is the input for this hop?
    let from: Address
    let to: Address

    if (currentTokenIn === token0) {
      from = pool.token0 as Address
      to = pool.token1 as Address
    } else if (currentTokenIn === token1) {
      from = pool.token1 as Address
      to = pool.token0 as Address
    } else {
      throw new Error(`Token ${currentTokenIn} not found in pool ${pool.poolAddr}`)
    }

    routes.push({
      from,
      to,
      factory: pool.factoryAddr as Address,
    })

    // The output of this hop becomes the input of the next hop
    currentTokenIn = to.toLowerCase()
  }

  return routes
}
