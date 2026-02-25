import { PublicClient } from 'viem'
import { PoolService } from '../pools'
import { RouteService } from '../routes'
import {
  LiquidityOptions,
  AddLiquidityQuote,
  RemoveLiquidityQuote,
  AddLiquidityDetails,
  RemoveLiquidityDetails,
  AddLiquidityTransaction,
  RemoveLiquidityTransaction,
  LPTokenBalance,
  ZapInQuote,
  ZapOutQuote,
  ZapInDetails,
  ZapOutDetails,
  ZapInTransaction,
  ZapOutTransaction,
} from '../../core/types'
import {
  buildAddLiquidityTransactionInternal,
  buildAddLiquidityParamsInternal,
  buildRemoveLiquidityTransactionInternal,
  buildRemoveLiquidityParamsInternal,
  quoteAddLiquidityInternal,
  quoteRemoveLiquidityInternal,
  getLPTokenBalanceInternal,
} from './basicLiquidity'
import {
  buildZapInTransactionInternal,
  buildZapInParamsInternal,
  quoteZapInInternal,
} from './zapIn'
import {
  buildZapOutTransactionInternal,
  buildZapOutParamsInternal,
  quoteZapOutInternal,
} from './zapOut'

export class LiquidityService {
  constructor(
    private publicClient: PublicClient,
    private chainId: number,
    private poolService: PoolService,
    private routeService: RouteService
  ) {}

  /**
   * Builds add liquidity transaction with token approvals if needed.
   * Provide two tokens in any order - the Router handles token ordering automatically.
   * @param poolAddress - FPMM pool address
   * @param tokenA - First token address
   * @param amountA - Amount of first token
   * @param tokenB - Second token address
   * @param amountB - Amount of second token
   * @param recipient - Address to receive LP tokens
   * @param owner - Address that owns the input tokens (for checking allowances)
   * @param options - Slippage tolerance and deadline
   * @returns Transaction with approvals (if needed) and add liquidity call
   */
  async buildAddLiquidityTransaction(
    poolAddress: string,
    tokenA: string,
    amountA: bigint,
    tokenB: string,
    amountB: bigint,
    recipient: string,
    owner: string,
    options: LiquidityOptions
  ): Promise<AddLiquidityTransaction> {
    return buildAddLiquidityTransactionInternal(
      this.publicClient,
      this.chainId,
      this.poolService,
      poolAddress,
      tokenA,
      amountA,
      tokenB,
      amountB,
      recipient,
      owner,
      options
    )
  }

  /**
   * Builds add liquidity transaction parameters without checking token approvals.
   * Use buildAddLiquidityTransaction if you need approval handling.
   * @param poolAddress - FPMM pool address
   * @param tokenA - First token address
   * @param amountA - Amount of first token
   * @param tokenB - Second token address
   * @param amountB - Amount of second token
   * @param recipient - Address to receive LP tokens
   * @param options - Slippage tolerance and deadline
   * @returns Transaction details with encoded call data
   */
  async buildAddLiquidityParams(
    poolAddress: string,
    tokenA: string,
    amountA: bigint,
    tokenB: string,
    amountB: bigint,
    recipient: string,
    options: LiquidityOptions
  ): Promise<AddLiquidityDetails> {
    return buildAddLiquidityParamsInternal(
      this.publicClient,
      this.chainId,
      this.poolService,
      poolAddress,
      tokenA,
      amountA,
      tokenB,
      amountB,
      recipient,
      options
    )
  }

  /**
   * Builds remove liquidity transaction with LP token approval if needed.
   * @param poolAddress - FPMM pool address (also the LP token address)
   * @param liquidity - Amount of LP tokens to burn
   * @param recipient - Address to receive the underlying tokens
   * @param owner - Address that owns the LP tokens (for checking allowance)
   * @param options - Slippage tolerance and deadline
   * @returns Transaction with approval (if needed) and remove liquidity call
   */
  async buildRemoveLiquidityTransaction(
    poolAddress: string,
    liquidity: bigint,
    recipient: string,
    owner: string,
    options: LiquidityOptions
  ): Promise<RemoveLiquidityTransaction> {
    return buildRemoveLiquidityTransactionInternal(
      this.publicClient,
      this.chainId,
      this.poolService,
      poolAddress,
      liquidity,
      recipient,
      owner,
      options
    )
  }

  /**
   * Builds remove liquidity transaction parameters without checking LP token approval.
   * Use buildRemoveLiquidityTransaction if you need approval handling.
   * @param poolAddress - FPMM pool address
   * @param liquidity - Amount of LP tokens to burn
   * @param recipient - Address to receive the underlying tokens
   * @param options - Slippage tolerance and deadline
   * @returns Transaction details with encoded call data
   */
  async buildRemoveLiquidityParams(
    poolAddress: string,
    liquidity: bigint,
    recipient: string,
    options: LiquidityOptions
  ): Promise<RemoveLiquidityDetails> {
    return buildRemoveLiquidityParamsInternal(
      this.publicClient,
      this.chainId,
      this.poolService,
      poolAddress,
      liquidity,
      recipient,
      options
    )
  }

  /**
   * Quotes an add liquidity operation (read-only call).
   * Returns expected amounts and LP tokens based on current pool reserves.
   * @param poolAddress - FPMM pool address
   * @param tokenA - First token address
   * @param amountA - Amount of first token
   * @param tokenB - Second token address
   * @param amountB - Amount of second token
   * @returns Expected amounts and LP tokens to be minted
   */
  async quoteAddLiquidity(
    poolAddress: string,
    tokenA: string,
    amountA: bigint,
    tokenB: string,
    amountB: bigint
  ): Promise<AddLiquidityQuote> {
    return quoteAddLiquidityInternal(
      this.publicClient,
      this.chainId,
      this.poolService,
      poolAddress,
      tokenA,
      amountA,
      tokenB,
      amountB
    )
  }

  /**
   * Quotes a remove liquidity operation (read-only call).
   * Returns expected token amounts based on current pool reserves.
   * @param poolAddress - FPMM pool address
   * @param liquidity - Amount of LP tokens to burn
   * @returns Expected amounts of token0 and token1
   */
  async quoteRemoveLiquidity(poolAddress: string, liquidity: bigint): Promise<RemoveLiquidityQuote> {
    return quoteRemoveLiquidityInternal(this.publicClient, this.chainId, this.poolService, poolAddress, liquidity)
  }

  /**
   * Gets LP token balance and pool share percentage for an address.
   * @param poolAddress - FPMM pool address (also the LP token address)
   * @param owner - Address to check balance for
   * @returns Balance, total supply, and share percentage
   */
  async getLPTokenBalance(poolAddress: string, owner: string): Promise<LPTokenBalance> {
    return getLPTokenBalanceInternal(this.publicClient, this.poolService, poolAddress, owner)
  }

  /**
   * Builds zap in transaction with approval if needed.
   * Adds liquidity using a single input token - the Router swaps it to both pool tokens automatically.
   * @param poolAddress - FPMM pool address
   * @param tokenIn - Input token address
   * @param amountIn - Total input amount
   * @param amountInSplit - How to split input between pool tokens (0-1, e.g., 0.5 for 50/50)
   * @param recipient - Address to receive LP tokens
   * @param owner - Address that owns the input token
   * @param options - Slippage tolerance and deadline
   * @returns Transaction with approval (if needed) and zap in call
   */
  async buildZapInTransaction(
    poolAddress: string,
    tokenIn: string,
    amountIn: bigint,
    amountInSplit: number,
    recipient: string,
    owner: string,
    options: LiquidityOptions
  ): Promise<ZapInTransaction> {
    return buildZapInTransactionInternal(
      this.publicClient,
      this.chainId,
      this.poolService,
      this.routeService,
      poolAddress,
      tokenIn,
      amountIn,
      amountInSplit,
      recipient,
      owner,
      options
    )
  }

  /**
   * Builds zap in transaction parameters without checking approval.
   * Use buildZapInTransaction if you need approval handling.
   * @param poolAddress - FPMM pool address
   * @param tokenIn - Input token address
   * @param amountIn - Total input amount
   * @param amountInSplit - Split ratio (0-1)
   * @param recipient - Address to receive LP tokens
   * @param options - Slippage tolerance and deadline
   * @returns Transaction details with encoded call data and routing information
   */
  async buildZapInParams(
    poolAddress: string,
    tokenIn: string,
    amountIn: bigint,
    amountInSplit: number,
    recipient: string,
    options: LiquidityOptions
  ): Promise<ZapInDetails> {
    return buildZapInParamsInternal(
      this.publicClient,
      this.chainId,
      this.poolService,
      this.routeService,
      poolAddress,
      tokenIn,
      amountIn,
      amountInSplit,
      recipient,
      options
    )
  }

  /**
   * Builds zap out transaction with approval if needed.
   * Removes liquidity and swaps both tokens to a single output token.
   * @param poolAddress - FPMM pool address
   * @param tokenOut - Output token address
   * @param liquidity - Amount of LP tokens to burn
   * @param recipient - Address to receive output tokens
   * @param owner - Address that owns the LP tokens
   * @param options - Slippage tolerance and deadline
   * @returns Transaction with approval (if needed) and zap out call
   */
  async buildZapOutTransaction(
    poolAddress: string,
    tokenOut: string,
    liquidity: bigint,
    recipient: string,
    owner: string,
    options: LiquidityOptions
  ): Promise<ZapOutTransaction> {
    return buildZapOutTransactionInternal(
      this.publicClient,
      this.chainId,
      this.poolService,
      this.routeService,
      poolAddress,
      tokenOut,
      liquidity,
      recipient,
      owner,
      options
    )
  }

  /**
   * Builds zap out transaction parameters without checking approval.
   * Use buildZapOutTransaction if you need approval handling.
   * @param poolAddress - FPMM pool address
   * @param tokenOut - Output token address
   * @param liquidity - Amount of LP tokens to burn
   * @param recipient - Address to receive output tokens
   * @param options - Slippage tolerance and deadline
   * @returns Transaction details with encoded call data and routing information
   */
  async buildZapOutParams(
    poolAddress: string,
    tokenOut: string,
    liquidity: bigint,
    recipient: string,
    options: LiquidityOptions
  ): Promise<ZapOutDetails> {
    return buildZapOutParamsInternal(
      this.publicClient,
      this.chainId,
      this.poolService,
      this.routeService,
      poolAddress,
      tokenOut,
      liquidity,
      recipient,
      options
    )
  }

  /**
   * Quotes a zap in operation (read-only call).
   * Estimates expected LP tokens and minimum amounts after swaps and slippage.
   * @param poolAddress - FPMM pool address
   * @param tokenIn - Input token address
   * @param amountIn - Total input amount
   * @param amountInSplit - Split ratio (0-1)
   * @param options - Slippage tolerance and deadline
   * @returns Expected LP tokens and minimum amounts for both pool tokens
   */
  async quoteZapIn(
    poolAddress: string,
    tokenIn: string,
    amountIn: bigint,
    amountInSplit: number,
    options: LiquidityOptions
  ): Promise<ZapInQuote> {
    return quoteZapInInternal(
      this.publicClient,
      this.chainId,
      this.poolService,
      this.routeService,
      poolAddress,
      tokenIn,
      amountIn,
      amountInSplit,
      options
    )
  }

  /**
   * Quotes a zap out operation (read-only call).
   * Estimates expected output tokens after removing liquidity and swapping.
   * @param poolAddress - FPMM pool address
   * @param tokenOut - Output token address
   * @param liquidity - Amount of LP tokens to burn
   * @param options - Slippage tolerance and deadline
   * @returns Expected output amount and minimum amounts after slippage
   */
  async quoteZapOut(
    poolAddress: string,
    tokenOut: string,
    liquidity: bigint,
    options: LiquidityOptions
  ): Promise<ZapOutQuote> {
    return quoteZapOutInternal(
      this.publicClient,
      this.chainId,
      this.poolService,
      this.routeService,
      poolAddress,
      tokenOut,
      liquidity,
      options
    )
  }
}
