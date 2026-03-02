import { parseAbi } from 'viem'

export const SYSTEM_PARAMS_ABI = parseAbi([
  'function CCR() view returns (uint256)',
  'function MCR() view returns (uint256)',
  'function SCR() view returns (uint256)',
  'function BCR() view returns (uint256)',
  'function MIN_DEBT() view returns (uint256)',
  'function ETH_GAS_COMPENSATION() view returns (uint256)',
  'function MIN_ANNUAL_INTEREST_RATE() view returns (uint256)',
]) as any
