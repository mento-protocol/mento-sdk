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
  let routesA: RouterRoute[] = []
  let routesB: RouterRoute[] = []

  // Find route from tokenIn to token0 (if different)
  if (tokenIn.toLowerCase() !== token0.toLowerCase()) {
    const routeA = await routeService.findRoute(tokenIn, token0)
    routesA = encodeRoutePath(routeA.path, tokenIn as Address, token0 as Address)
  }

  // Find route from tokenIn to token1 (if different)
  if (tokenIn.toLowerCase() !== token1.toLowerCase()) {
    const routeB = await routeService.findRoute(tokenIn, token1)
    routesB = encodeRoutePath(routeB.path, tokenIn as Address, token1 as Address)
  }

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
  let routesA: RouterRoute[] = []
  let routesB: RouterRoute[] = []

  // Find route from token0 to tokenOut (if different)
  if (token0.toLowerCase() !== tokenOut.toLowerCase()) {
    const routeA = await routeService.findRoute(token0, tokenOut)
    routesA = encodeRoutePath(routeA.path, token0 as Address, tokenOut as Address)
  }

  // Find route from token1 to tokenOut (if different)
  if (token1.toLowerCase() !== tokenOut.toLowerCase()) {
    const routeB = await routeService.findRoute(token1, tokenOut)
    routesB = encodeRoutePath(routeB.path, token1 as Address, tokenOut as Address)
  }

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
    // First liquidity provision - use geometric mean
    const product = Number(amountOutA) * Number(amountOutB)
    return BigInt(Math.floor(Math.sqrt(product)))
  }

  // Existing pool - calculate based on smaller ratio
  const liquidityA = (amountOutA * totalSupply) / reserve0
  const liquidityB = (amountOutB * totalSupply) / reserve1

  return liquidityA < liquidityB ? liquidityA : liquidityB
}
