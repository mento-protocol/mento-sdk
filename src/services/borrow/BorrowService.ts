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

  buildOpenTroveTransaction(debtTokenSymbol: string, params: OpenTroveParams): Promise<CallParams> {
    return this.withContext(debtTokenSymbol, (ctx) => this.txService.buildOpenTroveTransaction(ctx, params))
  }

  buildAdjustTroveTransaction(debtTokenSymbol: string, params: AdjustTroveParams): Promise<CallParams> {
    return this.withContext(debtTokenSymbol, (ctx) => this.txService.buildAdjustTroveTransaction(ctx, params))
  }

  buildAdjustZombieTroveTransaction(
    debtTokenSymbol: string,
    params: AdjustTroveParams
  ): Promise<CallParams> {
    return this.withContext(debtTokenSymbol, (ctx) =>
      this.txService.buildAdjustZombieTroveTransaction(ctx, params)
    )
  }

  buildCloseTroveTransaction(debtTokenSymbol: string, troveId: string): Promise<CallParams> {
    return this.withContext(debtTokenSymbol, (ctx) => this.txService.buildCloseTroveTransaction(ctx, troveId))
  }

  buildAddCollTransaction(
    debtTokenSymbol: string,
    troveId: string,
    amount: bigint
  ): Promise<CallParams> {
    return this.withContext(debtTokenSymbol, (ctx) =>
      this.txService.buildAddCollTransaction(ctx, troveId, amount)
    )
  }

  buildWithdrawCollTransaction(
    debtTokenSymbol: string,
    troveId: string,
    amount: bigint
  ): Promise<CallParams> {
    return this.withContext(debtTokenSymbol, (ctx) =>
      this.txService.buildWithdrawCollTransaction(ctx, troveId, amount)
    )
  }

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

  buildRepayDebtTransaction(
    debtTokenSymbol: string,
    troveId: string,
    amount: bigint
  ): Promise<CallParams> {
    return this.withContext(debtTokenSymbol, (ctx) =>
      this.txService.buildRepayDebtTransaction(ctx, troveId, amount)
    )
  }

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

  buildClaimCollateralTransaction(debtTokenSymbol: string): Promise<CallParams> {
    return this.withContext(debtTokenSymbol, (ctx) => this.txService.buildClaimCollateralTransaction(ctx))
  }

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

  buildRemoveInterestDelegateTransaction(
    debtTokenSymbol: string,
    troveId: string
  ): Promise<CallParams> {
    return this.withContext(debtTokenSymbol, (ctx) =>
      this.txService.buildRemoveInterestDelegateTransaction(ctx, troveId)
    )
  }

  buildCollateralApprovalParams(debtTokenSymbol: string, amount: bigint): Promise<CallParams> {
    return this.withContext(debtTokenSymbol, (ctx) =>
      this.approvalService.buildCollateralApprovalParams(ctx, amount)
    )
  }

  buildDebtApprovalParams(
    debtTokenSymbol: string,
    spender: string,
    amount: bigint
  ): Promise<CallParams> {
    return this.withContext(debtTokenSymbol, (ctx) =>
      this.approvalService.buildDebtApprovalParams(ctx, spender, amount)
    )
  }

  buildGasCompensationApprovalParams(
    debtTokenSymbol: string,
    amount?: bigint
  ): Promise<CallParams> {
    return this.withContext(debtTokenSymbol, (ctx) =>
      this.approvalService.buildGasCompensationApprovalParams(ctx, amount)
    )
  }

  getCollateralAllowance(debtTokenSymbol: string, owner: string): Promise<bigint> {
    return this.withContext(debtTokenSymbol, (ctx) => this.approvalService.getCollateralAllowance(ctx, owner))
  }

  getDebtAllowance(debtTokenSymbol: string, owner: string, spender: string): Promise<bigint> {
    return this.withContext(debtTokenSymbol, (ctx) =>
      this.approvalService.getDebtAllowance(ctx, owner, spender)
    )
  }

  getGasTokenAllowance(debtTokenSymbol: string, owner: string): Promise<bigint> {
    return this.withContext(debtTokenSymbol, (ctx) => this.approvalService.getGasTokenAllowance(ctx, owner))
  }

  getTroveData(debtTokenSymbol: string, troveId: string): Promise<BorrowPosition> {
    return this.withContext(debtTokenSymbol, (ctx) => this.readService.getTroveData(ctx, troveId))
  }

  getUserTroves(debtTokenSymbol: string, owner: string): Promise<BorrowPosition[]> {
    return this.withContext(debtTokenSymbol, (ctx) => this.readService.getUserTroves(ctx, owner))
  }

  getCollateralPrice(debtTokenSymbol: string): Promise<bigint> {
    return this.withContext(debtTokenSymbol, (ctx) => this.readService.getCollateralPrice(ctx))
  }

  getSystemParams(debtTokenSymbol: string): Promise<SystemParams> {
    return this.withContext(debtTokenSymbol, (ctx) => ({ ...ctx.systemParams }))
  }

  isSystemShutDown(debtTokenSymbol: string): Promise<boolean> {
    return this.withContext(debtTokenSymbol, (ctx) => this.readService.isSystemShutDown(ctx))
  }

  getBranchStats(debtTokenSymbol: string): Promise<{ totalColl: bigint; totalDebt: bigint }> {
    return this.withContext(debtTokenSymbol, (ctx) => this.readService.getBranchStats(ctx))
  }

  getInterestRateBrackets(debtTokenSymbol: string): Promise<InterestRateBracket[]> {
    return this.withContext(debtTokenSymbol, (ctx) => this.readService.getInterestRateBrackets(ctx))
  }

  getAverageInterestRate(debtTokenSymbol: string): Promise<bigint> {
    return this.withContext(debtTokenSymbol, (ctx) => this.readService.getAverageInterestRate(ctx))
  }

  getBatchManagerInfo(
    debtTokenSymbol: string,
    address: string
  ): Promise<{ minRate: bigint; maxRate: bigint; minChangePeriod: bigint } | null> {
    return this.withContext(debtTokenSymbol, (ctx) => this.readService.getBatchManagerInfo(ctx, address))
  }

  predictOpenTroveUpfrontFee(
    debtTokenSymbol: string,
    amount: bigint,
    rate: bigint
  ): Promise<bigint> {
    return this.withContext(debtTokenSymbol, (ctx) =>
      this.readService.predictOpenTroveUpfrontFee(ctx, amount, rate)
    )
  }

  predictAdjustUpfrontFee(
    debtTokenSymbol: string,
    troveId: string,
    debtIncrease: bigint
  ): Promise<bigint> {
    return this.withContext(debtTokenSymbol, (ctx) =>
      this.readService.predictAdjustUpfrontFee(ctx, troveId, debtIncrease)
    )
  }

  predictAdjustInterestRateUpfrontFee(
    debtTokenSymbol: string,
    troveId: string,
    newRate: bigint
  ): Promise<bigint> {
    return this.withContext(debtTokenSymbol, (ctx) =>
      this.readService.predictAdjustInterestRateUpfrontFee(ctx, troveId, newRate)
    )
  }

  predictJoinBatchUpfrontFee(
    debtTokenSymbol: string,
    troveId: string,
    batchAddress: string
  ): Promise<bigint> {
    return this.withContext(debtTokenSymbol, (ctx) =>
      this.readService.predictJoinBatchUpfrontFee(ctx, troveId, batchAddress)
    )
  }

  getNextOwnerIndex(debtTokenSymbol: string, owner: string): Promise<number> {
    return this.withContext(debtTokenSymbol, (ctx) => this.readService.getNextOwnerIndex(ctx, owner))
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
