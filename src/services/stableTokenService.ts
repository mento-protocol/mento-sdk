import { ERC20_ABI, RESERVE_ABI } from '../abis'
import { getContractAddress } from '../constants'
import { ProviderAdapter, StableToken } from '../types'

export class StableTokenService {
  constructor(private provider: ProviderAdapter) {}

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
      try {
        const [name, symbol, decimals, totalSupply] = await Promise.all([
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
          this.provider.readContract({
            address,
            abi: ERC20_ABI,
            functionName: 'totalSupply',
          }),
        ])

        tokens.push({
          address,
          name: name as string,
          symbol: symbol as string,
          decimals: Number(decimals),
          totalSupply: (totalSupply as bigint).toString(),
        })
      } catch (error) {
        // TODO: impement retry logic.
        // One call cannot fail, if one fails, the whole operation should fail.
        console.error(`Error fetching token info for ${address}:`, error)
      }
    }

    return tokens
  }
}
