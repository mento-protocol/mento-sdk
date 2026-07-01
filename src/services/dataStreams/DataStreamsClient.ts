import type { DataStreamsClient as ChainlinkClient } from '@chainlink/data-streams-sdk'
import { DataStreamsCredentials, DataStreamsReport } from '../../core/types'

const DEFAULT_REST_URL = 'https://api.dataengine.chain.link'
const DEFAULT_WS_URL = 'wss://ws.dataengine.chain.link'
const CACHE_TTL_MS = 5000

interface CacheEntry {
  report: DataStreamsReport
  expiresAt: number
}

// Load the Node-oriented Chainlink Data Streams SDK lazily (dynamic import) so it never lands in a
// consumer's *client* bundle. DataStreamsClient is server-only (it needs the HMAC userSecret), but
// it is statically reachable from the package entry via `Mento` -> `DataStreamsClient`; deferring
// the import keeps '@chainlink/data-streams-sdk' out of that static graph, so a bundler only pulls
// it in for code paths that actually run it (i.e. server-side).
type ChainlinkModule = typeof import('@chainlink/data-streams-sdk')
let chainlinkModule: Promise<ChainlinkModule> | undefined
function loadChainlink(): Promise<ChainlinkModule> {
  chainlinkModule ??= import('@chainlink/data-streams-sdk')
  return chainlinkModule
}

function deriveWsUrl(restUrl: string): string {
  return restUrl.replace('https://api.', 'wss://ws.').replace('http://api.', 'ws://ws.')
}

export class DataStreamsClient {
  private readonly credentials: DataStreamsCredentials
  private clientPromise: Promise<ChainlinkClient> | undefined
  private readonly cache = new Map<string, CacheEntry>()

  constructor(credentials: DataStreamsCredentials) {
    if (!credentials.apiKey || !credentials.userSecret) {
      throw new Error('DataStreamsClient: apiKey and userSecret are required')
    }
    this.credentials = credentials
  }

  /** Lazily creates (and memoizes) the underlying Chainlink client on first use. */
  private getClient(): Promise<ChainlinkClient> {
    this.clientPromise ??= loadChainlink().then(({ createClient }) => {
      const endpoint = this.credentials.baseUrl ?? DEFAULT_REST_URL
      const wsEndpoint = deriveWsUrl(endpoint) || DEFAULT_WS_URL
      return createClient({
        apiKey: this.credentials.apiKey,
        userSecret: this.credentials.userSecret,
        endpoint,
        wsEndpoint,
      })
    })
    return this.clientPromise
  }

  async getLatestReport(feedId: string): Promise<DataStreamsReport> {
    const cached = this.cache.get(feedId)
    if (cached && Date.now() < cached.expiresAt) {
      return cached.report
    }

    const client = await this.getClient()
    const raw = await client.getLatestReport(feedId)
    const report = await mapReport(raw.feedID, raw.fullReport, raw.validFromTimestamp, raw.observationsTimestamp)

    this.cache.set(feedId, { report, expiresAt: Date.now() + CACHE_TTL_MS })
    return report
  }

  async listFeeds(): Promise<Array<{ feedID: string; name?: string }>> {
    // `name` is not guaranteed by the Data Streams API — some subscriptions return nameless feeds.
    const client = await this.getClient()
    return client.listFeeds()
  }

  async getBulkReports(feedIds: string[], timestamp: number): Promise<DataStreamsReport[]> {
    const client = await this.getClient()
    const raws = await client.getReportsBulk(feedIds, timestamp)

    const mapped = await Promise.all(
      raws.map(
        async (r) =>
          [r.feedID, await mapReport(r.feedID, r.fullReport, r.validFromTimestamp, r.observationsTimestamp)] as const
      )
    )
    const byFeedId = new Map(mapped)

    return feedIds.map((id) => {
      const report = byFeedId.get(id)
      if (!report) throw new Error(`DataStreamsClient: no report returned for feedId ${id}`)
      return report
    })
  }
}

async function mapReport(
  feedID: string,
  fullReport: string,
  validFromTimestamp: number,
  observationsTimestamp: number
): Promise<DataStreamsReport> {
  const { decodeReport } = await loadChainlink()
  const decoded = decodeReport(fullReport, feedID)
  const common = {
    feedID,
    fullReport,
    validFromTimestamp,
    observationsTimestamp,
    nativeFee: decoded.nativeFee,
    linkFee: decoded.linkFee,
    expiresAt: decoded.expiresAt,
  }

  if (decoded.version === 'V3') {
    return { ...common, price: decoded.price, bid: decoded.bid, ask: decoded.ask }
  }

  // V8 (RWA / forex) supersedes the deprecated V4 schema: the price is the report's `midPrice`, and
  // it carries a nanosecond `lastUpdateTimestamp`.
  if (decoded.version === 'V8') {
    return {
      ...common,
      price: decoded.midPrice,
      marketStatus: decoded.marketStatus as 0 | 1 | 2,
      lastUpdateTimestamp: decoded.lastUpdateTimestamp,
    }
  }

  throw new Error(`DataStreamsClient: unsupported report schema version "${decoded.version}" for feed ${feedID}`)
}
