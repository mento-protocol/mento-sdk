import { createClient, decodeReport } from '@chainlink/data-streams-sdk'
import type { DataStreamsClient as ChainlinkClient } from '@chainlink/data-streams-sdk'
import { DataStreamsCredentials, DataStreamsReport } from '../../core/types'

const DEFAULT_REST_URL = 'https://api.dataengine.chain.link'
const DEFAULT_WS_URL = 'wss://ws.dataengine.chain.link'
const CACHE_TTL_MS = 5000

interface CacheEntry {
  report: DataStreamsReport
  expiresAt: number
}

function deriveWsUrl(restUrl: string): string {
  return restUrl.replace('https://api.', 'wss://ws.').replace('http://api.', 'ws://ws.')
}

export class DataStreamsClient {
  private readonly client: ChainlinkClient
  private readonly cache = new Map<string, CacheEntry>()

  constructor(credentials: DataStreamsCredentials) {
    if (!credentials.apiKey || !credentials.userSecret) {
      throw new Error('DataStreamsClient: apiKey and userSecret are required')
    }

    const endpoint = credentials.baseUrl ?? DEFAULT_REST_URL
    const wsEndpoint = deriveWsUrl(endpoint) || DEFAULT_WS_URL

    this.client = createClient({ apiKey: credentials.apiKey, userSecret: credentials.userSecret, endpoint, wsEndpoint })
  }

  async getLatestReport(feedId: string): Promise<DataStreamsReport> {
    const cached = this.cache.get(feedId)
    if (cached && Date.now() < cached.expiresAt) {
      return cached.report
    }

    const raw = await this.client.getLatestReport(feedId)
    const report = mapReport(raw.feedID, raw.fullReport, raw.validFromTimestamp, raw.observationsTimestamp)

    this.cache.set(feedId, { report, expiresAt: Date.now() + CACHE_TTL_MS })
    return report
  }

  async listFeeds(): Promise<Array<{ feedID: string; name: string }>> {
    return this.client.listFeeds()
  }

  async getBulkReports(feedIds: string[], timestamp: number): Promise<DataStreamsReport[]> {
    const raws = await this.client.getReportsBulk(feedIds, timestamp)

    const byFeedId = new Map(
      raws.map((r) => [r.feedID, mapReport(r.feedID, r.fullReport, r.validFromTimestamp, r.observationsTimestamp)])
    )

    return feedIds.map((id) => {
      const report = byFeedId.get(id)
      if (!report) throw new Error(`DataStreamsClient: no report returned for feedId ${id}`)
      return report
    })
  }
}

function mapReport(
  feedID: string,
  fullReport: string,
  validFromTimestamp: number,
  observationsTimestamp: number
): DataStreamsReport {
  const decoded = decodeReport(fullReport, feedID)
  const common = { feedID, fullReport, validFromTimestamp, observationsTimestamp, nativeFee: decoded.nativeFee, linkFee: decoded.linkFee, expiresAt: decoded.expiresAt }

  if (decoded.version === 'V3') {
    return { ...common, price: decoded.price, bid: decoded.bid, ask: decoded.ask }
  }

  if (decoded.version === 'V4') {
    return { ...common, price: decoded.price, marketStatus: decoded.marketStatus as 0 | 1 | 2 }
  }

  throw new Error(`DataStreamsClient: unsupported report schema version "${decoded.version}" for feed ${feedID}`)
}
