import { Contract, providers, ContractInterface } from 'ethers-v5'
import { ContractCallOptions, ProviderAdapter } from '../../types'

export class EthersV5Adapter implements ProviderAdapter {
  constructor(private provider: providers.Provider) {}

  async readContract(options: ContractCallOptions): Promise<unknown> {
    const contract = new Contract(
      options.address,
      options.abi as string[] | ContractInterface,
      this.provider
    )
    return await contract[options.functionName](...(options.args || []))
  }

  async getChainId(): Promise<number> {
    const network = await this.provider.getNetwork()
    return Number(network.chainId)
  }
}
