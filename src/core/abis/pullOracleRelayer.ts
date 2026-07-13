import { parseAbi } from 'viem'

/**
 * Minimal ABI for a PullOracleRelayerV1 instance.
 *
 * - `getLegs` returns the ordered legs (provider feedId + invert flag) the relayer composes. We
 *   resolve these to know which feedId(s) to fetch update data for, in leg order.
 * - `adapter` returns the IPullOracleAdapter the relayer verifies through; its `provider()` tells
 *   the SDK which off-chain data source to use.
 */
export const PULL_ORACLE_RELAYER_ABI = parseAbi([
  'struct OracleLeg { bytes32 feedId; bool invert; }',
  'function getLegs() view returns (OracleLeg[])',
  'function rateFeedId() view returns (address)',
  'function maxStaleness() view returns (uint256)',
  'function adapter() view returns (address)',
])
