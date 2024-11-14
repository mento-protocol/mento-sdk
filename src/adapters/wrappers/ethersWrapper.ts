import { ProviderAdapter } from '../../types'
import type { Provider as EthersV6Provider } from 'ethers'

/**
 * Wrapper class that implements lazy loading for ethers v6 provider adapter.
 *
 * Why do we need this?
 *
 * Read the README.md in this directory for more information
 * ./adapters/wrappers/README.md
 */
export class EthersAdapterWrapper implements ProviderAdapter {
  private adapter: ProviderAdapter | null = null
  private initPromise: Promise<void>

  constructor(provider: EthersV6Provider) {
    this.initPromise = this.initialize(provider)
  }

  private async initialize(provider: EthersV6Provider) {
    try {
      const { EthersAdapter } = await import('../implementations/ethersAdapter')
      this.adapter = new EthersAdapter(provider)
    } catch (error) {
      throw new Error(
        'ethers v6 is not installed. Please install ethers@6 to use this adapter'
      )
    }
  }

  async readContract(...args: Parameters<ProviderAdapter['readContract']>) {
    await this.initPromise
    if (!this.adapter) {
      throw new Error(
        'Adapter not initialized. Are you missing ethers v6 dependency?'
      )
    }
    return this.adapter.readContract(...args)
  }

  async getChainId() {
    await this.initPromise
    if (!this.adapter) {
      throw new Error(
        'Adapter not initialized. Are you missing ethers v6 dependency?'
      )
    }
    return this.adapter.getChainId()
  }
}
