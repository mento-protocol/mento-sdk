import { PoolType, Pool } from '../core/types'
import { FPMM_ABI } from '../core/abis'
import type { PublicClient } from 'viem'
import { VIRTUAL_POOL_ABI } from '../core/abis/virtualPool'

/**
 * Calculate cost percentage for a pool based on its type
 * Returns cost as a percentage (e.g., 0.5 = 0.5%)
 *
 * @param pool - The pool to calculate cost for
 * @param publicClient - Viem public client for RPC calls
 * @returns Cost percentage for the pool
 */
export async function getPoolCostPercent(pool: Pool, publicClient: PublicClient): Promise<number> {
  if (pool.poolType === PoolType.FPMM) {
    return getFPMMCostPercent(pool.poolAddr, publicClient)
  } else if (pool.poolType === PoolType.Virtual) {
    return getVirtualPoolCostPercent(pool.poolAddr, publicClient)
  } else {
    throw new Error('Invalid pool type')
  }
}

/**
 * Calculate cost for FPMM pools
 * FPMM pools use lpFee + protocolFee in basis points (10000 = 100%)
 */
async function getFPMMCostPercent(poolAddress: string, publicClient: PublicClient): Promise<number> {
  const [lpFee, protocolFee] = await Promise.all([
    publicClient.readContract({
      address: poolAddress as `0x${string}`,
      abi: FPMM_ABI,
      functionName: 'lpFee',
    }) as Promise<bigint>,
    publicClient.readContract({
      address: poolAddress as `0x${string}`,
      abi: FPMM_ABI,
      functionName: 'protocolFee',
    }) as Promise<bigint>,
  ])

  // Convert from basis points to percentage, rounded to 2dp
  const totalBasisPoints = Number(lpFee) + Number(protocolFee)
  return Math.round((totalBasisPoints / 100) * 100) / 100
}

/**
 * Calculate cost for Virtual pools
 */
async function getVirtualPoolCostPercent(poolAddress: string, publicClient: PublicClient): Promise<number> {
  const protocolFee = await publicClient.readContract({
    address: poolAddress as `0x${string}`,
    abi: VIRTUAL_POOL_ABI,
    functionName: 'protocolFee',
  })

  // Convert from basis points to percentage, rounded to 2dp
  return Math.round((Number(protocolFee) / 100) * 100) / 100
}
