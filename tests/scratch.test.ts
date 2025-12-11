import { createPublicClient, http } from 'viem'
import { celo } from 'viem/chains'
import { PoolService } from '../src/services/pools/PoolService'
import { RouterService } from '../src/services/router/RouterService'

describe('Local Deployment tests', () => {
  const publicClient = createPublicClient({
    transport: http('http://localhost:8545'),
  })

  const poolService = new PoolService(publicClient, 42220)
  const routerService = new RouterService(publicClient, 42220, poolService)

  describe('getPools()', () => {
    it.only(`should return the pools`, async function () {
      // const pools = await poolService.getPools()
      // console.log(pools)

      // const numPools = pools.length
      // const firstPool = pools[0]

      // expect(numPools).toBeGreaterThan(0)
      // expect(firstPool.poolAddr).toBe('0xC70C7925256654b41DD64e81815b3ea0E754aB38')

      // // Get the direct routes. 
      // // Should be 2
      // // - cUSD-USDC
      // // - cUSD-cEUR

      // const directRoutes = await routerService.getDirectRoutes()
      // console.log(directRoutes)
      // expect(directRoutes.length).toBe(2)
      
      // const routes = await routerService.getRoutes()
      // console.log(routes)
      // expect(routes.length).toBeGreaterThan(0)

      // Get a route for cKES to cGHS
      const route = await routerService.findRoute(
        '0x456a3D042C0DbD3db53D5489e98dFb038553B0d0',
        '0xfAeA5F3404bbA20D3cc2f8C4B0A888F55a3c7313'
      )
      console.log(route)

      // Get a quote - cGHS to USDC

      const quote = await routerService.getAmountOut(
        '0x456a3D042C0DbD3db53D5489e98dFb038553B0d0',
        '0xfAeA5F3404bbA20D3cc2f8C4B0A888F55a3c7313',
        1000000000000000000n,
        route
      )
      console.log(quote)
    })
  })
})
