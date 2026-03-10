import { tryGetContractAddress, ChainId } from '../../core/constants'
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
import { multicall } from '../../utils/multicall'

/**
 * Fetches all FPMM pools from the FPMM Factory
 */
export async function fetchFPMMPools(publicClient: PublicClient, chainId: number): Promise<Pool[]> {
  const fpmmFactoryAddress = tryGetContractAddress(chainId as ChainId, 'FPMMFactory')

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

    // Batch all token0/token1 reads into a single multicall
    const contracts = poolAddresses.flatMap((poolAddress) => [
      { address: poolAddress, abi: FPMM_ABI, functionName: 'token0' as const },
      { address: poolAddress, abi: FPMM_ABI, functionName: 'token1' as const },
    ])

    const results = await multicall(publicClient, contracts)

    return poolAddresses.map((poolAddress, i) => {
      const token0Result = results[i * 2]
      const token1Result = results[i * 2 + 1]

      if (token0Result.status === 'failure' || token1Result.status === 'failure') {
        throw new Error(`Failed to read token addresses for pool ${poolAddress}`)
      }

      return {
        factoryAddr: fpmmFactoryAddress,
        poolAddr: poolAddress as string,
        token0: token0Result.result as string,
        token1: token1Result.result as string,
        poolType: PoolType.FPMM as `${PoolType}`,
      }
    })
  } catch (error) {
    throw new Error(`Failed to fetch FPMM pools: ${(error as Error).message}`)
  }
}

/**
 * Fetches all active Virtual pools from the VirtualPoolFactory,
 * then resolves token pairs and exchange IDs from each pool and BiPoolManager.
 */
export async function fetchVirtualPools(publicClient: PublicClient, chainId: number): Promise<Pool[]> {
  const virtualPoolFactoryAddress = tryGetContractAddress(chainId as ChainId, 'VirtualPoolFactory')
  const biPoolManagerAddress = tryGetContractAddress(chainId as ChainId, 'BiPoolManager')

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

    // Batch all tokens() reads into a single multicall
    const contracts = poolAddresses.map((poolAddress) => ({
      address: poolAddress,
      abi: VIRTUAL_POOL_ABI,
      functionName: 'tokens' as const,
    }))

    const results = await multicall(publicClient, contracts)

    return poolAddresses.map((poolAddress, i) => {
      const result = results[i]
      if (result.status === 'failure') {
        throw new Error(`Failed to read token addresses for virtual pool ${poolAddress}`)
      }

      const [token0, token1] = result.result as [Address, Address]
      const [sorted0, sorted1] = sortTokenAddresses(token0, token1)
      const exchangeId = tokenPairToExchangeId.get(`${sorted0}:${sorted1}`)

      return {
        factoryAddr: virtualPoolFactoryAddress,
        poolAddr: poolAddress as string,
        token0: sorted0 as string,
        token1: sorted1 as string,
        poolType: PoolType.Virtual as `${PoolType}`,
        exchangeId,
      }
    })
  } catch (error) {
    throw new Error(`Failed to fetch Virtual pools: ${(error as Error).message}`)
  }
}
