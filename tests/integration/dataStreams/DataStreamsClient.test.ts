import { DataStreamsClient } from '../../../src/services/dataStreams/DataStreamsClient'

const apiKey = process.env.DATA_STREAMS_API_KEY ?? ''
const userSecret = process.env.DATA_STREAMS_USER_SECRET ?? ''
const baseUrl = process.env.DATA_STREAMS_BASE_URL ?? 'https://api.dataengine.chain.link'

// The client only decodes V3 (crypto, feedId prefix 0x0003) and V8 (RWA/forex, 0x0008) reports and
// throws on any other schema. A subscription may also be provisioned for feeds of other schema
// versions, so scope the report assertions to the feeds the client actually supports.
const SUPPORTED_SCHEMA_PREFIXES = ['0x0003', '0x0008']
const isSupported = (feedID: string): boolean => SUPPORTED_SCHEMA_PREFIXES.some((p) => feedID.startsWith(p))

describe('DataStreamsClient integration', () => {
  if (!process.env.DATA_STREAMS_API_KEY) {
    it.skip('Skipping: DATA_STREAMS_API_KEY not set', () => {})
    return
  }

  let client: DataStreamsClient
  let provisionedFeeds: Array<{ feedID: string; name?: string }>
  let supportedFeeds: Array<{ feedID: string; name?: string }>

  beforeAll(async () => {
    client = new DataStreamsClient({ apiKey, userSecret, baseUrl })
    provisionedFeeds = await client.listFeeds()
    supportedFeeds = provisionedFeeds.filter((f) => isSupported(f.feedID))
  }, 15000)

  describe('listFeeds', () => {
    it('returns the feeds provisioned for this subscription', () => {
      expect(provisionedFeeds.length).toBeGreaterThan(0)
      provisionedFeeds.forEach((feed) => {
        expect(feed.feedID).toMatch(/^0x[0-9a-f]{64}$/i)
        // `name` is not guaranteed by the API — assert it only when present.
        if (feed.name !== undefined) {
          expect(typeof feed.name).toBe('string')
        }
      })
    })
  })

  describe('getLatestReport', () => {
    it('returns a valid report with correct schema for each supported feed', async () => {
      for (const feed of supportedFeeds) {
        const report = await client.getLatestReport(feed.feedID)

        expect(report.feedID).toBe(feed.feedID)
        expect(report.fullReport.length).toBeGreaterThan(0)
        expect(report.observationsTimestamp).toBeGreaterThan(0)
        expect(report.price).toBeGreaterThan(0n)

        if (feed.feedID.startsWith('0x0003')) {
          expect('bid' in report).toBe(true)
          expect('ask' in report).toBe(true)
          expect('marketStatus' in report).toBe(false)
        } else if (feed.feedID.startsWith('0x0008')) {
          expect('marketStatus' in report).toBe(true)
          expect('bid' in report).toBe(false)
          expect('ask' in report).toBe(false)
        }
      }
    }, 15000 * 10)
  })

  describe('getBulkReports', () => {
    it('fetches all supported feeds in a single call', async () => {
      if (supportedFeeds.length === 0) return
      const feedIds = supportedFeeds.map((f) => f.feedID)
      const timestamp = Math.floor(Date.now() / 1000) - 10

      const reports = await client.getBulkReports(feedIds, timestamp)

      expect(reports).toHaveLength(feedIds.length)
      reports.forEach((report, i) => {
        expect(report.feedID).toBe(feedIds[i])
        expect(report.price).toBeGreaterThan(0n)
      })
    }, 30000)
  })

  describe('cache', () => {
    it('second call within TTL returns the same fullReport', async () => {
      if (supportedFeeds.length === 0) return
      const feedId = supportedFeeds[0].feedID
      const first = await client.getLatestReport(feedId)
      const second = await client.getLatestReport(feedId)

      expect(second.fullReport).toBe(first.fullReport)
    }, 15000)
  })
})
