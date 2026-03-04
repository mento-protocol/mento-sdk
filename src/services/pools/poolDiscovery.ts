import { getContractAddress, ChainId } from '../../core/constants'
import { Pool, PoolType } from '../../core/types'
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
    const wrapped = new Error(`Failed to fetch FPMM pools: ${(error as Error).message}`)
    ;(wrapped as any).cause = error
    throw wrapped
  }
}

/**
 * Fetches all active Virtual pools from the VirtualPoolFactory,
 * then resolves token pairs and exchange IDs from each pool and BiPoolManager.
 */
export async function fetchVirtualPools(publicClient: PublicClient, chainId: number): Promise<Pool[]> {
  const virtualPoolFactoryAddress = getContractAddress(chainId as ChainId, 'VirtualPoolFactory')
  const biPoolManagerAddress = getContractAddress(chainId as ChainId, 'BiPoolManager')

  if (!virtualPoolFactoryAddress || !biPoolManagerAddress) {
    return []
  }

  try {
    // Fetch active pool addresses and all exchanges in parallel
    const [poolAddresses, exchangesData] = await Promise.all([
      publicClient.readContract({
        address: virtualPoolFactoryAddress as Address,
        abi: VIRTUAL_POOL_FACTORY_ABI,
        functionName: 'getAllPools',
      }) as Promise<Address[]>,
      publicClient.readContract({
        address: biPoolManagerAddress as Address,
        abi: BIPOOL_MANAGER_ABI,
        functionName: 'getExchanges',
      }) as Promise<Array<{ exchangeId: string; assets: readonly Address[] }>>,
    ])

    if (poolAddresses.length === 0) {
      return []
    }

    // Build a lookup from sorted token pair to exchangeId
    const tokenPairToExchangeId = new Map<string, string>()
    for (const exchange of exchangesData) {
      if (exchange.assets.length === 2) {
        const [t0, t1] = sortTokenAddresses(exchange.assets[0], exchange.assets[1])
        tokenPairToExchangeId.set(`${t0}:${t1}`, exchange.exchangeId)
      }
    }

    // For each pool, read its token pair and match to an exchangeId
    const poolPromises = poolAddresses.map(async (poolAddress) => {
      const [token0, token1] = (await publicClient.readContract({
        address: poolAddress,
        abi: VIRTUAL_POOL_ABI,
        functionName: 'tokens',
      })) as [Address, Address]

      const [sorted0, sorted1] = sortTokenAddresses(token0, token1)
      const exchangeId = tokenPairToExchangeId.get(`${sorted0}:${sorted1}`)

      const pool: Pool = {
        factoryAddr: virtualPoolFactoryAddress,
        poolAddr: poolAddress as string,
        token0: sorted0 as string,
        token1: sorted1 as string,
        poolType: PoolType.Virtual as `${PoolType}`,
        exchangeId,
      }
      return pool
    })

    return await Promise.all(poolPromises)
  } catch (error) {
    const wrapped = new Error(`Failed to fetch Virtual pools: ${(error as Error).message}`)
    ;(wrapped as any).cause = error
    throw wrapped
  }
}
