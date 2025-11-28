import { BaseToken } from '../types'
import { ERC20_ABI } from '../abis'
import { retryOperation } from '../utils'
import type { PublicClient } from 'viem'

export class TokenMetadataService {
  constructor(private publicClient: PublicClient) {}

  async getTokenMetadata(
    address: string
  ): Promise<Pick<BaseToken, 'name' | 'symbol' | 'decimals'>> {
    const [name, symbol, decimals] = await Promise.all([
      retryOperation(() =>
        this.publicClient.readContract({
          address: address as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'name',
        })
      ),
      retryOperation(() =>
        this.publicClient.readContract({
          address: address as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'symbol',
        })
      ),
      retryOperation(() =>
        this.publicClient.readContract({
          address: address as `0x${string}`,
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
      this.publicClient.readContract({
        address: address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'totalSupply',
      })
    )

    return (totalSupply as bigint).toString()
  }
}
