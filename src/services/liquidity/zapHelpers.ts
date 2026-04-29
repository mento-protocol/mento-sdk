import { Address, encodeFunctionData } from 'viem'
import { RouteService } from '../routes'
import { ZapParams } from '../../core/types'
import { ROUTER_ABI } from '../../core/abis'
import { encodeRoutePath, RouterRoute, ReadonlyRouterRoutes } from '../../utils/pathEncoder'

// ========== ENCODING FUNCTIONS ==========

/**
 * Encodes the zapIn function call for the Router contract
 */
export function encodeZapInCall(
  tokenIn: Address,
  amountInA: bigint,
  amountInB: bigint,
  zapParams: ZapParams,
  routesA: RouterRoute[],
  routesB: RouterRoute[],
  recipient: Address
): string {
  return encodeFunctionData({
    abi: ROUTER_ABI,
    functionName: 'zapIn',
    args: [tokenIn, amountInA, amountInB, zapParams as { factory: Address, tokenA: Address, tokenB: Address, amountAMin: bigint, amountBMin: bigint, amountOutMinA: bigint, amountOutMinB: bigint }, routesA as ReadonlyRouterRoutes, routesB as ReadonlyRouterRoutes, recipient],
  })
}

/**
 * Encodes the zapOut function call for the Router contract
 */
export function encodeZapOutCall(
  tokenOut: Address,
  liquidity: bigint,
  zapParams: ZapParams,
  routesA: RouterRoute[],
  routesB: RouterRoute[]
): string {
  return encodeFunctionData({
    abi: ROUTER_ABI,
    functionName: 'zapOut',
    args: [tokenOut, liquidity, zapParams as { factory: Address, tokenA: Address, tokenB: Address, amountAMin: bigint, amountBMin: bigint, amountOutMinA: bigint, amountOutMinB: bigint }, routesA as ReadonlyRouterRoutes, routesB as ReadonlyRouterRoutes],
  })
}

// ========== ROUTING FUNCTIONS ==========

/**
 * Finds routes for zap in operations (from tokenIn to both pool tokens)
 *
 * @param routeService - Route service for finding swap paths
 * @param tokenIn - Input token address
 * @param token0 - Pool's token0 address
 * @param token1 - Pool's token1 address
 * @returns Routes from tokenIn to token0 and token1
 */
export async function findZapInRoutes(
  routeService: RouteService,
  tokenIn: string,
  token0: string,
  token1: string
): Promise<{ routesA: RouterRoute[]; routesB: RouterRoute[] }> {
  const [routeA, routeB] = await Promise.all([
    tokenIn.toLowerCase() !== token0.toLowerCase()
      ? routeService.findRoute(tokenIn, token0)
      : Promise.resolve(null),
    tokenIn.toLowerCase() !== token1.toLowerCase()
      ? routeService.findRoute(tokenIn, token1)
      : Promise.resolve(null),
  ])

  const routesA = routeA ? encodeRoutePath(routeA.path, tokenIn as Address, token0 as Address) : []
  const routesB = routeB ? encodeRoutePath(routeB.path, tokenIn as Address, token1 as Address) : []

  return { routesA, routesB }
}

/**
 * Finds routes for zap out operations (from both pool tokens to tokenOut)
 *
 * @param routeService - Route service for finding swap paths
 * @param token0 - Pool's token0 address
 * @param token1 - Pool's token1 address
 * @param tokenOut - Output token address
 * @returns Routes from token0 and token1 to tokenOut
 */
export async function findZapOutRoutes(
  routeService: RouteService,
  token0: string,
  token1: string,
  tokenOut: string
): Promise<{ routesA: RouterRoute[]; routesB: RouterRoute[] }> {
  const [routeA, routeB] = await Promise.all([
    token0.toLowerCase() !== tokenOut.toLowerCase()
      ? routeService.findRoute(token0, tokenOut)
      : Promise.resolve(null),
    token1.toLowerCase() !== tokenOut.toLowerCase()
      ? routeService.findRoute(token1, tokenOut)
      : Promise.resolve(null),
  ])

  const routesA = routeA ? encodeRoutePath(routeA.path, token0 as Address, tokenOut as Address) : []
  const routesB = routeB ? encodeRoutePath(routeB.path, token1 as Address, tokenOut as Address) : []

  return { routesA, routesB }
}

// ========== CALCULATION FUNCTIONS ==========

/**
 * Splits an amount into two parts based on a ratio
 *
 * @param amountIn - Total input amount
 * @param splitRatio - Ratio for splitting (0-1, e.g., 0.5 for 50/50)
 * @returns Split amounts for each part
 */
export function splitAmount(amountIn: bigint, splitRatio: number): { amountA: bigint; amountB: bigint } {
  if (splitRatio < 0 || splitRatio > 1) {
    throw new Error('Split ratio must be between 0 and 1')
  }

  const amountA = (amountIn * BigInt(Math.floor(splitRatio * 10000))) / 10000n
  const amountB = amountIn - amountA

  return { amountA, amountB }
}

/**
 * Off-chain mirror of Router.sol's quoteAddLiquidity / _quoteZapLiquidity logic.
 *
 * Given desired amounts and pool reserves, returns the (amountA, amountB) the
 * router will actually deposit when adding liquidity. Used to predict the exact
 * `amountAMin` / `amountBMin` the contract will check against post-swap reserves.
 *
 * @param amountADesired - Desired amount of tokenA
 * @param amountBDesired - Desired amount of tokenB
 * @param reserveA - Reserve of tokenA at the moment liquidity is added
 * @param reserveB - Reserve of tokenB at the moment liquidity is added
 */
export function quoteAddLiquidityFromReserves(
  amountADesired: bigint,
  amountBDesired: bigint,
  reserveA: bigint,
  reserveB: bigint
): { amountA: bigint; amountB: bigint } {
  if (reserveA === 0n && reserveB === 0n) {
    return { amountA: amountADesired, amountB: amountBDesired }
  }
  if (reserveA === 0n || reserveB === 0n) {
    // Mirrors Router.sol's InsufficientLiquidity revert. Caller can fall back.
    return { amountA: 0n, amountB: 0n }
  }

  const amountBOptimal = (amountADesired * reserveB) / reserveA
  if (amountBOptimal <= amountBDesired) {
    return { amountA: amountADesired, amountB: amountBOptimal }
  }
  const amountAOptimal = (amountBDesired * reserveA) / reserveB
  return { amountA: amountAOptimal, amountB: amountBDesired }
}

/**
 * Computes the net delta a single-hop zap swap applies to a target pool's
 * reserves. Returns `{delta0, delta1}` to add to the pool's pre-swap reserves
 * to obtain the reserves the router will see when it runs `_quoteZapLiquidity`.
 *
 * Only single-hop routes whose factory matches the target pool's factory and
 * whose `(from, to)` are `(token0, token1)` (in either direction) are
 * considered. Multi-hop routes and routes through other pools have no effect
 * on the target pool's reserves and return `{0, 0}`.
 *
 * Note: Multi-hop routes that traverse the target pool as an intermediate hop
 * are intentionally not handled here — they are uncommon for single-sided zaps
 * and would require per-hop amounts from `getAmountsOut`.
 */
export function computeTargetPoolImpact(
  routes: RouterRoute[],
  amountIn: bigint,
  amountOut: bigint,
  token0: Address,
  token1: Address,
  factoryAddr: Address
): { delta0: bigint; delta1: bigint } {
  if (routes.length !== 1) {
    return { delta0: 0n, delta1: 0n }
  }
  const route = routes[0]
  if (route.factory.toLowerCase() !== factoryAddr.toLowerCase()) {
    return { delta0: 0n, delta1: 0n }
  }
  const fromLower = route.from.toLowerCase()
  const toLower = route.to.toLowerCase()
  const t0 = token0.toLowerCase()
  const t1 = token1.toLowerCase()

  if (fromLower === t0 && toLower === t1) {
    return { delta0: amountIn, delta1: -amountOut }
  }
  if (fromLower === t1 && toLower === t0) {
    return { delta0: -amountOut, delta1: amountIn }
  }
  return { delta0: 0n, delta1: 0n }
}

/**
 * Estimates minimum LP tokens from zap in amounts.
 *
 * This is a conservative lower-bound estimate. The inputs are slippage-adjusted
 * minimums, not expected amounts. Actual LP tokens minted on-chain may be higher
 * because the router uses balanceOf(address(this)) after swaps, which can exceed
 * the pre-calculated minimums.
 *
 * @param amountOutA - Minimum amount of token0 after swap (slippage-adjusted)
 * @param amountOutB - Minimum amount of token1 after swap (slippage-adjusted)
 * @param reserve0 - Current reserve of token0 in pool
 * @param reserve1 - Current reserve of token1 in pool
 * @param totalSupply - Total LP token supply
 * @returns Conservative estimate of minimum LP tokens to be minted
 */
export function estimateLiquidityFromZapIn(
  amountOutA: bigint,
  amountOutB: bigint,
  reserve0: bigint,
  reserve1: bigint,
  totalSupply: bigint
): bigint {
  if (totalSupply === 0n) {
    // First liquidity provision - use geometric mean with BigInt sqrt
    // to avoid precision loss from Number() conversion on 18-decimal values
    const product = amountOutA * amountOutB
    if (product === 0n) return 0n
    let x = product
    let y = (x + 1n) / 2n
    while (y < x) { x = y; y = (x + product / x) / 2n }
    return x
  }

  // Existing pool - calculate based on smaller ratio
  const liquidityA = (amountOutA * totalSupply) / reserve0
  const liquidityB = (amountOutB * totalSupply) / reserve1

  return liquidityA < liquidityB ? liquidityA : liquidityB
}
