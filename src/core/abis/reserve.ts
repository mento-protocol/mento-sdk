import { parseAbi } from 'viem'

export const RESERVE_ABI = parseAbi([
  'function getTokens() view returns (address[])',
  'function isToken(address) view returns (bool)',
  'function isCollateralAsset(address) view returns (bool)',
]) as any
