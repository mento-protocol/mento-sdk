import { parseAbi } from 'viem'

export const VIRTUAL_POOL_FACTORY_ABI = parseAbi([
  'function getOrPrecomputeProxyAddress(address token0, address token1) view returns (address)',
  'function isPool(address pool) view returns (bool)',
])
