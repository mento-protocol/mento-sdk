import { PublicClient, decodeFunctionData, zeroAddress, type Hex } from 'viem'
import { DataStreamsService } from '../../../../src/services/dataStreams/DataStreamsService'
import { DataStreamsClient } from '../../../../src/services/dataStreams/DataStreamsClient'
import { DATA_STREAMS_RELAYER_FACTORY_ABI } from '../../../../src/core/abis'
import { ChainId } from '../../../../src/core/constants'

const FACTORY = '0x1111111111111111111111111111111111111111'
const RATE_FEED = '0x2222222222222222222222222222222222222222'
const RATE_FEED_2 = '0x4444444444444444444444444444444444444444'
const RELAYER = '0x3333333333333333333333333333333333333333'
const FEED_ID_1 = `0x${'aa'.repeat(32)}` as Hex
const FEED_ID_2 = `0x${'bb'.repeat(32)}` as Hex
const REPORT_1 = '0xaaaa' as Hex
const REPORT_2 = '0xbbbb' as Hex

const LEGS = [
  { feedId: FEED_ID_1, invert: false },
  { feedId: FEED_ID_2, invert: true },
]

function makeReadContract(relayer: string = RELAYER) {
  return jest.fn(async ({ functionName }: { functionName: string }) => {
    if (functionName === 'getRelayer') return relayer
    if (functionName === 'getLegs') return LEGS
    throw new Error(`unexpected functionName ${functionName}`)
  })
}

// A pool that prices against a Data Streams feed, and one that prices against a push feed.
const POOL_DS = '0x5555555555555555555555555555555555555555'
const POOL_PUSH = '0x6666666666666666666666666666666666666666'
const RATE_FEED_PUSH = '0x7777777777777777777777777777777777777777'

function makePoolReadContract() {
  return jest.fn(async ({ functionName, address, args }: { functionName: string; address: string; args?: unknown[] }) => {
    if (functionName === 'referenceRateFeedID') {
      return address.toLowerCase() === POOL_DS ? RATE_FEED : RATE_FEED_PUSH
    }
    if (functionName === 'getRelayer') {
      return (args?.[0] as string).toLowerCase() === RATE_FEED ? RELAYER : zeroAddress
    }
    if (functionName === 'getLegs') return LEGS
    throw new Error(`unexpected functionName ${functionName}`)
  })
}

function makeClient() {
  const getLatestReport = jest.fn(async (feedId: string) => ({
    fullReport: feedId === FEED_ID_1 ? REPORT_1 : REPORT_2,
  }))
  return { getLatestReport } as unknown as DataStreamsClient
}

function makeService(readContract: jest.Mock, client: DataStreamsClient, factory?: string) {
  const publicClient = { readContract } as unknown as PublicClient
  return new DataStreamsService(publicClient, ChainId.CELO, client, factory ?? FACTORY)
}

describe('DataStreamsService', () => {
  it('resolves the relayer for a rateFeedId via the factory', async () => {
    const readContract = makeReadContract()
    const service = makeService(readContract, makeClient())

    const relayer = await service.resolveRelayer(RATE_FEED)

    expect(relayer.toLowerCase()).toBe(RELAYER)
    expect(readContract).toHaveBeenCalledWith(
      expect.objectContaining({
        address: FACTORY,
        functionName: 'getRelayer',
        args: [RATE_FEED],
      })
    )
  })

  it('throws when no relayer is registered for the rateFeedId', async () => {
    const readContract = makeReadContract(zeroAddress)
    const service = makeService(readContract, makeClient())

    await expect(service.resolveRelayer(RATE_FEED)).rejects.toThrow(/No Data Streams relayer/)
  })

  it('resolves the ordered legs for a rateFeedId', async () => {
    const service = makeService(makeReadContract(), makeClient())

    const legs = await service.resolveLegs(RATE_FEED)

    expect(legs).toEqual([
      { feedId: FEED_ID_1, invert: false },
      { feedId: FEED_ID_2, invert: true },
    ])
  })

  it('fetches one signed report blob per leg, in leg order', async () => {
    const client = makeClient()
    const service = makeService(makeReadContract(), client)

    const reports = await service.fetchReports(RATE_FEED)

    expect(reports).toEqual([REPORT_1, REPORT_2])
    expect(client.getLatestReport).toHaveBeenNthCalledWith(1, FEED_ID_1)
    expect(client.getLatestReport).toHaveBeenNthCalledWith(2, FEED_ID_2)
  })

  it('fetches per-hop reports aligned to the input rateFeedIds (signedReportsPerHop)', async () => {
    const service = makeService(makeReadContract(), makeClient())

    const perHop = await service.fetchReportsForRateFeeds([RATE_FEED, RATE_FEED_2])

    expect(perHop).toHaveLength(2)
    expect(perHop[0]).toEqual([REPORT_1, REPORT_2])
    expect(perHop[1]).toEqual([REPORT_1, REPORT_2])
  })

  it('builds ingest calldata for the permissionless recovery path', async () => {
    const service = makeService(makeReadContract(), makeClient())

    const params = await service.buildIngestParams(RATE_FEED)

    expect(params.to).toBe(FACTORY)
    expect(params.value).toBe('0')

    const decoded = decodeFunctionData({
      abi: DATA_STREAMS_RELAYER_FACTORY_ABI,
      data: params.data as Hex,
    })
    expect(decoded.functionName).toBe('ingest')
    expect((decoded.args[0] as string).toLowerCase()).toBe(RATE_FEED)
    expect(decoded.args[1]).toEqual([REPORT_1, REPORT_2])
    expect(decoded.args[2]).toBe('0x')
  })

  it('accepts pre-fetched reports for ingest without re-fetching', async () => {
    const client = makeClient()
    const service = makeService(makeReadContract(), client)

    await service.buildIngestParams(RATE_FEED, [REPORT_1])

    expect(client.getLatestReport).not.toHaveBeenCalled()
  })

  it('resolves a pool referenceRateFeedID', async () => {
    const readContract = makePoolReadContract()
    const service = makeService(readContract, makeClient())

    await expect(service.resolvePoolRateFeedId(POOL_DS)).resolves.toBe(RATE_FEED)
  })

  it('builds signedReportsPerHop for a route, leaving non-Data-Streams hops empty', async () => {
    const readContract = makePoolReadContract()
    const service = makeService(readContract, makeClient())

    const perHop = await service.fetchReportsForPools([POOL_DS, POOL_PUSH])

    // DS hop -> reports for both legs; push hop (no relayer) -> empty, so the Router skips it.
    expect(perHop).toEqual([[REPORT_1, REPORT_2], []])
  })

  it('throws a clear error when no factory is configured (not deployed yet)', async () => {
    const publicClient = { readContract: jest.fn() } as unknown as PublicClient
    // No override and no registry entry for CELO -> must throw before any RPC call.
    const service = new DataStreamsService(publicClient, ChainId.CELO, makeClient())

    await expect(service.resolveRelayer(RATE_FEED)).rejects.toThrow(/DataStreamsRelayerFactory address is not configured/)
    expect(publicClient.readContract).not.toHaveBeenCalled()
  })
})
