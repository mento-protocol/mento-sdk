import type { Hex } from 'viem'

/**
 * Known pull-oracle providers. Must match the bytes32 short-string returned by the on-chain
 * adapter's `provider()` (see IPullOracleAdapter).
 */
export type OracleProvider = 'chainlink-data-streams' | 'pyth' | 'redstone'

/**
 * A provider-specific off-chain data source: fetches the opaque `updateData` blob that the
 * provider's on-chain IPullOracleAdapter can verify, plus any native verification fee.
 *
 * One implementation per provider (Chainlink Data Streams today; Pyth, RedStone next). The
 * PullOracleService picks the source whose `provider` matches the relayer's on-chain adapter.
 */
export interface IOracleDataSource {
  readonly provider: OracleProvider

  /**
   * Fetches the update blob covering `feedIds` (in order) for submission on-chain.
   * @returns updateData The provider-specific blob (opaque to callers).
   * @returns fee The native-token verification fee to attach as tx value (0n for fee-less providers).
   */
  fetchUpdateData(feedIds: Hex[]): Promise<{ updateData: Hex; fee: bigint }>
}
