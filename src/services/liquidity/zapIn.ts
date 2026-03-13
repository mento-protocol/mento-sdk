import { Address, PublicClient } from 'viem'
import { PoolService } from '../pools'
import { RouteService } from '../routes'
import {
  LiquidityOptions,
  PreparedZapIn,
  ZapInQuote,
  ZapInDetails,
  ZapInTransaction,
  ZapParams,
} from '../../core/types'
import { ROUTER_ABI } from '../../core/abis'
import { getContractAddress, ChainId } from '../../core/constants'
import { validateAddress } from '../../utils/validation'
import { ReadonlyRouterRoutes } from '../../utils/pathEncoder'
import { buildApprovalParams, getAllowance, calculateMinAmount, getPoolInfo, getPoolSnapshot } from './liquidityHelpers'
import {
  encodeZapInCall,
  findZapInRoutes,
  splitAmount,
  estimateLiquidityFromZapIn,
} from './zapHelpers'

interface ZapInPreparedContext {
  routesA: ZapInDetails['routesA']
  routesB: ZapInDetails['routesB']
  quote: ZapInQuote
  details: ZapInDetails
}

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
  const prepared = await prepareZapInInternal(
    publicClient,
    chainId,
    poolService,
    routeService,
    poolAddress,
    tokenIn,
    amountIn,
    amountInSplit,
    recipient,
    owner,
    options
  )

  return {
    approval: prepared.approval ?? null,
    zapIn: prepared.details,
  }
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
  const prepared = await prepareZapInInternal(
    publicClient,
    chainId,
    poolService,
    routeService,
    poolAddress,
    tokenIn,
    amountIn,
    amountInSplit,
    recipient,
    undefined,
    options
  )

  return prepared.details
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
  const prepared = await prepareZapInInternal(
    publicClient,
    chainId,
    poolService,
    routeService,
    poolAddress,
    tokenIn,
    amountIn,
    amountInSplit,
    tokenIn,
    undefined,
    options
  )

  return prepared.quote
}

export async function prepareZapInInternal(
  publicClient: PublicClient,
  chainId: number,
  poolService: PoolService,
  routeService: RouteService,
  poolAddress: string,
  tokenIn: string,
  amountIn: bigint,
  amountInSplit: number,
  recipient: string,
  owner: string | undefined,
  options: LiquidityOptions
): Promise<PreparedZapIn> {
  if (owner) {
    validateAddress(owner, 'owner')
  }

  const [context, currentAllowance] = await Promise.all([
    prepareZapInContextInternal(
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
    ),
    owner ? getAllowance(publicClient, tokenIn as Address, owner as Address, chainId) : Promise.resolve<bigint | null>(null),
  ])

  const approval = owner && currentAllowance !== null && currentAllowance < amountIn
    ? { token: tokenIn, amount: amountIn, params: buildApprovalParams(chainId, tokenIn as Address, amountIn) }
    : owner
      ? null
      : undefined

  return {
    routesA: context.routesA,
    routesB: context.routesB,
    quote: context.quote,
    approval,
    details: context.details,
  }
}

async function prepareZapInContextInternal(
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
): Promise<ZapInPreparedContext> {
  validateAddress(poolAddress, 'poolAddress')
  validateAddress(tokenIn, 'tokenIn')
  validateAddress(recipient, 'recipient')

  const { token0, token1, factoryAddr } = await getPoolInfo(poolService, poolAddress)
  const { amountA: amountInA, amountB: amountInB } = splitAmount(amountIn, amountInSplit)
  const [{ routesA, routesB }, poolSnapshot] = await Promise.all([
    findZapInRoutes(routeService, tokenIn, token0, token1),
    getPoolSnapshot(publicClient, poolAddress as Address),
  ])

  const routerAddress = getContractAddress(chainId as ChainId, 'Router')
  const [amountOutMinA, amountOutMinB, amountAMin, amountBMin] = (await publicClient.readContract({
    address: routerAddress as Address,
    abi: ROUTER_ABI,
    functionName: 'generateZapInParams',
    args: [token0, token1, factoryAddr, amountInA, amountInB, routesA as ReadonlyRouterRoutes, routesB as ReadonlyRouterRoutes],
  })) as [bigint, bigint, bigint, bigint]

  const finalAmountAMin = calculateMinAmount(amountAMin, options.slippageTolerance)
  const finalAmountBMin = calculateMinAmount(amountBMin, options.slippageTolerance)
  const finalAmountOutMinA = calculateMinAmount(amountOutMinA, options.slippageTolerance)
  const finalAmountOutMinB = calculateMinAmount(amountOutMinB, options.slippageTolerance)

  const expectedLiquidity = estimateLiquidityFromZapIn(
    finalAmountOutMinA,
    finalAmountOutMinB,
    poolSnapshot.reserve0,
    poolSnapshot.reserve1,
    poolSnapshot.totalSupply
  )

  const quote: ZapInQuote = {
    amountOutFromA: finalAmountOutMinA,
    amountOutFromB: finalAmountOutMinB,
    amountAMin: finalAmountAMin,
    amountBMin: finalAmountBMin,
    estimatedMinLiquidity: expectedLiquidity,
  }

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
    routesA,
    routesB,
    quote,
    details: {
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
    },
  }
}
