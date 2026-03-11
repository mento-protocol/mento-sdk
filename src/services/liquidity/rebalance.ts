import { Address, PublicClient, encodeFunctionData } from 'viem'
import { LIQUIDITY_STRATEGY_ABI } from '../../core/abis'
import { RebalanceDetails, RebalanceTransaction } from '../../core/types'
import { validateAddress } from '../../utils/validation'
import { PoolService } from '../pools'
import { buildApprovalParams, getAllowance } from './liquidityHelpers'

function getRebalanceUnavailableError(poolAddress: string): Error {
  return new Error(
    `Pool ${poolAddress} is not currently rebalanceable or does not have a supported liquidity strategy.`
  )
}

function assertRebalanceActionAmounts(
  poolAddress: string,
  amountRequired: bigint,
  amountTransferred: bigint
): void {
  if (amountRequired <= 0n || amountTransferred <= 0n) {
    throw new Error(`Rebalance action for pool ${poolAddress} has zero amounts and cannot be executed.`)
  }
}

export async function buildRebalanceParamsInternal(
  publicClient: PublicClient,
  chainId: number,
  poolService: PoolService,
  poolAddress: string
): Promise<RebalanceDetails> {
  validateAddress(poolAddress, 'poolAddress')

  const preview = await poolService.getPoolRebalancePreview(poolAddress)

  if (!preview) {
    throw getRebalanceUnavailableError(poolAddress)
  }

  assertRebalanceActionAmounts(
    poolAddress,
    preview.amountRequired.amount,
    preview.amountTransferred.amount
  )

  const data = encodeFunctionData({
    abi: LIQUIDITY_STRATEGY_ABI,
    functionName: 'rebalance',
    args: [poolAddress as Address],
  })

  return {
    params: {
      to: preview.strategyAddress,
      data,
      value: '0',
    },
    poolAddress,
    strategyAddress: preview.strategyAddress,
    inputToken: preview.inputToken,
    outputToken: preview.outputToken,
    amountRequired: preview.amountRequired.amount,
    expectedAmountTransferred: preview.amountTransferred.amount,
    expectedProtocolIncentive: preview.protocolIncentive.amount,
    expectedLiquiditySourceIncentive: preview.liquiditySourceIncentive.amount,
    approvalToken: preview.approvalToken,
    approvalSpender: preview.approvalSpender,
    approvalAmount: preview.approvalAmount,
    direction: preview.direction,
  }
}

export async function buildRebalanceTransactionInternal(
  publicClient: PublicClient,
  chainId: number,
  poolService: PoolService,
  poolAddress: string,
  owner: string
): Promise<RebalanceTransaction> {
  validateAddress(owner, 'owner')

  const rebalance = await buildRebalanceParamsInternal(
    publicClient,
    chainId,
    poolService,
    poolAddress
  )

  const approvalToken = rebalance.approvalToken as Address
  const approvalSpender = rebalance.approvalSpender as Address
  const currentAllowance = await getAllowance(
    publicClient,
    approvalToken,
    owner as Address,
    chainId,
    approvalSpender
  )

  const approval = currentAllowance < rebalance.approvalAmount
    ? {
        token: rebalance.approvalToken,
        amount: rebalance.approvalAmount,
        params: buildApprovalParams(
          chainId,
          approvalToken,
          rebalance.approvalAmount,
          approvalSpender
        ),
      }
    : null

  return { approval, rebalance }
}
