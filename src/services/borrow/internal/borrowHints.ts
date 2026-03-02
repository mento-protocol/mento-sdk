import { Address, PublicClient } from 'viem'
import { HINT_HELPERS_ABI, SORTED_TROVES_ABI } from '../../../core/abis'
import { COLL_INDEX } from '../../../core/constants'
import { DeploymentContext } from './borrowTypes'
import { ceilSqrt, requireNonNegativeBigInt } from './borrowValidation'

export async function getTroveOperationHints(
  publicClient: PublicClient,
  ctx: DeploymentContext,
  interestRate: bigint
): Promise<{ upper: bigint; lower: bigint }> {
  const annualInterestRate = requireNonNegativeBigInt(interestRate, 'interestRate')

  const troveCount = (await publicClient.readContract({
    address: ctx.addresses.sortedTroves as Address,
    abi: SORTED_TROVES_ABI,
    functionName: 'getSize',
    args: [],
  })) as bigint

  const sqrtCount = ceilSqrt(troveCount)
  const numTrials = 10n * (sqrtCount > 0n ? sqrtCount : 1n)

  const [approxHint] = (await publicClient.readContract({
    address: ctx.addresses.hintHelpers as Address,
    abi: HINT_HELPERS_ABI,
    functionName: 'getApproxHint',
    args: [COLL_INDEX, annualInterestRate, numTrials, 42n],
  })) as readonly [bigint, bigint, bigint]

  const [upperHint, lowerHint] = (await publicClient.readContract({
    address: ctx.addresses.sortedTroves as Address,
    abi: SORTED_TROVES_ABI,
    functionName: 'findInsertPosition',
    args: [annualInterestRate, approxHint, approxHint],
  })) as readonly [bigint, bigint]

  return { upper: upperHint, lower: lowerHint }
}
