import { createPublicClient, http, type PublicClient } from 'viem'
import { ContractAddresses } from './core/types'
import { ChainId } from './core/constants/chainId'
import { getContractAddress } from './core/constants/addresses'
import { getDefaultRpcUrl, getChainConfig } from './utils/chainConfig'
import { TokenService } from '@services/tokens'
import { PoolService } from '@services/pools'
import { RouteService } from '@services/routes'
import { QuoteService } from '@services/quotes'
import { SwapService } from '@services/swap'

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
 *              // Get all collateral assets
 *              const collateralAssets = await mento.tokens.getCollateralAssets();
 *
 *              // Get all pools
 *              const pools = await mento.pools.getPools();
 *
 *              // Find a route between tokens
 *              const route = await mento.routes.findRoute(cUSD, CELO);
 *
 *              // Get a quote for a swap
 *              const amountOut = await mento.quotes.getAmountOut(cUSD, CELO, amountIn);
 *
 *              // Build swap parameters
 *              const swapDetails = await mento.swap.buildSwapParams(cUSD, CELO, amountIn, { slippageTolerance: 0.5 });
 */
export class Mento {
  private constructor(
    private chainId: number,
    public tokens: TokenService,
    public pools: PoolService,
    public routes: RouteService,
    public quotes: QuoteService,
    public swap: SwapService
  ) {}

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
    const poolService = new PoolService(publicClient, chainId)
    const routeService = new RouteService(publicClient, chainId, poolService)
    const quoteService = new QuoteService(publicClient, chainId, routeService)
    const swapService = new SwapService(publicClient, chainId, routeService, quoteService)

    // Return new mento
    return new Mento(chainId, tokenService, poolService, routeService, quoteService, swapService)
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
export * from './utils'