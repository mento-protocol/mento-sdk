import type { PublicClient } from 'viem'
import type { Provider as EthersV6Provider } from 'ethers'
import type { providers as EthersV5Providers } from 'ethers-v5'

import { EthersAdapter, EthersV5Adapter, ViemAdapter } from './adapters'
import { CollateralAsset, ProviderAdapter, StableToken } from './types'
import { CollateralAssetService, StableTokenService } from './services'

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
  // Check for v5 specific properties that don't exist in v6
  return (
    'getNetwork' in provider &&
    '_network' in provider &&
    // v5 specific internal property
    'formatter' in provider
  )
}

/** Helper type guard for Ethers v6 Provider */
function isEthersV6Provider(
  provider: SupportedProvider
): provider is EthersV6Provider {
  // Check for v6 specific properties that don't exist in v5
  return (
    'getNetwork' in provider &&
    // v6 specific methods
    'broadcastTransaction' in provider
  )
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
  private stableTokenService: StableTokenService
  private collateralAssetService: CollateralAssetService

  private constructor(
    provider: ProviderAdapter,
    stableTokenService: StableTokenService,
    collateralAssetService: CollateralAssetService
  ) {
    this.provider = provider
    this.stableTokenService = stableTokenService
    this.collateralAssetService = collateralAssetService
  }

  public static async create(config: MentoConfig): Promise<Mento> {
    if (!config.provider) {
      throw new Error('Provider is required to initialize Mento SDK')
    }

    // Initialize provider adapter based on provider type
    let provider: ProviderAdapter
    if (isEthersV5Provider(config.provider)) {
      provider = new EthersV5Adapter(config.provider)
    } else if (isEthersV6Provider(config.provider)) {
      provider = new EthersAdapter(config.provider)
    } else if (isViemProvider(config.provider)) {
      provider = new ViemAdapter(config.provider)
    } else {
      throw new Error('Unsupported provider type')
    }

    // Initialize everything we need
    const stableTokenService = new StableTokenService(provider)
    const collateralAssetService = new CollateralAssetService(provider)

    // Return fully initialized instance
    return new Mento(provider, stableTokenService, collateralAssetService)
  }

  public async getStableTokens(): Promise<StableToken[]> {
    return this.stableTokenService.getStableTokens()
  }

  public async getCollateralAssets(): Promise<CollateralAsset[]> {
    return this.collateralAssetService.getCollateralAssets()
  }
}

// Export types that consumers might need
export * from './constants'
export * from './types'
export * from './adapters'
export * from './services'
