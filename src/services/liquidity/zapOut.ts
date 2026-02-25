import { Address, PublicClient } from 'viem'
import { PoolService } from '../pools'
import { RouteService } from '../routes'
import {
  LiquidityOptions,
  ZapOutQuote,
  ZapOutDetails,
  ZapOutTransaction,
  ZapParams,
} from '../../core/types'
import { ROUTER_ABI } from '../../core/abis'
import { getContractAddress, ChainId } from '../../core/constants'
import { validateAddress } from '../../utils/validation'
import { ReadonlyRouterRoutes } from '../../utils/pathEncoder'
import { buildApprovalParams, getAllowance, calculateMinAmount, getPoolInfo } from './liquidityHelpers'
import { encodeZapOutCall, findZapOutRoutes } from './zapHelpers'

// ========== ZAP OUT OPERATIONS ==========

/**
 * Builds a complete zap out transaction including approval if needed
 */
export async function buildZapOutTransactionInternal(
  publicClient: PublicClient,
  chainId: number,
  poolService: PoolService,
  routeService: RouteService,
  poolAddress: string,
  tokenOut: string,
  liquidity: bigint,
  recipient: string,
  owner: string,
  options: LiquidityOptions
): Promise<ZapOutTransaction> {
  validateAddress(owner, 'owner')

  // Build zap out params
  const zapOut = await buildZapOutParamsInternal(
    publicClient,
    chainId,
    poolService,
    routeService,
    poolAddress,
    tokenOut,
    liquidity,
    recipient,
    options
  )

  // Check LP token allowance
  const poolAddr = poolAddress as Address
  const ownerAddr = owner as Address
  const currentAllowance = await getAllowance(publicClient, poolAddr, ownerAddr, chainId)

  // Build approval if needed
  const approval = currentAllowance < liquidity
    ? { token: poolAddress, amount: liquidity, params: buildApprovalParams(chainId, poolAddr, liquidity) }
    : null

  return { approval, zapOut }
}

/**
 * Builds zap out transaction parameters without checking approval
 */
export async function buildZapOutParamsInternal(
  publicClient: PublicClient,
  chainId: number,
  poolService: PoolService,
  routeService: RouteService,
  poolAddress: string,
  tokenOut: string,
  liquidity: bigint,
  recipient: string,
  options: LiquidityOptions
): Promise<ZapOutDetails> {
  validateAddress(poolAddress, 'poolAddress')
  validateAddress(tokenOut, 'tokenOut')
  validateAddress(recipient, 'recipient')

  // Get pool info
  const { token0, token1, factoryAddr } = await getPoolInfo(poolService, poolAddress)

  // Find routes for swapping (from pool tokens to tokenOut)
  const { routesA, routesB } = await findZapOutRoutes(routeService, token0, token1, tokenOut)

  // Generate zap parameters using Router helper
  const routerAddress = getContractAddress(chainId as ChainId, 'Router')
  const [amountOutMinA, amountOutMinB, amountAMin, amountBMin] = (await publicClient.readContract({
    address: routerAddress as Address,
    abi: ROUTER_ABI,
    functionName: 'generateZapOutParams',
    args: [token0, token1, factoryAddr, liquidity, routesA as ReadonlyRouterRoutes, routesB as ReadonlyRouterRoutes],
  })) as [bigint, bigint, bigint, bigint]

  // Apply slippage to all minimum amounts
  const finalAmountAMin = calculateMinAmount(amountAMin, options.slippageTolerance)
  const finalAmountBMin = calculateMinAmount(amountBMin, options.slippageTolerance)
  const finalAmountOutMinA = calculateMinAmount(amountOutMinA, options.slippageTolerance)
  const finalAmountOutMinB = calculateMinAmount(amountOutMinB, options.slippageTolerance)

  const zapParams: ZapParams = {
    tokenA: token0,
    tokenB: token1,
    factory: factoryAddr,
    amountAMin: finalAmountAMin,
    amountBMin: finalAmountBMin,
    amountOutMinA: finalAmountOutMinA,
    amountOutMinB: finalAmountOutMinB,
  }

  const data = encodeZapOutCall(tokenOut as Address, liquidity, zapParams, routesA, routesB)

  return {
    params: {
      to: routerAddress,
      data,
      value: '0',
    },
    poolAddress,
    tokenOut,
    liquidity,
    routesA,
    routesB,
    zapParams,
    estimatedMinTokenOut: finalAmountOutMinA + finalAmountOutMinB,
  }
}

/**
 * Quotes a zap out operation (read-only)
 */
export async function quoteZapOutInternal(
  publicClient: PublicClient,
  chainId: number,
  poolService: PoolService,
  routeService: RouteService,
  poolAddress: string,
  tokenOut: string,
  liquidity: bigint,
  options: LiquidityOptions
): Promise<ZapOutQuote> {
  validateAddress(poolAddress, 'poolAddress')
  validateAddress(tokenOut, 'tokenOut')

  const { token0, token1, factoryAddr } = await getPoolInfo(poolService, poolAddress)

  // Find routes for swapping (from pool tokens to tokenOut)
  const { routesA, routesB } = await findZapOutRoutes(routeService, token0, token1, tokenOut)

  const routerAddress = getContractAddress(chainId as ChainId, 'Router')
  const [amountOutMinA, amountOutMinB, amountAMin, amountBMin] = (await publicClient.readContract({
    address: routerAddress as Address,
    abi: ROUTER_ABI,
    functionName: 'generateZapOutParams',
    args: [token0, token1, factoryAddr, liquidity, routesA as ReadonlyRouterRoutes, routesB as ReadonlyRouterRoutes],
  })) as [bigint, bigint, bigint, bigint]

  const finalAmountOutFromA = calculateMinAmount(amountOutMinA, options.slippageTolerance)
  const finalAmountOutFromB = calculateMinAmount(amountOutMinB, options.slippageTolerance)

  return {
    amountOutFromA: finalAmountOutFromA,
    amountOutFromB: finalAmountOutFromB,
    amountAMin: calculateMinAmount(amountAMin, options.slippageTolerance),
    amountBMin: calculateMinAmount(amountBMin, options.slippageTolerance),
    estimatedMinTokenOut: finalAmountOutFromA + finalAmountOutFromB,
  }
}
