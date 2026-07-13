import { PublicClient, decodeFunctionData, stringToHex, zeroAddress, type Hex } from 'viem'
import { PullOracleService } from '../../../../src/services/pullOracle/PullOracleService'
import type { IOracleDataSource } from '../../../../src/services/pullOracle/types'
import { PULL_ORACLE_RELAYER_FACTORY_ABI } from '../../../../src/core/abis'
import { ChainId } from '../../../../src/core/constants'

const FACTORY = '0x1111111111111111111111111111111111111111'
const RATE_FEED = '0x2222222222222222222222222222222222222222'
const RELAYER = '0x3333333333333333333333333333333333333333'
const ADAPTER = '0x9999999999999999999999999999999999999999'
const FEED_ID_1 = `0x${'aa'.repeat(32)}` as Hex
const FEED_ID_2 = `0x${'bb'.repeat(32)}` as Hex
const UPDATE_DATA = '0xdada' as Hex

const CHAINLINK_PROVIDER_BYTES32 = stringToHex('chainlink-data-streams', { size: 32 })

const LEGS = [
  { feedId: FEED_ID_1, invert: false },
  { feedId: FEED_ID_2, invert: true },
]

function makeReadContract(relayer: string = RELAYER) {
  return jest.fn(async ({ functionName }: { functionName: string }) => {
    if (functionName === 'getRelayer') return relayer
    if (functionName === 'getLegs') return LEGS
    if (functionName === 'adapter') return ADAPTER
    if (functionName === 'provider') return CHAINLINK_PROVIDER_BYTES32
    throw new Error(`unexpected functionName ${functionName}`)
  })
}

// A pool that prices against a pull-oracle feed, and one that prices against a push feed.
const POOL_PULL = '0x5555555555555555555555555555555555555555'
const POOL_PUSH = '0x6666666666666666666666666666666666666666'
const RATE_FEED_PUSH = '0x7777777777777777777777777777777777777777'

function makePoolReadContract() {
  return jest.fn(
    async ({ functionName, address, args }: { functionName: string; address: string; args?: unknown[] }) => {
      if (functionName === 'referenceRateFeedID') {
        return address.toLowerCase() === POOL_PULL ? RATE_FEED : RATE_FEED_PUSH
      }
      if (functionName === 'getRelayer') {
        return (args?.[0] as string).toLowerCase() === RATE_FEED ? RELAYER : zeroAddress
      }
      if (functionName === 'getLegs') return LEGS
      if (functionName === 'adapter') return ADAPTER
      if (functionName === 'provider') return CHAINLINK_PROVIDER_BYTES32
      throw new Error(`unexpected functionName ${functionName}`)
    }
  )
}

function makeSource(fee = 0n): IOracleDataSource {
  return {
    provider: 'chainlink-data-streams',
    fetchUpdateData: jest.fn(async () => ({ updateData: UPDATE_DATA, fee })),
  }
}

function makeService(readContract: jest.Mock, source: IOracleDataSource, factory?: string) {
  const publicClient = { readContract } as unknown as PublicClient
  return new PullOracleService(publicClient, ChainId.CELO, [source], factory ?? FACTORY)
}

describe('PullOracleService', () => {
  it('resolves the relayer for a rateFeedId via the factory', async () => {
    const readContract = makeReadContract()
    const service = makeService(readContract, makeSource())

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
    const service = makeService(readContract, makeSource())

    await expect(service.resolveRelayer(RATE_FEED)).rejects.toThrow(/No pull-oracle relayer/)
  })

  it('resolves the ordered legs for a rateFeedId', async () => {
    const service = makeService(makeReadContract(), makeSource())

    const legs = await service.resolveLegs(RATE_FEED)

    expect(legs).toEqual([
      { feedId: FEED_ID_1, invert: false },
      { feedId: FEED_ID_2, invert: true },
    ])
  })

  it('resolves the provider via the relayer adapter', async () => {
    const service = makeService(makeReadContract(), makeSource())

    await expect(service.resolveProvider(RATE_FEED)).resolves.toBe('chainlink-data-streams')
  })

  it('fetches update data from the source matching the on-chain provider, in leg order', async () => {
    const source = makeSource()
    const service = makeService(makeReadContract(), source)

    const update = await service.fetchUpdateData(RATE_FEED)

    expect(update).toEqual({ updateData: UPDATE_DATA, fee: 0n })
    expect(source.fetchUpdateData).toHaveBeenCalledWith([FEED_ID_1, FEED_ID_2])
  })

  it('throws a configuration error when no source matches the provider', async () => {
    const wrongSource: IOracleDataSource = {
      provider: 'pyth',
      fetchUpdateData: jest.fn(),
    }
    const service = makeService(makeReadContract(), wrongSource)

    await expect(service.fetchUpdateData(RATE_FEED)).rejects.toThrow(
      /No oracle data source registered for provider "chainlink-data-streams"/
    )
  })

  it('builds ingest calldata for the permissionless recovery path', async () => {
    const service = makeService(makeReadContract(), makeSource())

    const params = await service.buildIngestParams(RATE_FEED)

    expect(params.to).toBe(FACTORY)
    expect(params.value).toBe('0')

    const decoded = decodeFunctionData({
      abi: PULL_ORACLE_RELAYER_FACTORY_ABI,
      data: params.data as Hex,
    })
    expect(decoded.functionName).toBe('ingest')
    expect((decoded.args[0] as string).toLowerCase()).toBe(RATE_FEED)
    expect(decoded.args[1]).toBe(UPDATE_DATA)
  })

  it('sets the verification fee as the ingest tx value', async () => {
    const service = makeService(makeReadContract(), makeSource(7n))

    const params = await service.buildIngestParams(RATE_FEED)

    expect(params.value).toBe('7')
  })

  it('accepts a pre-fetched update for ingest without re-fetching', async () => {
    const source = makeSource()
    const service = makeService(makeReadContract(), source)

    await service.buildIngestParams(RATE_FEED, { updateData: UPDATE_DATA, fee: 0n })

    expect(source.fetchUpdateData).not.toHaveBeenCalled()
  })

  it('resolves a pool referenceRateFeedID', async () => {
    const readContract = makePoolReadContract()
    const service = makeService(readContract, makeSource())

    await expect(service.resolvePoolRateFeedId(POOL_PULL)).resolves.toBe(RATE_FEED)
  })

  it('builds updateDataPerHop for a route, leaving non-pull-oracle hops empty', async () => {
    const readContract = makePoolReadContract()
    const service = makeService(readContract, makeSource(3n))

    const { updateDataPerHop, totalFee } = await service.fetchUpdateDataForPools([POOL_PULL, POOL_PUSH])

    // Pull hop -> update blob (+fee); push hop (no relayer) -> empty blob, so the Router skips it.
    expect(updateDataPerHop).toEqual([UPDATE_DATA, '0x'])
    expect(totalFee).toBe(3n)
  })

  it('throws a clear error when no factory is configured (not deployed yet)', async () => {
    const publicClient = { readContract: jest.fn() } as unknown as PublicClient
    // No override and no registry entry for CELO -> must throw before any RPC call.
    const service = new PullOracleService(publicClient, ChainId.CELO, [makeSource()])

    await expect(service.resolveRelayer(RATE_FEED)).rejects.toThrow(
      /PullOracleRelayerFactory address is not configured/
    )
    expect(publicClient.readContract).not.toHaveBeenCalled()
  })
})
