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
 * @throws {Error} If path is empty, too long, or contains invalid pools
 *
 * @example
 * ```typescript
 * const route = await routeService.findRoute(USDm, CELO)
 * const routerRoutes = encodeRoutePath(route.path, USDm, CELO)
 * // routerRoutes can now be passed to Router.getAmountsOut or Router.swapTokensForTokens
 * ```
 */
export function encodeRoutePath(path: Pool[], tokenIn: Address, _tokenOut: Address): RouterRoute[] {
  // Validate path is not empty
  if (!path || path.length === 0) {
    throw new Error(
      'Internal error: Route path is empty. This should not happen - routes are validated before encoding.'
    )
  }

  // Validate all pools have required structure
  for (let i = 0; i < path.length; i++) {
    const pool = path[i]
    if (!pool.token0 || !pool.token1 || !pool.factoryAddr) {
      throw new Error(
        `Invalid pool structure at index ${i}: missing required fields. ` +
        `Pool must have token0, token1, and factoryAddr. ` +
        `Got: ${JSON.stringify(pool)}`
      )
    }
  }

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
      throw new Error(
        `Route encoding error: Token ${currentTokenIn} not found in pool ${pool.poolAddr}. ` +
        `Pool contains tokens: ${token0}, ${token1}. ` +
        `This indicates the route path is invalid or tokens don't form a connected path.`
      )
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
