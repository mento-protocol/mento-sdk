import { Address, PublicClient, encodeFunctionData } from 'viem'
import { PoolService } from '../pools'
import {
  LiquidityOptions,
  AddLiquidityQuote,
  RemoveLiquidityQuote,
  AddLiquidityDetails,
  RemoveLiquidityDetails,
  AddLiquidityTransaction,
  RemoveLiquidityTransaction,
  LPTokenBalance,
} from '../../core/types'
import { ROUTER_ABI, ERC20_ABI } from '../../core/abis'
import { getContractAddress, ChainId } from '../../core/constants'
import { validateAddress } from '../../utils/validation'
import { buildApprovalParams, getAllowance, calculateMinAmount, getPoolInfo, validatePoolTokens, getDeadline } from './liquidityHelpers'

function encodeAddLiquidityCall(
  tokenA: Address,
  tokenB: Address,
  amountADesired: bigint,
  amountBDesired: bigint,
  amountAMin: bigint,
  amountBMin: bigint,
  recipient: Address,
  deadline: bigint
): string {
  return encodeFunctionData({
    abi: ROUTER_ABI,
    functionName: 'addLiquidity',
    args: [tokenA, tokenB, amountADesired, amountBDesired, amountAMin, amountBMin, recipient, deadline],
  })
}

function encodeRemoveLiquidityCall(
  token0: Address,
  token1: Address,
  liquidity: bigint,
  amount0Min: bigint,
  amount1Min: bigint,
  recipient: Address,
  deadline: bigint
): string {
  return encodeFunctionData({
    abi: ROUTER_ABI,
    functionName: 'removeLiquidity',
    args: [token0, token1, liquidity, amount0Min, amount1Min, recipient, deadline],
  })
}

export async function buildAddLiquidityTransactionInternal(
  publicClient: PublicClient,
  chainId: number,
  poolService: PoolService,
  poolAddress: string,
  tokenA: string,
  amountA: bigint,
  tokenB: string,
  amountB: bigint,
  recipient: string,
  owner: string,
  options: LiquidityOptions
): Promise<AddLiquidityTransaction> {
  const addLiquidity = await buildAddLiquidityParamsInternal(
    publicClient,
    chainId,
    poolService,
    poolAddress,
    tokenA,
    amountA,
    tokenB,
    amountB,
    recipient,
    options
  )

  validateAddress(owner, 'owner')
  const ownerAddr = owner as Address
  const tokenAAddr = addLiquidity.tokenA as Address
  const tokenBAddr = addLiquidity.tokenB as Address

  const [allowanceA, allowanceB] = await Promise.all([
    getAllowance(publicClient, tokenAAddr, ownerAddr, chainId),
    getAllowance(publicClient, tokenBAddr, ownerAddr, chainId),
  ])

  const approvalA = allowanceA < amountA
    ? { token: addLiquidity.tokenA, amount: amountA, params: buildApprovalParams(chainId, tokenAAddr, amountA) }
    : null

  const approvalB = allowanceB < amountB
    ? { token: addLiquidity.tokenB, amount: amountB, params: buildApprovalParams(chainId, tokenBAddr, amountB) }
    : null

  return { approvalA, approvalB, addLiquidity }
}

export async function buildAddLiquidityParamsInternal(
  publicClient: PublicClient,
  chainId: number,
  poolService: PoolService,
  poolAddress: string,
  tokenA: string,
  amountA: bigint,
  tokenB: string,
  amountB: bigint,
  recipient: string,
  options: LiquidityOptions
): Promise<AddLiquidityDetails> {
  validateAddress(poolAddress, 'poolAddress')
  validateAddress(tokenA, 'tokenA')
  validateAddress(tokenB, 'tokenB')
  validateAddress(recipient, 'recipient')

  const { token0, token1, factoryAddr } = await getPoolInfo(poolService, poolAddress)
  validatePoolTokens(token0, token1, tokenA, tokenB)

  const quote = await quoteAddLiquidityInternal(publicClient, chainId, poolService, poolAddress, tokenA, amountA, tokenB, amountB)

  const amountAMin = calculateMinAmount(quote.amountA, options.slippageTolerance)
  const amountBMin = calculateMinAmount(quote.amountB, options.slippageTolerance)

  const deadline = getDeadline(options)

  const routerAddress = getContractAddress(chainId as ChainId, 'Router')
  const data = encodeAddLiquidityCall(tokenA as Address, tokenB as Address, amountA, amountB, amountAMin, amountBMin, recipient as Address, deadline)

  return {
    params: {
      to: routerAddress,
      data,
      value: '0',
    },
    poolAddress,
    token0,
    token1,
    tokenA,
    tokenB,
    amountADesired: amountA,
    amountBDesired: amountB,
    amountAMin,
    amountBMin,
    expectedLiquidity: quote.liquidity,
    deadline,
  }
}

export async function quoteAddLiquidityInternal(
  publicClient: PublicClient,
  chainId: number,
  poolService: PoolService,
  poolAddress: string,
  tokenA: string,
  amountA: bigint,
  tokenB: string,
  amountB: bigint
): Promise<AddLiquidityQuote> {
  validateAddress(poolAddress, 'poolAddress')
  validateAddress(tokenA, 'tokenA')
  validateAddress(tokenB, 'tokenB')

  const { token0, token1, factoryAddr } = await getPoolInfo(poolService, poolAddress)
  validatePoolTokens(token0, token1, tokenA, tokenB)

  const routerAddress = getContractAddress(chainId as ChainId, 'Router')

  const [resultAmountA, resultAmountB, liquidity] = (await publicClient.readContract({
    address: routerAddress as Address,
    abi: ROUTER_ABI,
    functionName: 'quoteAddLiquidity',
    args: [tokenA as Address, tokenB as Address, factoryAddr, amountA, amountB],
  })) as [bigint, bigint, bigint]

  return { amountA: resultAmountA, amountB: resultAmountB, liquidity }
}

export async function buildRemoveLiquidityTransactionInternal(
  publicClient: PublicClient,
  chainId: number,
  poolService: PoolService,
  poolAddress: string,
  liquidity: bigint,
  recipient: string,
  owner: string,
  options: LiquidityOptions
): Promise<RemoveLiquidityTransaction> {
  validateAddress(owner, 'owner')

  // Build remove liquidity params
  const removeLiquidity = await buildRemoveLiquidityParamsInternal(
    publicClient,
    chainId,
    poolService,
    poolAddress,
    liquidity,
    recipient,
    options
  )

  const poolAddr = poolAddress as Address // Pool address IS the LP token
  const ownerAddr = owner as Address
  const currentAllowance = await getAllowance(publicClient, poolAddr, ownerAddr, chainId)

  const approval = currentAllowance < liquidity
    ? { token: poolAddress, amount: liquidity, params: buildApprovalParams(chainId, poolAddr, liquidity) }
    : null

  return { approval, removeLiquidity }
}

export async function buildRemoveLiquidityParamsInternal(
  publicClient: PublicClient,
  chainId: number,
  poolService: PoolService,
  poolAddress: string,
  liquidity: bigint,
  recipient: string,
  options: LiquidityOptions
): Promise<RemoveLiquidityDetails> {
  validateAddress(poolAddress, 'poolAddress')
  validateAddress(recipient, 'recipient')

  const { token0, token1 } = await getPoolInfo(poolService, poolAddress)
  const quote = await quoteRemoveLiquidityInternal(publicClient, chainId, poolService, poolAddress, liquidity)

  const amount0Min = calculateMinAmount(quote.amount0, options.slippageTolerance)
  const amount1Min = calculateMinAmount(quote.amount1, options.slippageTolerance)

  const deadline = getDeadline(options)

  const routerAddress = getContractAddress(chainId as ChainId, 'Router')
  const data = encodeRemoveLiquidityCall(token0, token1, liquidity, amount0Min, amount1Min, recipient as Address, deadline)

  return {
    params: {
      to: routerAddress,
      data,
      value: '0',
    },
    poolAddress,
    token0,
    token1,
    liquidity,
    amount0Min,
    amount1Min,
    expectedAmount0: quote.amount0,
    expectedAmount1: quote.amount1,
    deadline,
  }
}

export async function quoteRemoveLiquidityInternal(
  publicClient: PublicClient,
  chainId: number,
  poolService: PoolService,
  poolAddress: string,
  liquidity: bigint
): Promise<RemoveLiquidityQuote> {
  validateAddress(poolAddress, 'poolAddress')

  const { token0, token1, factoryAddr } = await getPoolInfo(poolService, poolAddress)
  const routerAddress = getContractAddress(chainId as ChainId, 'Router')

  const [amount0, amount1] = (await publicClient.readContract({
    address: routerAddress as Address,
    abi: ROUTER_ABI,
    functionName: 'quoteRemoveLiquidity',
    args: [token0, token1, factoryAddr, liquidity],
  })) as [bigint, bigint]

  return { amount0, amount1 }
}

export async function getLPTokenBalanceInternal(
  publicClient: PublicClient,
  poolService: PoolService,
  poolAddress: string,
  owner: string
): Promise<LPTokenBalance> {
  validateAddress(poolAddress, 'poolAddress')
  validateAddress(owner, 'owner')

  const { token0, token1 } = await getPoolInfo(poolService, poolAddress)

  // Pool address IS the LP token address (FPMM pools are ERC20)
  const [balance, totalSupply] = await Promise.all([
    publicClient.readContract({
      address: poolAddress as Address,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [owner as Address],
    }) as Promise<bigint>,
    publicClient.readContract({
      address: poolAddress as Address,
      abi: ERC20_ABI,
      functionName: 'totalSupply',
      args: [],
    }) as Promise<bigint>,
  ])

  const sharePercent = totalSupply > 0n ? (Number(balance) / Number(totalSupply)) * 100 : 0

  return {
    poolAddress,
    balance,
    token0,
    token1,
    totalSupply,
    sharePercent,
  }
}
