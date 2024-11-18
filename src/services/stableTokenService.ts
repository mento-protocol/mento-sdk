import { ERC20_ABI, RESERVE_ABI } from '../abis'
import {
  getContractAddress,
  getFiatTicker,
  StableTokenSymbol,
} from '../constants'
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
      let attempts = 0
      const maxAttempts = 3
      const backoffMs = 1000 // Start with 1 second

      while (attempts < maxAttempts) {
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
            fiatTicker: getFiatTicker(symbol as StableTokenSymbol),
          })
          break // Success, exit retry loop
        } catch (error) {
          attempts++
          if (attempts === maxAttempts) {
            throw new Error(
              `Failed to fetch token info for ${address} after ${maxAttempts} attempts: ${error}`
            )
          }
          // Exponential backoff
          await new Promise((resolve) =>
            setTimeout(resolve, backoffMs * attempts)
          )
        }
      }
    }

    return tokens
  }
}
