import { PublicClient } from 'viem'
import {
  AdjustTroveParams,
  BorrowPosition,
  CallParams,
  InterestRateBracket,
  OpenTroveParams,
  SystemParams,
} from '../../core/types'
import { BorrowApprovalService } from './internal/borrowApprovalService'
import { BorrowContextStore } from './internal/borrowContextStore'
import { BorrowReadService } from './internal/borrowReadService'
import { BorrowTransactionService } from './internal/borrowTransactionService'
import { DeploymentContext } from './internal/borrowTypes'

/**
 * Service for managing borrowing positions (troves) in the Mento protocol.
 * Provides methods to open, adjust, and close troves, manage collateral and debt,
 * handle interest rates and batch managers, and query position data.
 *
 * All `build*` methods return `CallParams` ({ to, data, value }) that can be
 * executed with any wallet client. The `debtTokenSymbol` parameter (e.g., 'GBPm')
 * identifies which borrowing deployment to interact with.
 *
 * @example
 * ```typescript
 * const mento = await Mento.create(ChainId.CELO)
 *
 * const ownerIndex = await mento.borrow.findNextAvailableOwnerIndex('GBPm', '0x...', '0x...')
 *
 * // Open a trove
 * const tx = await mento.borrow.buildOpenTroveTransaction('GBPm', {
 *   owner: '0x...', ownerIndex,
 *   collAmount: parseUnits('10', 18),
 *   boldAmount: parseUnits('1000', 18),
 *   annualInterestRate: parseUnits('0.05', 18),
 *   maxUpfrontFee: parseUnits('100', 18),
 * })
 * await walletClient.sendTransaction(tx)
 * ```
 */
export class BorrowService {
  private contextStore: BorrowContextStore
  private txService: BorrowTransactionService
  private approvalService: BorrowApprovalService
  private readService: BorrowReadService

  constructor(
    publicClient: PublicClient,
    chainId: number
  ) {
    this.contextStore = new BorrowContextStore(publicClient, chainId)
    this.txService = new BorrowTransactionService(publicClient)
    this.approvalService = new BorrowApprovalService(publicClient)
    this.readService = new BorrowReadService(publicClient)
  }

  /**
   * Builds a transaction to open a new trove (borrowing position).
   * Requires prior collateral approval via `buildCollateralApprovalParams`.
   *
   * @param debtTokenSymbol - The debt token symbol (e.g., 'GBPm')
   * @param params - Trove opening parameters including collateral, debt amount, and interest rate
   * @returns Transaction parameters ready to send
   */
  buildOpenTroveTransaction(debtTokenSymbol: string, params: OpenTroveParams): Promise<CallParams> {
    return this.withContext(debtTokenSymbol, (ctx) => this.txService.buildOpenTroveTransaction(ctx, params))
  }

  /**
   * Builds a transaction to adjust an existing trove's collateral and/or debt.
   *
   * @param debtTokenSymbol - The debt token symbol (e.g., 'GBPm')
   * @param params - Adjustment parameters specifying collateral/debt changes
   * @returns Transaction parameters ready to send
   */
  buildAdjustTroveTransaction(debtTokenSymbol: string, params: AdjustTroveParams): Promise<CallParams> {
    return this.withContext(debtTokenSymbol, (ctx) => this.txService.buildAdjustTroveTransaction(ctx, params))
  }

  /**
   * Builds a transaction to adjust a zombie trove. Zombie troves are still-open troves whose
   * debt fell below the branch minimum debt, typically after a redemption.
   *
   * Use this when `getTroveData()` or `getUserTroves()` returns `status === 'zombie'`.
   * Same parameters as `buildAdjustTroveTransaction`.
   *
   * @param debtTokenSymbol - The debt token symbol (e.g., 'GBPm')
   * @param params - Adjustment parameters specifying collateral/debt changes
   * @returns Transaction parameters ready to send
   */
  buildAdjustZombieTroveTransaction(
    debtTokenSymbol: string,
    params: AdjustTroveParams
  ): Promise<CallParams> {
    return this.withContext(debtTokenSymbol, (ctx) =>
      this.txService.buildAdjustZombieTroveTransaction(ctx, params)
    )
  }

  /**
   * Builds a transaction to close a trove, repaying all debt and reclaiming collateral.
   *
   * @param debtTokenSymbol - The debt token symbol (e.g., 'GBPm')
   * @param troveId - The NFT token ID identifying the trove
   * @returns Transaction parameters ready to send
   */
  buildCloseTroveTransaction(debtTokenSymbol: string, troveId: string): Promise<CallParams> {
    return this.withContext(debtTokenSymbol, (ctx) => this.txService.buildCloseTroveTransaction(ctx, troveId))
  }

  /**
   * Builds a transaction to add collateral to an existing trove.
   * Requires prior collateral approval via `buildCollateralApprovalParams`.
   *
   * @param debtTokenSymbol - The debt token symbol (e.g., 'GBPm')
   * @param troveId - The NFT token ID identifying the trove
   * @param amount - Amount of collateral to add (in wei)
   * @returns Transaction parameters ready to send
   */
  buildAddCollTransaction(
    debtTokenSymbol: string,
    troveId: string,
    amount: bigint
  ): Promise<CallParams> {
    return this.withContext(debtTokenSymbol, (ctx) =>
      this.txService.buildAddCollTransaction(ctx, troveId, amount)
    )
  }

  /**
   * Builds a transaction to withdraw collateral from an existing trove.
   *
   * @param debtTokenSymbol - The debt token symbol (e.g., 'GBPm')
   * @param troveId - The NFT token ID identifying the trove
   * @param amount - Amount of collateral to withdraw (in wei)
   * @returns Transaction parameters ready to send
   */
  buildWithdrawCollTransaction(
    debtTokenSymbol: string,
    troveId: string,
    amount: bigint
  ): Promise<CallParams> {
    return this.withContext(debtTokenSymbol, (ctx) =>
      this.txService.buildWithdrawCollTransaction(ctx, troveId, amount)
    )
  }

  /**
   * Builds a transaction to borrow additional debt against an existing trove.
   *
   * @param debtTokenSymbol - The debt token symbol (e.g., 'GBPm')
   * @param troveId - The NFT token ID identifying the trove
   * @param amount - Additional debt amount to borrow (in wei)
   * @param maxFee - Maximum upfront fee the borrower is willing to pay (in wei)
   * @returns Transaction parameters ready to send
   */
  buildBorrowMoreTransaction(
    debtTokenSymbol: string,
    troveId: string,
    amount: bigint,
    maxFee: bigint
  ): Promise<CallParams> {
    return this.withContext(debtTokenSymbol, (ctx) =>
      this.txService.buildBorrowMoreTransaction(ctx, troveId, amount, maxFee)
    )
  }

  /**
   * Builds a transaction to repay debt on an existing trove.
   *
   * @param debtTokenSymbol - The debt token symbol (e.g., 'GBPm')
   * @param troveId - The NFT token ID identifying the trove
   * @param amount - Amount of debt to repay (in wei)
   * @returns Transaction parameters ready to send
   */
  buildRepayDebtTransaction(
    debtTokenSymbol: string,
    troveId: string,
    amount: bigint
  ): Promise<CallParams> {
    return this.withContext(debtTokenSymbol, (ctx) =>
      this.txService.buildRepayDebtTransaction(ctx, troveId, amount)
    )
  }

  /**
   * Builds a transaction to change the annual interest rate on a trove.
   *
   * @param debtTokenSymbol - The debt token symbol (e.g., 'GBPm')
   * @param troveId - The NFT token ID identifying the trove
   * @param newRate - New annual interest rate (18-decimal fixed-point, e.g., parseUnits('0.05', 18) for 5%)
   * @param maxFee - Maximum upfront fee the borrower is willing to pay (in wei)
   * @returns Transaction parameters ready to send
   */
  buildAdjustInterestRateTransaction(
    debtTokenSymbol: string,
    troveId: string,
    newRate: bigint,
    maxFee: bigint
  ): Promise<CallParams> {
    return this.withContext(debtTokenSymbol, (ctx) =>
      this.txService.buildAdjustInterestRateTransaction(ctx, troveId, newRate, maxFee)
    )
  }

  /**
   * Builds a transaction to claim collateral surplus after a liquidation.
   * This is for collateral held in the surplus pool after `closedByLiquidation`.
   * Zombie troves with remaining collateral should usually be closed or adjusted instead.
   *
   * @param debtTokenSymbol - The debt token symbol (e.g., 'GBPm')
   * @returns Transaction parameters ready to send
   */
  buildClaimCollateralTransaction(debtTokenSymbol: string): Promise<CallParams> {
    return this.withContext(debtTokenSymbol, (ctx) => this.txService.buildClaimCollateralTransaction(ctx))
  }

  /**
   * Builds a transaction to delegate interest rate management to a batch manager.
   *
   * @param debtTokenSymbol - The debt token symbol (e.g., 'GBPm')
   * @param troveId - The NFT token ID identifying the trove
   * @param manager - Address of the batch manager contract
   * @param maxFee - Maximum upfront fee the borrower is willing to pay (in wei)
   * @returns Transaction parameters ready to send
   */
  buildSetBatchManagerTransaction(
    debtTokenSymbol: string,
    troveId: string,
    manager: string,
    maxFee: bigint
  ): Promise<CallParams> {
    return this.withContext(debtTokenSymbol, (ctx) =>
      this.txService.buildSetBatchManagerTransaction(ctx, troveId, manager, maxFee)
    )
  }

  /**
   * Builds a transaction to remove a trove from a batch manager, setting a new individual rate.
   *
   * @param debtTokenSymbol - The debt token symbol (e.g., 'GBPm')
   * @param troveId - The NFT token ID identifying the trove
   * @param newRate - New individual annual interest rate (18-decimal fixed-point)
   * @param maxFee - Maximum upfront fee the borrower is willing to pay (in wei)
   * @returns Transaction parameters ready to send
   */
  buildRemoveFromBatchTransaction(
    debtTokenSymbol: string,
    troveId: string,
    newRate: bigint,
    maxFee: bigint
  ): Promise<CallParams> {
    return this.withContext(debtTokenSymbol, (ctx) =>
      this.txService.buildRemoveFromBatchTransaction(ctx, troveId, newRate, maxFee)
    )
  }

  /**
   * Builds a transaction to switch a trove to a different batch manager.
   *
   * @param debtTokenSymbol - The debt token symbol (e.g., 'GBPm')
   * @param troveId - The NFT token ID identifying the trove
   * @param newManager - Address of the new batch manager contract
   * @param maxFee - Maximum upfront fee the borrower is willing to pay (in wei)
   * @returns Transaction parameters ready to send
   */
  buildSwitchBatchManagerTransaction(
    debtTokenSymbol: string,
    troveId: string,
    newManager: string,
    maxFee: bigint
  ): Promise<CallParams> {
    return this.withContext(debtTokenSymbol, (ctx) =>
      this.txService.buildSwitchBatchManagerTransaction(ctx, troveId, newManager, maxFee)
    )
  }

  /**
   * Builds a transaction to delegate interest rate management to another address
   * with bounded rate constraints.
   *
   * @param debtTokenSymbol - The debt token symbol (e.g., 'GBPm')
   * @param troveId - The NFT token ID identifying the trove
   * @param delegate - Address to delegate interest rate management to
   * @param minRate - Minimum allowed annual interest rate (18-decimal fixed-point)
   * @param maxRate - Maximum allowed annual interest rate (18-decimal fixed-point)
   * @param newRate - Initial annual interest rate to set (18-decimal fixed-point)
   * @param maxFee - Maximum upfront fee the borrower is willing to pay (in wei)
   * @param minChangePeriod - Minimum time between rate changes (in seconds)
   * @returns Transaction parameters ready to send
   */
  buildSetInterestDelegateTransaction(
    debtTokenSymbol: string,
    troveId: string,
    delegate: string,
    minRate: bigint,
    maxRate: bigint,
    newRate: bigint,
    maxFee: bigint,
    minChangePeriod: bigint
  ): Promise<CallParams> {
    return this.withContext(debtTokenSymbol, (ctx) =>
      this.txService.buildSetInterestDelegateTransaction(
        ctx,
        troveId,
        delegate,
        minRate,
        maxRate,
        newRate,
        maxFee,
        minChangePeriod
      )
    )
  }

  /**
   * Builds a transaction to remove the interest rate delegate from a trove.
   *
   * @param debtTokenSymbol - The debt token symbol (e.g., 'GBPm')
   * @param troveId - The NFT token ID identifying the trove
   * @returns Transaction parameters ready to send
   */
  buildRemoveInterestDelegateTransaction(
    debtTokenSymbol: string,
    troveId: string
  ): Promise<CallParams> {
    return this.withContext(debtTokenSymbol, (ctx) =>
      this.txService.buildRemoveInterestDelegateTransaction(ctx, troveId)
    )
  }

  /**
   * Builds approval params to allow BorrowerOperations to spend collateral tokens.
   * Must be executed before `buildOpenTroveTransaction` or `buildAddCollTransaction`.
   *
   * @param debtTokenSymbol - The debt token symbol (e.g., 'GBPm')
   * @param amount - Amount of collateral to approve (in wei)
   * @returns Transaction parameters for the ERC-20 approve call
   */
  buildCollateralApprovalParams(debtTokenSymbol: string, amount: bigint): Promise<CallParams> {
    return this.withContext(debtTokenSymbol, (ctx) =>
      this.approvalService.buildCollateralApprovalParams(ctx, amount)
    )
  }

  /**
   * Builds approval params for the debt token (e.g., for repayment or closing).
   *
   * @param debtTokenSymbol - The debt token symbol (e.g., 'GBPm')
   * @param spender - Address to approve as spender
   * @param amount - Amount of debt tokens to approve (in wei)
   * @returns Transaction parameters for the ERC-20 approve call
   */
  buildDebtApprovalParams(
    debtTokenSymbol: string,
    spender: string,
    amount: bigint
  ): Promise<CallParams> {
    return this.withContext(debtTokenSymbol, (ctx) =>
      this.approvalService.buildDebtApprovalParams(ctx, spender, amount)
    )
  }

  /**
   * Builds approval params for the gas compensation token (required when opening a trove).
   *
   * @param debtTokenSymbol - The debt token symbol (e.g., 'GBPm')
   * @param amount - Amount to approve (in wei). If omitted, approves the gas compensation amount.
   * @returns Transaction parameters for the ERC-20 approve call
   */
  buildGasCompensationApprovalParams(
    debtTokenSymbol: string,
    amount?: bigint
  ): Promise<CallParams> {
    return this.withContext(debtTokenSymbol, (ctx) =>
      this.approvalService.buildGasCompensationApprovalParams(ctx, amount)
    )
  }

  /**
   * Gets the current collateral token allowance for BorrowerOperations.
   *
   * @param debtTokenSymbol - The debt token symbol (e.g., 'GBPm')
   * @param owner - Address to check allowance for
   * @returns Current allowance in wei
   */
  getCollateralAllowance(debtTokenSymbol: string, owner: string): Promise<bigint> {
    return this.withContext(debtTokenSymbol, (ctx) => this.approvalService.getCollateralAllowance(ctx, owner))
  }

  /**
   * Gets the current debt token allowance for a specific spender.
   *
   * @param debtTokenSymbol - The debt token symbol (e.g., 'GBPm')
   * @param owner - Address to check allowance for
   * @param spender - Address of the approved spender
   * @returns Current allowance in wei
   */
  getDebtAllowance(debtTokenSymbol: string, owner: string, spender: string): Promise<bigint> {
    return this.withContext(debtTokenSymbol, (ctx) =>
      this.approvalService.getDebtAllowance(ctx, owner, spender)
    )
  }

  /**
   * Gets the current gas compensation token allowance.
   *
   * @param debtTokenSymbol - The debt token symbol (e.g., 'GBPm')
   * @param owner - Address to check allowance for
   * @returns Current allowance in wei
   */
  getGasTokenAllowance(debtTokenSymbol: string, owner: string): Promise<bigint> {
    return this.withContext(debtTokenSymbol, (ctx) => this.approvalService.getGasTokenAllowance(ctx, owner))
  }

  /**
   * Fetches on-chain data for a specific trove.
   * The returned position reflects the trove's current lifecycle status, including
   * zombie troves that may still hold collateral even when their debt is zero.
   *
   * @param debtTokenSymbol - The debt token symbol (e.g., 'GBPm')
   * @param troveId - The NFT token ID identifying the trove
   * @returns Trove position data including collateral, debt, interest rate, and status
   */
  getTroveData(debtTokenSymbol: string, troveId: string): Promise<BorrowPosition> {
    return this.withContext(debtTokenSymbol, (ctx) => this.readService.getTroveData(ctx, troveId))
  }

  /**
   * Fetches troves currently owned by an address via the Trove NFT.
   * This includes zombie troves that have been removed from `SortedTroves` but are still owned
   * by the address. Closed or liquidated troves are not returned once their Trove NFT is burned
   * or transferred away.
   *
   * @param debtTokenSymbol - The debt token symbol (e.g., 'GBPm')
   * @param owner - Address to query troves for
   * @returns Array of trove positions currently owned by the address
   */
  getUserTroves(debtTokenSymbol: string, owner: string): Promise<BorrowPosition[]> {
    return this.withContext(debtTokenSymbol, (ctx) => this.readService.getUserTroves(ctx, owner))
  }

  /**
   * Gets the current collateral token price from the price feed.
   *
   * @param debtTokenSymbol - The debt token symbol (e.g., 'GBPm')
   * @returns Collateral price in 18-decimal fixed-point format
   */
  getCollateralPrice(debtTokenSymbol: string): Promise<bigint> {
    return this.withContext(debtTokenSymbol, (ctx) => this.readService.getCollateralPrice(ctx))
  }

  /**
   * Gets the system parameters for a borrowing deployment.
   * Returns MCR, CCR, SCR, BCR, minimum debt, gas compensation, and minimum interest rate.
   *
   * @param debtTokenSymbol - The debt token symbol (e.g., 'GBPm')
   * @returns System parameters (all values in 18-decimal fixed-point)
   */
  getSystemParams(debtTokenSymbol: string): Promise<SystemParams> {
    return this.withContext(debtTokenSymbol, (ctx) => ({ ...ctx.systemParams }))
  }

  /**
   * Checks whether the borrowing system has been shut down (e.g., during a crisis).
   *
   * @param debtTokenSymbol - The debt token symbol (e.g., 'GBPm')
   * @returns true if the system is shut down, false otherwise
   */
  isSystemShutDown(debtTokenSymbol: string): Promise<boolean> {
    return this.withContext(debtTokenSymbol, (ctx) => this.readService.isSystemShutDown(ctx))
  }

  /**
   * Gets aggregate collateral and debt statistics for the borrowing branch.
   *
   * @param debtTokenSymbol - The debt token symbol (e.g., 'GBPm')
   * @returns Total collateral and total debt across all troves (in wei)
   */
  getBranchStats(debtTokenSymbol: string): Promise<{ totalColl: bigint; totalDebt: bigint }> {
    return this.withContext(debtTokenSymbol, (ctx) => this.readService.getBranchStats(ctx))
  }

  /**
   * Gets the distribution of debt across interest rate brackets.
   *
   * @param debtTokenSymbol - The debt token symbol (e.g., 'GBPm')
   * @returns Array of brackets, each with a rate and total debt at that rate
   */
  getInterestRateBrackets(debtTokenSymbol: string): Promise<InterestRateBracket[]> {
    return this.withContext(debtTokenSymbol, (ctx) => this.readService.getInterestRateBrackets(ctx))
  }

  /**
   * Gets the weighted average interest rate across all active troves.
   *
   * @param debtTokenSymbol - The debt token symbol (e.g., 'GBPm')
   * @returns Average annual interest rate in 18-decimal fixed-point
   */
  getAverageInterestRate(debtTokenSymbol: string): Promise<bigint> {
    return this.withContext(debtTokenSymbol, (ctx) => this.readService.getAverageInterestRate(ctx))
  }

  /**
   * Gets information about a batch manager's configuration.
   *
   * @param debtTokenSymbol - The debt token symbol (e.g., 'GBPm')
   * @param address - Address of the batch manager
   * @returns Batch manager config (min/max rate, min change period), or null if not a valid manager
   */
  getBatchManagerInfo(
    debtTokenSymbol: string,
    address: string
  ): Promise<{ minRate: bigint; maxRate: bigint; minChangePeriod: bigint } | null> {
    return this.withContext(debtTokenSymbol, (ctx) => this.readService.getBatchManagerInfo(ctx, address))
  }

  /**
   * Estimates the upfront fee for opening a new trove.
   *
   * @param debtTokenSymbol - The debt token symbol (e.g., 'GBPm')
   * @param amount - Debt amount to borrow (in wei)
   * @param rate - Annual interest rate (18-decimal fixed-point)
   * @returns Estimated upfront fee in wei
   */
  predictOpenTroveUpfrontFee(
    debtTokenSymbol: string,
    amount: bigint,
    rate: bigint
  ): Promise<bigint> {
    return this.withContext(debtTokenSymbol, (ctx) =>
      this.readService.predictOpenTroveUpfrontFee(ctx, amount, rate)
    )
  }

  /**
   * Estimates the upfront fee for increasing debt on an existing trove.
   *
   * @param debtTokenSymbol - The debt token symbol (e.g., 'GBPm')
   * @param troveId - The NFT token ID identifying the trove
   * @param debtIncrease - Amount of additional debt (in wei)
   * @returns Estimated upfront fee in wei
   */
  predictAdjustUpfrontFee(
    debtTokenSymbol: string,
    troveId: string,
    debtIncrease: bigint
  ): Promise<bigint> {
    return this.withContext(debtTokenSymbol, (ctx) =>
      this.readService.predictAdjustUpfrontFee(ctx, troveId, debtIncrease)
    )
  }

  /**
   * Estimates the upfront fee for changing a trove's interest rate.
   *
   * @param debtTokenSymbol - The debt token symbol (e.g., 'GBPm')
   * @param troveId - The NFT token ID identifying the trove
   * @param newRate - New annual interest rate (18-decimal fixed-point)
   * @returns Estimated upfront fee in wei
   */
  predictAdjustInterestRateUpfrontFee(
    debtTokenSymbol: string,
    troveId: string,
    newRate: bigint
  ): Promise<bigint> {
    return this.withContext(debtTokenSymbol, (ctx) =>
      this.readService.predictAdjustInterestRateUpfrontFee(ctx, troveId, newRate)
    )
  }

  /**
   * Estimates the upfront fee for joining a batch manager.
   *
   * @param debtTokenSymbol - The debt token symbol (e.g., 'GBPm')
   * @param troveId - The NFT token ID identifying the trove
   * @param batchAddress - Address of the batch manager to join
   * @returns Estimated upfront fee in wei
   */
  predictJoinBatchUpfrontFee(
    debtTokenSymbol: string,
    troveId: string,
    batchAddress: string
  ): Promise<bigint> {
    return this.withContext(debtTokenSymbol, (ctx) =>
      this.readService.predictJoinBatchUpfrontFee(ctx, troveId, batchAddress)
    )
  }

  /**
   * Gets the current number of troves owned by an address via the Trove NFT.
   *
   * @param debtTokenSymbol - The debt token symbol (e.g., 'GBPm')
   * @param owner - Address of the trove owner
   * @returns The number of troves currently owned by the address
   */
  getOwnedTroveCount(debtTokenSymbol: string, owner: string): Promise<number> {
    return this.withContext(debtTokenSymbol, (ctx) => this.readService.getOwnedTroveCount(ctx, owner))
  }

  /**
   * Finds the first safe owner index for opening a trove with the given transaction sender.
   *
   * The `opener` must be the address that will call BorrowerOperations on-chain.
   * For smart accounts, pass the smart account address rather than the controlling EOA.
   *
   * @param debtTokenSymbol - The debt token symbol (e.g., 'GBPm')
   * @param owner - Address that will own the trove NFT
   * @param opener - Address that will submit the open-trove transaction on-chain
   * @returns The first owner index that does not already map to an existing trove
   */
  findNextAvailableOwnerIndex(
    debtTokenSymbol: string,
    owner: string,
    opener: string
  ): Promise<number> {
    return this.withContext(debtTokenSymbol, (ctx) =>
      this.readService.findNextAvailableOwnerIndex(ctx, owner, opener)
    )
  }

  /**
   * Gets the current number of troves owned by an address via the Trove NFT.
   *
   * @deprecated Use `findNextAvailableOwnerIndex` when preparing an open-trove transaction.
   *
   * @param debtTokenSymbol - The debt token symbol (e.g., 'GBPm')
   * @param owner - Address of the trove owner
   * @returns The number of troves currently owned by the address
   */
  getNextOwnerIndex(debtTokenSymbol: string, owner: string): Promise<number> {
    return this.withContext(debtTokenSymbol, (ctx) => this.readService.getOwnedTroveCount(ctx, owner))
  }

  private async withContext<T>(
    debtTokenSymbol: string,
    callback: (ctx: DeploymentContext) => Promise<T> | T
  ): Promise<T> {
    const ctx = await this.ensureInitialized(debtTokenSymbol)
    return callback(ctx)
  }

  private ensureInitialized(debtTokenSymbol: string): Promise<DeploymentContext> {
    return this.contextStore.ensureInitialized(debtTokenSymbol)
  }
}
