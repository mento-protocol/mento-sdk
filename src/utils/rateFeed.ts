import { keccak256, toBytes } from 'viem'

/**
 * Computes the rate feed ID from a rate feed identifier string.
 * Follows the Solidity formula: address(uint160(uint256(keccak256(abi.encodePacked(rateFeed)))))
 *
 * @param rateFeed - The rate feed identifier string (e.g., "EURUSD", "relayed:COPUSD")
 * @returns The computed rate feed address as a hex string
 *
 * @example
 * ```typescript
 * const rateFeedId = toRateFeedId('EURUSD')
 * // Returns the computed address for the EURUSD rate feed
 *
 * const relayedRateFeedId = toRateFeedId('relayed:COPUSD')
 * // Returns the computed address for the relayed COPUSD rate feed
 * ```
 */
export function toRateFeedId(rateFeed: string): `0x${string}` {
  const hashedBytes = keccak256(toBytes(rateFeed))
  const hashAsBigInt = BigInt(hashedBytes)
  const maskedToUint160 = hashAsBigInt & ((1n << 160n) - 1n)

  return `0x${maskedToUint160.toString(16).padStart(40, '0')}`
}
