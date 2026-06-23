import { parseAbi } from 'viem'

/**
 * Minimal ABI for a DataStreamsRelayerV1 instance.
 *
 * `getLegs` returns the ordered Chainlink Data Streams legs (feedId + invert flag) that the relayer
 * composes. We resolve these to know which feedId(s) to fetch signed reports for, in leg order.
 */
export const DATA_STREAMS_RELAYER_ABI = parseAbi([
  'struct StreamLeg { bytes32 feedId; bool invert; }',
  'function getLegs() view returns (StreamLeg[])',
  'function rateFeedId() view returns (address)',
  'function maxStaleness() view returns (uint256)',
])
