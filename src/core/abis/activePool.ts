import { parseAbi } from 'viem'

export const ACTIVE_POOL_ABI = parseAbi([
  'function getCollBalance() view returns (uint256)',
  'function getBoldDebt() view returns (uint256)',
  'function aggWeightedDebtSum() view returns (uint256)',
  'function aggRecordedDebt() view returns (uint256)',
  'function calcPendingAggInterest() view returns (uint256)',
  'function hasBeenShutDown() view returns (bool)',
  'function shutdownTime() view returns (uint256)',
]) as any
