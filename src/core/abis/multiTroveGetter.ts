import { parseAbi } from 'viem'

/**
 * MultiTroveGetter ABI for batch trove queries
 *
 * Source: MultiTroveGetter.sol
 * Note: Both functions require `_collIndex` as first param — SDK passes `0n`.
 */
export const MULTI_TROVE_GETTER_ABI = parseAbi([
  'function getMultipleSortedTroves(uint256 _collIndex, int256 _startIdx, uint256 _count) view returns ((uint256 id, uint256 entireDebt, uint256 entireColl, uint256 redistBoldDebtGain, uint256 redistCollGain, uint256 accruedInterest, uint256 recordedDebt, uint256 annualInterestRate, uint256 accruedBatchManagementFee, uint256 lastInterestRateAdjTime, uint256 stake, uint256 lastDebtUpdateTime, address interestBatchManager, uint256 batchDebtShares, uint256 snapshotETH, uint256 snapshotBoldDebt)[])',
  'function getDebtPerInterestRateAscending(uint256 _collIndex, uint256 _startId, uint256 _maxIterations) view returns ((address interestBatchManager, uint256 interestRate, uint256 debt)[] data, uint256 currId)',
]) as any
