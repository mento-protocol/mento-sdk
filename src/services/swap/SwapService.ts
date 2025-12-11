import { Address, PublicClient } from 'viem'
import { RouteService } from '../routes'
import { QuoteService } from '../quotes'
import { Route } from '../../core/types'
import { getContractAddress, ChainId } from '../../core/constants'
import { encodeRoutePath, RouterRoute } from '../../utils/pathEncoder'

/**
 * Options for configuring a swap transaction
 */
export interface SwapOptions {
  /**
   * Maximum acceptable slippage as a percentage (e.g., 0.5 for 0.5%)
   */
  slippageTolerance: number
  /**
   * Unix timestamp after which the transaction will revert
   * Defaults to 20 minutes from now if not provided
   */
  deadline?: bigint
  /**
   * Address to receive the output tokens
   * Defaults to the sender if not provided
   */
  recipient?: Address
}

/**
 * Parameters for executing a swap transaction
 */
export interface SwapParams {
  /**
   * The Router contract address
   */
  to: Address
  /**
   * Encoded function data for the swap
   */
  data: `0x${string}`
  /**
   * Native token value to send (0 for token-to-token swaps)
   */
  value: bigint
}

/**
 * Detailed swap parameters including decoded values for transparency
 */
export interface SwapDetails {
  /**
   * Transaction parameters ready to send
   */
  params: SwapParams
  /**
   * The route being used for the swap
   */
  route: Route
  /**
   * Encoded route for the Router contract
   */
  routerRoutes: RouterRoute[]
  /**
   * Input amount in wei
   */
  amountIn: bigint
  /**
   * Minimum output amount after slippage
   */
  amountOutMin: bigint
  /**
   * Expected output amount (before slippage)
   */
  expectedAmountOut: bigint
  /**
   * Transaction deadline
   */
  deadline: bigint
}

/**
 * Service for executing token swaps on the Mento protocol.
 * Handles swap parameter building and transaction execution.
 */
export class SwapService {
  constructor(
    private publicClient: PublicClient,
    private chainId: number,
    private routeService: RouteService,
    private quoteService: QuoteService
  ) {}

  /**
   * Builds swap parameters without executing the transaction.
   * Useful for wallets that need custom signing flows or for previewing swaps.
   *
   * @param tokenIn - The address of the input token
   * @param tokenOut - The address of the output token
   * @param amountIn - The amount of input tokens (in wei/smallest unit)
   * @param options - Swap configuration options
   * @param route - Optional pre-fetched route
   * @returns Detailed swap parameters including transaction data
   *
   * @example
   * ```typescript
   * const swapDetails = await swapService.buildSwapParams(
   *   cUSD,
   *   CELO,
   *   parseUnits('100', 18),
   *   { slippageTolerance: 0.5 }
   * )
   *
   * // Use with any wallet
   * const txHash = await walletClient.sendTransaction(swapDetails.params)
   * ```
   */
  async buildSwapParams(
    tokenIn: Address,
    tokenOut: Address,
    amountIn: bigint,
    options: SwapOptions,
    route?: Route
  ): Promise<SwapDetails> {
    // Find route if not provided
    if (!route) {
      route = await this.routeService.findRoute(tokenIn, tokenOut)
    }

    // Get expected output
    const expectedAmountOut = await this.quoteService.getAmountOut(tokenIn, tokenOut, amountIn, route)

    // Calculate minimum output with slippage
    const amountOutMin = this.calculateMinAmountOut(expectedAmountOut, options.slippageTolerance)

    // Set deadline (default: 20 minutes from now)
    const deadline = options.deadline ?? BigInt(Math.floor(Date.now() / 1000) + 20 * 60)

    // Encode route path
    const routerRoutes = encodeRoutePath(route.path, tokenIn, tokenOut)

    // Get router address
    const routerAddress = getContractAddress(this.chainId as ChainId, 'Router') as Address

    // Encode swap function call
    const data = this.encodeSwapCall(amountIn, amountOutMin, routerRoutes, options.recipient, deadline)

    return {
      params: {
        to: routerAddress,
        data,
        value: 0n,
      },
      route,
      routerRoutes,
      amountIn,
      amountOutMin,
      expectedAmountOut,
      deadline,
    }
  }

  /**
   * Calculates minimum output amount after applying slippage tolerance
   *
   * @param amountOut - Expected output amount
   * @param slippageTolerance - Slippage tolerance as percentage (e.g., 0.5 for 0.5%)
   * @returns Minimum acceptable output amount
   */
  private calculateMinAmountOut(amountOut: bigint, slippageTolerance: number): bigint {
    // Convert percentage to basis points for precision (0.5% = 50 bps)
    const basisPoints = BigInt(Math.floor(slippageTolerance * 100))
    const slippageMultiplier = 10000n - basisPoints
    return (amountOut * slippageMultiplier) / 10000n
  }

  /**
   * Encodes the swapTokensForTokens function call
   *
   * @private
   */
  private encodeSwapCall(
    amountIn: bigint,
    amountOutMin: bigint,
    routes: RouterRoute[],
    recipient: Address | undefined,
    deadline: bigint
  ): `0x${string}` {
    // TODO: Implement actual encoding using viem's encodeFunctionData
    // For now, this is a placeholder that will be completed when implementing swap execution
    //
    // The actual implementation will look like:
    // return encodeFunctionData({
    //   abi: ROUTER_ABI,
    //   functionName: 'swapTokensForTokens',
    //   args: [amountIn, amountOutMin, routes, recipient ?? zeroAddress, deadline]
    // })

    void amountIn
    void amountOutMin
    void routes
    void recipient
    void deadline

    throw new Error('Swap execution not yet implemented. Use buildSwapParams for parameter preview.')
  }
}
