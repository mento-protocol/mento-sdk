import { parseAbi } from 'viem'

export const HINT_HELPERS_ABI = parseAbi([
  'function getApproxHint(uint256 _collIndex, uint256 _interestRate, uint256 _numTrials, uint256 _inputRandomSeed) view returns (uint256 hintId, uint256 diff, uint256 latestRandomSeed)',
  'function predictOpenTroveUpfrontFee(uint256 _collIndex, uint256 _borrowedAmount, uint256 _interestRate) view returns (uint256)',
  'function predictAdjustTroveUpfrontFee(uint256 _collIndex, uint256 _troveId, uint256 _debtIncrease) view returns (uint256)',
  'function predictAdjustInterestRateUpfrontFee(uint256 _collIndex, uint256 _troveId, uint256 _newInterestRate) view returns (uint256)',
  'function forcePredictAdjustInterestRateUpfrontFee(uint256 _collIndex, uint256 _troveId, uint256 _newInterestRate) view returns (uint256)',
  'function predictAdjustBatchInterestRateUpfrontFee(uint256 _collIndex, address _batchAddress, uint256 _newInterestRate) view returns (uint256)',
  'function predictJoinBatchInterestRateUpfrontFee(uint256 _collIndex, uint256 _troveId, address _batchAddress) view returns (uint256)',
]) as any
