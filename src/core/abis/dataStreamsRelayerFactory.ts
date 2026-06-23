import { parseAbi } from 'viem'

/**
 * Minimal ABI for the DataStreamsRelayerFactory.
 *
 * - `getRelayer` resolves a Mento rateFeedId to its deployed DataStreamsRelayerV1 (zero if none).
 * - `ingest` is the permissionless router: it forwards signed reports to the relayer for a
 *   rateFeedId (used for standalone recovery/relay, and per-hop inside the swap-with-reports path).
 */
export const DATA_STREAMS_RELAYER_FACTORY_ABI = parseAbi([
  'function getRelayer(address rateFeedId) view returns (address)',
  'function ingest(address rateFeedId, bytes[] signedReports, bytes parameterPayload)',
])
