import { encodeAbiParameters, type Hex } from 'viem'
import { DataStreamsClient } from '../dataStreams/DataStreamsClient'
import type { IOracleDataSource, OracleProvider } from './types'

/**
 * IOracleDataSource for Chainlink Data Streams.
 *
 * Fetches the freshest DON-signed report per feedId via the Data Streams REST API (HMAC-authed,
 * server-only) and packs them into the `updateData` encoding the on-chain
 * ChainlinkDataStreamsAdapter expects: `abi.encode(bytes[] signedReports)`, one report per feedId,
 * in feedId order. Verification is free on Celo (no FeeManager), so the fee is always 0n.
 */
export class ChainlinkDataStreamsSource implements IOracleDataSource {
  readonly provider: OracleProvider = 'chainlink-data-streams'

  constructor(private readonly client: DataStreamsClient) {}

  async fetchUpdateData(feedIds: Hex[]): Promise<{ updateData: Hex; fee: bigint }> {
    const reports = await Promise.all(feedIds.map((feedId) => this.client.getLatestReport(feedId)))
    const signedReports = reports.map((report) => report.fullReport as Hex)
    const updateData = encodeAbiParameters([{ type: 'bytes[]' }], [signedReports])
    return { updateData, fee: 0n }
  }
}
