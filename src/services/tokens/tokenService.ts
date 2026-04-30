import { RESERVE_ABI, RESERVE_V2_ABI, BIPOOL_MANAGER_ABI, ERC20_ABI } from '../../core/abis'
import { Token, StableToken, CollateralAsset } from '../../core/types'

// Legacy Exchange type for BiPoolManager v2 responses
interface Exchange {
  exchangeId: string
  assets: readonly `0x${string}`[]
}
import {
  getContractAddress,
  tryGetContractAddress,
  ChainId,
  RESERVE,
  BIPOOLMANAGER,
} from '../../core/constants'
import { retryOperation } from '../../utils'
import { multicall } from '../../utils/multicall'
import type { PublicClient } from 'viem'

/**
 * Chains that use ReserveV2 (v3) instead of the legacy Reserve contract.
 */
const RESERVE_V2_CHAINS: Set<number> = new Set([ChainId.MONAD_TESTNET, ChainId.MONAD, ChainId.POLYGON_AMOY])

export class TokenService {
  private tokenMetadataCache = new Map<string, Pick<Token, 'name' | 'symbol' | 'decimals'>>()

  constructor(private publicClient: PublicClient, private chainId: number) {}

  private isReserveV2(): boolean {
    return RESERVE_V2_CHAINS.has(this.chainId)
  }

  /**
   * Get token metadata (name, symbol, decimals)
   * @param address - Token contract address
   * @returns Token metadata
   */
  private async getTokenMetadata(
    address: string
  ): Promise<Pick<Token, 'name' | 'symbol' | 'decimals'>> {
    const cacheKey = address.toLowerCase()
    const cached = this.tokenMetadataCache.get(cacheKey)
    if (cached) {
      return cached
    }

    const [metadata] = await this.getTokenMetadataBatch([address])
    this.tokenMetadataCache.set(cacheKey, metadata)
    return metadata
  }

  private async getTokenMetadataBatch(
    addresses: string[]
  ): Promise<Array<Pick<Token, 'name' | 'symbol' | 'decimals'>>> {
    if (addresses.length === 0) {
      return []
    }

    const results = new Array<Pick<Token, 'name' | 'symbol' | 'decimals'>>(addresses.length)
    const missing: Array<{ address: string; index: number }> = []

    for (const [index, address] of addresses.entries()) {
      const cached = this.tokenMetadataCache.get(address.toLowerCase())
      if (cached) {
        results[index] = cached
        continue
      }

      missing.push({ address, index })
    }

    if (missing.length === 0) {
      return results
    }

    const multicallResults = await multicall(
      this.publicClient,
      missing.flatMap(({ address }) => ([
        {
          address: address as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'name',
          args: [] as const,
        },
        {
          address: address as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'symbol',
          args: [] as const,
        },
        {
          address: address as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'decimals',
          args: [] as const,
        },
      ])),
      { allowFailure: true }
    )

    const hydrated = await Promise.all(
      missing.map(async ({ address }, index) => {
        const resultOffset = index * 3
        const name = multicallResults[resultOffset]
        const symbol = multicallResults[resultOffset + 1]
        const decimals = multicallResults[resultOffset + 2]

        if (
          name?.status === 'success' &&
          symbol?.status === 'success' &&
          decimals?.status === 'success'
        ) {
          return {
            name: name.result as string,
            symbol: symbol.result as string,
            decimals: Number(decimals.result),
          }
        }

        return this.readTokenMetadataWithRetry(address)
      })
    )

    for (const [index, metadata] of hydrated.entries()) {
      const address = missing[index].address
      this.tokenMetadataCache.set(address.toLowerCase(), metadata)
      results[missing[index].index] = metadata
    }

    return results
  }

  private async readTokenMetadataWithRetry(
    address: string
  ): Promise<Pick<Token, 'name' | 'symbol' | 'decimals'>> {
    const [name, symbol, decimals] = await Promise.all([
      retryOperation(() =>
        this.publicClient.readContract({
          address: address as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'name',
          args: [],
        })
      ),
      retryOperation(() =>
        this.publicClient.readContract({
          address: address as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'symbol',
          args: [],
        })
      ),
      retryOperation(() =>
        this.publicClient.readContract({
          address: address as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'decimals',
          args: [],
        })
      ),
    ])

    return {
      name: name as string,
      symbol: symbol as string,
      decimals: Number(decimals),
    }
  }

  /**
   * Get total supply of a token
   * @param address - Token contract address
   * @returns Total supply as string
   */
  private async getTotalSupply(address: string): Promise<string> {
    const [totalSupply] = await this.getTotalSupplyBatch([address])
    return totalSupply
  }

  private async getTotalSupplyBatch(addresses: string[]): Promise<string[]> {
    if (addresses.length === 0) {
      return []
    }

    const results = await multicall(
      this.publicClient,
      addresses.map((address) => ({
        address: address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'totalSupply',
        args: [] as const,
      })),
      { allowFailure: true }
    )

    return Promise.all(
      addresses.map(async (address, index) => {
        const result = results[index]
        if (result?.status === 'success') {
          return (result.result as bigint).toString()
        }

        return this.readTotalSupplyWithRetry(address)
      })
    )
  }

  private async readTotalSupplyWithRetry(address: string): Promise<string> {
    const totalSupply = await retryOperation(() =>
      this.publicClient.readContract({
        address: address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'totalSupply',
        args: [],
      })
    )

    return (totalSupply as bigint).toString()
  }

  private async getCollateralStatusBatch(
    reserveAddress: string,
    addresses: string[]
  ): Promise<boolean[]> {
    if (addresses.length === 0) {
      return []
    }

    const results = await multicall(
      this.publicClient,
      addresses.map((address) => ({
        address: reserveAddress as `0x${string}`,
        abi: RESERVE_ABI,
        functionName: 'isCollateralAsset',
        args: [address as `0x${string}`] as const,
      })),
      { allowFailure: true }
    )

    return Promise.all(
      addresses.map(async (address, index) => {
        const result = results[index]
        if (result?.status === 'success') {
          return result.result as boolean
        }

        return this.readCollateralStatusWithRetry(reserveAddress, address)
      })
    )
  }

  private async readCollateralStatusWithRetry(reserveAddress: string, address: string): Promise<boolean> {
    return retryOperation(() =>
      this.publicClient.readContract({
        address: reserveAddress as `0x${string}`,
        abi: RESERVE_ABI,
        functionName: 'isCollateralAsset',
        args: [address as `0x${string}`],
      })
    ) as Promise<boolean>
  }

  /**
   * Get stable token addresses from the Reserve contract.
   * Uses getStableAssets() on ReserveV2, getTokens() on legacy Reserve.
   */
  private async getStableTokenAddresses(reserveAddress: string): Promise<string[]> {
    if (this.isReserveV2()) {
      return (await this.publicClient.readContract({
        address: reserveAddress as `0x${string}`,
        abi: RESERVE_V2_ABI,
        functionName: 'getStableAssets',
        args: [],
      })) as string[]
    }

    return (await this.publicClient.readContract({
      address: reserveAddress as `0x${string}`,
      abi: RESERVE_ABI,
      functionName: 'getTokens',
      args: [],
    })) as string[]
  }

  /**
   * Get all stable tokens from the Reserve contract.
   * Returns the actual on-chain ERC20 totalSupply values without adjustments.
   * @param includeSupply - Whether to fetch total supply
   * @returns Array of stable tokens
   */
  public async getStableTokens(includeSupply = true): Promise<StableToken[]> {
    const reserveAddress = getContractAddress(this.chainId, RESERVE)
    const tokenAddresses = await this.getStableTokenAddresses(reserveAddress)

    const [metadataList, totalSupplies] = await Promise.all([
      this.getTokenMetadataBatch(tokenAddresses),
      includeSupply ? this.getTotalSupplyBatch(tokenAddresses) : Promise.resolve(tokenAddresses.map(() => '0')),
    ])

    const tokens = tokenAddresses.map((address, index) => ({
      address,
      ...metadataList[index],
      totalSupply: totalSupplies[index],
    }))

    return tokens
  }

  /**
   * Get all collateral assets.
   * On ReserveV2 chains, queries the reserve directly.
   * On legacy chains, discovers collateral via BiPoolManager exchanges.
   * @returns Array of collateral assets
   */
  public async getCollateralAssets(): Promise<CollateralAsset[]> {
    if (this.isReserveV2()) {
      return this.getCollateralAssetsV2()
    }
    return this.getCollateralAssetsLegacy()
  }

  /**
   * Get collateral assets directly from ReserveV2.
   */
  private async getCollateralAssetsV2(): Promise<CollateralAsset[]> {
    const reserveAddress = getContractAddress(this.chainId, RESERVE)

    const collateralAddresses = (await retryOperation(() =>
      this.publicClient.readContract({
        address: reserveAddress as `0x${string}`,
        abi: RESERVE_V2_ABI,
        functionName: 'getCollateralAssets',
        args: [],
      })
    )) as string[]

    const metadataList = await this.getTokenMetadataBatch(collateralAddresses)
    const assets = collateralAddresses.map((address, index) => ({
      address,
      ...metadataList[index],
    }))

    return assets
  }

  /**
   * Get collateral assets from legacy Reserve via BiPoolManager exchanges.
   */
  private async getCollateralAssetsLegacy(): Promise<CollateralAsset[]> {
    const biPoolManagerAddress = tryGetContractAddress(this.chainId, BIPOOLMANAGER)
    if (!biPoolManagerAddress) {
      return []
    }
    const reserveAddress = getContractAddress(this.chainId, RESERVE)

    // Get all exchanges to find unique token addresses
    const exchanges = (await retryOperation(() =>
      this.publicClient.readContract({
        address: biPoolManagerAddress as `0x${string}`,
        abi: BIPOOL_MANAGER_ABI,
        functionName: 'getExchanges',
      })
    )) as Exchange[]

    // Extract unique token addresses from exchanges
    const uniqueAddresses = new Set<string>()
    for (const exchange of exchanges) {
      exchange.assets.forEach((address: string) => uniqueAddresses.add(address))
    }

    const addresses = Array.from(uniqueAddresses)
    const [collateralStatuses, metadataList] = await Promise.all([
      this.getCollateralStatusBatch(reserveAddress, addresses),
      this.getTokenMetadataBatch(addresses),
    ])

    const results = addresses.map((address, index) => {
      if (!collateralStatuses[index]) {
        return null
      }

      return { address, ...metadataList[index] }
    })

    return results.filter((asset): asset is CollateralAsset => asset !== null)
  }
}
