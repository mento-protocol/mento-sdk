import { isAddress } from 'viem'

/**
 * Validates an Ethereum address format using viem's isAddress utility
 *
 * @param address - The address string to validate
 * @param paramName - Optional parameter name for better error messages
 * @returns True if valid (type guard for `0x${string}`)
 * @throws Error if address is invalid
 *
 * @example
 * ```typescript
 * validateAddress('0x765DE816845861e75A25fCA122bb6898B8B1282a')
 * // Returns true
 *
 * validateAddress('invalid', 'tokenIn')
 * // Throws: "Invalid address for tokenIn: invalid"
 * ```
 */
export function validateAddress(address: string, paramName?: string): address is `0x${string}` {
  if (typeof address !== 'string') {
    const param = paramName ? ` for ${paramName}` : ''
    throw new Error(`Address${param} must be a string, got ${typeof address}`)
  }

  // Use viem's isAddress with strict: false to allow both checksummed and non-checksummed addresses
  if (!isAddress(address, { strict: false })) {
    const param = paramName ? ` for ${paramName}` : ''
    throw new Error(
      `Invalid address${param}: ${address}. Expected 0x followed by 40 hex characters`
    )
  }

  return true
}
