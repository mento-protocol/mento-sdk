import { createPublicClient, createWalletClient, http } from 'viem'
import { PoolService } from '../src/services/pools/PoolService'
import { RouteService } from '../src/services/routes/RouteService'
import { QuoteService } from '../src/services/quotes/QuoteService'
import { SwapService } from '../src/services/swap/SwapService'
import { privateKeyToAccount } from 'viem/accounts'
import { getChainConfig } from '../src/utils/chainConfig'

describe('Local Deployment tests', () => {
  const publicClient = createPublicClient({
    transport: http('http://localhost:8545'),
  })

  const account = privateKeyToAccount('0x')

  const walletClient = createWalletClient({
    account,
    transport: http('http://localhost:8545'),
  })

  const poolService = new PoolService(publicClient, 42220)
  const routeService = new RouteService(publicClient, 42220, poolService)
  const quoteService = new QuoteService(publicClient, 42220, routeService)
  const swapService = new SwapService(publicClient, 42220, routeService, quoteService)

  describe('getPools()', () => {
    it.only(`should return the pools`, async function () {
      const pools = await poolService.getPools()
      console.log(pools)

      const numPools = pools.length
      expect(numPools).toBeGreaterThan(0)

      const directRoutes = await routeService.getDirectRoutes()
      console.log(directRoutes)
      expect(directRoutes.length).toBe(2)

      const routes = await routeService.getRoutes()
      console.log(routes)
      expect(routes.length).toBe(3)

      // Get a route for cKES to cGHS
      const route = await routeService.findRoute(
        '0x456a3D042C0DbD3db53D5489e98dFb038553B0d0',
        '0xfAeA5F3404bbA20D3cc2f8C4B0A888F55a3c7313'
      )
      console.log(route)

      // Get a quote - cGHS to USDC
      const quote = await quoteService.getAmountOut(
        '0x456a3D042C0DbD3db53D5489e98dFb038553B0d0',
        '0xfAeA5F3404bbA20D3cc2f8C4B0A888F55a3c7313',
        1000000000000000000n,
        route
      )
      console.log(quote)

      const celo = getChainConfig(42220)

      // Build swap transaction (includes approval check)
      const { approval, swap } = await swapService.buildSwapTransaction(
        '0x456a3D042C0DbD3db53D5489e98dFb038553B0d0',
        '0xfAeA5F3404bbA20D3cc2f8C4B0A888F55a3c7313',
        1000000000000000000n,
        '0x56fd3f2bee130e9867942d0f463a16fbe49b8d81',
        account.address,
        { slippageTolerance: 0.5 }
      )
      console.log('Approval needed:', approval !== null)
      console.log('Swap details:', swap)

      // Execute approval if needed
      if (approval) {
        const approvalTx = await walletClient.sendTransaction({
          to: approval.to as `0x${string}`,
          data: approval.data as `0x${string}`,
          value: BigInt(approval.value),
          chain: celo,
        })
        console.log('Approval tx:', approvalTx)
      }

      // Execute swap
      const txHash = await walletClient.sendTransaction({
        to: swap.params.to as `0x${string}`,
        data: swap.params.data as `0x${string}`,
        value: BigInt(swap.params.value),
        chain: celo,
      })
      console.log('Swap tx:', txHash)
    })
  })
})
