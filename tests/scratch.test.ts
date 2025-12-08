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
      const pools = await poolService.getPools()
      console.log(pools)

      const numPools = pools.length
      const firstPool = pools[0]

      expect(numPools).toBeGreaterThan(0)
      expect(firstPool.poolAddr).toBe(
        '0xbe230E6aD4bBB1E6574509F0337f54F9f2fD5002'
      )

      // Get the direct routes. 
      // Should be 2
      // - cUSD-USDC
      // - cUSD-cEUR

      const directRoutes = await routerService.getDirectRoutes()
      console.log(directRoutes)

      expect(directRoutes.length).toBe(2)
      expect(directRoutes[0].id).toBe('cUSD-USDC')
      expect(directRoutes[1].id).toBe('cUSD-cEUR')

      expect(directRoutes[0].path.length).toBe(1)
      expect(directRoutes[1].path.length).toBe(1)

      expect(directRoutes[0].path[0].poolAddr).toBe('0xbe230E6aD4bBB1E6574509F0337f54F9f2fD5002')
      expect(directRoutes[1].path[0].poolAddr).toBe('0xbe230E6aD4bBB1E6574509F0337f54F9f2fD5002')
    })
  })
})
