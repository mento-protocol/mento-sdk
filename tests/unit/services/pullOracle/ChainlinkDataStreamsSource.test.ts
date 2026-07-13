import { decodeAbiParameters, type Hex } from 'viem'
import { ChainlinkDataStreamsSource } from '../../../../src/services/pullOracle/ChainlinkDataStreamsSource'
import type { DataStreamsClient } from '../../../../src/services/dataStreams/DataStreamsClient'

const FEED_ID_1 = `0x${'aa'.repeat(32)}` as Hex
const FEED_ID_2 = `0x${'bb'.repeat(32)}` as Hex
const REPORT_1 = '0xaaaa' as Hex
const REPORT_2 = '0xbbbb' as Hex

function makeClient() {
  const getLatestReport = jest.fn(async (feedId: string) => ({
    fullReport: feedId === FEED_ID_1 ? REPORT_1 : REPORT_2,
  }))
  return { getLatestReport } as unknown as DataStreamsClient
}

describe('ChainlinkDataStreamsSource', () => {
  it('identifies as the chainlink-data-streams provider', () => {
    expect(new ChainlinkDataStreamsSource(makeClient()).provider).toBe('chainlink-data-streams')
  })

  it('packs one signed report per feedId, in order, as abi.encode(bytes[])', async () => {
    const client = makeClient()
    const source = new ChainlinkDataStreamsSource(client)

    const { updateData, fee } = await source.fetchUpdateData([FEED_ID_1, FEED_ID_2])

    expect(fee).toBe(0n) // verification is free on Celo (no FeeManager)
    expect(client.getLatestReport).toHaveBeenNthCalledWith(1, FEED_ID_1)
    expect(client.getLatestReport).toHaveBeenNthCalledWith(2, FEED_ID_2)

    // The blob must decode to the exact shape the on-chain ChainlinkDataStreamsAdapter expects.
    const [signedReports] = decodeAbiParameters([{ type: 'bytes[]' }], updateData)
    expect(signedReports).toEqual([REPORT_1, REPORT_2])
  })
})
