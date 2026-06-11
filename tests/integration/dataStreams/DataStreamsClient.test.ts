import { DataStreamsClient } from '../../../src/services/dataStreams/DataStreamsClient'

const EUR_USD_FEED_ID = '0x0004ce7bd717133dc3d5280e917e4c875bc51b5250af08207f88d2188183b999'

const apiKey = process.env.DATA_STREAMS_API_KEY ?? ''
const userSecret = process.env.DATA_STREAMS_USER_SECRET ?? ''
const baseUrl = process.env.DATA_STREAMS_BASE_URL ?? 'https://api.dataengine.chain.link'

describe('DataStreamsClient integration', () => {
  if (!process.env.DATA_STREAMS_API_KEY) {
    it.skip('Skipping: DATA_STREAMS_API_KEY not set', () => {})
    return
  }

  let client: DataStreamsClient

  beforeAll(() => {
    client = new DataStreamsClient({ apiKey, userSecret, baseUrl })
  })

  it('getLatestReport returns a valid V4 report for EUR/USD', async () => {
    const report = await client.getLatestReport(EUR_USD_FEED_ID)

    expect(report.feedID).toBe(EUR_USD_FEED_ID)
    expect(typeof report.fullReport).toBe('string')
    expect(report.fullReport.length).toBeGreaterThan(0)
    expect(report.observationsTimestamp).toBeGreaterThan(0)
    expect(report.price).toBeGreaterThan(0n)
    expect('marketStatus' in report).toBe(true)
    expect('bid' in report).toBe(false)
  }, 15000)

  it('second getLatestReport call within 1s returns the same fullReport (cache hit)', async () => {
    const first = await client.getLatestReport(EUR_USD_FEED_ID)
    const second = await client.getLatestReport(EUR_USD_FEED_ID)

    expect(second.fullReport).toBe(first.fullReport)
  }, 15000)
})
