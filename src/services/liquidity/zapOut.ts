import { Address, Hex, PublicClient } from 'viem'
import { PoolService } from '../pools'
import { RouteService } from '../routes'
import {
  LiquidityOptions,
  Route,
  RouteWithCost,
  ZapOutQuote,
  ZapOutDetails,
  ZapOutTransaction,
  ZapParams,
} from '../../core/types'
import { ROUTER_ABI } from '../../core/abis'
import { getContractAddress, ChainId } from '../../core/constants'
import { RouteNotFoundError, ZapOutRouteNotViableError } from '../../core/errors'
import { validateAddress } from '../../utils/validation'
import { encodeRoutePath, ReadonlyRouterRoutes, RouterRoute } from '../../utils/pathEncoder'
import { buildApprovalParams, getAllowance, calculateMinAmount, getPoolInfo } from './liquidityHelpers'
import { encodeZapOutCall, findZapOutRoutes } from './zapHelpers'

// ========== ZAP OUT OPERATIONS ==========

const INSUFFICIENT_LIQUIDITY_SELECTOR = '0xbb55fd27'
const MAX_ROUTE_CANDIDATES_PER_LEG = 8
const MAX_ROUTE_COMBINATIONS = 48

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
  let zapOut = await buildZapOutParamsInternal(
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

  // We can only preflight/simulate a real zap call when approval is already sufficient.
  // Before approval, transferFrom in zapOut() would fail and make simulation meaningless.
  if (currentAllowance >= liquidity) {
    const routerAddress = getContractAddress(chainId as ChainId, 'Router') as Address
    try {
      await simulateZapOut(publicClient, ownerAddr, routerAddress, zapOut.params.data as Hex)
    } catch (error) {
      // Only attempt route fallback for the known liquidity failure.
      if (!isInsufficientLiquidityError(error)) {
        throw error
      }

      zapOut = await findViableZapOutDetails(
        publicClient,
        chainId,
        poolService,
        routeService,
        poolAddress,
        tokenOut,
        liquidity,
        ownerAddr,
        options
      )
    }
  }

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

  return buildZapOutDetailsForRoutes(
    publicClient,
    chainId,
    poolAddress,
    tokenOut,
    liquidity,
    token0,
    token1,
    factoryAddr,
    routesA,
    routesB,
    options
  )
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

async function buildZapOutDetailsForRoutes(
  publicClient: PublicClient,
  chainId: number,
  poolAddress: string,
  tokenOut: string,
  liquidity: bigint,
  token0: Address,
  token1: Address,
  factoryAddr: Address,
  routesA: RouterRoute[],
  routesB: RouterRoute[],
  options: LiquidityOptions
): Promise<ZapOutDetails> {
  const routerAddress = getContractAddress(chainId as ChainId, 'Router')
  const [amountOutMinA, amountOutMinB, amountAMin, amountBMin] = (await publicClient.readContract({
    address: routerAddress as Address,
    abi: ROUTER_ABI,
    functionName: 'generateZapOutParams',
    args: [token0, token1, factoryAddr, liquidity, routesA as ReadonlyRouterRoutes, routesB as ReadonlyRouterRoutes],
  })) as [bigint, bigint, bigint, bigint]

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

async function findViableZapOutDetails(
  publicClient: PublicClient,
  chainId: number,
  poolService: PoolService,
  routeService: RouteService,
  poolAddress: string,
  tokenOut: string,
  liquidity: bigint,
  owner: Address,
  options: LiquidityOptions
): Promise<ZapOutDetails> {
  const { token0, token1, factoryAddr } = await getPoolInfo(poolService, poolAddress)
  const routerAddress = getContractAddress(chainId as ChainId, 'Router') as Address

  const routesAOptions = await getEncodedRouteCandidates(routeService, token0, tokenOut, poolAddress)
  const routesBOptions = await getEncodedRouteCandidates(routeService, token1, tokenOut, poolAddress)

  let best: ZapOutDetails | null = null
  let combinationsTried = 0

  outer: for (const routesA of routesAOptions) {
    for (const routesB of routesBOptions) {
      if (combinationsTried >= MAX_ROUTE_COMBINATIONS) {
        break outer
      }
      combinationsTried += 1

      try {
        const candidate = await buildZapOutDetailsForRoutes(
          publicClient,
          chainId,
          poolAddress,
          tokenOut,
          liquidity,
          token0,
          token1,
          factoryAddr,
          routesA,
          routesB,
          options
        )

        await simulateZapOut(publicClient, owner, routerAddress, candidate.params.data as Hex)

        if (!best || candidate.estimatedMinTokenOut > best.estimatedMinTokenOut) {
          best = candidate
        }
      } catch {
        // Ignore non-viable route combination and continue searching.
      }
    }
  }

  if (!best) {
    throw new ZapOutRouteNotViableError(poolAddress, tokenOut)
  }

  return best
}

async function getEncodedRouteCandidates(
  routeService: RouteService,
  tokenIn: string,
  tokenOut: string,
  sourcePoolAddress: string
): Promise<RouterRoute[][]> {
  if (tokenIn.toLowerCase() === tokenOut.toLowerCase()) {
    return [[]]
  }

  const rawCandidates: Array<Route | RouteWithCost> = []

  // Include the SDK default first for consistency.
  try {
    rawCandidates.push(await routeService.findRoute(tokenIn, tokenOut))
  } catch {
    // Continue; we'll try full route enumeration next.
  }

  // Build a broader candidate set for fallback route selection.
  const allRoutes = await routeService.getRoutes({ cached: false, returnAllRoutes: true })
  const pairCandidates = allRoutes.filter((route) => {
    const a0 = route.tokens[0].address.toLowerCase()
    const a1 = route.tokens[1].address.toLowerCase()
    const t0 = tokenIn.toLowerCase()
    const t1 = tokenOut.toLowerCase()
    return (a0 === t0 && a1 === t1) || (a0 === t1 && a1 === t0)
  })
  rawCandidates.push(...(pairCandidates as Array<Route | RouteWithCost>))

  if (rawCandidates.length === 0) {
    throw new RouteNotFoundError(tokenIn, tokenOut)
  }

  // Prioritize routes that avoid swapping through the same pool being zapped out.
  rawCandidates.sort((a, b) => {
    const aUsesSourcePool = routeUsesPool(a, sourcePoolAddress) ? 1 : 0
    const bUsesSourcePool = routeUsesPool(b, sourcePoolAddress) ? 1 : 0
    if (aUsesSourcePool !== bUsesSourcePool) return aUsesSourcePool - bUsesSourcePool

    if (a.path.length !== b.path.length) return a.path.length - b.path.length
    return 0
  })

  const encodedRoutes: RouterRoute[][] = []
  const seen = new Set<string>()
  for (const route of rawCandidates) {
    try {
      const encoded = encodeRoutePath(route.path, tokenIn as Address, tokenOut as Address)
      const key = JSON.stringify(encoded)
      if (seen.has(key)) continue
      seen.add(key)
      encodedRoutes.push(encoded)
      if (encodedRoutes.length >= MAX_ROUTE_CANDIDATES_PER_LEG) {
        break
      }
    } catch {
      // Invalid path encoding for this direction; skip.
    }
  }

  if (encodedRoutes.length === 0) {
    throw new RouteNotFoundError(tokenIn, tokenOut)
  }

  return encodedRoutes
}

function routeUsesPool(route: Route | RouteWithCost, poolAddress: string): boolean {
  const normalizedPool = poolAddress.toLowerCase()
  return route.path.some((hop) => hop.poolAddr.toLowerCase() === normalizedPool)
}

async function simulateZapOut(
  publicClient: PublicClient,
  owner: Address,
  routerAddress: Address,
  data: Hex
): Promise<void> {
  await publicClient.call({
    account: owner,
    to: routerAddress,
    data,
  })
}

function isInsufficientLiquidityError(error: unknown): boolean {
  const message = extractErrorMessage(error).toLowerCase()
  return (
    message.includes(INSUFFICIENT_LIQUIDITY_SELECTOR) ||
    message.includes('insufficientliquidity')
  )
}

function extractErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return String(error)
  }

  const typed = error as Error & {
    shortMessage?: string
    details?: string
    cause?: unknown
  }

  const parts = [
    typed.message,
    typed.shortMessage,
    typed.details,
    typed.cause instanceof Error ? typed.cause.message : undefined,
  ].filter((part): part is string => Boolean(part))

  return parts.join(' | ')
}
