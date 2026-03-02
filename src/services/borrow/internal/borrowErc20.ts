import { Address, PublicClient, encodeFunctionData } from 'viem'
import { ERC20_ABI } from '../../../core/abis'
import { CallParams } from '../../../core/types'
import { validateAddress } from '../../../utils/validation'

const ZERO_VALUE = '0'

function requireBigInt(value: unknown, fieldName: string): bigint {
  if (typeof value !== 'bigint') {
    throw new Error(`${fieldName} must be a bigint`)
  }
  if (value < 0n) {
    throw new Error(`${fieldName} cannot be negative`)
  }
  return value
}

export function buildErc20ApprovalParams(
  token: Address,
  spender: Address,
  amount: bigint
): CallParams {
  validateAddress(token, 'token')
  validateAddress(spender, 'spender')

  if (amount < 0n) {
    throw new Error('Approval amount cannot be negative')
  }

  const data = encodeFunctionData({
    abi: ERC20_ABI,
    functionName: 'approve',
    args: [spender, amount],
  })

  return { to: token, data, value: ZERO_VALUE }
}

export async function readErc20Allowance(
  publicClient: PublicClient,
  token: Address,
  owner: Address,
  spender: Address
): Promise<bigint> {
  validateAddress(token, 'token')
  validateAddress(owner, 'owner')
  validateAddress(spender, 'spender')

  const allowanceRaw = await publicClient.readContract({
    address: token,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [owner, spender],
  })

  return requireBigInt(allowanceRaw, 'allowance')
}
