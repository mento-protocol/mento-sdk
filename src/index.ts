import type { PublicClient } from 'viem'
import type { Provider as EthersV6Provider } from 'ethers'

import { EthersAdapter, ViemAdapter } from './adapters'
import {
  CollateralAsset,
  ContractAddresses,
  ProviderAdapter,
  StableToken,
} from './types'
import {
  CollateralAssetService,
  StableTokenService,
  ExchangeService,
} from './services'
import { ChainId } from './constants/chainId'
import { addresses } from './constants/addresses'

export type SupportedProvider = EthersV6Provider | PublicClient

export interface MentoConfig {
  /** Provider can be one of:
   * - Ethers v6 Provider (from 'ethers')
   * - Viem PublicClient (from 'viem')
   */
  provider: SupportedProvider
}

/** Helper type guard for Ethers v6 Provider */
function isEthersProvider(
  provider: SupportedProvider
): provider is EthersV6Provider {
  // Check for Ethers provider properties
  return 'getNetwork' in provider && 'broadcastTransaction' in provider
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
 *              // Viem
 *              const mento = await Mento.create({
 *                provider: createPublicClient({
 *                  transport: http("https://forno.celo.org")
 *                })
 *              });
 *
 *              // Get all stable tokens
 *              const stableTokens = await mento.tokens.getStableTokens();
 *
 *              // Get all collateral assets
 *              const collateralAssets = await mento.collateral.getCollateralAssets();
 *
 *              // Get all exchanges
 *              const exchanges = await mento.exchanges.getExchanges();
 */
export class Mento {
  private provider: ProviderAdapter
  public tokens: StableTokenService
  public collateral: CollateralAssetService
  public exchanges: ExchangeService

  private constructor(
    provider: ProviderAdapter,
    stableTokenService: StableTokenService,
    collateralAssetService: CollateralAssetService,
    exchangeService: ExchangeService
  ) {
    this.provider = provider
    this.tokens = stableTokenService
    this.collateral = collateralAssetService
    this.exchanges = exchangeService
  }

  public static async create(config: MentoConfig): Promise<Mento> {
    if (!config.provider) {
      throw new Error('Provider is required to initialize Mento SDK')
    }

    let provider: ProviderAdapter
    if (isEthersProvider(config.provider)) {
      provider = new EthersAdapter(config.provider)
    } else if (isViemProvider(config.provider)) {
      provider = new ViemAdapter(config.provider)
    } else {
      throw new Error('Unsupported provider type')
    }

    const stableTokenService = new StableTokenService(provider)
    const collateralAssetService = new CollateralAssetService(provider)
    const exchangeService = new ExchangeService(provider)

    return new Mento(
      provider,
      stableTokenService,
      collateralAssetService,
      exchangeService
    )
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

export * from './constants'
export * from './types'
export * from './adapters'
export * from './services'
export * from './abis'
export * from './utils'
