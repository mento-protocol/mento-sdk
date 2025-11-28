import {
  createPublicClient,
  http,
  type PublicClient,
  encodeFunctionData,
  parseAbi,
} from 'viem'
import {
  CollateralAsset,
  ContractAddresses,
  StableToken,
  CallParams,
  ContractWriteOptions,
} from './types'
import {
  CollateralAssetService,
  StableTokenService,
  ExchangeService,
} from './services'
import { ChainId } from './constants/chainId'
import { getContractAddress } from './constants/addresses'
import { getDefaultRpcUrl, getChainConfig } from './utils/chainConfig'

/**
 * @class Mento
 * @description The main class for the Mento SDK. It initializes a viem PublicClient internally
 *              and provides a public API for interacting with the Mento Protocol.
 * @dev         example usage:
 *              const mento = await Mento.create(ChainId.CELO);
 *              // or with custom RPC URL
 *              const mento = await Mento.create(ChainId.CELO, 'https://custom-rpc-url.com');
 *
 *              // Get all stable tokens
 *              const stableTokens = await mento.tokens.getStableTokens();
 *
 *              // Get all collateral assets
 *              const collateralAssets = await mento.collateral.getCollateralAssets();
 *
 *              // Get all exchanges
 *              const exchanges = await mento.exchanges.getExchanges();
 *
 *              // Build call parameters for a write operation
 *              const callParams = await mento.buildCallParams({
 *                address: '0x...',
 *                abi: ['function approve(address spender, uint256 amount)'],
 *                functionName: 'approve',
 *                args: [spenderAddress, amount]
 *              });
 */
export class Mento {
  private readonly chainId: number
  private readonly publicClient: PublicClient
  public tokens: StableTokenService
  public collateral: CollateralAssetService
  public exchanges: ExchangeService

  private constructor(
    chainId: number,
    publicClient: PublicClient,
    stableTokenService: StableTokenService,
    collateralAssetService: CollateralAssetService,
    exchangeService: ExchangeService
  ) {
    this.chainId = chainId
    this.publicClient = publicClient
    this.tokens = stableTokenService
    this.collateral = collateralAssetService
    this.exchanges = exchangeService
  }

  /**
   * Create a new Mento SDK instance
   * @param chainId - The chain ID (e.g., ChainId.CELO, ChainId.CELO_SEPOLIA)
   * @param rpcUrl - Optional RPC URL. If not provided, uses default for the chain
   * @returns A new Mento instance
   */
  public static async create(chainId: number, rpcUrl?: string): Promise<Mento> {
    // Use provided RPC URL or default for the chain
    const transport = http(rpcUrl || getDefaultRpcUrl(chainId))

    // Create viem PublicClient
    const publicClient = createPublicClient({
      chain: getChainConfig(chainId),
      transport,
    })

    const stableTokenService = new StableTokenService(publicClient, chainId)
    const collateralAssetService = new CollateralAssetService(
      publicClient,
      chainId
    )
    const exchangeService = new ExchangeService(publicClient, chainId)

    return new Mento(
      chainId,
      publicClient,
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
  public getContractAddress(contractName: keyof ContractAddresses): string {
    return getContractAddress(this.chainId as ChainId, contractName)
  }

  /**
   * Build call parameters for a contract write operation
   *
   * Returns the transaction parameters that can be used by consumers to execute
   * transactions themselves using their own wallet/signer.
   *
   * @param options - Contract write options
   * @returns Call parameters including to, data, value, and optional gasLimit
   *
   * @example
   * ```typescript
   * const callParams = await mento.buildCallParams({
   *   address: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
   *   abi: ['function approve(address spender, uint256 amount)'],
   *   functionName: 'approve',
   *   args: ['0x1234...', 1000000n],
   *   value: 0n
   * });
   *
   * // Use callParams with your wallet
   * const tx = await wallet.sendTransaction(callParams);
   * ```
   */
  public async buildCallParams(
    options: ContractWriteOptions
  ): Promise<CallParams> {
    // Parse ABI if needed (handle both string array and object array formats)
    const abi =
      Array.isArray(options.abi) && typeof options.abi[0] === 'string'
        ? parseAbi(options.abi as string[])
        : options.abi

    // Encode function data
    const data = encodeFunctionData({
      abi: abi,
      functionName: options.functionName,
      args: options.args || [],
    })

    // Convert value to hex string
    const value = `0x${(options.value || 0n).toString(16)}`

    // Convert gasLimit to hex string if provided
    // Use !== undefined to properly handle gasLimit: 0n case
    const gasLimit =
      options.gasLimit !== undefined
        ? `0x${options.gasLimit.toString(16)}`
        : undefined

    return {
      to: options.address,
      data,
      value,
      gasLimit,
    }
  }
}

export * from './constants'
export * from './types'
export * from './services'
export * from './abis'
export * from './utils'
