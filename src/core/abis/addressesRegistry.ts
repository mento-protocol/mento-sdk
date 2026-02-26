import { parseAbi } from 'viem'

export const ADDRESSES_REGISTRY_ABI = parseAbi([
  'function collToken() view returns (address)',
  'function borrowerOperations() view returns (address)',
  'function troveManager() view returns (address)',
  'function troveNFT() view returns (address)',
  'function metadataNFT() view returns (address)',
  'function stabilityPool() view returns (address)',
  'function priceFeed() view returns (address)',
  'function activePool() view returns (address)',
  'function defaultPool() view returns (address)',
  'function gasPoolAddress() view returns (address)',
  'function collSurplusPool() view returns (address)',
  'function sortedTroves() view returns (address)',
  'function interestRouter() view returns (address)',
  'function hintHelpers() view returns (address)',
  'function multiTroveGetter() view returns (address)',
  'function collateralRegistry() view returns (address)',
  'function boldToken() view returns (address)',
  'function gasToken() view returns (address)',
  'function liquidityStrategy() view returns (address)',
]) as any
