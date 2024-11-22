import { ProviderAdapter, BaseToken } from '../types'
import { ERC20_ABI } from '../abis'
import { retryOperation } from '../utils'

export class TokenMetadataService {
  constructor(private provider: ProviderAdapter) {}

  async getTokenMetadata(
    address: string
  ): Promise<Pick<BaseToken, 'name' | 'symbol' | 'decimals'>> {
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
      name: name as string,
      symbol: symbol as string,
      decimals: Number(decimals),
    }
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
