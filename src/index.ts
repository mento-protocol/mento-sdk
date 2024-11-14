import type { PublicClient } from 'viem'
import type { Provider as EthersV6Provider } from 'ethers'
import type { providers as EthersV5Providers } from 'ethers-v5'

import { EthersAdapter, EthersV5Adapter, ViemAdapter } from './adapters'
import {
  CollateralAsset,
  ContractAddresses,
  ProviderAdapter,
  StableToken,
} from './types'
import { CollateralAssetService, StableTokenService } from './services'
import { ChainId } from './constants/chainId'
import { addresses } from './constants/addresses'

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
 *              and provides a public API for interacting with the Mento Protocol.
 * @dev         example usage:
 *              // Ethers v6
 *              const mento = await Mento.create({
 *                provider: new ethers.JsonRpcProvider("https://forno.celo.org")
 *              });
 *
 *              // Ethers v5
 *              const mento = await Mento.create({
 *                provider: new ethersV5.providers.JsonRpcProvider("https://forno.celo.org")
 *              });
 *
 *              // Viem
 *              const mento = await Mento.create({
 *                provider: createPublicClient({
 *                  transport: http("https://forno.celo.org")
 *                })
 *              });
 *
 *              // Get all stable tokens
 *              const stableTokens = await mento.getStableTokens();
 *
 *              // Get all collateral assets
 *              const collateralAssets = await mento.getCollateralAssets();
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

  /**
   * Get all collateral assets that are available on the current chain.
   * @returns An array of collateral assets
   */
  public async getCollateralAssets(): Promise<CollateralAsset[]> {
    return this.collateralAssetService.getCollateralAssets()
  }

  /**
   * Get the address of a contract for the current chain
   * @param contractName - The contract name
   * @returns The contract address
   */
  public async getContractAddress(
    contractName: keyof ContractAddresses
  ): Promise<string> {
    const chainId = (await this.provider.getChainId()) as ChainId
    return addresses[chainId][contractName]
  }
}

// Export types that consumers might need
export * from './constants'
export * from './types'
export * from './adapters'
export * from './services'
export * from './abis'