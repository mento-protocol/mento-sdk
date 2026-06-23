import { createClient, decodeReport } from '@chainlink/data-streams-sdk'
import { DataStreamsClient } from '../../../../src/services/dataStreams/DataStreamsClient'
import { DataStreamsCredentials } from '../../../../src/core/types'

// The client delegates transport + signature auth to the official Chainlink SDK; we mock it so the
// unit tests exercise our mapping/caching/ordering logic without any network or real credentials.
jest.mock('@chainlink/data-streams-sdk', () => ({
  createClient: jest.fn(),
  decodeReport: jest.fn(),
}))

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>
const mockDecodeReport = decodeReport as jest.MockedFunction<typeof decodeReport>

const CREDENTIALS: DataStreamsCredentials = {
  apiKey: 'test-key',
  userSecret: 'test-secret',
  baseUrl: 'https://api.test.example',
}

const V3_FEED_ID = '0x00030000000000000000000000000000000000000000000000000000000000ab'
const V4_FEED_ID = '0x00040000000000000000000000000000000000000000000000000000000000ab'

/** The raw shape the official SDK returns (the fields our client reads off it). */
function rawReport(feedID: string) {
  return {
    feedID,
    fullReport: `0xreport_${feedID.slice(2, 10)}`,
    validFromTimestamp: 1700000000,
    observationsTimestamp: 1700000001,
  }
}

/** The decoded shape `decodeReport` returns, branched on schema version by feedId prefix. */
function decodedFor(feedID: string) {
  const common = { nativeFee: 1000n, linkFee: 2000n, expiresAt: 1700003600 }
  if (feedID.startsWith('0x0004')) {
    return { ...common, version: 'V4', price: 1050000000000000000n, marketStatus: 2 }
  }
  return { ...common, version: 'V3', price: 1050000000000000000n, bid: 1040000000000000000n, ask: 1060000000000000000n }
}

let underlying: {
  getLatestReport: jest.Mock
  getReportsBulk: jest.Mock
  listFeeds: jest.Mock
}

beforeEach(() => {
  jest.useFakeTimers()
  underlying = {
    getLatestReport: jest.fn(async (feedId: string) => rawReport(feedId)),
    getReportsBulk: jest.fn(),
    listFeeds: jest.fn(),
  }
  mockCreateClient.mockReturnValue(underlying as unknown as ReturnType<typeof createClient>)
  mockDecodeReport.mockImplementation(
    (_fullReport: string, feedID: string) => decodedFor(feedID) as unknown as ReturnType<typeof decodeReport>
  )
})

afterEach(() => {
  jest.useRealTimers()
  jest.clearAllMocks()
})

describe('DataStreamsClient constructor', () => {
  it('throws when apiKey is missing', () => {
    expect(() => new DataStreamsClient({ apiKey: '', userSecret: 'secret' })).toThrow(
      'DataStreamsClient: apiKey and userSecret are required'
    )
  })

  it('throws when userSecret is missing', () => {
    expect(() => new DataStreamsClient({ apiKey: 'key', userSecret: '' })).toThrow(
      'DataStreamsClient: apiKey and userSecret are required'
    )
  })
})

describe('DataStreamsClient.getLatestReport', () => {
  it('returns cached result on second call within 5s', async () => {
    const client = new DataStreamsClient(CREDENTIALS)
    const first = await client.getLatestReport(V3_FEED_ID)
    const second = await client.getLatestReport(V3_FEED_ID)

    expect(underlying.getLatestReport).toHaveBeenCalledTimes(1)
    expect(second.fullReport).toBe(first.fullReport)
    expect(second.feedID).toBe(first.feedID)
  })

  it('bypasses cache after 5s TTL expires', async () => {
    const client = new DataStreamsClient(CREDENTIALS)
    await client.getLatestReport(V3_FEED_ID)

    jest.advanceTimersByTime(5001)
    await client.getLatestReport(V3_FEED_ID)

    expect(underlying.getLatestReport).toHaveBeenCalledTimes(2)
  })

  it('retains the raw fullReport blob for on-chain calldata', async () => {
    const client = new DataStreamsClient(CREDENTIALS)
    const report = await client.getLatestReport(V3_FEED_ID)
    expect(report.fullReport).toBe(rawReport(V3_FEED_ID).fullReport)
  })

  it('decodes a V3 report with bid and ask', async () => {
    const client = new DataStreamsClient(CREDENTIALS)
    const report = await client.getLatestReport(V3_FEED_ID)

    expect('bid' in report).toBe(true)
    expect('ask' in report).toBe(true)
    expect('marketStatus' in report).toBe(false)
    expect(report.price).toBe(1050000000000000000n)
  })

  it('decodes a V4 report with marketStatus and no bid/ask', async () => {
    const client = new DataStreamsClient(CREDENTIALS)
    const report = await client.getLatestReport(V4_FEED_ID)

    expect('marketStatus' in report).toBe(true)
    expect('bid' in report).toBe(false)
    expect('ask' in report).toBe(false)
  })

  it('throws on an unsupported schema version', async () => {
    mockDecodeReport.mockReturnValueOnce({ version: 'V2' } as unknown as ReturnType<typeof decodeReport>)
    const client = new DataStreamsClient(CREDENTIALS)
    await expect(client.getLatestReport(V3_FEED_ID)).rejects.toThrow(/unsupported report schema version/)
  })
})

describe('DataStreamsClient.getBulkReports', () => {
  it('returns reports in the same order as the input feedIds', async () => {
    // SDK returns them out of order; the client must realign to the requested order.
    underlying.getReportsBulk.mockResolvedValue([rawReport(V4_FEED_ID), rawReport(V3_FEED_ID)])

    const client = new DataStreamsClient(CREDENTIALS)
    const reports = await client.getBulkReports([V3_FEED_ID, V4_FEED_ID], 1700000000)

    expect(reports[0].feedID).toBe(V3_FEED_ID)
    expect(reports[1].feedID).toBe(V4_FEED_ID)
  })

  it('does not cache results', async () => {
    underlying.getReportsBulk.mockResolvedValue([rawReport(V3_FEED_ID)])

    const client = new DataStreamsClient(CREDENTIALS)
    await client.getBulkReports([V3_FEED_ID], 1700000000)
    await client.getBulkReports([V3_FEED_ID], 1700000000)

    expect(underlying.getReportsBulk).toHaveBeenCalledTimes(2)
  })

  it('throws when a requested feedId is missing from the response', async () => {
    underlying.getReportsBulk.mockResolvedValue([rawReport(V3_FEED_ID)]) // V4 missing

    const client = new DataStreamsClient(CREDENTIALS)
    await expect(client.getBulkReports([V3_FEED_ID, V4_FEED_ID], 1700000000)).rejects.toThrow(
      `no report returned for feedId ${V4_FEED_ID}`
    )
  })
})

describe('DataStreamsClient.listFeeds', () => {
  it('passes through the SDK feed list', async () => {
    const feeds = [{ feedID: V3_FEED_ID, name: 'CELO/USD' }]
    underlying.listFeeds.mockResolvedValue(feeds)

    const client = new DataStreamsClient(CREDENTIALS)
    await expect(client.listFeeds()).resolves.toEqual(feeds)
  })
})
