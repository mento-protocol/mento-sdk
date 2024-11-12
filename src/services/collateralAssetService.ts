import { BIPOOL_MANAGER_ABI, ERC20_ABI, RESERVE_ABI } from 'abis'
import { CollateralAsset, Exchange, ProviderAdapter } from 'types'
import { getContractAddress } from '../constants'

//TODO: Update paths in tsconfig.json to use @

export class CollateralAssetService {
  constructor(private provider: ProviderAdapter) {}

  async getCollateralAssets(): Promise<CollateralAsset[]> {
    const chainId = await this.provider.getChainId()
    const biPoolManagerAddress = getContractAddress(chainId, 'BiPoolManager')
    const reserveAddress = getContractAddress(chainId, 'Reserve')

    // Get all exchanges from BiPoolManager
    const exchanges = (await this.provider.readContract({
      address: biPoolManagerAddress,
      abi: BIPOOL_MANAGER_ABI,
      functionName: 'getExchanges',
    })) as Exchange[]

    // Extract unique token addresses from all exchanges
    const uniqueAddresses = new Set<string>()
    for (const exchange of exchanges) {
      exchange.assets.forEach((address) => uniqueAddresses.add(address))
    }

    // Check which tokens are collateral assets and get their info
    const assets: CollateralAsset[] = []
    for (const address of uniqueAddresses) {
      try {
        const isCollateral = (await this.provider.readContract({
          address: reserveAddress,
          abi: RESERVE_ABI,
          functionName: 'isCollateralAsset',
          args: [address],
        })) as boolean

        if (isCollateral) {
          const [name, symbol, decimals] = await Promise.all([
            this.provider.readContract({
              address,
              abi: ERC20_ABI,
              functionName: 'name',
            }),
            this.provider.readContract({
              address,
              abi: ERC20_ABI,
              functionName: 'symbol',
            }),
            this.provider.readContract({
              address,
              abi: ERC20_ABI,
              functionName: 'decimals',
            }),
          ])

          assets.push({
            address,
            name: name as string,
            symbol: symbol as string,
            decimals: Number(decimals),
          })
        }
      } catch (error) {
        // TODO: impement retry logic.
        // One call cannot fail, if one fails, the whole operation should fail.
        console.error(`Error processing address ${address}:`, error)
      }
    }

    return assets
  }
}
