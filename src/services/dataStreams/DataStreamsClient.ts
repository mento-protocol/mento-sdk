import { DataStreamsCredentials, DataStreamsReport, DataStreamsSchemaVersion } from '../../core/types'
import { generateDataStreamsAuthHeaders } from './auth'

const DEFAULT_BASE_URL = 'https://api.dataengine.chain.link'
const CACHE_TTL_MS = 5000

interface CacheEntry {
  report: DataStreamsReport
  expiresAt: number
}

export class DataStreamsClient {
  private readonly credentials: DataStreamsCredentials
  private readonly baseUrl: string
  private readonly cache = new Map<string, CacheEntry>()

  constructor(credentials: DataStreamsCredentials) {
    this.credentials = credentials
    this.baseUrl = credentials.baseUrl ?? DEFAULT_BASE_URL
  }

  async getLatestReport(feedId: string): Promise<DataStreamsReport> {
    this.assertCredentials()

    const cached = this.cache.get(feedId)
    if (cached && Date.now() < cached.expiresAt) {
      return cached.report
    }

    const url = `${this.baseUrl}/api/v1/reports/latest?feedID=${feedId}`
    const headers = generateDataStreamsAuthHeaders(
      this.credentials.apiKey,
      this.credentials.userSecret,
      'GET',
      url
    )

    const response = await fetch(url, { headers })
    if (!response.ok) {
      throw new Error(`DataStreamsClient: request failed with status ${response.status}`)
    }

    const data = (await response.json()) as { report: Record<string, unknown> }
    const report = this.decodeReport(data.report)

    this.cache.set(feedId, { report, expiresAt: Date.now() + CACHE_TTL_MS })

    return report
  }

  async getBulkReports(feedIds: string[], timestamp: number): Promise<DataStreamsReport[]> {
    this.assertCredentials()

    const ids = feedIds.join(',')
    const url = `${this.baseUrl}/api/v1/reports/bulk?feedIDs=${ids}&timestamp=${timestamp}`
    const headers = generateDataStreamsAuthHeaders(
      this.credentials.apiKey,
      this.credentials.userSecret,
      'GET',
      url
    )

    const response = await fetch(url, { headers })
    if (!response.ok) {
      throw new Error(`DataStreamsClient: request failed with status ${response.status}`)
    }

    const data = (await response.json()) as { reports: Record<string, unknown>[] }
    const reportMap = new Map<string, DataStreamsReport>()
    for (const raw of data.reports) {
      const report = this.decodeReport(raw)
      reportMap.set(report.feedID, report)
    }

    return feedIds.map((id) => {
      const report = reportMap.get(id)
      if (!report) {
        throw new Error(`DataStreamsClient: no report returned for feedId ${id}`)
      }
      return report
    })
  }

  private assertCredentials(): void {
    if (!this.credentials.apiKey || !this.credentials.userSecret) {
      throw new Error('DataStreamsClient: apiKey and userSecret are required')
    }
  }

  private decodeReport(raw: Record<string, unknown>): DataStreamsReport {
    const feedID = raw.feedID as string
    const prefix = feedID.slice(0, 6).toLowerCase()

    const base = {
      feedID,
      fullReport: raw.fullReport as string,
      validFromTimestamp: Number(raw.validFromTimestamp),
      observationsTimestamp: Number(raw.observationsTimestamp),
      nativeFee: BigInt(raw.nativeFee as string),
      linkFee: BigInt(raw.linkFee as string),
      expiresAt: Number(raw.expiresAt),
      price: BigInt(raw.price as string),
    }

    if (prefix === DataStreamsSchemaVersion.V4) {
      return {
        ...base,
        marketStatus: Number(raw.marketStatus) as 0 | 1 | 2,
      }
    }

    return {
      ...base,
      bid: BigInt(raw.bid as string),
      ask: BigInt(raw.ask as string),
    }
  }
}
