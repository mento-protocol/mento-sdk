import { parseAbi } from 'viem'

/**
 * PriceFeed ABI for collateral price queries
 *
 * Source: FXPriceFeed.sol (Mento-specific)
 * Note: fetchPrice() is state-changing on-chain but declared as `view` here
 * so viem uses eth_call simulation (same approach as Bold frontend).
 * lastValidPrice is the Mento-specific field (not lastGoodPrice).
 */
export const PRICE_FEED_ABI = parseAbi([
  'function fetchPrice() view returns (uint256)',
  'function lastValidPrice() view returns (uint256)',
  'function isL2SequencerUp() view returns (bool)',
  'function isShutdown() view returns (bool)',
]) as any
