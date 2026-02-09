import { parseAbi } from 'viem'

export const FPMM_ABI = parseAbi([
  'function token0() view returns (address)',
  'function token1() view returns (address)',
  'function lpFee() view returns (uint256)',
  'function protocolFee() view returns (uint256)',
  'function referenceRateFeedID() view returns (address)',
  'function getTradingLimits(address token) view returns ((int120 limit0, int120 limit1, uint8 decimals) config, (uint32 lastUpdated0, uint32 lastUpdated1, int96 netflow0, int96 netflow1) state)',
  'function getReserves() view returns (uint256, uint256, uint256)',
  'function decimals0() view returns (uint256)',
  'function decimals1() view returns (uint256)',
  'function rebalanceIncentive() view returns (uint256)',
  'function rebalanceThresholdAbove() view returns (uint256)',
  'function rebalanceThresholdBelow() view returns (uint256)',
  'function liquidityStrategy(address) view returns (bool)',
  'function getRebalancingState() view returns (uint256, uint256, uint256, uint256, bool, uint16, uint256)',
])
