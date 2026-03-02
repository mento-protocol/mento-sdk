import { Address, zeroAddress } from 'viem'
import { validateAddress } from '../../../utils/validation'

const UINT128_MAX = (1n << 128n) - 1n
export const MAX_SAFE_INTEGER_BIGINT = BigInt(Number.MAX_SAFE_INTEGER)

export function requireDebtTokenSymbol(symbol: string): string {
  if (typeof symbol !== 'string' || symbol.trim().length === 0) {
    throw new Error('debtTokenSymbol must be a non-empty string')
  }
  return symbol.trim()
}

export function requireAddress(address: string, fieldName: string): Address {
  validateAddress(address, fieldName)
  return address as Address
}

export function optionalAddressOrZero(value: string | undefined, fieldName: string): Address {
  if (!value) return zeroAddress
  return requireAddress(value, fieldName)
}

export function parseTroveId(troveId: string): bigint {
  if (typeof troveId !== 'string' || troveId.trim().length === 0) {
    throw new Error('troveId must be a non-empty string')
  }

  let parsed: bigint
  try {
    parsed = BigInt(troveId)
  } catch {
    throw new Error(`Invalid troveId: ${troveId}`)
  }

  if (parsed < 0n) {
    throw new Error('troveId cannot be negative')
  }

  return parsed
}

export function formatTroveId(troveId: bigint): string {
  return `0x${troveId.toString(16)}`
}

export function requireNonNegativeInteger(value: number, fieldName: string): number {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error(`${fieldName} must be a non-negative safe integer`)
  }
  return value
}

export function requireNonNegativeBigInt(value: bigint, fieldName: string): bigint {
  if (typeof value !== 'bigint' || value < 0n) {
    throw new Error(`${fieldName} must be a non-negative bigint`)
  }
  return value
}

export function requirePositiveBigInt(value: bigint, fieldName: string): bigint {
  if (typeof value !== 'bigint' || value <= 0n) {
    throw new Error(`${fieldName} must be a positive bigint`)
  }
  return value
}

export function requireUint128(value: bigint, fieldName: string): bigint {
  const parsed = requireNonNegativeBigInt(value, fieldName)
  if (parsed > UINT128_MAX) {
    throw new Error(`${fieldName} exceeds uint128 max value`)
  }
  return parsed
}

function integerSqrt(value: bigint): bigint {
  if (value < 0n) {
    throw new Error('Cannot compute square root of a negative bigint')
  }
  if (value < 2n) {
    return value
  }

  let x0 = value
  let x1 = (x0 + 1n) >> 1n
  while (x1 < x0) {
    x0 = x1
    x1 = (x1 + value / x1) >> 1n
  }

  return x0
}

export function ceilSqrt(value: bigint): bigint {
  const floor = integerSqrt(value)
  return floor * floor === value ? floor : floor + 1n
}
