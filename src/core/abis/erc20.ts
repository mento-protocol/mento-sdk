import { parseAbi } from 'viem'

/**
 * ERC20 ABI for standard token operations
 *
 * Note: `as any` is used because viem's parseAbi returns a complex readonly tuple type
 * that can cause type verbosity. This doesn't compromise type safety - viem's
 * readContract/writeContract still infer types correctly from the ABI at usage sites.
 */
export const ERC20_ABI = parseAbi([
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
]) as any
