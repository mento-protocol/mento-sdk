import { RESERVE_ABI } from '../abis'
import {
  getContractAddress,
  getFiatTicker,
  StableTokenSymbol,
} from '../constants'
import { ProviderAdapter, StableToken } from '../types'
import { TokenMetadataService } from './tokenMetadataService'

export class StableTokenService {
  private tokenMetadataService: TokenMetadataService

  constructor(private provider: ProviderAdapter) {
    this.tokenMetadataService = new TokenMetadataService(provider)
  }

  async getStableTokens(): Promise<StableToken[]> {
    const chainId = await this.provider.getChainId()
    const reserveAddress = getContractAddress(chainId, 'Reserve')

    const tokenAddresses = (await this.provider.readContract({
      address: reserveAddress,
      abi: RESERVE_ABI,
      functionName: 'getTokens',
    })) as string[]

    const tokens: StableToken[] = []

    for (const address of tokenAddresses) {
      const metadata = await this.tokenMetadataService.getTokenMetadata(address)
      const totalSupply = await this.tokenMetadataService.getTotalSupply(
        address
      )

      const token = {
        address,
        ...metadata,
        totalSupply,
        fiatTicker: getFiatTicker(metadata.symbol as StableTokenSymbol),
      }

      tokens.push(token)
    }

    return tokens
  }
}
