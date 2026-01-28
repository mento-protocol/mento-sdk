import { RESERVE_ABI, BIPOOL_MANAGER_ABI, ERC20_ABI } from '../../core/abis'
import { Token, StableToken, CollateralAsset } from '../../core/types'

// Legacy Exchange type for BiPoolManager v2 responses
interface Exchange {
  exchangeId: string
  assets: readonly `0x${string}`[]
}
import {
  getContractAddress,
  RESERVE,
  BIPOOLMANAGER,
} from '../../core/constants'
import { retryOperation } from '../../utils'
import type { PublicClient } from 'viem'

export class TokenService {
  constructor(private publicClient: PublicClient, private chainId: number) {}

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
   * Get all stable tokens from the Reserve contract
   * Returns the actual on-chain ERC20 totalSupply values without adjustments.
   * @param includeSupply - Whether to fetch total supply
   * @returns Array of stable tokens
   */
  public async getStableTokens(includeSupply = true): Promise<StableToken[]> {
    const reserveAddress = getContractAddress(this.chainId, RESERVE)

    const tokenAddresses = (await this.publicClient.readContract({
      address: reserveAddress as `0x${string}`,
      abi: RESERVE_ABI,
      functionName: 'getTokens',
      args: [],
    })) as string[]

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
   * Get all collateral assets from exchanges
   * Filters tokens that are marked as collateral in the Reserve contract
   * @returns Array of collateral assets
   */
  public async getCollateralAssets(): Promise<CollateralAsset[]> {
    const biPoolManagerAddress = getContractAddress(this.chainId, BIPOOLMANAGER)
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
