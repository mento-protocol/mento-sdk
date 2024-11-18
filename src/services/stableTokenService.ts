import { ERC20_ABI, RESERVE_ABI } from '../abis'
import {
  getContractAddress,
  getFiatTicker,
  StableTokenSymbol,
} from '../constants'
import { ProviderAdapter, StableToken } from '../types'
import { retryOperation } from '../utils/retry'

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
      const [name, symbol, decimals, totalSupply] = await Promise.all([
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
        retryOperation(() =>
          this.provider.readContract({
            address,
            abi: ERC20_ABI,
            functionName: 'totalSupply',
          })
        ),
      ])

      tokens.push({
        address,
        name: name as string,
        symbol: symbol as string,
        decimals: Number(decimals),
        totalSupply: (totalSupply as bigint).toString(),
        fiatTicker: getFiatTicker(symbol as StableTokenSymbol),
      })
    }

    return tokens
  }
}
