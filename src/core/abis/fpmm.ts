import { parseAbi } from 'viem'

export const FPMM_ABI = parseAbi([
  'function token0() view returns (address)',
  'function token1() view returns (address)',
  'function lpFee() view returns (uint256)',
  'function protocolFee() view returns (uint256)',
])
