import { Address, Hex, PublicClient } from 'viem'
import { PoolService } from '../pools'
import { RouteService } from '../routes'
import {
  LiquidityOptions,
  PreparedZapOut,
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

const INSUFFICIENT_LIQUIDITY_SELECTOR = '0xbb55fd27'
const MAX_ROUTE_CANDIDATES_PER_LEG = 8
const MAX_ROUTE_COMBINATIONS = 48
const ROUTE_SIMULATION_BATCH_SIZE = 6

interface ZapOutPreparedContext {
  routesA: RouterRoute[]
  routesB: RouterRoute[]
  quote: ZapOutQuote
  details: ZapOutDetails
}

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
  const prepared = await prepareZapOutInternal(
    publicClient,
    chainId,
    poolService,
    routeService,
    poolAddress,
    tokenOut,
    liquidity,
    recipient,
    owner,
    options
  )

  return {
    approval: prepared.approval ?? null,
    zapOut: prepared.details,
  }
}

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
  const prepared = await prepareZapOutInternal(
    publicClient,
    chainId,
    poolService,
    routeService,
    poolAddress,
    tokenOut,
    liquidity,
    recipient,
    undefined,
    options
  )

  return prepared.details
}

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
  const prepared = await prepareZapOutInternal(
    publicClient,
    chainId,
    poolService,
    routeService,
    poolAddress,
    tokenOut,
    liquidity,
    tokenOut,
    undefined,
    options
  )

  return prepared.quote
}

export async function prepareZapOutInternal(
  publicClient: PublicClient,
  chainId: number,
  poolService: PoolService,
  routeService: RouteService,
  poolAddress: string,
  tokenOut: string,
  liquidity: bigint,
  recipient: string,
  owner: string | undefined,
  options: LiquidityOptions
): Promise<PreparedZapOut> {
  if (owner) {
    validateAddress(owner, 'owner')
  }

  const [context, currentAllowance] = await Promise.all([
    prepareZapOutContextInternal(
      publicClient,
      chainId,
      poolService,
      routeService,
      poolAddress,
      tokenOut,
      liquidity,
      recipient,
      options
    ),
    owner ? getAllowance(publicClient, poolAddress as Address, owner as Address, chainId) : Promise.resolve<bigint | null>(null),
  ])

  let details = context.details
  const approval = owner && currentAllowance !== null && currentAllowance < liquidity
    ? { token: poolAddress, amount: liquidity, params: buildApprovalParams(chainId, poolAddress as Address, liquidity) }
    : owner
      ? null
      : undefined

  if (owner && currentAllowance !== null && currentAllowance >= liquidity) {
    const ownerAddr = owner as Address
    const routerAddress = getContractAddress(chainId as ChainId, 'Router') as Address

    try {
      await simulateZapOut(publicClient, ownerAddr, routerAddress, details.params.data as Hex)
    } catch (error) {
      if (!isInsufficientLiquidityError(error)) {
        throw error
      }

      details = await findViableZapOutDetails(
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

  return {
    routesA: details.routesA,
    routesB: details.routesB,
    quote: {
      amountOutFromA: details.zapParams.amountOutMinA,
      amountOutFromB: details.zapParams.amountOutMinB,
      amountAMin: details.zapParams.amountAMin,
      amountBMin: details.zapParams.amountBMin,
      estimatedMinTokenOut: details.estimatedMinTokenOut,
    },
    approval,
    details,
  }
}

async function prepareZapOutContextInternal(
  publicClient: PublicClient,
  chainId: number,
  poolService: PoolService,
  routeService: RouteService,
  poolAddress: string,
  tokenOut: string,
  liquidity: bigint,
  recipient: string,
  options: LiquidityOptions
): Promise<ZapOutPreparedContext> {
  validateAddress(poolAddress, 'poolAddress')
  validateAddress(tokenOut, 'tokenOut')
  validateAddress(recipient, 'recipient')

  const { token0, token1, factoryAddr } = await getPoolInfo(poolService, poolAddress)
  const { routesA, routesB } = await findZapOutRoutes(routeService, token0, token1, tokenOut)
  const details = await buildZapOutDetailsForRoutes(
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

  return {
    routesA,
    routesB,
    quote: {
      amountOutFromA: details.zapParams.amountOutMinA,
      amountOutFromB: details.zapParams.amountOutMinB,
      amountAMin: details.zapParams.amountAMin,
      amountBMin: details.zapParams.amountBMin,
      estimatedMinTokenOut: details.estimatedMinTokenOut,
    },
    details,
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
  const allRoutes = await routeService.getRoutes({ cached: false, returnAllRoutes: true })
  const [routesAOptions, routesBOptions] = await Promise.all([
    getEncodedRouteCandidates(routeService, token0, tokenOut, poolAddress, allRoutes),
    getEncodedRouteCandidates(routeService, token1, tokenOut, poolAddress, allRoutes),
  ])

  const routeCombinations: Array<{ routesA: RouterRoute[]; routesB: RouterRoute[] }> = []
  outer: for (const routesA of routesAOptions) {
    for (const routesB of routesBOptions) {
      routeCombinations.push({ routesA, routesB })
      if (routeCombinations.length >= MAX_ROUTE_COMBINATIONS) {
        break outer
      }
    }
  }

  let best: ZapOutDetails | null = null

  for (let index = 0; index < routeCombinations.length; index += ROUTE_SIMULATION_BATCH_SIZE) {
    const batch = routeCombinations.slice(index, index + ROUTE_SIMULATION_BATCH_SIZE)
    const candidates = await Promise.all(
      batch.map(async ({ routesA, routesB }) => {
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
          return candidate
        } catch {
          return null
        }
      })
    )

    for (const candidate of candidates) {
      if (candidate && (!best || candidate.estimatedMinTokenOut > best.estimatedMinTokenOut)) {
        best = candidate
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
  sourcePoolAddress: string,
  allRoutes?: readonly (Route | RouteWithCost)[]
): Promise<RouterRoute[][]> {
  if (tokenIn.toLowerCase() === tokenOut.toLowerCase()) {
    return [[]]
  }

  const rawCandidates: Array<Route | RouteWithCost> = []

  try {
    rawCandidates.push(await routeService.findRoute(tokenIn, tokenOut))
  } catch {
    // Continue; we'll try the broader route set next.
  }

  const pairCandidates = (allRoutes ?? await routeService.getRoutes({ cached: false, returnAllRoutes: true })).filter((route) => {
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

  rawCandidates.sort((routeA, routeB) => {
    const routeAUsesSourcePool = routeUsesPool(routeA, sourcePoolAddress) ? 1 : 0
    const routeBUsesSourcePool = routeUsesPool(routeB, sourcePoolAddress) ? 1 : 0
    if (routeAUsesSourcePool !== routeBUsesSourcePool) return routeAUsesSourcePool - routeBUsesSourcePool

    if (routeA.path.length !== routeB.path.length) return routeA.path.length - routeB.path.length
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
