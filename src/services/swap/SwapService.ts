import { Address, PublicClient, encodeFunctionData } from 'viem'
import { RouteService } from '../routes'
import { QuoteService } from '../quotes'
import { Route, CallParams } from '../../core/types'
import { ROUTER_ABI, ERC20_ABI } from '../../core/abis'
import { getContractAddress, ChainId } from '../../core/constants'
import { encodeRoutePath, RouterRoute, ReadonlyRouterRoutes } from '../../utils/pathEncoder'
import { validateAddress } from '../../utils/validation'
import { retryOperation } from '../../utils'
import { getAmountOutForRoute } from '../quotes/QuoteService'

/**
 * Options for configuring a swap transaction
 */
export interface SwapOptions {
  /**
   * Maximum acceptable slippage as a percentage (e.g., 0.5 for 0.5%)
   */
  slippageTolerance: number
  /**
   * Unix timestamp after which the transaction will revert.
   * Use `deadlineFromMinutes()` for convenience.
   */
  deadline: bigint
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

export interface PrepareSwapInput {
  tokenIn: string
  tokenOut: string
  amountIn: bigint
  slippageTolerance: number
  recipient?: string
  owner?: string
  deadline?: bigint
  route?: Route
}

export interface PreparedSwap {
  route: Route
  routerRoutes: RouterRoute[]
  expectedAmountOut: bigint
  amountOutMin: bigint
  approval?: CallParams | null
  params?: CallParams
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
   * @param tokenIn - The address of the input token (e.g., '0x765DE816845861e75A25fCA122bb6898B8B1282a')
   * @param tokenOut - The address of the output token (e.g., '0x471EcE3750Da237f93B8E339c536989b8978a438')
   * @param amountIn - The amount of input tokens (in wei/smallest unit)
   * @param recipient - The address to receive the output tokens
   * @param owner - The address that owns the input tokens (needed to check allowance)
   * @param options - Swap configuration options (slippage, deadline)
   * @param route - Optional pre-fetched route for better performance
   * @returns Combined transaction with approval (if needed) and swap params
   * @throws {Error} 'amountIn must be greater than zero' - if amountIn <= 0
   * @throws {Error} 'Slippage tolerance cannot be negative' - if slippageTolerance < 0
   * @throws {Error} 'Slippage tolerance exceeds maximum' - if slippageTolerance > 20%
   * @throws {Error} 'Deadline must be in the future' - if deadline is not a future timestamp
   * @throws {Error} Invalid address - if any address parameter is not a valid Ethereum address
   * @throws {RouteNotFoundError} If no trading route exists between the token pair
   *
   * @example
   * ```typescript
   * const { approval, swap } = await mento.swap.buildSwapTransaction(
   *   '0x765DE816845861e75A25fCA122bb6898B8B1282a', // USDm
   *   '0x471EcE3750Da237f93B8E339c536989b8978a438', // CELO
   *   parseUnits('100', 18),
   *   '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', // recipient
   *   '0x123...', // owner
   *   { slippageTolerance: 0.5, deadline: deadlineFromMinutes(5) }
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
    tokenIn: string,
    tokenOut: string,
    amountIn: bigint,
    recipient: string,
    owner: string,
    options: SwapOptions,
    route?: Route
  ): Promise<SwapTransaction> {
    const prepared = await this.prepareSwap({
      amountIn,
      deadline: options.deadline,
      owner,
      recipient,
      route,
      slippageTolerance: options.slippageTolerance,
      tokenIn,
      tokenOut,
    })

    if (!prepared.params) {
      throw new Error('Swap params were not prepared')
    }

    return {
      approval: prepared.approval ?? null,
      swap: {
        params: prepared.params,
        route: prepared.route,
        routerRoutes: prepared.routerRoutes,
        amountIn,
        amountOutMin: prepared.amountOutMin,
        expectedAmountOut: prepared.expectedAmountOut,
        deadline: options.deadline,
      },
    }
  }

  /**
   * Builds swap transaction parameters without executing the transaction.
   * Does NOT check or handle token approval - use buildSwapTransaction for that.
   *
   * @param tokenIn - The address of the input token (e.g., '0x765DE816845861e75A25fCA122bb6898B8B1282a')
   * @param tokenOut - The address of the output token (e.g., '0x471EcE3750Da237f93B8E339c536989b8978a438')
   * @param amountIn - The amount of input tokens (in wei/smallest unit)
   * @param recipient - The address to receive the output tokens
   * @param options - Swap configuration options (slippage, deadline)
   * @param route - Optional pre-fetched route for better performance
   * @returns Detailed swap parameters including transaction data
   * @throws {Error} 'amountIn must be greater than zero' - if amountIn <= 0
   * @throws {Error} 'Slippage tolerance cannot be negative' - if slippageTolerance < 0
   * @throws {Error} 'Slippage tolerance exceeds maximum' - if slippageTolerance > 20%
   * @throws {Error} 'Deadline must be in the future' - if deadline is not a future timestamp
   * @throws {Error} Invalid address - if any address parameter is not a valid Ethereum address
   * @throws {RouteNotFoundError} If no trading route exists between the token pair
   *
   * @example
   * ```typescript
   * const swapDetails = await mento.swap.buildSwapParams(
   *   '0x765DE816845861e75A25fCA122bb6898B8B1282a', // USDm
   *   '0x471EcE3750Da237f93B8E339c536989b8978a438', // CELO
   *   parseUnits('100', 18),
   *   '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', // recipient
   *   { slippageTolerance: 0.5, deadline: deadlineFromMinutes(5) }
   * )
   *
   * // Execute with any wallet (assumes approval already granted)
   * await walletClient.sendTransaction(swapDetails.params)
   * ```
   */
  async buildSwapParams(
    tokenIn: string,
    tokenOut: string,
    amountIn: bigint,
    recipient: string,
    options: SwapOptions,
    route?: Route
  ): Promise<SwapDetails> {
    const prepared = await this.prepareSwap({
      amountIn,
      deadline: options.deadline,
      recipient,
      route,
      slippageTolerance: options.slippageTolerance,
      tokenIn,
      tokenOut,
    })

    if (!prepared.params) {
      throw new Error('Swap params were not prepared')
    }

    return {
      params: prepared.params,
      route: prepared.route,
      routerRoutes: prepared.routerRoutes,
      amountIn,
      amountOutMin: prepared.amountOutMin,
      expectedAmountOut: prepared.expectedAmountOut,
      deadline: options.deadline,
    }
  }

  async prepareSwap(input: PrepareSwapInput): Promise<PreparedSwap> {
    this.validateAmountIn(input.amountIn)
    validateAddress(input.tokenIn, 'tokenIn')
    validateAddress(input.tokenOut, 'tokenOut')

    if (input.recipient) {
      validateAddress(input.recipient, 'recipient')
    }

    if (input.owner) {
      validateAddress(input.owner, 'owner')
    }

    if (input.deadline !== undefined && input.deadline <= BigInt(Date.now()) / 1000n) {
      throw new Error('Deadline must be in the future')
    }

    const route = input.route ?? await this.routeService.findRoute(input.tokenIn, input.tokenOut)
    const routerRoutes = encodeRoutePath(route.path, input.tokenIn as Address, input.tokenOut as Address)
    const expectedAmountOut = await getAmountOutForRoute(
      this.publicClient,
      this.chainId,
      input.tokenIn,
      input.tokenOut,
      input.amountIn,
      route
    )
    const amountOutMin = this.calculateMinAmountOut(expectedAmountOut, input.slippageTolerance)

    const prepared: PreparedSwap = {
      route,
      routerRoutes,
      expectedAmountOut,
      amountOutMin,
    }

    if (input.owner) {
      const currentAllowance = await this.getAllowance(input.tokenIn as Address, input.owner as Address)
      prepared.approval = currentAllowance < input.amountIn
        ? this.buildApprovalParams(input.tokenIn as Address, input.amountIn)
        : null
    }

    if (input.recipient && input.deadline !== undefined) {
      const routerAddress = getContractAddress(this.chainId as ChainId, 'Router')
      const data = this.encodeSwapCall(
        input.amountIn,
        amountOutMin,
        routerRoutes,
        input.recipient as Address,
        input.deadline
      )

      prepared.params = {
        to: routerAddress,
        data,
        value: '0',
      }
    }

    return prepared
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
    return retryOperation(() =>
      this.publicClient.readContract({
        address: tokenIn,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [owner, routerAddress],
      })
    ) as Promise<bigint>
  }

  /**
   * Validates that the input amount is strictly positive.
   * @private
   */
  private validateAmountIn(amountIn: bigint): void {
    if (amountIn <= 0n) {
      throw new Error('amountIn must be greater than zero')
    }
  }

  /**
   * Calculates minimum output amount after applying slippage tolerance
   * @param amountOut - Expected output amount
   * @param slippageTolerance - Slippage tolerance as percentage (e.g., 0.5 for 0.5%)
   * @returns Minimum acceptable output amount
   * @throws Error if slippage tolerance is invalid
   * @private
   */
  private calculateMinAmountOut(amountOut: bigint, slippageTolerance: number): bigint {
    const MAX_SLIPPAGE_TOLERANCE = 20 // 20% max

    if (slippageTolerance < 0) {
      throw new Error('Slippage tolerance cannot be negative')
    }
    if (slippageTolerance > MAX_SLIPPAGE_TOLERANCE) {
      throw new Error(
        `Slippage tolerance ${slippageTolerance}% exceeds maximum of ${MAX_SLIPPAGE_TOLERANCE}%. ` +
          'High slippage makes transactions vulnerable to sandwich attacks.'
      )
    }

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
      args: [amountIn, amountOutMin, routes as ReadonlyRouterRoutes, recipient, deadline],
    })
  }
}
