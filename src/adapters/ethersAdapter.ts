import { Contract, Interface, Provider as EthersProvider } from 'ethers'
import { ContractCallOptions, ProviderAdapter } from 'types'

export class EthersAdapter implements ProviderAdapter {
  constructor(private provider: EthersProvider) {}

  async readContract(options: ContractCallOptions): Promise<unknown> {
    const contract = new Contract(
      options.address,
      options.abi as string[] | Interface,
      this.provider
    )
    return await contract[options.functionName](...(options.args || []))
  }

  async getChainId(): Promise<number> {
    const network = await this.provider.getNetwork()
    return Number(network.chainId)
  }
}
