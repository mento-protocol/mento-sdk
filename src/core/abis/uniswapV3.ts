import { parseAbi } from 'viem'

export const UNIV3_POSITION_MANAGER_ABI = parseAbi([
  'function balanceOf(address) view returns (uint256)',
  'function tokenOfOwnerByIndex(address, uint256) view returns (uint256)',
  'function positions(uint256) view returns (uint96, address, address, address, uint24, int24, int24, uint128, uint256, uint256, uint128, uint128)',
]) as any

export const UNIV3_FACTORY_ABI = parseAbi([
  'function getPool(address, address, uint24) view returns (address)',
]) as any

export const UNIV3_POOL_ABI = parseAbi([
  'function slot0() view returns (uint160, int24, uint160, int24, uint16, uint16)',
]) as any
