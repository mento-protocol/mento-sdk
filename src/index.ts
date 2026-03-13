import { createPublicClient, http, type PublicClient } from 'viem'
import { ContractAddresses } from './core/types'
import { ChainId } from './core/constants/chainId'
import { getContractAddress } from './core/constants/addresses'
import { getDefaultRpcUrl, getChainConfig } from './utils/chainConfig'
import { TokenService } from './services/tokens'
import { PoolService } from './services/pools'
import { RouteService } from './services/routes'
import { QuoteService } from './services/quotes'
import { SwapService } from './services/swap'
import { TradingService } from './services/trading'
import { LiquidityService } from './services/liquidity'
import { BorrowService } from './services/borrow'

export interface MentoBatchOptions {
  batchSize?: number
  wait?: number
}

export interface MentoClientOptions {
  httpBatch?: MentoBatchOptions | false
  multicallBatch?: MentoBatchOptions | false
}

const DEFAULT_HTTP_BATCH_OPTIONS: Required<MentoBatchOptions> = {
  batchSize: 1000,
  wait: 8,
}

const DEFAULT_MULTICALL_BATCH_OPTIONS: Required<MentoBatchOptions> = {
  batchSize: 1024,
  wait: 8,
}

/**
 * @class Mento
 * @description The main class for the Mento SDK. Initializes a viem PublicClient internally
 *              and provides a public API for interacting with the Mento Protocol.
 * @dev         example usage:
 *              const mento = await Mento.create(ChainId.CELO);
 *              // or with custom RPC URL
 *              const mento = await Mento.create(ChainId.CELO, 'https://custom-rpc-url.com');
 *              // or with an existing viem PublicClient
 *              const mento = await Mento.create(ChainId.CELO, myPublicClient);
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
 *              const route = await mento.routes.findRoute(USDm, CELO);
 *
 *              // Get a quote for a swap
 *              const amountOut = await mento.quotes.getAmountOut(USDm, CELO, amountIn);
 *
 *              // Build swap parameters
 *              const swapDetails = await mento.swap.buildSwapParams(USDm, CELO, amountIn, recipient, { slippageTolerance: 0.5, deadline: deadlineFromMinutes(5) });
 *
 *              // Check if a pair is tradable (circuit breaker check)
 *              const isTradable = await mento.trading.isPairTradable(USDm, CELO);
 *
 *              // Get trading limits for a pool
 *              const limits = await mento.trading.getPoolTradingLimits(pool);
 *
 *              // Get full tradability status (circuit breaker + limits)
 *              const status = await mento.trading.getPoolTradabilityStatus(pool);
 *
 *              // Add liquidity to a pool
 *              const { approval0, approval1, addLiquidity } = await mento.liquidity.buildAddLiquidityTransaction(
 *                poolAddress, amount0, amount1, recipient, owner, { slippageTolerance: 0.5, deadline: deadlineFromMinutes(5) }
 *              );
 *
 *              // Add liquidity using a single token (zap in)
 *              const { approval, zapIn } = await mento.liquidity.buildZapInTransaction(
 *                poolAddress, tokenIn, amountIn, 0.5, recipient, owner, { slippageTolerance: 0.5, deadline: deadlineFromMinutes(5) }
 *              );
 */
export class Mento {
  private constructor(
    private chainId: number,
    public tokens: TokenService,
    public pools: PoolService,
    public routes: RouteService,
    public quotes: QuoteService,
    public swap: SwapService,
    public trading: TradingService,
    public liquidity: LiquidityService,
    public borrow: BorrowService
  ) {}

  /**
   * Create a new Mento SDK instance
   * @param chainId - The chain ID (e.g., ChainId.CELO, ChainId.CELO_SEPOLIA)
   * @param rpcUrlOrClient - Optional RPC URL string or an existing viem PublicClient.
   *                         If not provided, uses the default RPC URL for the chain.
   * @param options - Optional batching configuration used only when the SDK creates the PublicClient internally.
   * @returns A new Mento instance
   */
  public static async create(chainId: number): Promise<Mento>
  public static async create(
    chainId: number,
    rpcUrlOrClient: string | PublicClient,
    options?: MentoClientOptions
  ): Promise<Mento>
  public static async create(
    chainId: number,
    rpcUrlOrClient?: string | PublicClient,
    options?: MentoClientOptions
  ): Promise<Mento> {
    // Validate chainId is supported
    const supportedChainIds = Object.values(ChainId).filter((v) => typeof v === 'number') as number[]
    if (!supportedChainIds.includes(chainId)) {
      throw new Error(
        `ChainId ${chainId} is not supported. ` +
          `Supported chains: ${supportedChainIds.map((id) => `${id} (${ChainId[id]})`).join(', ')}`
      )
    }

    let publicClient: PublicClient
    if (rpcUrlOrClient && typeof rpcUrlOrClient !== 'string') {
      publicClient = rpcUrlOrClient
    } else {
      const transport = http(rpcUrlOrClient || getDefaultRpcUrl(chainId), {
        batch: options?.httpBatch === false
          ? false
          : {
              ...DEFAULT_HTTP_BATCH_OPTIONS,
              ...(options?.httpBatch ?? {}),
            },
      })
      publicClient = createPublicClient({
        batch: {
          multicall: options?.multicallBatch === false
            ? false
            : {
                ...DEFAULT_MULTICALL_BATCH_OPTIONS,
                ...(options?.multicallBatch ?? {}),
              },
        },
        chain: getChainConfig(chainId),
        transport,
      })
    }

    const tokenService = new TokenService(publicClient, chainId)
    const poolService = new PoolService(publicClient, chainId)
    const routeService = new RouteService(publicClient, chainId, poolService)
    const quoteService = new QuoteService(publicClient, chainId, routeService)
    const swapService = new SwapService(publicClient, chainId, routeService, quoteService)
    const tradingService = new TradingService(publicClient, chainId, routeService)
    const liquidityService = new LiquidityService(publicClient, chainId, poolService, routeService)
    const borrowService = new BorrowService(publicClient, chainId)

    // Return new mento
    return new Mento(
      chainId,
      tokenService,
      poolService,
      routeService,
      quoteService,
      swapService,
      tradingService,
      liquidityService,
      borrowService
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
}

export * from './core/constants'
export * from './core/errors'
export * from './core/types'
export * from './core/abis'
export * from './services'
export * from './utils'
