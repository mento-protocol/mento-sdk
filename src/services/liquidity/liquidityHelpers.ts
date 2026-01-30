import { Address, PublicClient, encodeFunctionData } from 'viem'
import { PoolService } from '../pools'
import { CallParams, PoolType, LiquidityOptions } from '../../core/types'
import { ERC20_ABI } from '../../core/abis'
import { getContractAddress, ChainId } from '../../core/constants'
import { validateAddress } from '../../utils/validation'

export function buildApprovalParams(chainId: number, token: Address, amount: bigint): CallParams {
  const routerAddress = getContractAddress(chainId as ChainId, 'Router')
  const data = encodeFunctionData({
    abi: ERC20_ABI,
    functionName: 'approve',
    args: [routerAddress, amount],
  })
  return { to: token, data, value: '0' }
}

export async function getAllowance(
  publicClient: PublicClient,
  token: Address,
  owner: Address,
  chainId: number
): Promise<bigint> {
  const routerAddress = getContractAddress(chainId as ChainId, 'Router')
  return (await publicClient.readContract({
    address: token,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [owner, routerAddress],
  })) as bigint
}

export function calculateMinAmount(amount: bigint, slippageTolerance: number): bigint {
  if (slippageTolerance < 0) {
    throw new Error('Slippage tolerance cannot be negative')
  }
  if (slippageTolerance > 100) {
    throw new Error('Slippage tolerance cannot exceed 100%')
  }

  const basisPoints = BigInt(Math.floor(slippageTolerance * 100))
  const slippageMultiplier = 10000n - basisPoints
  return (amount * slippageMultiplier) / 10000n
}

export async function getPoolInfo(
  poolService: PoolService,
  poolAddress: string
): Promise<{
  token0: Address
  token1: Address
  factoryAddr: Address
}> {
  validateAddress(poolAddress, 'poolAddress')

  const pools = await poolService.getPools()
  const pool = pools.find((p) => p.poolAddr.toLowerCase() === poolAddress.toLowerCase())

  if (!pool) {
    throw new Error(`Pool not found: ${poolAddress}. Ensure the address is a valid FPMM pool.`)
  }

  if (pool.poolType !== PoolType.FPMM) {
    throw new Error(`Pool ${poolAddress} is type ${pool.poolType}. Only FPMM pools support liquidity provision.`)
  }

  return {
    token0: pool.token0 as Address,
    token1: pool.token1 as Address,
    factoryAddr: pool.factoryAddr as Address,
  }
}

export function validatePoolTokens(
  poolToken0: Address,
  poolToken1: Address,
  tokenA: string,
  tokenB: string
): void {
  const tokenALower = tokenA.toLowerCase()
  const tokenBLower = tokenB.toLowerCase()
  const token0Lower = poolToken0.toLowerCase()
  const token1Lower = poolToken1.toLowerCase()

  // Ensure both tokens belong to pool
  const aInPool = tokenALower === token0Lower || tokenALower === token1Lower
  const bInPool = tokenBLower === token0Lower || tokenBLower === token1Lower

  if (!aInPool || !bInPool) {
    throw new Error(
      `Tokens don't match pool. Pool has ${poolToken0} and ${poolToken1}, but received ${tokenA} and ${tokenB}`
    )
  }

  // Ensure tokens are different
  if (tokenALower === tokenBLower) {
    throw new Error('tokenA and tokenB must be different')
  }
}

export function getDeadline(options: LiquidityOptions): bigint {
  return options.deadline ?? BigInt(Math.floor(Date.now() / 1000) + 20 * 60)
}
