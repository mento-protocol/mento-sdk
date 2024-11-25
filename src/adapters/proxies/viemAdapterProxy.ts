import type { PublicClient } from 'viem'
import { ProviderAdapter } from '../../types'

/**
 * Proxy class that implements lazy loading for viem provider adapter.
 * 
 * This is an implementation of the Virtual Proxy pattern, which provides
 * a placeholder for the ViemAdapter and controls its initialization.
 * The actual adapter is only loaded when needed, allowing for:
 * - Lazy loading of the viem dependency
 * - Better error handling for missing dependencies
 * - Same interface as the real adapter (ProviderAdapter)
 * 
 * For more information about the proxy pattern implementation,
 * see the README.md in this directory:
 * ./adapters/proxies/README.md
 */
export class ViemAdapterProxy implements ProviderAdapter {
  private adapter: ProviderAdapter | null = null
  private initPromise: Promise<void>

  constructor(client: PublicClient) {
    this.initPromise = this.initialize(client)
  }

  private async initialize(client: PublicClient) {
    try {
      const { ViemAdapter } = await import('../implementations/viemAdapter')
      this.adapter = new ViemAdapter(client)
    } catch (error) {
      throw new Error(
        'viem is not installed. Please install viem to use this adapter'
      )
    }
  }

  async readContract(...args: Parameters<ProviderAdapter['readContract']>) {
    await this.initPromise
    if (!this.adapter) {
      throw new Error(
        'Adapter not initialized. Are you missing viem dependency?'
      )
    }
    return this.adapter.readContract(...args)
  }

  async getChainId() {
    await this.initPromise
    if (!this.adapter) {
      throw new Error(
        'Adapter not initialized. Are you missing viem dependency?'
      )
    }
    return this.adapter.getChainId()
  }
}
