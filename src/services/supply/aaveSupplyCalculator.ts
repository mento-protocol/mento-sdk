import { ISupplyCalculator } from './ISupplyCalculator'
import { ERC20_ABI } from '../../abis'
import { AAVE_TOKEN_MAPPINGS } from '../../constants'
import type { PublicClient } from 'viem'

/**
 * Calculates the amount of tokens supplied to AAVE protocol.
 *
 * When tokens are supplied to AAVE, the protocol mints corresponding "aTokens"
 * as receipt tokens. The balance of the aTokens represents the total
 * amount of the original token supplied to the protocol.
 */
export class AAVESupplyCalculator implements ISupplyCalculator {
  constructor(
    private readonly publicClient: PublicClient,
    private readonly chainId: number,
    private holderAddresses: string[]
  ) {}

  /**
   * Gets the balance of the corresponding aToken for the specified token address that is held by the holder addresses.
   * @param tokenAddress - The address of the token to get the balance for.
   * @returns The balance of the corresponding aToken.
   */
  async getAmount(tokenAddress: string): Promise<bigint> {
    const chainMappings = AAVE_TOKEN_MAPPINGS[this.chainId]
    if (!chainMappings) {
      return 0n // No mappings for this chain, return 0
    }
    const aTokenAddress = chainMappings[tokenAddress]
    if (!aTokenAddress) {
      return 0n // No aToken mapping for this token, return 0
    }

    const balances = await Promise.all(
      this.holderAddresses.map(async (holderAddress) => {
        const balance = (await this.publicClient.readContract({
          address: aTokenAddress as `0x${string}`,
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
