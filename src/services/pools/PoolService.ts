import { getContractAddress, ChainId, addresses } from '../../core/constants'
import { Pool, PoolType, PoolDetails, FPMMPoolDetails, VirtualPoolDetails } from '../../core/types'
import {
  FPMM_FACTORY_ABI,
  FPMM_ABI,
  VIRTUAL_POOL_FACTORY_ABI,
  VIRTUAL_POOL_ABI,
  BIPOOL_MANAGER_ABI,
} from '../../core/abis'
import { PublicClient, Address } from 'viem'
import { sortTokenAddresses } from '../../utils/sortUtils'

/**
 * Service for discovering liquidity pools in the Mento protocol.
 * Aggregates pools from multiple factory contracts (FPMM and VirtualPool).
 */
export class PoolService {
  private poolsCache: Pool[] | null = null

  constructor(private publicClient: PublicClient, private chainId: number) {}

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

    // TODO: Update to use router.factoryRegistry.poolFactories()
    //       for dynamic factory discovery. For now we will use
    //       the hardcoded factory addresses for the chain for v1.
    const pools: Pool[] = []

    try {
      const fpmmPools = await this.fetchFPMMPools()
      pools.push(...fpmmPools)
    } catch {}

    try {
      const virtualPools = await this.fetchVirtualPools()
      pools.push(...virtualPools)
    } catch {}

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
      return this.fetchFPMMPoolDetails(pool)
    } else {
      return this.fetchVirtualPoolDetails(pool)
    }
  }

  /**
   * Fetches enriched details for an FPMM pool
   */
  private async fetchFPMMPoolDetails(pool: Pool): Promise<FPMMPoolDetails> {
    const address = pool.poolAddr as Address

    try {
      // Known liquidity strategy addresses for this chain
      const knownStrategies = this.getKnownLiquidityStrategies()

      const [
        reservesResult,
        pricesResult,
        decimals0,
        decimals1,
        lpFee,
        protocolFee,
        rebalanceIncentive,
        rebalanceThresholdAbove,
        rebalanceThresholdBelow,
        ...strategyResults
      ] = await Promise.all([
        this.publicClient.readContract({ address, abi: FPMM_ABI, functionName: 'getReserves' }),
        this.publicClient.readContract({ address, abi: FPMM_ABI, functionName: 'getPrices' }),
        this.publicClient.readContract({ address, abi: FPMM_ABI, functionName: 'decimals0' }),
        this.publicClient.readContract({ address, abi: FPMM_ABI, functionName: 'decimals1' }),
        this.publicClient.readContract({ address, abi: FPMM_ABI, functionName: 'lpFee' }),
        this.publicClient.readContract({ address, abi: FPMM_ABI, functionName: 'protocolFee' }),
        this.publicClient.readContract({ address, abi: FPMM_ABI, functionName: 'rebalanceIncentive' }),
        this.publicClient.readContract({ address, abi: FPMM_ABI, functionName: 'rebalanceThresholdAbove' }),
        this.publicClient.readContract({ address, abi: FPMM_ABI, functionName: 'rebalanceThresholdBelow' }),
        ...knownStrategies.map((strategyAddr: string) =>
          this.publicClient.readContract({
            address,
            abi: FPMM_ABI,
            functionName: 'liquidityStrategy',
            args: [strategyAddr as Address],
          })
        ),
      ])

      const [reserve0, reserve1, blockTimestampLast] = reservesResult as [bigint, bigint, bigint]
      const [
        oraclePriceNum,
        oraclePriceDen,
        reservePriceNum,
        reservePriceDen,
        priceDifference,
        reservePriceAboveOraclePrice,
      ] = pricesResult as [bigint, bigint, bigint, bigint, bigint, boolean]

      const lpFeeBps = lpFee as bigint
      const protocolFeeBps = protocolFee as bigint
      const rebalanceIncentiveBps = rebalanceIncentive as bigint
      const thresholdAboveBps = rebalanceThresholdAbove as bigint
      const thresholdBelowBps = rebalanceThresholdBelow as bigint

      // Find the active liquidity strategy (first match wins)
      // Note: this could break at some point in the future if we decide to use
      //       more than one stragegy for a pool. For now it is not an issue,
      //       if we do forget to change this the impact is low as this function
      //       is just for informational purposes.
      const activeIndex = strategyResults.findIndex((result) => result === true)
      const liquidityStrategy = activeIndex >= 0 ? knownStrategies[activeIndex] : null

      const applicableThreshold = reservePriceAboveOraclePrice ? thresholdAboveBps : thresholdBelowBps
      const inBand = priceDifference < applicableThreshold

      return {
        ...pool,
        poolType: 'FPMM',
        decimals0: decimals0 as bigint,
        decimals1: decimals1 as bigint,
        reserve0,
        reserve1,
        blockTimestampLast,
        pricing: {
          oraclePriceNum,
          oraclePriceDen,
          oraclePrice: Number(oraclePriceNum) / Number(oraclePriceDen),
          reservePriceNum,
          reservePriceDen,
          reservePrice: Number(reservePriceNum) / Number(reservePriceDen),
          priceDifferenceBps: priceDifference,
          priceDifferencePercent: Number(priceDifference) / 100,
          reservePriceAboveOraclePrice,
        },
        fees: {
          lpFeeBps,
          lpFeePercent: Number(lpFeeBps) / 100,
          protocolFeeBps,
          protocolFeePercent: Number(protocolFeeBps) / 100,
          totalFeePercent: (Number(lpFeeBps) + Number(protocolFeeBps)) / 100,
        },
        rebalancing: {
          rebalanceIncentiveBps,
          rebalanceIncentivePercent: Number(rebalanceIncentiveBps) / 100,
          rebalanceThresholdAboveBps: thresholdAboveBps,
          rebalanceThresholdAbovePercent: Number(thresholdAboveBps) / 100,
          rebalanceThresholdBelowBps: thresholdBelowBps,
          rebalanceThresholdBelowPercent: Number(thresholdBelowBps) / 100,
          inBand,
          liquidityStrategy,
        },
      }
    } catch (error) {
      throw new Error(`Failed to fetch FPMM pool details for ${pool.poolAddr}: ${(error as Error).message}`)
    }
  }

  /**
   * Fetches enriched details for a Virtual pool
   */
  private async fetchVirtualPoolDetails(pool: Pool): Promise<VirtualPoolDetails> {
    const address = pool.poolAddr as Address

    try {
      const [reservesResult, protocolFee, metadataResult] = await Promise.all([
        this.publicClient.readContract({ address, abi: VIRTUAL_POOL_ABI, functionName: 'getReserves' }),
        this.publicClient.readContract({ address, abi: VIRTUAL_POOL_ABI, functionName: 'protocolFee' }),
        this.publicClient.readContract({ address, abi: VIRTUAL_POOL_ABI, functionName: 'metadata' }),
      ])

      const [reserve0, reserve1, blockTimestampLast] = reservesResult as [bigint, bigint, bigint]
      const [dec0, dec1] = metadataResult as [bigint, bigint, bigint, bigint, string, string]
      const spreadBps = protocolFee as bigint

      return {
        ...pool,
        poolType: 'Virtual',
        decimals0: dec0,
        decimals1: dec1,
        reserve0,
        reserve1,
        blockTimestampLast,
        spreadBps,
        spreadPercent: Number(spreadBps) / 100,
      }
    } catch (error) {
      throw new Error(`Failed to fetch Virtual pool details for ${pool.poolAddr}: ${(error as Error).message}`)
    }
  }

  /**
   * Fetches all FPMM pools from the FPMM Factory
   */
  private async fetchFPMMPools(): Promise<Pool[]> {
    const fpmmFactoryAddress = getContractAddress(this.chainId as ChainId, 'FPMMFactory')

    if (!fpmmFactoryAddress) {
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
          poolAddr: poolAddress as string,
          token0: token0 as string,
          token1: token1 as string,
          poolType: PoolType.FPMM as `${PoolType}`,
        }
      })

      return await Promise.all(poolDataPromises)
    } catch (error) {
      throw new Error(`Failed to fetch FPMM pools: ${(error as Error).message}`)
    }
  }

  /**
   * Fetches all Virtual pools by discovering them from BiPoolManager exchanges.
   * VirtualPoolFactory doesn't have an enumeration method,
   * so we have to derive pools from BiPoolManager.
   */
  private async fetchVirtualPools(): Promise<Pool[]> {
    const virtualPoolFactoryAddress = getContractAddress(this.chainId as ChainId, 'VirtualPoolFactory')
    const biPoolManagerAddress = getContractAddress(this.chainId as ChainId, 'BiPoolManager')

    if (!virtualPoolFactoryAddress || !biPoolManagerAddress) {
      return []
    }

    try {
      // TODO: When the latest virtual pool factory contract is deployed
      //       we can simplify this by using VirtualPoolFactory.getAllPools() returns(address[])

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
          return null
        }

        const [token0, token1] = sortTokenAddresses(exchange.assets[0], exchange.assets[1])

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

        const pool: Pool = {
          factoryAddr: virtualPoolFactoryAddress,
          poolAddr: poolAddress as string,
          token0: token0 as string,
          token1: token1 as string,
          poolType: PoolType.Virtual as `${PoolType}`,
          exchangeId: exchange.exchangeId,
        }
        return pool
      })

      const results = await Promise.all(poolPromises)
      return results.filter((pool): pool is Pool => pool !== null)
    } catch (error) {
      throw new Error(`Failed to fetch Virtual pools: ${(error as Error).message}`)
    }
  }

  /**
   * Returns the known liquidity strategy addresses for the current chain.
   */
  private getKnownLiquidityStrategies(): string[] {
    const strategies: string[] = []
    const chainAddresses = addresses[this.chainId as ChainId]
    if (!chainAddresses) return strategies

    if (chainAddresses.ReserveLiquidityStrategy) {
      strategies.push(chainAddresses.ReserveLiquidityStrategy)
    }
    if (chainAddresses.CDPLiquidityStrategy) {
      strategies.push(chainAddresses.CDPLiquidityStrategy)
    }
    return strategies
  }
}
