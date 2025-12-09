import { parseAbi } from 'viem'

export const VIRTUAL_POOL_ABI = parseAbi(['function protocolFee() view returns (uint256)'])
