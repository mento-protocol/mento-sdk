import { PublicClient } from 'viem'
import { PoolService } from '../pools'
import { RouteService } from '../routes'
import {
  AddLiquidityInput,
  RemoveLiquidityInput,
  RebalanceDetails,
  RebalanceInput,
  RebalanceTransaction,
  ZapInInput,
  ZapOutInput,
  PrepareZapInInput,
  PrepareZapOutInput,
  AddLiquidityQuote,
  RemoveLiquidityQuote,
  AddLiquidityDetails,
  RemoveLiquidityDetails,
  AddLiquidityTransaction,
  RemoveLiquidityTransaction,
  LPTokenBalance,
  LiquidityOptions,
  PreparedZapIn,
  PreparedZapOut,
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
  prepareZapInInternal,
  quoteZapInInternal,
} from './zapIn'
import {
  buildZapOutTransactionInternal,
  buildZapOutParamsInternal,
  prepareZapOutInternal,
  quoteZapOutInternal,
} from './zapOut'
import {
  buildRebalanceParamsInternal,
  buildRebalanceTransactionInternal,
} from './rebalance'

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
   * @param input - Add liquidity parameters including owner for allowance checks
   * @returns Transaction with approvals (if needed) and add liquidity call
   */
  async buildAddLiquidityTransaction(
    input: AddLiquidityInput & { owner: string }
  ): Promise<AddLiquidityTransaction> {
    return buildAddLiquidityTransactionInternal(
      this.publicClient,
      this.chainId,
      this.poolService,
      input.poolAddress,
      input.tokenA,
      input.amountA,
      input.tokenB,
      input.amountB,
      input.recipient,
      input.owner,
      input.options
    )
  }

  /**
   * Builds add liquidity transaction parameters without checking token approvals.
   * Use buildAddLiquidityTransaction if you need approval handling.
   * @param input - Add liquidity parameters
   * @returns Transaction details with encoded call data
   */
  async buildAddLiquidityParams(
    input: AddLiquidityInput
  ): Promise<AddLiquidityDetails> {
    return buildAddLiquidityParamsInternal(
      this.publicClient,
      this.chainId,
      this.poolService,
      input.poolAddress,
      input.tokenA,
      input.amountA,
      input.tokenB,
      input.amountB,
      input.recipient,
      input.options
    )
  }

  /**
   * Builds remove liquidity transaction with LP token approval if needed.
   * @param input - Remove liquidity parameters including owner for allowance check
   * @returns Transaction with approval (if needed) and remove liquidity call
   */
  async buildRemoveLiquidityTransaction(
    input: RemoveLiquidityInput & { owner: string }
  ): Promise<RemoveLiquidityTransaction> {
    return buildRemoveLiquidityTransactionInternal(
      this.publicClient,
      this.chainId,
      this.poolService,
      input.poolAddress,
      input.liquidity,
      input.recipient,
      input.owner,
      input.options
    )
  }

  /**
   * Builds remove liquidity transaction parameters without checking LP token approval.
   * Use buildRemoveLiquidityTransaction if you need approval handling.
   * @param input - Remove liquidity parameters
   * @returns Transaction details with encoded call data
   */
  async buildRemoveLiquidityParams(
    input: RemoveLiquidityInput
  ): Promise<RemoveLiquidityDetails> {
    return buildRemoveLiquidityParamsInternal(
      this.publicClient,
      this.chainId,
      this.poolService,
      input.poolAddress,
      input.liquidity,
      input.recipient,
      input.options
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
   * @param input - Zap in parameters including owner for allowance check
   * @returns Transaction with approval (if needed) and zap in call
   */
  async buildZapInTransaction(
    input: ZapInInput & { owner: string }
  ): Promise<ZapInTransaction> {
    return buildZapInTransactionInternal(
      this.publicClient,
      this.chainId,
      this.poolService,
      this.routeService,
      input.poolAddress,
      input.tokenIn,
      input.amountIn,
      input.amountInSplit,
      input.recipient,
      input.owner,
      input.options
    )
  }

  /**
   * Builds zap in transaction parameters without checking approval.
   * Use buildZapInTransaction if you need approval handling.
   * @param input - Zap in parameters
   * @returns Transaction details with encoded call data and routing information
   */
  async buildZapInParams(
    input: ZapInInput
  ): Promise<ZapInDetails> {
    return buildZapInParamsInternal(
      this.publicClient,
      this.chainId,
      this.poolService,
      this.routeService,
      input.poolAddress,
      input.tokenIn,
      input.amountIn,
      input.amountInSplit,
      input.recipient,
      input.options
    )
  }

  async prepareZapIn(input: PrepareZapInInput): Promise<PreparedZapIn> {
    return prepareZapInInternal(
      this.publicClient,
      this.chainId,
      this.poolService,
      this.routeService,
      input.poolAddress,
      input.tokenIn,
      input.amountIn,
      input.amountInSplit,
      input.recipient,
      input.owner,
      input.options
    )
  }

  /**
   * Builds zap out transaction with approval if needed.
   * Removes liquidity and swaps both tokens to a single output token.
   * @param input - Zap out parameters including owner for allowance check
   * @returns Transaction with approval (if needed) and zap out call
   */
  async buildZapOutTransaction(
    input: ZapOutInput & { owner: string }
  ): Promise<ZapOutTransaction> {
    return buildZapOutTransactionInternal(
      this.publicClient,
      this.chainId,
      this.poolService,
      this.routeService,
      input.poolAddress,
      input.tokenOut,
      input.liquidity,
      input.recipient,
      input.owner,
      input.options
    )
  }

  /**
   * Builds zap out transaction parameters without checking approval.
   * Use buildZapOutTransaction if you need approval handling.
   * @param input - Zap out parameters
   * @returns Transaction details with encoded call data and routing information
   */
  async buildZapOutParams(
    input: ZapOutInput
  ): Promise<ZapOutDetails> {
    return buildZapOutParamsInternal(
      this.publicClient,
      this.chainId,
      this.poolService,
      this.routeService,
      input.poolAddress,
      input.tokenOut,
      input.liquidity,
      input.recipient,
      input.options
    )
  }

  async prepareZapOut(input: PrepareZapOutInput): Promise<PreparedZapOut> {
    return prepareZapOutInternal(
      this.publicClient,
      this.chainId,
      this.poolService,
      this.routeService,
      input.poolAddress,
      input.tokenOut,
      input.liquidity,
      input.recipient,
      input.owner,
      input.options
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

  /**
   * Builds rebalance transaction parameters without checking approval.
   * Use buildRebalanceTransaction if you need approval handling.
   * @param input - Rebalance parameters
   * @returns Transaction details with encoded call data
   */
  async buildRebalanceParams(
    input: RebalanceInput
  ): Promise<RebalanceDetails> {
    return buildRebalanceParamsInternal(
      this.publicClient,
      this.chainId,
      this.poolService,
      input.poolAddress
    )
  }

  /**
   * Builds a rebalance transaction with ERC20 approval if needed.
   * @param input - Rebalance parameters including owner for allowance checks
   * @returns Transaction with approval (if needed) and rebalance call
   */
  async buildRebalanceTransaction(
    input: RebalanceInput & { owner: string }
  ): Promise<RebalanceTransaction> {
    return buildRebalanceTransactionInternal(
      this.publicClient,
      this.chainId,
      this.poolService,
      input.poolAddress,
      input.owner
    )
  }
}
