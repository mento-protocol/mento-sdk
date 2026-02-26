import { parseAbi } from 'viem'

/**
 * BorrowerOperations ABI for Bold protocol trove operations
 *
 * Note: `as any` is used because viem's parseAbi returns a complex readonly tuple type
 * that can cause type verbosity. This doesn't compromise type safety - viem's
 * readContract/writeContract still infer types correctly from the ABI at usage sites.
 */
export const BORROWER_OPERATIONS_ABI = parseAbi([
  // Core trove operations
  'function openTrove(address _owner, uint256 _ownerIndex, uint256 _ETHAmount, uint256 _boldAmount, uint256 _upperHint, uint256 _lowerHint, uint256 _annualInterestRate, uint256 _maxUpfrontFee, address _addManager, address _removeManager, address _receiver) returns (uint256)',
  'function openTroveAndJoinInterestBatchManager((address owner, uint256 ownerIndex, uint256 collAmount, uint256 boldAmount, uint256 upperHint, uint256 lowerHint, address interestBatchManager, uint256 maxUpfrontFee, address addManager, address removeManager, address receiver) _params) returns (uint256)',
  'function addColl(uint256 _troveId, uint256 _ETHAmount)',
  'function withdrawColl(uint256 _troveId, uint256 _amount)',
  'function withdrawBold(uint256 _troveId, uint256 _amount, uint256 _maxUpfrontFee)',
  'function repayBold(uint256 _troveId, uint256 _amount)',
  'function closeTrove(uint256 _troveId)',
  'function adjustTrove(uint256 _troveId, uint256 _collChange, bool _isCollIncrease, uint256 _debtChange, bool isDebtIncrease, uint256 _maxUpfrontFee)',
  'function adjustZombieTrove(uint256 _troveId, uint256 _collChange, bool _isCollIncrease, uint256 _boldChange, bool _isDebtIncrease, uint256 _upperHint, uint256 _lowerHint, uint256 _maxUpfrontFee)',
  'function adjustTroveInterestRate(uint256 _troveId, uint256 _newAnnualInterestRate, uint256 _upperHint, uint256 _lowerHint, uint256 _maxUpfrontFee)',
  'function applyPendingDebt(uint256 _troveId, uint256 _lowerHint, uint256 _upperHint)',
  'function claimCollateral()',

  // Batch manager operations
  'function setInterestBatchManager(uint256 _troveId, address _newBatchManager, uint256 _upperHint, uint256 _lowerHint, uint256 _maxUpfrontFee)',
  'function removeFromBatch(uint256 _troveId, uint256 _newAnnualInterestRate, uint256 _upperHint, uint256 _lowerHint, uint256 _maxUpfrontFee)',
  'function switchBatchManager(uint256 _troveId, uint256 _removeUpperHint, uint256 _removeLowerHint, address _newBatchManager, uint256 _addUpperHint, uint256 _addLowerHint, uint256 _maxUpfrontFee)',

  // Individual delegate
  'function setInterestIndividualDelegate(uint256 _troveId, address _delegate, uint128 _minInterestRate, uint128 _maxInterestRate, uint256 _newAnnualInterestRate, uint256 _upperHint, uint256 _lowerHint, uint256 _maxUpfrontFee, uint256 _minInterestRateChangePeriod)',
  'function removeInterestIndividualDelegate(uint256 _troveId)',

  // View functions
  'function hasBeenShutDown() view returns (bool)',
  'function interestBatchManagerOf(uint256 _troveId) view returns (address)',
  'function getInterestBatchManager(address _account) view returns ((uint128 minInterestRate, uint128 maxInterestRate, uint256 minInterestRateChangePeriod))',
  'function checkBatchManagerExists(address _batchManager) view returns (bool)',
  'function getInterestIndividualDelegateOf(uint256 _troveId) view returns ((address account, uint128 minInterestRate, uint128 maxInterestRate, uint256 minInterestRateChangePeriod))',

  'function CCR() view returns (uint256)',
  'function MCR() view returns (uint256)',

  // Custom errors (BorrowerOperations.sol)
  'error IsShutDown()',
  'error TCRNotBelowSCR()',
  'error ZeroAdjustment()',
  'error NotOwnerNorInterestManager()',
  'error TroveInBatch()',
  'error TroveNotInBatch()',
  'error InterestNotInRange()',
  'error BatchInterestRateChangePeriodNotPassed()',
  'error DelegateInterestRateChangePeriodNotPassed()',
  'error TroveExists()',
  'error TroveNotOpen()',
  'error TroveNotActive()',
  'error TroveNotZombie()',
  'error TroveWithZeroDebt()',
  'error UpfrontFeeTooHigh()',
  'error ICRBelowMCR()',
  'error ICRBelowMCRPlusBCR()',
  'error RepaymentNotMatchingCollWithdrawal()',
  'error TCRBelowCCR()',
  'error DebtBelowMin()',
  'error CollWithdrawalTooHigh()',
  'error NotEnoughBoldBalance()',
  'error InterestRateTooLow()',
  'error InterestRateTooHigh()',
  'error InterestRateNotNew()',
  'error InvalidInterestBatchManager()',
  'error BatchManagerExists()',
  'error BatchManagerNotNew()',
  'error NewFeeNotLower()',
  'error CallerNotTroveManager()',
  'error CallerNotPriceFeed()',
  'error CallerNotSelf()',
  'error MinGeMax()',
  'error AnnualManagementFeeTooHigh()',
  'error MinInterestRateChangePeriodTooLow()',
  'error NewOracleFailureDetected()',
  'error BatchSharesRatioTooLow()',

  // Custom errors (inherited from AddRemoveManagers)
  'error EmptyManager()',
  'error NotBorrower()',
  'error NotOwnerNorAddManager()',
  'error NotOwnerNorRemoveManager()',
]) as any
