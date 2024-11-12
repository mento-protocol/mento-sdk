import type { PublicClient } from 'viem'
import type { Provider as EthersV6Provider } from 'ethers'
import type { providers as EthersV5Providers } from 'ethers-v5'

import { EthersAdapter, EthersV5Adapter, ViemAdapter } from 'adapters'
import { ProviderAdapter } from 'types'
import { CollateralAssetService, StableTokenService } from 'services'

export type SupportedProvider =
  | EthersV6Provider
  | PublicClient
  | EthersV5Providers.Provider

export interface MentoConfig {
  /** Provider can be one of:
   * - Ethers v6 Provider (from 'ethers')
   * - Ethers v5 Provider (from 'ethers-v5')
   * - Viem PublicClient (from 'viem')
   */
  provider: SupportedProvider
}

/** Helper type guard for Ethers v5 Provider */
function isEthersV5Provider(
  provider: SupportedProvider
): provider is EthersV5Providers.Provider {
  return 'getNetwork' in provider && '_network' in provider
}

/** Helper type guard for Ethers v6 Provider */
function isEthersV6Provider(
  provider: SupportedProvider
): provider is EthersV6Provider {
  return 'getNetwork' in provider && !('_network' in provider)
}

/** Helper type guard for Viem Provider */
function isViemProvider(provider: SupportedProvider): provider is PublicClient {
  return !('getNetwork' in provider)
}

/**
 * @class Mento
 * @description The main class for the Mento SDK. It initializes the provider and services,
 *              and provides a public API for accessing the services.
 * @dev         example usage:
 *              // Ethers v6
 *              const mento = new Mento({ provider: new ethers.JsonRpcProvider("https://forno.celo.org") });
 *
 *              // Ethers v5
 *              const mento = new Mento({ provider: new ethersV5.providers.JsonRpcProvider("https://forno.celo.org") });
 *
 *              // Viem
 *              const mento = new Mento({ provider: createPublicClient({ transport: http("https://forno.celo.org") }) });
 *
 *              const stableTokens = await mento.stable.getStableTokens();
 */
export class Mento {
  private provider: ProviderAdapter
  private stableTokenService!: StableTokenService
  private collateralAssetService!: CollateralAssetService
  private chainId!: number
  private initialized = false

  constructor(config: MentoConfig) {
    if (!config.provider) {
      throw new Error('Provider is required to initialize Mento SDK')
    }

    // Initialize provider adapter based on provider type
    if (isEthersV5Provider(config.provider)) {
      this.provider = new EthersV5Adapter(config.provider)
    } else if (isEthersV6Provider(config.provider)) {
      this.provider = new EthersAdapter(config.provider)
    } else if (isViemProvider(config.provider)) {
      this.provider = new ViemAdapter(config.provider)
    } else {
      throw new Error('Unsupported provider type')
    }

    // Initialize services
    this.initializeServices().catch((error) => {
      console.error('Failed to initialize Mento services:', error)
    })
  }

  private async initializeServices(): Promise<void> {
    if (this.initialized) {
      return
    }

    // Get chainId from provider
    this.chainId = await this.provider.getChainId()

    this.stableTokenService = new StableTokenService(this.provider)
    this.collateralAssetService = new CollateralAssetService(this.provider)

    this.initialized = true
  }

  private ensureInitialized() {
    if (!this.initialized) {
      throw new Error(
        'Mento SDK not initialized. Services are being initialized.'
      )
    }
  }

  // Public API methods
  public get stable(): StableTokenService {
    this.ensureInitialized()
    return this.stableTokenService
  }

  public get collateral(): CollateralAssetService {
    this.ensureInitialized()
    return this.collateralAssetService
  }

  // Convenience method to get current chainId
  public getChainId(): number {
    this.ensureInitialized()
    return this.chainId
  }
}

// Export types that consumers might need
export * from './constants'
export * from './types'
export * from './adapters'
export * from './services'
