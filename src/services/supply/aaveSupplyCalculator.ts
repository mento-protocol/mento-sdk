import { ISupplyCalculator } from './ISupplyCalculator'
import { ProviderAdapter } from '../../types'
import { ERC20_ABI } from '../../abis'
import { AAVE_TOKEN_MAPPINGS } from '../../constants'

/**
 * Calculates the amount of tokens supplied to AAVE protocol.
 *
 * When tokens are supplied to AAVE, the protocol mints corresponding "aTokens"
 * as receipt tokens. The balance of the aTokens represents the total
 * amount of the original token supplied to the protocol.
 */
export class AAVESupplyCalculator implements ISupplyCalculator {

  constructor(
    private readonly provider: ProviderAdapter,
    private holderAddresses: string[]
  ) {}

  /**
   * Gets the balance of the corresponding aToken for the specified token address that is held by the holder addresses.
   * @param tokenAddress - The address of the token to get the balance for.
   * @returns The balance of the corresponding aToken.
   */
  async getAmount(tokenAddress: string): Promise<bigint> {
    const chainId = await this.provider.getChainId()

    const chainMappings = AAVE_TOKEN_MAPPINGS[chainId]
    if (!chainMappings) {
      return 0n // No mappings for this chain, return 0
    }
    const aTokenAddress = chainMappings[tokenAddress]
    if (!aTokenAddress) {
      return 0n // No aToken mapping for this token, return 0
    }

    const balances = await Promise.all(
      this.holderAddresses.map(async (holderAddress) => {
        const balance = (await this.provider.readContract({
          address: aTokenAddress,
          abi: ERC20_ABI,
          functionName: 'balanceOf',
          args: [holderAddress],
        })) as bigint

        return balance
      })
    )

    return balances.reduce((acc, balance) => acc + balance, 0n)
  }
}
