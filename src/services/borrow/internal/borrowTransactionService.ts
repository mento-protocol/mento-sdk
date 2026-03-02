import { Address, PublicClient, encodeFunctionData } from 'viem'
import { BORROWER_OPERATIONS_ABI, TROVE_MANAGER_ABI } from '../../../core/abis'
import { AdjustTroveParams, CallParams, OpenTroveParams } from '../../../core/types'
import { DeploymentContext } from './borrowTypes'
import { getTroveOperationHints } from './borrowHints'
import {
  optionalAddressOrZero,
  parseTroveId,
  requireAddress,
  requireNonNegativeBigInt,
  requireNonNegativeInteger,
  requirePositiveBigInt,
  requireUint128,
} from './borrowValidation'

const ZERO_VALUE_HEX = '0x0'

export class BorrowTransactionService {
  constructor(private publicClient: PublicClient) {}

  async buildOpenTroveTransaction(ctx: DeploymentContext, params: OpenTroveParams): Promise<CallParams> {
    const owner = requireAddress(params.owner, 'owner')
    const ownerIndex = requireNonNegativeInteger(params.ownerIndex, 'ownerIndex')
    const collAmount = requirePositiveBigInt(params.collAmount, 'collAmount')
    const boldAmount = requirePositiveBigInt(params.boldAmount, 'boldAmount')
    const annualInterestRate = requireNonNegativeBigInt(params.annualInterestRate, 'annualInterestRate')
    const maxUpfrontFee = requireNonNegativeBigInt(params.maxUpfrontFee, 'maxUpfrontFee')
    const addManager = optionalAddressOrZero(params.addManager, 'addManager')
    const removeManager = optionalAddressOrZero(params.removeManager, 'removeManager')
    const receiver = optionalAddressOrZero(params.receiver, 'receiver')

    const hints = await getTroveOperationHints(this.publicClient, ctx, annualInterestRate)

    const data = params.interestBatchManager
      ? encodeFunctionData({
          abi: BORROWER_OPERATIONS_ABI,
          functionName: 'openTroveAndJoinInterestBatchManager',
          args: [
            {
              owner,
              ownerIndex: BigInt(ownerIndex),
              collAmount,
              boldAmount,
              upperHint: hints.upper,
              lowerHint: hints.lower,
              interestBatchManager: requireAddress(
                params.interestBatchManager,
                'interestBatchManager'
              ),
              maxUpfrontFee,
              addManager,
              removeManager,
              receiver,
            },
          ],
        })
      : encodeFunctionData({
          abi: BORROWER_OPERATIONS_ABI,
          functionName: 'openTrove',
          args: [
            owner,
            BigInt(ownerIndex),
            collAmount,
            boldAmount,
            hints.upper,
            hints.lower,
            annualInterestRate,
            maxUpfrontFee,
            addManager,
            removeManager,
            receiver,
          ],
        })

    return {
      to: ctx.addresses.borrowerOperations,
      data,
      value: ZERO_VALUE_HEX,
    }
  }

  buildAdjustTroveTransaction(ctx: DeploymentContext, params: AdjustTroveParams): CallParams {
    const troveId = parseTroveId(params.troveId)
    const collChange = requireNonNegativeBigInt(params.collChange, 'collChange')
    const debtChange = requireNonNegativeBigInt(params.debtChange, 'debtChange')
    const maxUpfrontFee = requireNonNegativeBigInt(params.maxUpfrontFee, 'maxUpfrontFee')

    const data = encodeFunctionData({
      abi: BORROWER_OPERATIONS_ABI,
      functionName: 'adjustTrove',
      args: [troveId, collChange, params.isCollIncrease, debtChange, params.isDebtIncrease, maxUpfrontFee],
    })

    return { to: ctx.addresses.borrowerOperations, data, value: ZERO_VALUE_HEX }
  }

  async buildAdjustZombieTroveTransaction(
    ctx: DeploymentContext,
    params: AdjustTroveParams
  ): Promise<CallParams> {
    const troveId = parseTroveId(params.troveId)
    const collChange = requireNonNegativeBigInt(params.collChange, 'collChange')
    const debtChange = requireNonNegativeBigInt(params.debtChange, 'debtChange')
    const maxUpfrontFee = requireNonNegativeBigInt(params.maxUpfrontFee, 'maxUpfrontFee')

    const currentRate = (await this.publicClient.readContract({
      address: ctx.addresses.troveManager as Address,
      abi: TROVE_MANAGER_ABI,
      functionName: 'getTroveAnnualInterestRate',
      args: [troveId],
    })) as bigint

    const hints = await getTroveOperationHints(this.publicClient, ctx, currentRate)

    const data = encodeFunctionData({
      abi: BORROWER_OPERATIONS_ABI,
      functionName: 'adjustZombieTrove',
      args: [
        troveId,
        collChange,
        params.isCollIncrease,
        debtChange,
        params.isDebtIncrease,
        hints.upper,
        hints.lower,
        maxUpfrontFee,
      ],
    })

    return { to: ctx.addresses.borrowerOperations, data, value: ZERO_VALUE_HEX }
  }

  buildCloseTroveTransaction(ctx: DeploymentContext, troveId: string): CallParams {
    const parsedTroveId = parseTroveId(troveId)

    const data = encodeFunctionData({
      abi: BORROWER_OPERATIONS_ABI,
      functionName: 'closeTrove',
      args: [parsedTroveId],
    })

    return { to: ctx.addresses.borrowerOperations, data, value: ZERO_VALUE_HEX }
  }

  buildAddCollTransaction(ctx: DeploymentContext, troveId: string, amount: bigint): CallParams {
    const parsedTroveId = parseTroveId(troveId)
    const collAmount = requirePositiveBigInt(amount, 'amount')

    const data = encodeFunctionData({
      abi: BORROWER_OPERATIONS_ABI,
      functionName: 'addColl',
      args: [parsedTroveId, collAmount],
    })

    return { to: ctx.addresses.borrowerOperations, data, value: ZERO_VALUE_HEX }
  }

  buildWithdrawCollTransaction(ctx: DeploymentContext, troveId: string, amount: bigint): CallParams {
    const parsedTroveId = parseTroveId(troveId)
    const collAmount = requirePositiveBigInt(amount, 'amount')

    const data = encodeFunctionData({
      abi: BORROWER_OPERATIONS_ABI,
      functionName: 'withdrawColl',
      args: [parsedTroveId, collAmount],
    })

    return { to: ctx.addresses.borrowerOperations, data, value: ZERO_VALUE_HEX }
  }

  buildBorrowMoreTransaction(
    ctx: DeploymentContext,
    troveId: string,
    amount: bigint,
    maxFee: bigint
  ): CallParams {
    const parsedTroveId = parseTroveId(troveId)
    const borrowAmount = requirePositiveBigInt(amount, 'amount')
    const maxUpfrontFee = requireNonNegativeBigInt(maxFee, 'maxFee')

    const data = encodeFunctionData({
      abi: BORROWER_OPERATIONS_ABI,
      functionName: 'withdrawBold',
      args: [parsedTroveId, borrowAmount, maxUpfrontFee],
    })

    return { to: ctx.addresses.borrowerOperations, data, value: ZERO_VALUE_HEX }
  }

  buildRepayDebtTransaction(ctx: DeploymentContext, troveId: string, amount: bigint): CallParams {
    const parsedTroveId = parseTroveId(troveId)
    const repayAmount = requirePositiveBigInt(amount, 'amount')

    const data = encodeFunctionData({
      abi: BORROWER_OPERATIONS_ABI,
      functionName: 'repayBold',
      args: [parsedTroveId, repayAmount],
    })

    return { to: ctx.addresses.borrowerOperations, data, value: ZERO_VALUE_HEX }
  }

  async buildAdjustInterestRateTransaction(
    ctx: DeploymentContext,
    troveId: string,
    newRate: bigint,
    maxFee: bigint
  ): Promise<CallParams> {
    const parsedTroveId = parseTroveId(troveId)
    const newAnnualInterestRate = requireNonNegativeBigInt(newRate, 'newRate')
    const maxUpfrontFee = requireNonNegativeBigInt(maxFee, 'maxFee')

    const hints = await getTroveOperationHints(this.publicClient, ctx, newAnnualInterestRate)

    const data = encodeFunctionData({
      abi: BORROWER_OPERATIONS_ABI,
      functionName: 'adjustTroveInterestRate',
      args: [parsedTroveId, newAnnualInterestRate, hints.upper, hints.lower, maxUpfrontFee],
    })

    return { to: ctx.addresses.borrowerOperations, data, value: ZERO_VALUE_HEX }
  }

  buildClaimCollateralTransaction(ctx: DeploymentContext): CallParams {
    const data = encodeFunctionData({
      abi: BORROWER_OPERATIONS_ABI,
      functionName: 'claimCollateral',
      args: [],
    })

    return { to: ctx.addresses.borrowerOperations, data, value: ZERO_VALUE_HEX }
  }

  async buildSetBatchManagerTransaction(
    ctx: DeploymentContext,
    troveId: string,
    manager: string,
    maxFee: bigint
  ): Promise<CallParams> {
    const parsedTroveId = parseTroveId(troveId)
    const newBatchManager = requireAddress(manager, 'manager')
    const maxUpfrontFee = requireNonNegativeBigInt(maxFee, 'maxFee')

    const currentRate = (await this.publicClient.readContract({
      address: ctx.addresses.troveManager as Address,
      abi: TROVE_MANAGER_ABI,
      functionName: 'getTroveAnnualInterestRate',
      args: [parsedTroveId],
    })) as bigint

    const hints = await getTroveOperationHints(this.publicClient, ctx, currentRate)

    const data = encodeFunctionData({
      abi: BORROWER_OPERATIONS_ABI,
      functionName: 'setInterestBatchManager',
      args: [parsedTroveId, newBatchManager, hints.upper, hints.lower, maxUpfrontFee],
    })

    return { to: ctx.addresses.borrowerOperations, data, value: ZERO_VALUE_HEX }
  }

  async buildRemoveFromBatchTransaction(
    ctx: DeploymentContext,
    troveId: string,
    newRate: bigint,
    maxFee: bigint
  ): Promise<CallParams> {
    const parsedTroveId = parseTroveId(troveId)
    const newAnnualInterestRate = requireNonNegativeBigInt(newRate, 'newRate')
    const maxUpfrontFee = requireNonNegativeBigInt(maxFee, 'maxFee')

    const hints = await getTroveOperationHints(this.publicClient, ctx, newAnnualInterestRate)

    const data = encodeFunctionData({
      abi: BORROWER_OPERATIONS_ABI,
      functionName: 'removeFromBatch',
      args: [parsedTroveId, newAnnualInterestRate, hints.upper, hints.lower, maxUpfrontFee],
    })

    return { to: ctx.addresses.borrowerOperations, data, value: ZERO_VALUE_HEX }
  }

  async buildSwitchBatchManagerTransaction(
    ctx: DeploymentContext,
    troveId: string,
    newManager: string,
    maxFee: bigint
  ): Promise<CallParams> {
    const parsedTroveId = parseTroveId(troveId)
    const managerAddress = requireAddress(newManager, 'newManager')
    const maxUpfrontFee = requireNonNegativeBigInt(maxFee, 'maxFee')

    const currentRate = (await this.publicClient.readContract({
      address: ctx.addresses.troveManager as Address,
      abi: TROVE_MANAGER_ABI,
      functionName: 'getTroveAnnualInterestRate',
      args: [parsedTroveId],
    })) as bigint

    const [removeHints, addHints] = await Promise.all([
      getTroveOperationHints(this.publicClient, ctx, currentRate),
      getTroveOperationHints(this.publicClient, ctx, currentRate),
    ])

    const data = encodeFunctionData({
      abi: BORROWER_OPERATIONS_ABI,
      functionName: 'switchBatchManager',
      args: [
        parsedTroveId,
        removeHints.upper,
        removeHints.lower,
        managerAddress,
        addHints.upper,
        addHints.lower,
        maxUpfrontFee,
      ],
    })

    return { to: ctx.addresses.borrowerOperations, data, value: ZERO_VALUE_HEX }
  }

  async buildSetInterestDelegateTransaction(
    ctx: DeploymentContext,
    troveId: string,
    delegate: string,
    minRate: bigint,
    maxRate: bigint,
    newRate: bigint,
    maxFee: bigint,
    minChangePeriod: bigint
  ): Promise<CallParams> {
    const parsedTroveId = parseTroveId(troveId)
    const delegateAddress = requireAddress(delegate, 'delegate')
    const minInterestRate = requireUint128(minRate, 'minRate')
    const maxInterestRate = requireUint128(maxRate, 'maxRate')
    const newAnnualInterestRate = requireNonNegativeBigInt(newRate, 'newRate')
    const maxUpfrontFee = requireNonNegativeBigInt(maxFee, 'maxFee')
    const minRateChangePeriod = requireNonNegativeBigInt(minChangePeriod, 'minChangePeriod')

    if (minInterestRate > maxInterestRate) {
      throw new Error('minRate cannot be greater than maxRate')
    }

    const hints = await getTroveOperationHints(this.publicClient, ctx, newAnnualInterestRate)

    const data = encodeFunctionData({
      abi: BORROWER_OPERATIONS_ABI,
      functionName: 'setInterestIndividualDelegate',
      args: [
        parsedTroveId,
        delegateAddress,
        minInterestRate,
        maxInterestRate,
        newAnnualInterestRate,
        hints.upper,
        hints.lower,
        maxUpfrontFee,
        minRateChangePeriod,
      ],
    })

    return { to: ctx.addresses.borrowerOperations, data, value: ZERO_VALUE_HEX }
  }

  buildRemoveInterestDelegateTransaction(ctx: DeploymentContext, troveId: string): CallParams {
    const parsedTroveId = parseTroveId(troveId)

    const data = encodeFunctionData({
      abi: BORROWER_OPERATIONS_ABI,
      functionName: 'removeInterestIndividualDelegate',
      args: [parsedTroveId],
    })

    return { to: ctx.addresses.borrowerOperations, data, value: ZERO_VALUE_HEX }
  }
}
