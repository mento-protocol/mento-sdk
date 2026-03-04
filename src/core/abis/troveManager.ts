import { parseAbi } from 'viem'

export const TROVE_MANAGER_ABI = parseAbi([
  'function getLatestTroveData(uint256 _troveId) view returns ((uint256 entireDebt, uint256 entireColl, uint256 redistBoldDebtGain, uint256 redistCollGain, uint256 accruedInterest, uint256 recordedDebt, uint256 annualInterestRate, uint256 weightedRecordedDebt, uint256 accruedBatchManagementFee, uint256 lastInterestRateAdjTime))',
  'function getTroveStatus(uint256 _troveId) view returns (uint8)',
  'function getTroveAnnualInterestRate(uint256 _troveId) view returns (uint256)',
  'function Troves(uint256 _id) view returns (uint256 debt, uint256 coll, uint256 stake, uint8 status, uint64 arrayIndex, uint64 lastDebtUpdateTime, uint64 lastInterestRateAdjTime, uint256 annualInterestRate, address interestBatchManager, uint256 batchDebtShares)',
  'function getCurrentICR(uint256 _troveId, uint256 _price) view returns (uint256)',
  'function getTroveIdsCount() view returns (uint256)',
  'function getTroveFromTroveIdsArray(uint256 _index) view returns (uint256)',
  'function shutdownTime() view returns (uint256)',

  // Custom errors
  'error EmptyData()',
  'error NothingToLiquidate()',
  'error CallerNotBorrowerOperations()',
  'error CallerNotCollateralRegistry()',
  'error OnlyOneTroveLeft()',
  'error NotShutDown()',
  'error ZeroAmount()',
  'error NotEnoughBoldBalance()',
  'error MinCollNotReached(uint256 _coll)',
  'error BatchSharesRatioTooHigh()',
  'error L2SequencerDown()',
]) as any
