import { parseAbi } from 'viem'

export const FPMM_FACTORY_ABI = parseAbi([
  'function deployedFPMMAddresses() view returns (address[])',
  'function isPool(address pool) view returns (bool)',
])
