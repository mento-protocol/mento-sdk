import type { PublicClient } from 'viem'
import { ProviderAdapter } from '../../types'

/**
 * Wrapper class that implements lazy loading for viem provider adapter.
 *
 * Why do we need this?
 * Read the README.md in this directory for more information
 * ./adapters/wrappers/README.md
 */
export class ViemAdapterWrapper implements ProviderAdapter {
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
