// Tasks:
// - Update supporting types
// - Update fetching method, ensuring return type returns relevant information the same as v1 exchange struct
// - Update js docs
// - Create tests - won't pass

import { getContractAddress } from 'core/constants'
import { Pool } from 'core/types/pool'
import { PublicClient } from 'viem'

export class PoolService {
  private poolsCache: Pool[] | null = null

  constructor(private publicClient: PublicClient, private chainId: number) {}

  /**
   * Fetches all pools available in the protocol
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
    // Return cached exchanges if available
    if (this.poolsCache) {
      return this.poolsCache
    }

    // Have a note about the ideal implementation of this. Which would be to use the router...as below.
    // But because of limitations, we will assume we only have two factories - FPMM and Virtual pool. and just get the addresses for this chain

    // 1. Get the address for the router for this chain.
    // 2. From this router, get the address of the factory registry. router.factoryRegistry
    // 3. from this registry get all the factories poolFactories()
    // 4. for each factory we need to get all the pools. We also need to know the factory type.
    // 4a. For FPMM Factory we have this - deployedFPMMAddresses()
    // 4b. For Virtual pool factory we have this - 

    // Get the addresses for the factories for this chain.

    const fpmmFactoryAddress = getContractAddress(this.chainId, 'FPMMFactory')
    const virtualPoolFactoryAddress = getContractAddress(this.chainId, 'VirtualPoolFactory')

    // Ensure neither of the addresses are null.
    if (!fpmmFactoryAddress || !virtualPoolFactoryAddress) {
      throw new Error('FPMM or Virtual pool factory address not found for this chain. Please check the chain ID is valid.')
    }

    // Now get all the pools from the 

    try {
      // Get BiPoolManager address from constants
      const biPoolManagerAddress = this.getBiPoolManagerAddress()

      // Fetch exchanges directly from BiPoolManager
      const exchangesData = (await this.publicClient.readContract({
        address: biPoolManagerAddress as `0x${string}`,
        abi: BIPOOL_MANAGER_ABI,
        functionName: 'getExchanges',
      })) as Array<{ exchangeId: string; assets: string[] }>

      // Map to Exchange type with providerAddr set to BiPoolManager
      const exchanges: Exchange[] = exchangesData
        .filter((data) => {
          // Validate: each exchange must have exactly 2 assets
          if (data.assets.length !== 2) {
            console.warn(
              `Skipping invalid exchange ${data.exchangeId}: expected 2 assets, got ${data.assets.length}`
            )
            return false
          }
          return true
        })
        .map((data) => ({
          providerAddr: biPoolManagerAddress,
          id: data.exchangeId,
          assets: data.assets,
        }))

      // Cache the results
      this.exchangesCache = exchanges

      return exchanges
    } catch (error) {
      console.error('Failed to fetch exchanges:', error)
      throw new Error(`Failed to fetch exchanges: ${(error as Error).message}`)
    }
  }
}
