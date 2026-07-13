import type { PublicClient } from 'viem'
import { Mento } from '../../src'
import { ChainId } from '../../src/core/constants'
import type { IOracleDataSource } from '../../src/services/pullOracle'

// Mento.create only wires services — no RPC happens at construction time.
const publicClient = { readContract: jest.fn() } as unknown as PublicClient

describe('Mento.create pull-oracle wiring', () => {
  it('leaves reports undefined when no oracle source is configured', async () => {
    const mento = await Mento.create(ChainId.CELO, publicClient)

    expect(mento.reports).toBeUndefined()
  })

  it('registers the Chainlink source from dataStreams credentials', async () => {
    const mento = await Mento.create(ChainId.CELO, publicClient, {
      dataStreams: { apiKey: 'key', userSecret: 'secret' },
      pullOracleRelayerFactory: '0x1111111111111111111111111111111111111111',
    })

    expect(mento.reports).toBeDefined()
  })

  it('registers custom oracleSources without Chainlink credentials', async () => {
    const pythSource: IOracleDataSource = {
      provider: 'pyth',
      fetchUpdateData: jest.fn(),
    }
    const mento = await Mento.create(ChainId.CELO, publicClient, { oracleSources: [pythSource] })

    expect(mento.reports).toBeDefined()
  })

  it('rejects empty dataStreams credentials at construction', async () => {
    await expect(
      Mento.create(ChainId.CELO, publicClient, { dataStreams: { apiKey: '', userSecret: '' } })
    ).rejects.toThrow(/apiKey and userSecret are required/)
  })
})
