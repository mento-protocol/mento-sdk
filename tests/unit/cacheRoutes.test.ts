import type { Pool, Route, RouteID } from '../../src/core/types'
import { PoolType } from '../../src/core/types'
import { getPoolCostPercent } from '../../src/utils/costUtils'
import { processRoutesInBatches } from '../../scripts/cacheRoutes/batchProcessor'
import { assertCompleteChainGeneration } from '../../scripts/shared/completeness'
import { calculateCostForRoute, createPoolCostMemo, sortRoutesBySpread } from '../../scripts/cacheRoutes/spread'
import { calculateStatistics } from '../../scripts/cacheRoutes/statistics'

jest.mock('../../src/utils/costUtils', () => ({
  getPoolCostPercent: jest.fn(),
}))

const mockedGetPoolCostPercent = jest.mocked(getPoolCostPercent)

const TOKEN_A = '0xaa00000000000000000000000000000000000001'
const TOKEN_B = '0xbb00000000000000000000000000000000000002'
const TOKEN_C = '0xcc00000000000000000000000000000000000003'
const TOKEN_D = '0xdd00000000000000000000000000000000000004'
const TOKEN_SYMBOLS: Record<string, string> = {
  [TOKEN_A]: 'A',
  [TOKEN_B]: 'B',
  [TOKEN_C]: 'C',
  [TOKEN_D]: 'D',
}
const POOL_AB = '0x1000000000000000000000000000000000000001'
const POOL_BC = '0x1000000000000000000000000000000000000002'
const POOL_CD = '0x1000000000000000000000000000000000000003'

const poolAB = {
  factoryAddr: '0xff00000000000000000000000000000000000099',
  poolAddr: POOL_AB,
  token0: TOKEN_A,
  token1: TOKEN_B,
  poolType: PoolType.FPMM as `${PoolType}`,
}

const poolBC = {
  factoryAddr: '0xff00000000000000000000000000000000000099',
  poolAddr: POOL_BC,
  token0: TOKEN_B,
  token1: TOKEN_C,
  poolType: PoolType.FPMM as `${PoolType}`,
}

const poolCD = {
  factoryAddr: '0xff00000000000000000000000000000000000099',
  poolAddr: POOL_CD,
  token0: TOKEN_C,
  token1: TOKEN_D,
  poolType: PoolType.FPMM as `${PoolType}`,
}

function route(path: Pool[] = [poolAB], startToken = TOKEN_A): Route {
  let endToken = startToken
  for (const pool of path) {
    if (pool.token0 === endToken) endToken = pool.token1
    else if (pool.token1 === endToken) endToken = pool.token0
    else throw new Error(`Disconnected test route at pool ${pool.poolAddr}`)
  }

  const start = { address: startToken, symbol: TOKEN_SYMBOLS[startToken] }
  const end = { address: endToken, symbol: TOKEN_SYMBOLS[endToken] }
  const tokens: Route['tokens'] = start.symbol <= end.symbol ? [start, end] : [end, start]

  return {
    id: `${tokens[0].symbol}-${tokens[1].symbol}` as RouteID,
    tokens,
    path,
  }
}

describe('cache route pipeline', () => {
  beforeEach(() => {
    mockedGetPoolCostPercent.mockReset()
  })

  it('memoizes a successful pool-cost read across routes in one run', async () => {
    mockedGetPoolCostPercent.mockResolvedValue(0.5)
    const memo = createPoolCostMemo()

    await Promise.all([
      calculateCostForRoute(route(), {} as never, memo),
      calculateCostForRoute(route(), {} as never, memo),
    ])

    expect(mockedGetPoolCostPercent).toHaveBeenCalledTimes(1)
  })

  it('evicts a failed pool-cost read so a retry can recover', async () => {
    mockedGetPoolCostPercent.mockRejectedValueOnce(new Error('temporary RPC failure')).mockResolvedValueOnce(0.5)
    const memo = createPoolCostMemo()

    await expect(calculateCostForRoute(route(), {} as never, memo)).rejects.toThrow('temporary RPC failure')
    const recovered = await calculateCostForRoute(route(), {} as never, memo)

    expect(recovered.costData.hops).toHaveLength(1)
    expect(mockedGetPoolCostPercent).toHaveBeenCalledTimes(2)
  })

  it('shares pool-cost reads between routes processed in one batch run', async () => {
    mockedGetPoolCostPercent.mockResolvedValue(0.5)
    const firstRoute = route([poolAB, poolBC])
    const secondRoute = route([poolBC, poolCD], TOKEN_B)

    const results = await processRoutesInBatches([firstRoute, secondRoute], {} as never, 2, 1, 0)

    expect(results).toHaveLength(2)
    expect(results.map(({ id }) => id)).toEqual(['A-C', 'B-D'])
    expect(mockedGetPoolCostPercent).toHaveBeenCalledTimes(3)
  })

  it('reports one-, two-, and three-hop routes', () => {
    const statistics = calculateStatistics([
      { ...route([poolAB]), costData: { totalCostPercent: 0.1, hops: [] } },
      { ...route([poolAB, poolBC]), costData: { totalCostPercent: 0.2, hops: [] } },
      {
        ...route([poolAB, poolBC, poolCD]),
        costData: { totalCostPercent: 0.3, hops: [] },
      },
    ])

    expect(statistics.hopDistribution).toEqual({
      oneHop: 1,
      twoHop: 1,
      threeHop: 1,
    })
  })

  it('sorts equal-cost routes deterministically', () => {
    const lowerPath = {
      ...route(),
      costData: { totalCostPercent: 0.5, hops: [] },
    }
    const higherPath = {
      ...route([
        {
          ...poolAB,
          poolType: PoolType.Virtual as `${PoolType}`,
          poolAddr: '0x0000000000000000000000000000000000000009',
        },
      ]),
      costData: { totalCostPercent: 0.5, hops: [] },
    }
    const signature = (routes: Route[]) => routes.map((entry) => entry.path.map((pool) => pool.poolAddr).join('|'))

    expect(signature(sortRoutesBySpread([higherPath, lowerPath]))).toEqual(
      signature(sortRoutesBySpread([lowerPath, higherPath]))
    )
    expect(sortRoutesBySpread([higherPath, lowerPath])[0].path[0].poolAddr).toBe(POOL_AB)
  })

  it('blocks the cache write when any requested chain fails', () => {
    expect(() => assertCompleteChainGeneration('Route', [137, 42220], [42220])).toThrow('cache file left untouched')
    expect(() => assertCompleteChainGeneration('Route', [137, 42220], [])).not.toThrow()
  })

  // The token cache shares the guard: a failed chain there used to be written as
  // an empty token array, dropping that chain's TokenSymbol members too.
  it('names the cache that was left untouched', () => {
    expect(() => assertCompleteChainGeneration('Token', [42220, 84532], [84532])).toThrow(
      'Token cache generation failed for chain(s) 84532 of requested chain(s) 42220, 84532 - cache file left untouched'
    )
  })
})
