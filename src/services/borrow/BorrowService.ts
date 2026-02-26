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

  async buildOpenTroveTransaction(
    debtTokenSymbol: string,
    params: OpenTroveParams
  ): Promise<CallParams> {
    const ctx = await this.ensureInitialized(debtTokenSymbol)
    return this.txService.buildOpenTroveTransaction(ctx, params)
  }

  async buildAdjustTroveTransaction(
    debtTokenSymbol: string,
    params: AdjustTroveParams
  ): Promise<CallParams> {
    const ctx = await this.ensureInitialized(debtTokenSymbol)
    return this.txService.buildAdjustTroveTransaction(ctx, params)
  }

  async buildAdjustZombieTroveTransaction(
    debtTokenSymbol: string,
    params: AdjustTroveParams
  ): Promise<CallParams> {
    const ctx = await this.ensureInitialized(debtTokenSymbol)
    return this.txService.buildAdjustZombieTroveTransaction(ctx, params)
  }

  async buildCloseTroveTransaction(debtTokenSymbol: string, troveId: string): Promise<CallParams> {
    const ctx = await this.ensureInitialized(debtTokenSymbol)
    return this.txService.buildCloseTroveTransaction(ctx, troveId)
  }

  async buildAddCollTransaction(
    debtTokenSymbol: string,
    troveId: string,
    amount: bigint
  ): Promise<CallParams> {
    const ctx = await this.ensureInitialized(debtTokenSymbol)
    return this.txService.buildAddCollTransaction(ctx, troveId, amount)
  }

  async buildWithdrawCollTransaction(
    debtTokenSymbol: string,
    troveId: string,
    amount: bigint
  ): Promise<CallParams> {
    const ctx = await this.ensureInitialized(debtTokenSymbol)
    return this.txService.buildWithdrawCollTransaction(ctx, troveId, amount)
  }

  async buildBorrowMoreTransaction(
    debtTokenSymbol: string,
    troveId: string,
    amount: bigint,
    maxFee: bigint
  ): Promise<CallParams> {
    const ctx = await this.ensureInitialized(debtTokenSymbol)
    return this.txService.buildBorrowMoreTransaction(ctx, troveId, amount, maxFee)
  }

  async buildRepayDebtTransaction(
    debtTokenSymbol: string,
    troveId: string,
    amount: bigint
  ): Promise<CallParams> {
    const ctx = await this.ensureInitialized(debtTokenSymbol)
    return this.txService.buildRepayDebtTransaction(ctx, troveId, amount)
  }

  async buildAdjustInterestRateTransaction(
    debtTokenSymbol: string,
    troveId: string,
    newRate: bigint,
    maxFee: bigint
  ): Promise<CallParams> {
    const ctx = await this.ensureInitialized(debtTokenSymbol)
    return this.txService.buildAdjustInterestRateTransaction(ctx, troveId, newRate, maxFee)
  }

  async buildClaimCollateralTransaction(debtTokenSymbol: string): Promise<CallParams> {
    const ctx = await this.ensureInitialized(debtTokenSymbol)
    return this.txService.buildClaimCollateralTransaction(ctx)
  }

  async buildSetBatchManagerTransaction(
    debtTokenSymbol: string,
    troveId: string,
    manager: string,
    maxFee: bigint
  ): Promise<CallParams> {
    const ctx = await this.ensureInitialized(debtTokenSymbol)
    return this.txService.buildSetBatchManagerTransaction(ctx, troveId, manager, maxFee)
  }

  async buildRemoveFromBatchTransaction(
    debtTokenSymbol: string,
    troveId: string,
    newRate: bigint,
    maxFee: bigint
  ): Promise<CallParams> {
    const ctx = await this.ensureInitialized(debtTokenSymbol)
    return this.txService.buildRemoveFromBatchTransaction(ctx, troveId, newRate, maxFee)
  }

  async buildSwitchBatchManagerTransaction(
    debtTokenSymbol: string,
    troveId: string,
    newManager: string,
    maxFee: bigint
  ): Promise<CallParams> {
    const ctx = await this.ensureInitialized(debtTokenSymbol)
    return this.txService.buildSwitchBatchManagerTransaction(ctx, troveId, newManager, maxFee)
  }

  async buildSetInterestDelegateTransaction(
    debtTokenSymbol: string,
    troveId: string,
    delegate: string,
    minRate: bigint,
    maxRate: bigint,
    newRate: bigint,
    maxFee: bigint,
    minChangePeriod: bigint
  ): Promise<CallParams> {
    const ctx = await this.ensureInitialized(debtTokenSymbol)
    return this.txService.buildSetInterestDelegateTransaction(
      ctx,
      troveId,
      delegate,
      minRate,
      maxRate,
      newRate,
      maxFee,
      minChangePeriod
    )
  }

  async buildRemoveInterestDelegateTransaction(
    debtTokenSymbol: string,
    troveId: string
  ): Promise<CallParams> {
    const ctx = await this.ensureInitialized(debtTokenSymbol)
    return this.txService.buildRemoveInterestDelegateTransaction(ctx, troveId)
  }

  async buildCollateralApprovalParams(
    debtTokenSymbol: string,
    amount: bigint
  ): Promise<CallParams> {
    const ctx = await this.ensureInitialized(debtTokenSymbol)
    return this.approvalService.buildCollateralApprovalParams(ctx, amount)
  }

  async buildDebtApprovalParams(
    debtTokenSymbol: string,
    spender: string,
    amount: bigint
  ): Promise<CallParams> {
    const ctx = await this.ensureInitialized(debtTokenSymbol)
    return this.approvalService.buildDebtApprovalParams(ctx, spender, amount)
  }

  async buildGasCompensationApprovalParams(
    debtTokenSymbol: string,
    amount?: bigint
  ): Promise<CallParams> {
    const ctx = await this.ensureInitialized(debtTokenSymbol)
    return this.approvalService.buildGasCompensationApprovalParams(ctx, amount)
  }

  async getCollateralAllowance(debtTokenSymbol: string, owner: string): Promise<bigint> {
    const ctx = await this.ensureInitialized(debtTokenSymbol)
    return this.approvalService.getCollateralAllowance(ctx, owner)
  }

  async getDebtAllowance(debtTokenSymbol: string, owner: string, spender: string): Promise<bigint> {
    const ctx = await this.ensureInitialized(debtTokenSymbol)
    return this.approvalService.getDebtAllowance(ctx, owner, spender)
  }

  async getGasTokenAllowance(debtTokenSymbol: string, owner: string): Promise<bigint> {
    const ctx = await this.ensureInitialized(debtTokenSymbol)
    return this.approvalService.getGasTokenAllowance(ctx, owner)
  }

  async getTroveData(debtTokenSymbol: string, troveId: string): Promise<BorrowPosition> {
    const ctx = await this.ensureInitialized(debtTokenSymbol)
    return this.readService.getTroveData(ctx, troveId)
  }

  async getUserTroves(debtTokenSymbol: string, owner: string): Promise<BorrowPosition[]> {
    const ctx = await this.ensureInitialized(debtTokenSymbol)
    return this.readService.getUserTroves(ctx, owner)
  }

  async getCollateralPrice(debtTokenSymbol: string): Promise<bigint> {
    const ctx = await this.ensureInitialized(debtTokenSymbol)
    return this.readService.getCollateralPrice(ctx)
  }

  async getSystemParams(debtTokenSymbol: string): Promise<SystemParams> {
    const ctx = await this.ensureInitialized(debtTokenSymbol)
    return { ...ctx.systemParams }
  }

  async isSystemShutDown(debtTokenSymbol: string): Promise<boolean> {
    const ctx = await this.ensureInitialized(debtTokenSymbol)
    return this.readService.isSystemShutDown(ctx)
  }

  async getBranchStats(debtTokenSymbol: string): Promise<{ totalColl: bigint; totalDebt: bigint }> {
    const ctx = await this.ensureInitialized(debtTokenSymbol)
    return this.readService.getBranchStats(ctx)
  }

  async getInterestRateBrackets(debtTokenSymbol: string): Promise<InterestRateBracket[]> {
    const ctx = await this.ensureInitialized(debtTokenSymbol)
    return this.readService.getInterestRateBrackets(ctx)
  }

  async getAverageInterestRate(debtTokenSymbol: string): Promise<bigint> {
    const ctx = await this.ensureInitialized(debtTokenSymbol)
    return this.readService.getAverageInterestRate(ctx)
  }

  async getBatchManagerInfo(
    debtTokenSymbol: string,
    address: string
  ): Promise<{ minRate: bigint; maxRate: bigint; minChangePeriod: bigint } | null> {
    const ctx = await this.ensureInitialized(debtTokenSymbol)
    return this.readService.getBatchManagerInfo(ctx, address)
  }

  async predictOpenTroveUpfrontFee(
    debtTokenSymbol: string,
    amount: bigint,
    rate: bigint
  ): Promise<bigint> {
    const ctx = await this.ensureInitialized(debtTokenSymbol)
    return this.readService.predictOpenTroveUpfrontFee(ctx, amount, rate)
  }

  async predictAdjustUpfrontFee(
    debtTokenSymbol: string,
    troveId: string,
    debtIncrease: bigint
  ): Promise<bigint> {
    const ctx = await this.ensureInitialized(debtTokenSymbol)
    return this.readService.predictAdjustUpfrontFee(ctx, troveId, debtIncrease)
  }

  async predictAdjustInterestRateUpfrontFee(
    debtTokenSymbol: string,
    troveId: string,
    newRate: bigint
  ): Promise<bigint> {
    const ctx = await this.ensureInitialized(debtTokenSymbol)
    return this.readService.predictAdjustInterestRateUpfrontFee(ctx, troveId, newRate)
  }

  async predictJoinBatchUpfrontFee(
    debtTokenSymbol: string,
    troveId: string,
    batchAddress: string
  ): Promise<bigint> {
    const ctx = await this.ensureInitialized(debtTokenSymbol)
    return this.readService.predictJoinBatchUpfrontFee(ctx, troveId, batchAddress)
  }

  async getNextOwnerIndex(debtTokenSymbol: string, owner: string): Promise<number> {
    const ctx = await this.ensureInitialized(debtTokenSymbol)
    return this.readService.getNextOwnerIndex(ctx, owner)
  }

  private ensureInitialized(debtTokenSymbol: string): Promise<DeploymentContext> {
    return this.contextStore.ensureInitialized(debtTokenSymbol)
  }
}
