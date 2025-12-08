import { createPublicClient, http } from 'viem'
import { celo } from 'viem/chains'
import { PoolService } from '../src/services/pools/PoolService'

describe('Local Deployment tests', () => {

  const publicClient = createPublicClient({
    transport: http('http://localhost:8545'),
  })

  const poolService = new PoolService(publicClient, 42220)

  describe('getPools()', () => {
    it.only(`should return the pools`, async function () {
      const pools = await poolService.getPools()
      console.log(pools)

      const numPools = pools.length
      const firstPool = pools[0]

      expect(numPools).toBeGreaterThan(0)
      expect(firstPool.poolAddr).toBe('0xbe230E6aD4bBB1E6574509F0337f54F9f2fD5002')
    })
  })
})
