import { PoolType, Pool } from '../core/types'
import { FPMM_ABI } from '../core/abis'
import type { PublicClient } from 'viem'
import { VIRTUAL_POOL_ABI } from '../core/abis/virtualPool'
import { multicall } from './multicall'

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
  const results = await multicall(publicClient, [
    { address: poolAddress as `0x${string}`, abi: FPMM_ABI, functionName: 'lpFee' as const },
    { address: poolAddress as `0x${string}`, abi: FPMM_ABI, functionName: 'protocolFee' as const },
  ])

  if (results[0].status === 'failure' || results[1].status === 'failure') {
    throw new Error(`Failed to read fees for pool ${poolAddress}`)
  }

  const lpFee = results[0].result as bigint
  const protocolFee = results[1].result as bigint

  // Convert from basis points to percentage using BigInt arithmetic to avoid precision loss
  const totalBasisPoints = lpFee + protocolFee
  const scaled = totalBasisPoints * 1000000n
  return Number(scaled / 100n) / 1e6
}

/**
 * Calculate cost for Virtual pools
 */
async function getVirtualPoolCostPercent(poolAddress: string, publicClient: PublicClient): Promise<number> {
  const results = await multicall(publicClient, [
    { address: poolAddress as `0x${string}`, abi: VIRTUAL_POOL_ABI, functionName: 'protocolFee' as const },
  ])

  if (results[0].status === 'failure') {
    throw new Error(`Failed to read protocolFee for pool ${poolAddress}`)
  }

  // Convert from basis points to percentage using BigInt arithmetic to avoid precision loss
  const scaled = (results[0].result as bigint) * 1000000n
  return Number(scaled / 100n) / 1e6
}
