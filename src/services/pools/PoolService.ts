import { getContractAddress, ChainId } from '../../core/constants'
import { Pool, PoolType } from '../../core/types'
import {
  FPMM_FACTORY_ABI,
  FPMM_ABI,
  VIRTUAL_POOL_FACTORY_ABI,
  BIPOOL_MANAGER_ABI,
} from '../../core/abis'
import { PublicClient, Address } from 'viem'

// TODO: Update to enrich pools with more data as needed. Use optional flag to include more data.

/**
 * Service for discovering liquidity pools in the Mento protocol.
 * Aggregates pools from multiple factory contracts (FPMM and VirtualPool).
 */
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

    // TODO: Use router.factoryRegistry.poolFactories() for dynamic factory discovery
    const pools: Pool[] = []

    // Fetch FPMM pools
    const fpmmPools = await this.fetchFPMMPools()
    pools.push(...fpmmPools)

    // Fetch Virtual pools
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
        address: fpmmFactoryAddress as Address,
        abi: FPMM_FACTORY_ABI,
        functionName: 'deployedFPMMAddresses',
      })) as Address[]

      if (poolAddresses.length === 0) {
        return []
      }

      const poolDataPromises = poolAddresses.map(async (poolAddress) => {
        const [token0, token1] = await Promise.all([
          this.publicClient.readContract({
            address: poolAddress,
            abi: FPMM_ABI,
            functionName: 'token0',
          }) as Promise<Address>,
          this.publicClient.readContract({
            address: poolAddress,
            abi: FPMM_ABI,
            functionName: 'token1',
          }) as Promise<Address>,
        ])

        return {
          factoryAddr: fpmmFactoryAddress,
          poolAddress: poolAddress as string,
          token0: token0 as string,
          token1: token1 as string,
          poolType: PoolType.FPMM,
        }
      })

      return await Promise.all(poolDataPromises)
    } catch (error) {
      console.error('Failed to fetch FPMM pools:', error)
      throw new Error(`Failed to fetch FPMM pools: ${(error as Error).message}`)
    }
  }

  /**
   * Fetches all Virtual pools by discovering them from BiPoolManager exchanges.
   * VirtualPoolFactory doesn't have an enumeration method, 
   * so we have to derive pools from BiPoolManager.
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
        address: biPoolManagerAddress as Address,
        abi: BIPOOL_MANAGER_ABI,
        functionName: 'getExchanges',
      })) as Array<{ exchangeId: string; assets: readonly Address[] }>

      if (exchangesData.length === 0) {
        return []
      }

      // For each exchange, check if a virtual pool exists, and if so, return the pool address.
      const poolPromises = exchangesData.map(async (exchange) => {
        if (exchange.assets.length !== 2) {
          console.warn(
            `Skipping invalid exchange ${exchange.exchangeId}: expected 2 assets`
          )
          return null
        }

        const [token0, token1] = this.sortTokens(
          exchange.assets[0],
          exchange.assets[1]
        )

        const poolAddress = (await this.publicClient.readContract({
          address: virtualPoolFactoryAddress as Address,
          abi: VIRTUAL_POOL_FACTORY_ABI,
          functionName: 'getOrPrecomputeProxyAddress',
          args: [token0, token1],
        })) as Address

        const isDeployed = (await this.publicClient.readContract({
          address: virtualPoolFactoryAddress as Address,
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
          poolType: PoolType.Virtual,
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
   * Sorts two token addresses to match VirtualPoolFactory's sorting.
   */
  private sortTokens(
    tokenA: Address,
    tokenB: Address
  ): [Address, Address] {
    return tokenA.toLowerCase() < tokenB.toLowerCase()
      ? [tokenA, tokenB]
      : [tokenB, tokenA]
  }
}
