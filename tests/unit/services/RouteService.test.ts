import type { PublicClient } from 'viem'
import { ChainId } from '../../../src/core/constants'
import type { PoolService } from '../../../src/services/pools'
import type { Route, RouteID, RouteWithCost } from '../../../src/core/types'
import { RouteService } from '../../../src/services/routes/RouteService'
import { getCachedRoutes } from '../../../src/utils/routes'

jest.mock('../../../src/utils/routes', () => ({
  getCachedRoutes: jest.fn(),
}))

const token0 = '0x1000000000000000000000000000000000000001'
const token1 = '0x2000000000000000000000000000000000000002'

describe('RouteService', () => {
  let service: RouteService
  let mockPublicClient: jest.Mocked<PublicClient>
  let mockPoolService: jest.Mocked<PoolService>

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

  it('selects the lowest-cost cached candidate independently of candidate order', async () => {
    const expensive = makeCachedRoute(makePath(['0x41', '0x42']), 0.8)
    const cheap = makeCachedRoute(makePath(['0x43', '0x44']), 0.3)

    setCachedRoutes([expensive, cheap])
    const first = await service.findRoute(token0, token1)

    const reorderedService = new RouteService(mockPublicClient, ChainId.CELO, mockPoolService)
    setCachedRoutes([cheap, expensive])
    const second = await reorderedService.findRoute(token0, token1)

    expect(first.path.map((pool) => pool.poolAddr)).toEqual(['0x43', '0x44'])
    expect(second.path.map((pool) => pool.poolAddr)).toEqual(['0x43', '0x44'])
  })

  it('does not let a cheaper three-hop cached route compete with a shorter route', async () => {
    const expensiveTwoHop = makeCachedRoute(makePath(['0x45', '0x46']), 0.8)
    const cheapThreeHop = makeCachedRoute(makePath(['0x47', '0x48', '0x49']), 0.3)

    setCachedRoutes([expensiveTwoHop, cheapThreeHop])
    const first = await service.findRoute(token0, token1)

    const reorderedService = new RouteService(mockPublicClient, ChainId.CELO, mockPoolService)
    setCachedRoutes([cheapThreeHop, expensiveTwoHop])
    const second = await reorderedService.findRoute(token0, token1)

    expect(first.path.map((pool) => pool.poolAddr)).toEqual(['0x45', '0x46'])
    expect(second.path.map((pool) => pool.poolAddr)).toEqual(['0x45', '0x46'])
  })

  it('prefers fewer hops when cached costs tie', async () => {
    const long = makeCachedRoute(makePath(['0x51', '0x52']), 0.3)
    const short = makeCachedRoute(makePath(['0x54']), 0.3)

    setCachedRoutes([long, short])

    const route = await service.findRoute(token0, token1)

    expect(route.path).toHaveLength(1)
    expect(route.path[0].poolAddr).toBe('0x54')
  })

  it('prefers fewer hops when cached cost data is absent', async () => {
    const long = makeRoute(makePath(['0x61', '0x62']))
    const short = makeRoute(makePath(['0x63']))

    setCachedRoutes([long, short])

    const route = await service.findRoute(token0, token1)

    expect(route.path).toHaveLength(1)
    expect(route.path[0].poolAddr).toBe('0x63')
  })
})

function makePool(poolAddr: string, poolToken0 = token0, poolToken1 = token1) {
  return {
    factoryAddr: '0x7000000000000000000000000000000000000007',
    poolAddr,
    token0: poolToken0,
    token1: poolToken1,
    poolType: 'FPMM' as const,
  }
}

function makePath(poolAddresses: string[]): ReturnType<typeof makePool>[] {
  const intermediateTokens = poolAddresses.slice(1).map((_, index) => {
    return `0x${(index + 3).toString(16).padStart(40, '0')}`
  })
  const pathTokens = [token0, ...intermediateTokens, token1]

  return poolAddresses.map((poolAddress, index) => {
    return makePool(poolAddress, pathTokens[index], pathTokens[index + 1])
  })
}

function setCachedRoutes(routes: Array<Route | RouteWithCost>): void {
  ;(getCachedRoutes as unknown as jest.Mock).mockReturnValueOnce(routes)
}

function makeRoute(path: ReturnType<typeof makePool>[]): Route {
  return {
    id: 'AAA-BBB' as RouteID,
    tokens: [
      { address: token0, symbol: 'AAA' },
      { address: token1, symbol: 'BBB' },
    ],
    path,
  }
}

function makeCachedRoute(path: ReturnType<typeof makePool>[], totalCostPercent: number): RouteWithCost {
  return {
    ...makeRoute(path),
    costData: {
      totalCostPercent,
      hops: path.map((pool) => ({ poolAddress: pool.poolAddr, costPercent: totalCostPercent / path.length })),
    },
  }
}
