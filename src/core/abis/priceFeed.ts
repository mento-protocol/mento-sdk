import { parseAbi } from 'viem'

export const PRICE_FEED_ABI = parseAbi([
  'function fetchPrice() view returns (uint256)',
  'function lastValidPrice() view returns (uint256)',
  'function isL2SequencerUp() view returns (bool)',
  'function isShutdown() view returns (bool)',
]) as any
