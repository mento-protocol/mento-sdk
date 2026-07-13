import { parseAbi } from 'viem'

/**
 * Minimal ABI for the PullOracleRelayerFactory.
 *
 * - `getRelayer` resolves a Mento rateFeedId to its deployed PullOracleRelayerV1 (zero if none).
 * - `ingest` is the permissionless router: it forwards a provider update blob to the relayer for a
 *   rateFeedId (used for standalone recovery/relay, and per-hop inside the swap-with-reports path).
 *   Payable: msg.value covers the provider verification fee (0 for fee-less providers).
 */
export const PULL_ORACLE_RELAYER_FACTORY_ABI = parseAbi([
  'function getRelayer(address rateFeedId) view returns (address)',
  'function ingest(address rateFeedId, bytes updateData) payable',
])
