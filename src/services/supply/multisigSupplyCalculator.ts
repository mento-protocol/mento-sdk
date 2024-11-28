import { ERC20_ABI } from '../../abis'
import { ProviderAdapter } from '../../types'
import { ISupplyCalculator } from './ISupplyCalculator'

export class MultisigSupplyCalculator implements ISupplyCalculator {
  constructor(
    private provider: ProviderAdapter,
    private multisigAddress: string
  ) {}

  async getAmount(tokenAddress: string): Promise<bigint> {
    const balance = (await this.provider.readContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [this.multisigAddress],
    })) as bigint

    return balance
  }
}
