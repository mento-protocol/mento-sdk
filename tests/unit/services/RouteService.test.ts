import type { PublicClient } from 'viem'
import { ChainId } from '../../../src/core/constants'
import type { PoolService } from '../../../src/services/pools'
import { RouteService } from '../../../src/services/routes/RouteService'

describe('RouteService', () => {
  let service: RouteService
  let mockPublicClient: jest.Mocked<PublicClient>
  let mockPoolService: jest.Mocked<PoolService>

  const token0 = '0x1000000000000000000000000000000000000001'
  const token1 = '0x2000000000000000000000000000000000000002'

  beforeEach(() => {
    mockPublicClient = {
      readContract: jest.fn(),
      multicall: jest.fn().mockImplementation(async ({ contracts }: any) => {
        return contracts.map(({ address }: any) => ({
          status: 'success',
          result: address === token0 ? 'AAA' : 'BBB',
        }))
      }),
    } as unknown as jest.Mocked<PublicClient>

    mockPoolService = {
      getPools: jest.fn().mockResolvedValue([
        {
          factoryAddr: '0x3000000000000000000000000000000000000003',
          poolAddr: '0x4000000000000000000000000000000000000004',
          token0,
          token1,
          poolType: 'FPMM',
        },
      ]),
    } as unknown as jest.Mocked<PoolService>

    service = new RouteService(mockPublicClient, ChainId.CELO, mockPoolService)
  })

  it('warm populates the route cache so later lookups are O(1) cache hits', async () => {
    await service.warm({ cached: false })

    const poolCallsAfterWarm = mockPoolService.getPools.mock.calls.length
    const multicallCallsAfterWarm = mockPublicClient.multicall.mock.calls.length

    const route = await service.findRoute(token0, token1, { cached: false })

    expect(route.path).toHaveLength(1)
    expect(route.tokens[0].symbol).toBe('AAA')
    expect(mockPoolService.getPools).toHaveBeenCalledTimes(poolCallsAfterWarm)
    expect(mockPublicClient.multicall).toHaveBeenCalledTimes(multicallCallsAfterWarm)
  })
})
