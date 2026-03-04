import { parseAbi } from 'viem'

export const FPMM_FACTORY_ABI = parseAbi([
  'function deployedFPMMAddresses() view returns (address[])',
  'function isPool(address pool) view returns (bool)',

  // Custom errors
  'error CreateXBytecodeHashMismatch()',
  'error ZeroAddress()',
  'error IdenticalTokenAddresses()',
  'error SortTokensZeroAddress()',
  'error InvalidOracleAdapter()',
  'error InvalidProxyAdmin()',
  'error InvalidOwner()',
  'error InvalidReferenceRateFeedID()',
  'error PairAlreadyExists()',
  'error ImplementationNotRegistered()',
  'error ImplementationAlreadyRegistered()',
  'error IndexOutOfBounds()',
  'error ImplementationIndexMismatch()',
  'error FeeTooHigh()',
  'error RebalanceIncentiveTooHigh()',
  'error RebalanceThresholdTooHigh()',
])
