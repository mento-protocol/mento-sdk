import { PoolType, Pool } from '../core/types'
import { FPMM_ABI, BIPOOL_MANAGER_ABI } from '../core/abis'
import type { PublicClient } from 'viem'

/**
 * Calculate cost percentage for a pool based on its type
 * Returns cost as a percentage (e.g., 0.5 = 0.5%)
 *
 * @param pool - The pool to calculate cost for
 * @param publicClient - Viem public client for RPC calls
 * @param exchangeId - Required for Virtual pools (BiPoolManager exchange ID)
 * @returns Cost percentage for the pool
 */
export async function getPoolCostPercent(
  pool: Pool,
  publicClient: PublicClient,
  exchangeId?: string
): Promise<number> {
  if (pool.poolType === PoolType.FPMM) {
    return getFPMMCostPercent(pool.poolAddr, publicClient)
  } else {
    if (!exchangeId) {
      throw new Error('exchangeId required for Virtual pools')
    }
    return getVirtualPoolCostPercent(exchangeId, pool.factoryAddr, publicClient)
  }
}

/**
 * Calculate cost for FPMM pools
 * FPMM pools use lpFee + protocolFee in basis points (10000 = 100%)
 */
async function getFPMMCostPercent(
  poolAddress: string,
  publicClient: PublicClient
): Promise<number> {
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

  // Convert from basis points to percentage
  const totalBasisPoints = Number(lpFee) + Number(protocolFee)
  return totalBasisPoints / 100
}

/**
 * Calculate cost for Virtual pools
 * Virtual pools use spread from BiPoolManager in FixidityLib format (1e24 = 100%)
 */
async function getVirtualPoolCostPercent(
  exchangeId: string,
  biPoolManagerAddr: string,
  publicClient: PublicClient
): Promise<number> {
  const poolExchange = await publicClient.readContract({
    address: biPoolManagerAddr as `0x${string}`,
    abi: BIPOOL_MANAGER_ABI,
    functionName: 'getPoolExchange',
    args: [exchangeId],
  })

  // Convert from FixidityLib to percentage (1e24 = 100%)
  const spreadValue = (
    poolExchange as { config: { spread: { value: bigint } } }
  ).config.spread.value
  return (Number(spreadValue) / 1e24) * 100
}
