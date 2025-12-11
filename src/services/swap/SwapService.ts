import { Address, PublicClient, encodeFunctionData } from 'viem'
import { RouteService } from '../routes'
import { QuoteService } from '../quotes'
import { Route, CallParams } from '../../core/types'
import { ROUTER_ABI, ERC20_ABI } from '../../core/abis'
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
}

/**
 * Detailed swap parameters including decoded values for transparency
 */
export interface SwapDetails {
  /**
   * Transaction parameters ready to send
   */
  params: CallParams
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
 * Combined swap transaction with optional approval
 */
export interface SwapTransaction {
  /**
   * Approval transaction params - null if approval not needed
   */
  approval: CallParams | null
  /**
   * Swap details including transaction params
   */
  swap: SwapDetails
}

/**
 * Service for building token swap transactions on the Mento protocol.
 * Returns transaction parameters that can be executed by any wallet.
 */
export class SwapService {
  constructor(
    private publicClient: PublicClient,
    private chainId: number,
    private routeService: RouteService,
    private quoteService: QuoteService
  ) {}

  /**
   * Builds a complete swap transaction including approval if needed.
   * This is the recommended method for most use cases.
   *
   * @param tokenIn - The address of the input token
   * @param tokenOut - The address of the output token
   * @param amountIn - The amount of input tokens (in wei/smallest unit)
   * @param recipient - The address to receive the output tokens
   * @param owner - The address that owns the input tokens (needed to check allowance)
   * @param options - Swap configuration options (slippage, deadline)
   * @param route - Optional pre-fetched route for better performance
   * @returns Combined transaction with approval (if needed) and swap params
   *
   * @example
   * ```typescript
   * const { approval, swap } = await mento.swap.buildSwapTransaction(
   *   cUSD,
   *   CELO,
   *   parseUnits('100', 18),
   *   recipientAddress,
   *   ownerAddress,
   *   { slippageTolerance: 0.5 }
   * )
   *
   * // Execute approval if needed
   * if (approval) {
   *   await walletClient.sendTransaction(approval)
   * }
   *
   * // Execute swap
   * await walletClient.sendTransaction(swap.params)
   * ```
   */
  async buildSwapTransaction(
    tokenIn: Address,
    tokenOut: Address,
    amountIn: bigint,
    recipient: Address,
    owner: Address,
    options: SwapOptions,
    route?: Route
  ): Promise<SwapTransaction> {
    // Build swap params first
    const swap = await this.buildSwapParams(tokenIn, tokenOut, amountIn, recipient, options, route)

    // Check if approval is needed
    const currentAllowance = await this.getAllowance(tokenIn, owner)
    const approval = currentAllowance < amountIn ? this.buildApprovalParams(tokenIn, amountIn) : null

    return { approval, swap }
  }

  /**
   * Builds swap transaction parameters without executing the transaction.
   * Does NOT check or handle token approval - use buildSwapTransaction for that.
   *
   * @param tokenIn - The address of the input token
   * @param tokenOut - The address of the output token
   * @param amountIn - The amount of input tokens (in wei/smallest unit)
   * @param recipient - The address to receive the output tokens
   * @param options - Swap configuration options (slippage, deadline)
   * @param route - Optional pre-fetched route for better performance
   * @returns Detailed swap parameters including transaction data
   *
   * @example
   * ```typescript
   * const swapDetails = await mento.swap.buildSwapParams(
   *   cUSD,
   *   CELO,
   *   parseUnits('100', 18),
   *   recipientAddress,
   *   { slippageTolerance: 0.5 }
   * )
   *
   * // Execute with any wallet (assumes approval already granted)
   * await walletClient.sendTransaction(swapDetails.params)
   * ```
   */
  async buildSwapParams(
    tokenIn: Address,
    tokenOut: Address,
    amountIn: bigint,
    recipient: Address,
    options: SwapOptions,
    route?: Route
  ): Promise<SwapDetails> {
    // Find route if not provided
    if (!route) {
      route = await this.routeService.findRoute(tokenIn, tokenOut)
    }

    const expectedAmountOut = await this.quoteService.getAmountOut(tokenIn, tokenOut, amountIn, route)
    const amountOutMin = this.calculateMinAmountOut(expectedAmountOut, options.slippageTolerance)

    // Set deadline (default: 20 minutes from now)
    const deadline = options.deadline ?? BigInt(Math.floor(Date.now() / 1000) + 20 * 60)

    const routerRoutes = encodeRoutePath(route.path, tokenIn, tokenOut)
    const routerAddress = getContractAddress(this.chainId as ChainId, 'Router')
    const data = this.encodeSwapCall(amountIn, amountOutMin, routerRoutes, recipient, deadline)

    return {
      params: {
        to: routerAddress,
        data,
        value: '0',
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
   * Builds approval transaction params for the Router to spend tokenIn
   * @private
   */
  private buildApprovalParams(tokenIn: Address, amount: bigint): CallParams {
    const routerAddress = getContractAddress(this.chainId as ChainId, 'Router')
    const data = encodeFunctionData({
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [routerAddress, amount],
    })
    return { to: tokenIn, data, value: '0' }
  }

  /**
   * Gets current allowance for the Router contract
   * @private
   */
  private async getAllowance(tokenIn: Address, owner: Address): Promise<bigint> {
    const routerAddress = getContractAddress(this.chainId as ChainId, 'Router')
    return this.publicClient.readContract({
      address: tokenIn,
      abi: ERC20_ABI,
      functionName: 'allowance',
      args: [owner, routerAddress],
    }) as Promise<bigint>
  }

  /**
   * Calculates minimum output amount after applying slippage tolerance
   * @private
   */
  private calculateMinAmountOut(amountOut: bigint, slippageTolerance: number): bigint {
    const basisPoints = BigInt(Math.floor(slippageTolerance * 100))
    const slippageMultiplier = 10000n - basisPoints
    return (amountOut * slippageMultiplier) / 10000n
  }

  /**
   * Encodes the swapExactTokensForTokens function call
   * @private
   */
  private encodeSwapCall(
    amountIn: bigint,
    amountOutMin: bigint,
    routes: RouterRoute[],
    recipient: Address,
    deadline: bigint
  ): string {
    return encodeFunctionData({
      abi: ROUTER_ABI,
      functionName: 'swapExactTokensForTokens',
      args: [amountIn, amountOutMin, routes, recipient, deadline],
    })
  }
}
