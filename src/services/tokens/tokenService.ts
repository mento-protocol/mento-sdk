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
import type { PublicClient } from 'viem'

/**
 * Chains that use ReserveV2 (v3) instead of the legacy Reserve contract.
 */
const RESERVE_V2_CHAINS: Set<number> = new Set([ChainId.MONAD_TESTNET, ChainId.MONAD])

export class TokenService {
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

    // Fetch metadata and totalSupply for all tokens concurrently
    const tokens = await Promise.all(
      tokenAddresses.map(async (address) => {
        const [metadata, totalSupply] = await Promise.all([
          this.getTokenMetadata(address),
          includeSupply ? this.getTotalSupply(address) : Promise.resolve('0'),
        ])

        return {
          address,
          ...metadata,
          totalSupply,
        }
      })
    )

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

    const assets = await Promise.all(
      collateralAddresses.map(async (address) => {
        const metadata = await this.getTokenMetadata(address)
        return { address, ...metadata }
      })
    )

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

    // Check which tokens are collateral assets and get their info in parallel
    const results = await Promise.all(
      Array.from(uniqueAddresses).map(async (address) => {
        const [isCollateral, metadata] = await Promise.all([
          retryOperation(() =>
            this.publicClient.readContract({
              address: reserveAddress as `0x${string}`,
              abi: RESERVE_ABI,
              functionName: 'isCollateralAsset',
              args: [address as `0x${string}`],
            })
          ) as Promise<boolean>,
          this.getTokenMetadata(address),
        ])

        if (isCollateral) {
          return { address, ...metadata }
        }
        return null
      })
    )

    return results.filter((asset): asset is CollateralAsset => asset !== null)
  }
}
