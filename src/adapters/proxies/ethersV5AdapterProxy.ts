import { ProviderAdapter, TransactionResponse } from '../../types'
import type { providers as EthersV5Providers } from 'ethers-v5'

/**
 * Proxy class that implements lazy loading for ethers v5 provider adapter.
 *
 * This is an implementation of the Virtual Proxy pattern, which provides
 * a placeholder for the EthersV5Adapter and controls its initialization.
 * The actual adapter is only loaded when needed, allowing for:
 * - Lazy loading of the ethers v5 dependency
 * - Better error handling for missing dependencies
 * - Same interface as the real adapter (ProviderAdapter)
 *
 * For more information about the proxy pattern implementation,
 * see the README.md in this directory:
 * ./adapters/proxies/README.md
 */
export class EthersV5AdapterProxy implements ProviderAdapter {
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
  
  async writeContract(...args: Parameters<ProviderAdapter['writeContract']>): Promise<TransactionResponse> {
    await this.initPromise
    if (!this.adapter) {
      throw new Error(
        'Adapter not initialized. Are you missing ethers v5 dependency?'
      )
    }
    return this.adapter.writeContract(...args)
  }

  async getChainId() {
    await this.initPromise
    if (!this.adapter) {
      throw new Error(
        'Adapter not initialized. Are you missing ethers v5 dependency?'
      )
    }
    return this.adapter.getChainId()
  }
}
