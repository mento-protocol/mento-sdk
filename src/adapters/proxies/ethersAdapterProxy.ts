import { ProviderAdapter } from '../../types'
import type { Provider as EthersV6Provider } from 'ethers'

/**
 * Proxy class that implements lazy loading for ethers provider adapter.
 *
 * This is an implementation of the Virtual Proxy pattern, which provides
 * a placeholder for the EthersAdapter and controls its initialization.
 * The actual adapter is only loaded when needed, allowing for:
 * - Lazy loading of the ethers dependency
 * - Better error handling for missing dependencies
 * - Same interface as the real adapter (ProviderAdapter)
 *
 * For more information about the proxy pattern implementation,
 * see the README.md in this directory:
 * ./adapters/proxies/README.md
 */
export class EthersAdapterProxy implements ProviderAdapter {
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
