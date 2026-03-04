import { parseAbi } from 'viem'

export const BREAKERBOX_ABI = parseAbi([
  'function getRateFeedTradingMode(address rateFeedID) view returns (uint8)',
])
