import type { PublicClient } from 'viem'
import { ChainId } from '../../../src/core/constants'
import { TokenService } from '../../../src/services/tokens/tokenService'

describe('TokenService', () => {
  let service: TokenService
  let mockPublicClient: jest.Mocked<PublicClient>

  const tokenA = '0x1000000000000000000000000000000000000001'
  const tokenB = '0x2000000000000000000000000000000000000002'

  beforeEach(() => {
    mockPublicClient = {
      readContract: jest.fn().mockImplementation(async ({ functionName }: any) => {
        if (functionName === 'getTokens') {
          return [tokenA, tokenB]
        }

        throw new Error(`Unexpected readContract call: ${functionName}`)
      }),
      multicall: jest.fn().mockImplementation(async ({ contracts }: any) => {
        if (contracts[0]?.functionName === 'name') {
          return [
            { status: 'success', result: 'Token A' },
            { status: 'success', result: 'TKNA' },
            { status: 'success', result: 18 },
            { status: 'success', result: 'Token B' },
            { status: 'success', result: 'TKNB' },
            { status: 'success', result: 6 },
          ]
        }

        if (contracts[0]?.functionName === 'totalSupply') {
          return [
            { status: 'success', result: 1000n },
            { status: 'success', result: 2000n },
          ]
        }

        throw new Error(`Unexpected multicall batch: ${contracts[0]?.functionName}`)
      }),
    } as unknown as jest.Mocked<PublicClient>

    service = new TokenService(mockPublicClient, ChainId.CELO)
  })

  it('batches stable-token metadata and supply reads', async () => {
    const tokens = await service.getStableTokens(true)

    expect(tokens).toEqual([
      {
        address: tokenA,
        name: 'Token A',
        symbol: 'TKNA',
        decimals: 18,
        totalSupply: '1000',
      },
      {
        address: tokenB,
        name: 'Token B',
        symbol: 'TKNB',
        decimals: 6,
        totalSupply: '2000',
      },
    ])
    expect(mockPublicClient.readContract).toHaveBeenCalledTimes(1)
    expect(mockPublicClient.multicall).toHaveBeenCalledTimes(2)
  })
})
