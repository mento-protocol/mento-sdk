import { Pool, PoolType, PoolDetails } from '../../core/types'
import { PublicClient } from 'viem'
import { fetchFPMMPools, fetchVirtualPools } from './poolDiscovery'
import { fetchFPMMPoolDetails, fetchVirtualPoolDetails } from './poolDetails'

/**
 * Result of pool discovery including any warnings from failed factories
 */
export interface PoolDiscoveryResult {
  pools: Pool[]
  warnings: string[]
}

/**
 * Service for discovering liquidity pools in the Mento protocol.
 * Aggregates pools from multiple factory contracts (FPMM and VirtualPool).
 */
export class PoolService {
  private poolsCache: Pool[] | null = null
  private discoveryWarnings: string[] = []

  constructor(private publicClient: PublicClient, private chainId: number) {}

  /**
   * Returns any warnings from the last pool discovery operation.
   * Useful for debugging when some factories fail but others succeed.
   */
  getDiscoveryWarnings(): string[] {
    return [...this.discoveryWarnings]
  }

  /**
   * Fetches all pools available in the protocol from both FPMM and Virtual pool factories
   * Results are cached in memory for the service instance lifetime
   *
   * @returns Array of all pools available in the protocol
   * @throws {Error} If no pools can be discovered from any factory
   *
   * @example
   * ```typescript
   * const pools = await poolService.getPools()
   * console.log(`Found ${pools.length} pools`)
   * ```
   */
  async getPools(): Promise<Pool[]> {
    if (this.poolsCache) {
      return this.poolsCache
    }

    const pools: Pool[] = []
    const warnings: string[] = []

    try {
      const fpmmPools = await fetchFPMMPools(this.publicClient, this.chainId)
      pools.push(...fpmmPools)
    } catch (error) {
      const message = `Failed to fetch FPMM pools: ${error instanceof Error ? error.message : String(error)}`
      warnings.push(message)
    }

    try {
      const virtualPools = await fetchVirtualPools(this.publicClient, this.chainId)
      pools.push(...virtualPools)
    } catch (error) {
      const message = `Failed to fetch Virtual pools: ${error instanceof Error ? error.message : String(error)}`
      warnings.push(message)
    }

    this.discoveryWarnings = warnings

    // Only throw if NO pools were discovered from any factory
    if (pools.length === 0) {
      throw new Error(
        'Failed to discover any pools from any factory. ' +
          'All pool factory queries failed. Check network connectivity and RPC endpoint.'
      )
    }

    this.poolsCache = pools
    return pools
  }

  /**
   * Fetches enriched on-chain details for a specific pool by address.
   * Resolves the pool type from the discovery cache, then fetches
   * pool-type-specific data (pricing, fees, rebalancing for FPMM; reserves and spread for Virtual).
   *
   * @param poolAddr - The deployed pool contract address
   * @returns Enriched pool details (FPMMPoolDetails or VirtualPoolDetails)
   * @throws {Error} If the pool address is not found in any known factory
   * @throws {Error} If on-chain calls fail
   *
   * @example
   * ```typescript
   * const details = await poolService.getPoolDetails('0x...')
   * if (details.poolType === 'FPMM') {
   *   console.log(details.pricing.oraclePrice)
   *   console.log(details.rebalancing.inBand)
   * } else {
   *   console.log(details.spreadPercent)
   * }
   * ```
   */
  async getPoolDetails(poolAddr: string): Promise<PoolDetails> {
    const pools = await this.getPools()
    const pool = pools.find((p) => p.poolAddr.toLowerCase() === poolAddr.toLowerCase())

    if (!pool) {
      throw new Error(`Pool not found: ${poolAddr}. ` + 'Ensure the address is a valid pool discovered by getPools().')
    }

    if (pool.poolType === PoolType.FPMM) {
      return fetchFPMMPoolDetails(this.publicClient, this.chainId, pool)
    } else {
      return fetchVirtualPoolDetails(this.publicClient, pool)
    }
  }
}
