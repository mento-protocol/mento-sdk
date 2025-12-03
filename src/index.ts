import { createPublicClient, http, type PublicClient } from 'viem'
import { ContractAddresses } from './core/types'
import { ExchangeService } from './services'
import { ChainId } from './core/constants/chainId'
import { getContractAddress } from './core/constants/addresses'
import { getDefaultRpcUrl, getChainConfig } from './utils/chainConfig'
import { TokenService } from '@services/tokens'
import { PoolService } from '@services/pools'
import { RouterService } from '@services/router'

/**
 * @class Mento
 * @description The main class for the Mento SDK. Initializes a viem PublicClient internally
 *              and provides a public API for interacting with the Mento Protocol.
 * @dev         example usage:
 *              const mento = await Mento.create(ChainId.CELO);
 *              // or with custom RPC URL
 *              const mento = await Mento.create(ChainId.CELO, 'https://custom-rpc-url.com');
 *
 *              // Get all stable tokens
 *              const stableTokens = await mento.tokens.getStableTokens();
 *
 *              // Get all collateral assetsparseAbi
 *              const collateralAssets = await mento.tokens.getCollateralAssets();
 *
 *              // Get all pools
 *              const exchanges = await mento.pools.getPools();
 */
export class Mento {
  private readonly chainId: number
  private readonly publicClient: PublicClient
  public readonly tokens: TokenService
  public readonly pools: PoolService
  public readonly router: RouterService

  private constructor(
    chainId: number,
    publicClient: PublicClient,
    tokenService: TokenService,
    poolService: PoolService,
    routerService: RouterService
  ) {
    this.chainId = chainId
    this.publicClient = publicClient

    this.tokens = tokenService
    this.pools = poolService
    this.router = routerService
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

    const tokenService = new TokenService(publicClient, chainId)

    // TODO: Add proper initialization
    const poolService = {}
    const routerService = {}

    // Return new mento
    return new Mento(chainId, publicClient, tokenService, poolService, routerService)
  }

  /**
   * Get the address of a contract for the current chain
   * @param contractName - The contract name
   * @returns The contract address
   */
  public getContractAddress(contractName: keyof ContractAddresses): string {
    return getContractAddress(this.chainId as ChainId, contractName)
  }
}

export * from './core/constants'
export * from './core/types'
export * from './core/abis'
export * from './services'
