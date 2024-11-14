import { parseAbi, type PublicClient } from 'viem'
import type { ContractCallOptions, ProviderAdapter } from '../../types'

export class ViemAdapter implements ProviderAdapter {
  constructor(private client: PublicClient) {}

  async readContract(options: ContractCallOptions): Promise<unknown> {
    // Check if the abi is a string array(human readable format) or an array of objects(the normal format)
    const abi =
      Array.isArray(options.abi) && typeof options.abi[0] === 'string'
        ? parseAbi(options.abi as string[])
        : options.abi

    return await this.client.readContract({
      address: options.address as `0x${string}`,
      abi: abi,
      functionName: options.functionName,
      args: options.args,
    })
  }

  async getChainId(): Promise<number> {
    return await this.client.getChainId()
  }
}
