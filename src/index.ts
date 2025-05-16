import type { PublicClient, WalletClient, Account } from 'viem'
import type { Provider as EthersV6Provider } from 'ethers'
import type { providers as EthersV5Providers } from 'ethers-v5'

import { EthersAdapter, EthersV5Adapter, ViemAdapter } from './adapters'
import {
  CollateralAsset,
  ContractAddresses,
  ProviderAdapter,
  StableToken,
  TransactionResponse,
  ContractWriteOptions,
} from './types'
import { CollateralAssetService, StableTokenService, SwapService } from './services'
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

  /** Optional configuration for Viem wallet client (required for write operations with Viem) */
  viemAdapterConfig?: {
    walletClient: WalletClient
    account: Account
  }
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
  private swapService: SwapService

  private constructor(
    provider: ProviderAdapter,
    stableTokenService: StableTokenService,
    collateralAssetService: CollateralAssetService,
    swapService: SwapService
  ) {
    this.provider = provider
    this.stableTokenService = stableTokenService
    this.collateralAssetService = collateralAssetService
    this.swapService = swapService
  }

  public static async create(config: MentoConfig): Promise<Mento> {
    if (!config.provider) {
      throw new Error('Provider is required to initialize Mento SDK')
    }

    let provider: ProviderAdapter
    if (isEthersV5Provider(config.provider)) {
      provider = new EthersV5Adapter(config.provider)
    } else if (isEthersV6Provider(config.provider)) {
      provider = new EthersAdapter(config.provider)
    } else if (isViemProvider(config.provider)) {
      provider = new ViemAdapter(config.provider, config.viemAdapterConfig)
    } else {
      throw new Error('Unsupported provider type')
    }

    const stableTokenService = new StableTokenService(provider)
    const collateralAssetService = new CollateralAssetService(provider)
    const swapService = new SwapService(provider)

    return new Mento(provider, stableTokenService, collateralAssetService, swapService)
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
  
  /**
   * Swap a specified amount of collateral token for stable token.
   * 
   * @param tokenIn The address of the input token (collateral token)
   * @param tokenOut The address of the output token (stable token)
   * @param amountIn The amount of input token to swap
   * @param minAmountOut The minimum amount of output token to receive (for slippage protection)
   * @param options Optional parameters for the transaction (gas settings)
   * @returns A transaction response object
   */
  public async swapIn(
    tokenIn: string,
    tokenOut: string,
    amountIn: string,
    minAmountOut: string,
    options: Omit<ContractWriteOptions, 'address' | 'abi' | 'functionName' | 'args'> = {}
  ): Promise<TransactionResponse> {
    return this.swapService.swapIn(tokenIn, tokenOut, amountIn, minAmountOut, options)
  }
  
  /**
   * Swap collateral token for a specified amount of stable token.
   * 
   * @param tokenIn The address of the input token (collateral token)
   * @param tokenOut The address of the output token (stable token)
   * @param amountOut The exact amount of output token to receive
   * @param maxAmountIn The maximum amount of input token to spend (for slippage protection)
   * @param options Optional parameters for the transaction (gas settings)
   * @returns A transaction response object
   */
  public async swapOut(
    tokenIn: string,
    tokenOut: string,
    amountOut: string,
    maxAmountIn: string,
    options: Omit<ContractWriteOptions, 'address' | 'abi' | 'functionName' | 'args'> = {}
  ): Promise<TransactionResponse> {
    return this.swapService.swapOut(tokenIn, tokenOut, amountOut, maxAmountIn, options)
  }
  
  /**
   * Calculate the amount of output token that would be received for a given input amount.
   * 
   * @param tokenIn The address of the input token
   * @param tokenOut The address of the output token
   * @param amountIn The amount of input token
   * @returns The expected amount of output token as a string
   */
  public async getAmountOut(tokenIn: string, tokenOut: string, amountIn: string): Promise<string> {
    return this.swapService.getAmountOut(tokenIn, tokenOut, amountIn)
  }
  
  /**
   * Calculate the amount of input token required to receive a given output amount.
   * 
   * @param tokenIn The address of the input token
   * @param tokenOut The address of the output token
   * @param amountOut The desired amount of output token
   * @returns The required amount of input token as a string
   */
  public async getAmountIn(tokenIn: string, tokenOut: string, amountOut: string): Promise<string> {
    return this.swapService.getAmountIn(tokenIn, tokenOut, amountOut)
  }
  
  /**
   * Estimate the gas needed for a swap transaction.
   * 
   * @param methodName The method to call ('swapIn' or 'swapOut')
   * @param args The arguments for the method
   * @returns The estimated gas as a string
   */
  public async estimateGas(
    methodName: 'swapIn' | 'swapOut',
    args: [string, string, string, string]
  ): Promise<string> {
    return this.swapService.estimateGas(methodName, args)
  }
  
  /**
   * Calculate the price impact of a swap as a percentage.
   * 
   * @param tokenIn The address of the input token
   * @param tokenOut The address of the output token
   * @param amountIn The amount of input token
   * @param amountOut The expected amount of output token
   * @returns The price impact as a percentage string (e.g., "0.5" for 0.5%)
   */
  public async calculatePriceImpact(
    tokenIn: string,
    tokenOut: string,
    amountIn: string,
    amountOut: string
  ): Promise<string> {
    return this.swapService.calculatePriceImpact(tokenIn, tokenOut, amountIn, amountOut)
  }
}

export * from './constants'
export * from './types'
export * from './adapters'
export * from './services'
export * from './abis'
export * from './utils'
