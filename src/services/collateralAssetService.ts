import { BIPOOL_MANAGER_ABI, RESERVE_ABI } from '../abis'
import { CollateralAsset, Exchange } from '../types'
import { BIPOOLMANAGER, getContractAddress, RESERVE } from '../constants'
import { retryOperation } from '../utils'
import { TokenMetadataService } from './tokenMetadataService'
import type { PublicClient } from 'viem'

export class CollateralAssetService {
  private tokenMetadataService: TokenMetadataService

  constructor(private publicClient: PublicClient, private chainId: number) {
    this.tokenMetadataService = new TokenMetadataService(publicClient)
  }

  async getCollateralAssets(): Promise<CollateralAsset[]> {
    const biPoolManagerAddress = getContractAddress(
      this.chainId,
      BIPOOLMANAGER
    )
    const reserveAddress = getContractAddress(this.chainId, RESERVE)

    const exchanges = (await retryOperation(() =>
      this.publicClient.readContract({
        address: biPoolManagerAddress as `0x${string}`,
        abi: BIPOOL_MANAGER_ABI,
        functionName: 'getExchanges',
      })
    )) as Exchange[]

    const uniqueAddresses = new Set<string>()
    for (const exchange of exchanges) {
      exchange.assets.forEach((address) => uniqueAddresses.add(address))
    }

    // Check which tokens are collateral assets and get their info
    const assets: CollateralAsset[] = []
    for (const address of uniqueAddresses) {
      const isCollateral = (await retryOperation(() =>
        this.publicClient.readContract({
          address: reserveAddress as `0x${string}`,
          abi: RESERVE_ABI,
          functionName: 'isCollateralAsset',
          args: [address],
        })
      )) as boolean

      if (isCollateral) {
        const metadata = await this.tokenMetadataService.getTokenMetadata(
          address
        )
        assets.push({
          address,
          ...metadata,
        })
      }
    }

    return assets
  }
}
