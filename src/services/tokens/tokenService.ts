import { RESERVE_ABI, BIPOOL_MANAGER_ABI, ERC20_ABI } from '../../core/abis'
import {
  BaseToken,
  StableToken,
  CollateralAsset,
} from '../../core/types'

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
import { SupplyAdjustmentService } from './supplyAdjustmentService'
import { DefaultCalculatorFactory } from './supply'
import type { PublicClient } from 'viem'

export class TokenService {
  private supplyAdjustmentService: SupplyAdjustmentService

  constructor(private publicClient: PublicClient, private chainId: number) {
    this.supplyAdjustmentService = new SupplyAdjustmentService(
      publicClient,
      chainId,
      new DefaultCalculatorFactory()
    )
  }

  /**
   * Get token metadata (name, symbol, decimals)
   * @param address - Token contract address
   * @returns Token metadata
   */
  private async getTokenMetadata(
    address: string
  ): Promise<Pick<BaseToken, 'name' | 'symbol' | 'decimals'>> {
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
   * @param includeSupply - Whether to fetch total supply and apply adjustments
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

    const tokens: StableToken[] = []

    for (const address of tokenAddresses) {
      const metadata = await this.getTokenMetadata(address)

      let totalSupply = '0'
      if (includeSupply) {
        totalSupply = await this.getTotalSupply(address)
      }

      const token: StableToken = {
        address,
        ...metadata,
        totalSupply,
      }

      if (includeSupply) {
        const adjustedSupply =
          await this.supplyAdjustmentService.getAdjustedSupply(token)
        token.totalSupply = adjustedSupply
      }

      tokens.push(token)
    }

    return tokens
  }

  // TODO: V3 - How does USD.m fit in here?
  /**
   * Get all collateral assets from exchanges
   * Filters tokens that are marked as collateral in the Reserve contract
   * @returns Array of collateral assets
   */
  public async getCollateralAssets(): Promise<CollateralAsset[]> {
    const biPoolManagerAddress = getContractAddress(this.chainId, BIPOOLMANAGER)
    const reserveAddress = getContractAddress(this.chainId, RESERVE)

    // TODO: V3 - Should instead use the factories.
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

    // Check which tokens are collateral assets and get their metadata
    const assets: CollateralAsset[] = []
    for (const address of uniqueAddresses) {
      const isCollateral = (await retryOperation(() =>
        this.publicClient.readContract({
          address: reserveAddress as `0x${string}`,
          abi: RESERVE_ABI,
          functionName: 'isCollateralAsset',
          args: [address as `0x${string}`],
        })
      )) as boolean

      if (isCollateral) {
        const metadata = await this.getTokenMetadata(address)
        assets.push({
          address,
          ...metadata,
        })
      }
    }

    return assets
  }
}
