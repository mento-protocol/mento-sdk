import { getContractAddress } from '../../core/constants'
import { ChainId } from '../../core/constants/chainId'
import { Pool } from '../../core/types/pool'
import {
  FPMM_FACTORY_ABI,
  FPMM_ABI,
  VIRTUAL_POOL_FACTORY_ABI,
  BIPOOL_MANAGER_ABI,
} from '../../core/abis'
import { PublicClient } from 'viem'

export class PoolService {
  private poolsCache: Pool[] | null = null

  constructor(
    private publicClient: PublicClient,
    private chainId: number
  ) {}

  /**
   * Fetches all pools available in the protocol from both FPMM and Virtual pool factories
   * Results are cached in memory for the service instance lifetime
   *
   * @returns Array of all pools available in the protocol
   * @throws {Error} If RPC call fails or pools are unavailable
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

    // Note: The ideal implementation would use the router to dynamically discover factories:
    // 1. Get router address -> 2. Get factoryRegistry -> 3. Get all poolFactories()
    // But for now, we assume only two factories: FPMM and VirtualPool

    const pools: Pool[] = []

    // Fetch FPMM pools
    const fpmmPools = await this.fetchFPMMPools()
    pools.push(...fpmmPools)

    // Fetch Virtual pools (derived from BiPoolManager exchanges)
    const virtualPools = await this.fetchVirtualPools()
    pools.push(...virtualPools)

    this.poolsCache = pools
    return pools
  }

  /**
   * Fetches all FPMM pools from the FPMM Factory
   */
  private async fetchFPMMPools(): Promise<Pool[]> {
    const fpmmFactoryAddress = getContractAddress(
      this.chainId as ChainId,
      'FPMMFactory'
    )

    if (!fpmmFactoryAddress) {
      console.warn('FPMM Factory address not found for this chain')
      return []
    }

    try {
      // Get all deployed FPMM pool addresses
      const poolAddresses = (await this.publicClient.readContract({
        address: fpmmFactoryAddress as `0x${string}`,
        abi: FPMM_FACTORY_ABI,
        functionName: 'deployedFPMMAddresses',
      })) as `0x${string}`[]

      if (poolAddresses.length === 0) {
        return []
      }

      // Fetch token0 and token1 for each pool in parallel
      const poolDataPromises = poolAddresses.map(async (poolAddress) => {
        const [token0, token1] = await Promise.all([
          this.publicClient.readContract({
            address: poolAddress,
            abi: FPMM_ABI,
            functionName: 'token0',
          }) as Promise<`0x${string}`>,
          this.publicClient.readContract({
            address: poolAddress,
            abi: FPMM_ABI,
            functionName: 'token1',
          }) as Promise<`0x${string}`>,
        ])

        return {
          factoryAddr: fpmmFactoryAddress,
          poolAddress: poolAddress as string,
          token0: token0 as string,
          token1: token1 as string,
        }
      })

      return await Promise.all(poolDataPromises)
    } catch (error) {
      console.error('Failed to fetch FPMM pools:', error)
      throw new Error(`Failed to fetch FPMM pools: ${(error as Error).message}`)
    }
  }

  /**
   * Fetches all Virtual pools by discovering them from BiPoolManager exchanges
   */
  private async fetchVirtualPools(): Promise<Pool[]> {
    const virtualPoolFactoryAddress = getContractAddress(
      this.chainId as ChainId,
      'VirtualPoolFactory'
    )
    const biPoolManagerAddress = getContractAddress(
      this.chainId as ChainId,
      'BiPoolManager'
    )

    if (!virtualPoolFactoryAddress || !biPoolManagerAddress) {
      console.warn(
        'VirtualPoolFactory or BiPoolManager address not found for this chain'
      )
      return []
    }

    try {
      // Get all exchanges from BiPoolManager
      const exchangesData = (await this.publicClient.readContract({
        address: biPoolManagerAddress as `0x${string}`,
        abi: BIPOOL_MANAGER_ABI,
        functionName: 'getExchanges',
      })) as Array<{ exchangeId: string; assets: readonly `0x${string}`[] }>

      if (exchangesData.length === 0) {
        return []
      }

      // For each exchange, check if a virtual pool exists
      const poolPromises = exchangesData.map(async (exchange) => {
        if (exchange.assets.length !== 2) {
          console.warn(
            `Skipping invalid exchange ${exchange.exchangeId}: expected 2 assets`
          )
          return null
        }

        // Sort tokens (lower address first) to match VirtualPoolFactory's sorting
        const [token0, token1] = this.sortTokens(
          exchange.assets[0],
          exchange.assets[1]
        )

        // Get the pool address (precomputed or existing)
        const poolAddress = (await this.publicClient.readContract({
          address: virtualPoolFactoryAddress as `0x${string}`,
          abi: VIRTUAL_POOL_FACTORY_ABI,
          functionName: 'getOrPrecomputeProxyAddress',
          args: [token0, token1],
        })) as `0x${string}`

        // Check if the pool is actually deployed
        const isDeployed = (await this.publicClient.readContract({
          address: virtualPoolFactoryAddress as `0x${string}`,
          abi: VIRTUAL_POOL_FACTORY_ABI,
          functionName: 'isPool',
          args: [poolAddress],
        })) as boolean

        if (!isDeployed) {
          return null
        }

        return {
          factoryAddr: virtualPoolFactoryAddress,
          poolAddress: poolAddress as string,
          token0: token0 as string,
          token1: token1 as string,
        }
      })

      const results = await Promise.all(poolPromises)
      return results.filter((pool): pool is Pool => pool !== null)
    } catch (error) {
      console.error('Failed to fetch Virtual pools:', error)
      throw new Error(
        `Failed to fetch Virtual pools: ${(error as Error).message}`
      )
    }
  }

  /**
   * Sorts two token addresses (lower address first)
   * This matches the sorting logic in VirtualPoolFactory
   */
  private sortTokens(
    tokenA: `0x${string}`,
    tokenB: `0x${string}`
  ): [`0x${string}`, `0x${string}`] {
    return tokenA.toLowerCase() < tokenB.toLowerCase()
      ? [tokenA, tokenB]
      : [tokenB, tokenA]
  }
}
