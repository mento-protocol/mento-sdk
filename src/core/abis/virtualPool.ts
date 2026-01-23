import { parseAbi } from 'viem'

export const VIRTUAL_POOL_ABI = parseAbi([
  'function protocolFee() view returns (uint256)',
  'function getReserves() view returns (uint256, uint256, uint256)',
  'function metadata() view returns (uint256, uint256, uint256, uint256, address, address)',
])
