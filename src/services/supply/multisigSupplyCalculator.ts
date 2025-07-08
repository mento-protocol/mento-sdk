import { ERC20_ABI } from '../../abis'
import { ProviderAdapter } from '../../types'
import { ISupplyCalculator } from './ISupplyCalculator'

export class MultisigSupplyCalculator implements ISupplyCalculator {
  constructor(
    private provider: ProviderAdapter,
    private multisigAddresses: string[]
  ) {}

  async getAmount(tokenAddress: string): Promise<bigint> {
    const balancePromises = this.multisigAddresses.map(async (multisigAddress) => {
      try {
        const balance = (await this.provider.readContract({
          address: tokenAddress,
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
    })

    const balances = await Promise.all(balancePromises)
    return balances.reduce((sum, balance) => sum + balance, BigInt(0))
  }
}
