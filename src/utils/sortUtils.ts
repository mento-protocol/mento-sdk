import { Address } from 'viem'

/**
 * Sorts two token addresses to match the smart contract's _sortTokens behavior.
 * Compares addresses as numeric values (BigInt), matching Solidity's address comparison.
 *
 * Solidity reference:
 * ```solidity
 * function _sortTokens(address a, address b) private pure returns (address, address) {
 *   return (a < b) ? (a, b) : (b, a);
 * }
 * ```
 */
export function sortTokenAddresses(
  tokenA: Address,
  tokenB: Address
): [Address, Address] {
  return BigInt(tokenA) < BigInt(tokenB)
    ? [tokenA, tokenB]
    : [tokenB, tokenA]
}

/**
 * Creates a canonical pair key from two addresses.
 * Uses numeric address comparison to match contract behavior.
 */
export function canonicalAddressKey(
  addressA: Address,
  addressB: Address,
  separator = '-'
): string {
  const [first, second] = sortTokenAddresses(addressA, addressB)
  return `${first}${separator}${second}`
}

/**
 * Creates a canonical pair key from two symbols.
 * Uses standard string comparison for human-readable IDs.
 */
export function canonicalSymbolKey(
  symbolA: string,
  symbolB: string,
  separator = '-'
): string {
  return symbolA < symbolB
    ? `${symbolA}${separator}${symbolB}`
    : `${symbolB}${separator}${symbolA}`
}
