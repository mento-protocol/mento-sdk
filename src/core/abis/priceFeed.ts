import { parseAbi } from 'viem'

/**
 * Deliberate frontend-read shim:
 * `fetchPrice` is non-view in source contracts, but marked `view` here so it can
 * be called via `readContract`/`eth_call` without write simulation.
 */
export const PRICE_FEED_ABI = parseAbi([
  'function fetchPrice() view returns (uint256)',
  'function lastValidPrice() view returns (uint256)',
  'function isL2SequencerUp() view returns (bool)',
  'function isShutdown() view returns (bool)',
]) as any
