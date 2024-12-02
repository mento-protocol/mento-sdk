import { ProviderAdapter, IERC20Token } from '../types'
import { ERC20_ABI } from '../abis'
import { retryOperation } from '../utils'

export class TokenMetadataService {
  constructor(private provider: ProviderAdapter) {}

  async getTokenMetadata(address: string): Promise<IERC20Token> {
    const [name, symbol, decimals] = await Promise.all([
      retryOperation(() =>
        this.provider.readContract({
          address,
          abi: ERC20_ABI,
          functionName: 'name',
        })
      ),
      retryOperation(() =>
        this.provider.readContract({
          address,
          abi: ERC20_ABI,
          functionName: 'symbol',
        })
      ),
      retryOperation(() =>
        this.provider.readContract({
          address,
          abi: ERC20_ABI,
          functionName: 'decimals',
        })
      ),
    ])

    return {
      address,
      name: name as string,
      symbol: symbol as string,
      decimals: Number(decimals),
    }
  }

  async getTokensMetadata(
    addresses: string[]
  ): Promise<Map<string, IERC20Token>> {
    const uniqueAddresses = Array.from(new Set(addresses))

    const metadataMap = new Map<string, IERC20Token>()

    await Promise.all(
      uniqueAddresses.map(async (address) => {
        const metadata = await this.getTokenMetadata(address)
        metadataMap.set(address, metadata)
      })
    )

    return metadataMap
  }

  async getTotalSupply(address: string): Promise<string> {
    const totalSupply = await retryOperation(() =>
      this.provider.readContract({
        address,
        abi: ERC20_ABI,
        functionName: 'totalSupply',
      })
    )

    return (totalSupply as bigint).toString()
  }
}
