import { parseAbi } from 'viem'

export const FPMM_ABI = parseAbi([
  'function token0() view returns (address)',
  'function token1() view returns (address)',
  'function lpFee() view returns (uint256)',
  'function protocolFee() view returns (uint256)',
  'function referenceRateFeedID() view returns (address)',
  'function getTradingLimits(address token) view returns ((int120 limit0, int120 limit1, uint8 decimals) config, (uint32 lastUpdated0, uint32 lastUpdated1, int96 netflow0, int96 netflow1) state)',
])
