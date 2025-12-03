import { ERC20_ABI } from '../../../core/abis'
import { ISupplyCalculator } from './ISupplyCalculator'
import type { PublicClient } from 'viem'

export class MultisigSupplyCalculator implements ISupplyCalculator {
  constructor(
    private publicClient: PublicClient,
    private multisigAddresses: string[]
  ) {}

  async getAmount(tokenAddress: string): Promise<bigint> {
    const balancePromises = this.multisigAddresses.map(
      async (multisigAddress) => {
        try {
          const balance = (await this.publicClient.readContract({
            address: tokenAddress as `0x${string}`,
            abi: ERC20_ABI,
            functionName: 'balanceOf',
            args: [multisigAddress],
          })) as bigint
          return balance
        } catch (error) {
          // TODO: Failures are silent here which could lead to
          //       incorrect supply calculations. This will be addressed
          //       in the V2 release.
          return BigInt(0)
        }
      }
    )

    const balances = await Promise.all(balancePromises)
    return balances.reduce((sum, balance) => sum + balance, BigInt(0))
  }
}
