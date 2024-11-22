import { BIPOOL_MANAGER_ABI, RESERVE_ABI } from '../abis'
import { CollateralAsset, Exchange, ProviderAdapter } from '../types'
import { getContractAddress } from '../constants'
import { retryOperation } from '../utils'
import { TokenMetadataService } from './tokenMetadataService'

export class CollateralAssetService {
  private tokenMetadataService: TokenMetadataService

  constructor(private provider: ProviderAdapter) {
    this.tokenMetadataService = new TokenMetadataService(provider)
  }

  async getCollateralAssets(): Promise<CollateralAsset[]> {
    const chainId = await this.provider.getChainId()
    const biPoolManagerAddress = getContractAddress(chainId, 'BiPoolManager')
    const reserveAddress = getContractAddress(chainId, 'Reserve')

    const exchanges = (await retryOperation(() =>
      this.provider.readContract({
        address: biPoolManagerAddress,
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
        this.provider.readContract({
          address: reserveAddress,
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
