import { Address, PublicClient, encodeFunctionData } from 'viem'
import { ERC20_ABI } from '../../../core/abis'
import { CallParams } from '../../../core/types'
import {
  buildCollateralApprovalParams as buildCollateralApprovalParamsHelper,
  getCollateralAllowance as getCollateralAllowanceHelper,
} from '../borrowHelpers'
import { DeploymentContext } from './borrowTypes'
import { requireAddress, requireNonNegativeBigInt } from './borrowValidation'

const ZERO_VALUE = '0'

export class BorrowApprovalService {
  constructor(private publicClient: PublicClient) {}

  buildCollateralApprovalParams(ctx: DeploymentContext, amount: bigint): CallParams {
    const approvalAmount = requireNonNegativeBigInt(amount, 'amount')
    return buildCollateralApprovalParamsHelper(
      ctx.addresses.collToken as Address,
      ctx.addresses.borrowerOperations as Address,
      approvalAmount
    )
  }

  buildDebtApprovalParams(ctx: DeploymentContext, spender: string, amount: bigint): CallParams {
    const spenderAddress = requireAddress(spender, 'spender')
    const approvalAmount = requireNonNegativeBigInt(amount, 'amount')

    const data = encodeFunctionData({
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [spenderAddress, approvalAmount],
    })

    return { to: ctx.addresses.debtToken, data, value: ZERO_VALUE }
  }

  buildGasCompensationApprovalParams(ctx: DeploymentContext, amount?: bigint): CallParams {
    const approvalAmount =
      amount === undefined
        ? ctx.systemParams.ethGasCompensation
        : requireNonNegativeBigInt(amount, 'amount')

    return buildCollateralApprovalParamsHelper(
      ctx.addresses.gasToken as Address,
      ctx.addresses.borrowerOperations as Address,
      approvalAmount
    )
  }

  async getCollateralAllowance(ctx: DeploymentContext, owner: string): Promise<bigint> {
    const ownerAddress = requireAddress(owner, 'owner')

    return getCollateralAllowanceHelper(
      this.publicClient,
      ctx.addresses.collToken as Address,
      ownerAddress,
      ctx.addresses.borrowerOperations as Address
    )
  }

  async getDebtAllowance(ctx: DeploymentContext, owner: string, spender: string): Promise<bigint> {
    const ownerAddress = requireAddress(owner, 'owner')
    const spenderAddress = requireAddress(spender, 'spender')

    return (await this.publicClient.readContract({
      address: ctx.addresses.debtToken as Address,
      abi: ERC20_ABI,
      functionName: 'allowance',
      args: [ownerAddress, spenderAddress],
    })) as bigint
  }

  async getGasTokenAllowance(ctx: DeploymentContext, owner: string): Promise<bigint> {
    const ownerAddress = requireAddress(owner, 'owner')

    return getCollateralAllowanceHelper(
      this.publicClient,
      ctx.addresses.gasToken as Address,
      ownerAddress,
      ctx.addresses.borrowerOperations as Address
    )
  }
}
