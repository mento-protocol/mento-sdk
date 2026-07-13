import { parseAbi } from 'viem'

/**
 * Minimal ABI for an IPullOracleAdapter (the per-provider verification adapter a relayer holds).
 *
 * - `provider` identifies the oracle provider (bytes32 short-string, e.g. "chainlink-data-streams")
 *   so the SDK can pick the matching off-chain data source.
 * - `verificationFee` is the native fee required to verify a given update blob (0 for fee-less
 *   providers such as Chainlink-on-Celo and RedStone).
 */
export const PULL_ORACLE_ADAPTER_ABI = parseAbi([
  'function provider() view returns (bytes32)',
  'function verificationFee(bytes updateData) view returns (uint256)',
])
