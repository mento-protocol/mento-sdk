import { RESERVE_ABI } from '../abis'
import { getContractAddress, RESERVE } from '../constants'
import { ProviderAdapter, StableToken } from '../types'
import { TokenMetadataService } from './tokenMetadataService'

export class StableTokenService {
  private tokenMetadataService: TokenMetadataService

  constructor(private provider: ProviderAdapter) {
    this.tokenMetadataService = new TokenMetadataService(provider)
  }

  async getStableTokens(): Promise<StableToken[]> {
    const chainId = await this.provider.getChainId()
    const reserveAddress = getContractAddress(chainId, RESERVE)

    const tokenAddresses = (await this.provider.readContract({
      address: reserveAddress,
      abi: RESERVE_ABI,
      functionName: 'getTokens',
    })) as string[]

    const tokens = await Promise.all(
      tokenAddresses.map(async (address) => {
        const [metadata, totalSupply] = await Promise.all([
          this.tokenMetadataService.getTokenMetadata(address),
          this.tokenMetadataService.getTotalSupply(address),
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
}
