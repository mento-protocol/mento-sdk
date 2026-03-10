import { parseAbi } from 'viem'

// Legacy Reserve (Celo)
export const RESERVE_ABI = parseAbi([
  'function getTokens() view returns (address[])',
  'function isToken(address) view returns (bool)',
  'function isCollateralAsset(address) view returns (bool)',
]) as any

// ReserveV2 (Monad)
export const RESERVE_V2_ABI = parseAbi([
  'function getStableAssets() view returns (address[])',
  'function getCollateralAssets() view returns (address[])',
  'function isStableAsset(address) view returns (bool)',
  'function isCollateralAsset(address) view returns (bool)',
]) as any
