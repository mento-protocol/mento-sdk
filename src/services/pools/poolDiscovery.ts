import { getContractAddress, ChainId } from '../../core/constants'
import { Pool, PoolType } from '../../core/types'
import { FPMM_FACTORY_ABI, FPMM_ABI, VIRTUAL_POOL_FACTORY_ABI, BIPOOL_MANAGER_ABI } from '../../core/abis'
import { PublicClient, Address } from 'viem'
import { sortTokenAddresses } from '../../utils/sortUtils'

/**
 * Fetches all FPMM pools from the FPMM Factory
 */
export async function fetchFPMMPools(publicClient: PublicClient, chainId: number): Promise<Pool[]> {
  const fpmmFactoryAddress = getContractAddress(chainId as ChainId, 'FPMMFactory')

  if (!fpmmFactoryAddress) {
    return []
  }

  try {
    // Get all deployed FPMM pool addresses
    const poolAddresses = (await publicClient.readContract({
      address: fpmmFactoryAddress as Address,
      abi: FPMM_FACTORY_ABI,
      functionName: 'deployedFPMMAddresses',
    })) as Address[]

    if (poolAddresses.length === 0) {
      return []
    }

    const poolDataPromises = poolAddresses.map(async (poolAddress) => {
      const [token0, token1] = await Promise.all([
        publicClient.readContract({
          address: poolAddress,
          abi: FPMM_ABI,
          functionName: 'token0',
        }) as Promise<Address>,
        publicClient.readContract({
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
export async function fetchVirtualPools(publicClient: PublicClient, chainId: number): Promise<Pool[]> {
  const virtualPoolFactoryAddress = getContractAddress(chainId as ChainId, 'VirtualPoolFactory')
  const biPoolManagerAddress = getContractAddress(chainId as ChainId, 'BiPoolManager')

  if (!virtualPoolFactoryAddress || !biPoolManagerAddress) {
    return []
  }

  try {
    // TODO: When the latest virtual pool factory contract is deployed
    //       we can simplify this by using VirtualPoolFactory.getAllPools() returns(address[])

    // Get all exchanges from BiPoolManager
    const exchangesData = (await publicClient.readContract({
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

      const poolAddress = (await publicClient.readContract({
        address: virtualPoolFactoryAddress as Address,
        abi: VIRTUAL_POOL_FACTORY_ABI,
        functionName: 'getOrPrecomputeProxyAddress',
        args: [token0, token1],
      })) as Address

      const isDeployed = (await publicClient.readContract({
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
