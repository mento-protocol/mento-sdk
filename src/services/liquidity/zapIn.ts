import { Address, PublicClient } from 'viem'
import { PoolService } from '../pools'
import { RouteService } from '../routes'
import {
  LiquidityOptions,
  ZapInQuote,
  ZapInDetails,
  ZapInTransaction,
  ZapParams,
} from '../../core/types'
import { ROUTER_ABI, ERC20_ABI } from '../../core/abis'
import { getContractAddress, ChainId } from '../../core/constants'
import { validateAddress } from '../../utils/validation'
import { ReadonlyRouterRoutes } from '../../utils/pathEncoder'
import { buildApprovalParams, getAllowance, calculateMinAmount, getPoolInfo } from './liquidityHelpers'
import {
  encodeZapInCall,
  findZapInRoutes,
  splitAmount,
  estimateLiquidityFromZapIn,
} from './zapHelpers'

// ========== ZAP IN OPERATIONS ==========

/**
 * Builds a complete zap in transaction including approval if needed
 */
export async function buildZapInTransactionInternal(
  publicClient: PublicClient,
  chainId: number,
  poolService: PoolService,
  routeService: RouteService,
  poolAddress: string,
  tokenIn: string,
  amountIn: bigint,
  amountInSplit: number,
  recipient: string,
  owner: string,
  options: LiquidityOptions
): Promise<ZapInTransaction> {
  validateAddress(owner, 'owner')

  // Build zap in params
  const zapIn = await buildZapInParamsInternal(
    publicClient,
    chainId,
    poolService,
    routeService,
    poolAddress,
    tokenIn,
    amountIn,
    amountInSplit,
    recipient,
    options
  )

  // Check allowance for input token
  const tokenInAddr = tokenIn as Address
  const ownerAddr = owner as Address
  const currentAllowance = await getAllowance(publicClient, tokenInAddr, ownerAddr, chainId)

  // Build approval if needed
  const approval = currentAllowance < amountIn
    ? { token: tokenIn, amount: amountIn, params: buildApprovalParams(chainId, tokenInAddr, amountIn) }
    : null

  return { approval, zapIn }
}

/**
 * Builds zap in transaction parameters without checking approval
 */
export async function buildZapInParamsInternal(
  publicClient: PublicClient,
  chainId: number,
  poolService: PoolService,
  routeService: RouteService,
  poolAddress: string,
  tokenIn: string,
  amountIn: bigint,
  amountInSplit: number,
  recipient: string,
  options: LiquidityOptions
): Promise<ZapInDetails> {
  validateAddress(poolAddress, 'poolAddress')
  validateAddress(tokenIn, 'tokenIn')
  validateAddress(recipient, 'recipient')

  // Get pool info
  const { token0, token1, factoryAddr } = await getPoolInfo(poolService, poolAddress)

  // Split input amount
  const { amountA: amountInA, amountB: amountInB } = splitAmount(amountIn, amountInSplit)

  // Find routes for swapping
  const { routesA, routesB } = await findZapInRoutes(routeService, tokenIn, token0, token1)

  // Generate zap parameters using Router helper
  const routerAddress = getContractAddress(chainId as ChainId, 'Router')
  const [amountOutMinA, amountOutMinB, amountAMin, amountBMin] = (await publicClient.readContract({
    address: routerAddress as Address,
    abi: ROUTER_ABI,
    functionName: 'generateZapInParams',
    args: [token0, token1, factoryAddr, amountInA, amountInB, routesA as ReadonlyRouterRoutes, routesB as ReadonlyRouterRoutes],
  })) as [bigint, bigint, bigint, bigint]

  // Apply slippage to all minimum amounts
  const finalAmountAMin = calculateMinAmount(amountAMin, options.slippageTolerance)
  const finalAmountBMin = calculateMinAmount(amountBMin, options.slippageTolerance)
  const finalAmountOutMinA = calculateMinAmount(amountOutMinA, options.slippageTolerance)
  const finalAmountOutMinB = calculateMinAmount(amountOutMinB, options.slippageTolerance)

  // Estimate expected liquidity
  const poolDetails = await poolService.getPoolDetails(poolAddress)
  const totalSupply = (await publicClient.readContract({
    address: poolAddress as Address,
    abi: ERC20_ABI,
    functionName: 'totalSupply',
    args: [],
  })) as bigint
  const expectedLiquidity = estimateLiquidityFromZapIn(
    finalAmountOutMinA,
    finalAmountOutMinB,
    poolDetails.reserve0,
    poolDetails.reserve1,
    totalSupply
  )

  const zapParams: ZapParams = {
    tokenA: token0,
    tokenB: token1,
    factory: factoryAddr,
    amountAMin: finalAmountAMin,
    amountBMin: finalAmountBMin,
    amountOutMinA: finalAmountOutMinA,
    amountOutMinB: finalAmountOutMinB,
  }

  const data = encodeZapInCall(tokenIn as Address, amountInA, amountInB, zapParams, routesA, routesB, recipient as Address)

  return {
    params: {
      to: routerAddress,
      data,
      value: '0',
    },
    poolAddress,
    tokenIn,
    amountIn,
    amountInA,
    amountInB,
    routesA,
    routesB,
    zapParams,
    estimatedMinLiquidity: expectedLiquidity,
  }
}

/**
 * Quotes a zap in operation (read-only)
 */
export async function quoteZapInInternal(
  publicClient: PublicClient,
  chainId: number,
  poolService: PoolService,
  routeService: RouteService,
  poolAddress: string,
  tokenIn: string,
  amountIn: bigint,
  amountInSplit: number,
  options: LiquidityOptions
): Promise<ZapInQuote> {
  validateAddress(poolAddress, 'poolAddress')
  validateAddress(tokenIn, 'tokenIn')

  const { token0, token1, factoryAddr } = await getPoolInfo(poolService, poolAddress)
  const { amountA: amountInA, amountB: amountInB } = splitAmount(amountIn, amountInSplit)
  const { routesA, routesB } = await findZapInRoutes(routeService, tokenIn, token0, token1)

  const routerAddress = getContractAddress(chainId as ChainId, 'Router')
  const [amountOutMinA, amountOutMinB, amountAMin, amountBMin] = (await publicClient.readContract({
    address: routerAddress as Address,
    abi: ROUTER_ABI,
    functionName: 'generateZapInParams',
    args: [token0, token1, factoryAddr, amountInA, amountInB, routesA as ReadonlyRouterRoutes, routesB as ReadonlyRouterRoutes],
  })) as [bigint, bigint, bigint, bigint]

  const poolDetails = await poolService.getPoolDetails(poolAddress)
  const totalSupply = (await publicClient.readContract({
    address: poolAddress as Address,
    abi: ERC20_ABI,
    functionName: 'totalSupply',
    args: [],
  })) as bigint

  const finalAmountOutMinA = calculateMinAmount(amountOutMinA, options.slippageTolerance)
  const finalAmountOutMinB = calculateMinAmount(amountOutMinB, options.slippageTolerance)

  const expectedLiquidity = estimateLiquidityFromZapIn(
    finalAmountOutMinA,
    finalAmountOutMinB,
    poolDetails.reserve0,
    poolDetails.reserve1,
    totalSupply
  )

  return {
    amountOutMinA: finalAmountOutMinA,
    amountOutMinB: finalAmountOutMinB,
    amountAMin: calculateMinAmount(amountAMin, options.slippageTolerance),
    amountBMin: calculateMinAmount(amountBMin, options.slippageTolerance),
    estimatedMinLiquidity: expectedLiquidity,
  }
}
