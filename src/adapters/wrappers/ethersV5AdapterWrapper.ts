import { ProviderAdapter } from '../../types'
import type { providers as EthersV5Providers } from 'ethers-v5'

/**
 * Wrapper class that implements lazy loading for ethers v5 provider adapter.
 *
 * Why do we need this?
 * Read the README.md in this directory for more information
 * ./adapters/wrappers/README.md
 */
export class EthersV5AdapterWrapper implements ProviderAdapter {
  private adapter: ProviderAdapter | null = null
  private initPromise: Promise<void>

  constructor(provider: EthersV5Providers.Provider) {
    this.initPromise = this.initialize(provider)
  }

  private async initialize(provider: EthersV5Providers.Provider) {
    try {
      const { EthersV5Adapter } = await import(
        '../implementations/ethersV5Adapter'
      )
      this.adapter = new EthersV5Adapter(provider)
    } catch (error) {
      throw new Error(
        'ethers v5 is not installed. Please install ethers@5 to use this adapter'
      )
    }
  }

  async readContract(...args: Parameters<ProviderAdapter['readContract']>) {
    await this.initPromise
    if (!this.adapter) {
      throw new Error(
        'Adapter not initialized. Are you missing ethers v5 dependency?'
      )
    }
    return this.adapter.readContract(...args)
  }

  async getChainId() {
    if (!this.adapter) {
      throw new Error(
        'Adapter not initialized. Are you missing ethers v5 dependency?'
      )
    }
    return this.adapter.getChainId()
  }
}
