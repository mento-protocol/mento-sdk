import { DataStreamsClient } from '../../../../src/services/dataStreams/DataStreamsClient'
import { DataStreamsCredentials } from '../../../../src/core/types'

const CREDENTIALS: DataStreamsCredentials = {
  apiKey: 'test-key',
  userSecret: 'test-secret',
  baseUrl: 'https://api.test.example',
}

const V3_FEED_ID = '0x00030000000000000000000000000000000000000000000000000000000000ab'
const V4_FEED_ID = '0x00040000000000000000000000000000000000000000000000000000000000ab'

function makeRawReport(feedID: string, isV4 = false) {
  const base = {
    feedID,
    fullReport: '0xdeadbeef',
    validFromTimestamp: '1700000000',
    observationsTimestamp: '1700000001',
    nativeFee: '1000',
    linkFee: '2000',
    expiresAt: '1700003600',
    price: '1050000000000000000',
  }
  if (isV4) return { ...base, marketStatus: '2' }
  return { ...base, bid: '1040000000000000000', ask: '1060000000000000000' }
}

function makeFetchMock(feedID: string, isV4 = false, isBulk = false) {
  const raw = makeRawReport(feedID, isV4)
  const body = isBulk ? { reports: [raw] } : { report: raw }
  return jest.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(body),
  })
}

beforeEach(() => {
  jest.useFakeTimers()
})

afterEach(() => {
  jest.useRealTimers()
  jest.restoreAllMocks()
})

describe('DataStreamsClient.getLatestReport', () => {
  it('returns cached result on second call within 5s', async () => {
    const mockFetch = makeFetchMock(V3_FEED_ID)
    global.fetch = mockFetch as unknown as typeof fetch

    const client = new DataStreamsClient(CREDENTIALS)
    const first = await client.getLatestReport(V3_FEED_ID)
    const second = await client.getLatestReport(V3_FEED_ID)

    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(second.fullReport).toBe(first.fullReport)
    expect(second.feedID).toBe(first.feedID)
  })

  it('bypasses cache after 5s TTL expires', async () => {
    const mockFetch = makeFetchMock(V3_FEED_ID)
    global.fetch = mockFetch as unknown as typeof fetch

    const client = new DataStreamsClient(CREDENTIALS)
    await client.getLatestReport(V3_FEED_ID)

    jest.advanceTimersByTime(5001)

    await client.getLatestReport(V3_FEED_ID)

    expect(mockFetch).toHaveBeenCalledTimes(2)
  })

  it('decodes V3 report with bid and ask', async () => {
    global.fetch = makeFetchMock(V3_FEED_ID, false) as unknown as typeof fetch

    const client = new DataStreamsClient(CREDENTIALS)
    const report = await client.getLatestReport(V3_FEED_ID)

    expect('bid' in report).toBe(true)
    expect('ask' in report).toBe(true)
    expect('marketStatus' in report).toBe(false)
    expect(report.price).toBe(1050000000000000000n)
  })

  it('decodes V4 report with marketStatus and no bid/ask', async () => {
    global.fetch = makeFetchMock(V4_FEED_ID, true) as unknown as typeof fetch

    const client = new DataStreamsClient(CREDENTIALS)
    const report = await client.getLatestReport(V4_FEED_ID)

    expect('marketStatus' in report).toBe(true)
    expect('bid' in report).toBe(false)
    expect('ask' in report).toBe(false)
  })

  it('throws when apiKey is missing', async () => {
    const client = new DataStreamsClient({ apiKey: '', userSecret: 'secret' })
    await expect(client.getLatestReport(V3_FEED_ID)).rejects.toThrow(
      'DataStreamsClient: apiKey and userSecret are required'
    )
  })

  it('throws when userSecret is missing', async () => {
    const client = new DataStreamsClient({ apiKey: 'key', userSecret: '' })
    await expect(client.getLatestReport(V3_FEED_ID)).rejects.toThrow(
      'DataStreamsClient: apiKey and userSecret are required'
    )
  })
})

describe('DataStreamsClient.getBulkReports', () => {
  it('returns reports in the same order as input feedIds', async () => {
    const feedId1 = V3_FEED_ID
    const feedId2 = V4_FEED_ID
    const raw1 = makeRawReport(feedId1, false)
    const raw2 = makeRawReport(feedId2, true)
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ reports: [raw2, raw1] }),
    }) as unknown as typeof fetch

    const client = new DataStreamsClient(CREDENTIALS)
    const reports = await client.getBulkReports([feedId1, feedId2], 1700000000)

    expect(reports[0].feedID).toBe(feedId1)
    expect(reports[1].feedID).toBe(feedId2)
  })

  it('does not cache results', async () => {
    const mockFetch = makeFetchMock(V3_FEED_ID, false, true)
    global.fetch = mockFetch as unknown as typeof fetch

    const client = new DataStreamsClient(CREDENTIALS)
    await client.getBulkReports([V3_FEED_ID], 1700000000)
    await client.getBulkReports([V3_FEED_ID], 1700000000)

    expect(mockFetch).toHaveBeenCalledTimes(2)
  })

  it('throws when apiKey is missing', async () => {
    const client = new DataStreamsClient({ apiKey: '', userSecret: 'secret' })
    await expect(client.getBulkReports([V3_FEED_ID], 1700000000)).rejects.toThrow(
      'DataStreamsClient: apiKey and userSecret are required'
    )
  })

  it('throws when userSecret is missing', async () => {
    const client = new DataStreamsClient({ apiKey: 'key', userSecret: '' })
    await expect(client.getBulkReports([V3_FEED_ID], 1700000000)).rejects.toThrow(
      'DataStreamsClient: apiKey and userSecret are required'
    )
  })
})
