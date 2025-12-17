import { createPublicClient, http, Address } from 'viem'
import { PoolService } from '../../../src/services/pools/PoolService'
import { RouteService } from '../../../src/services/routes/RouteService'
import { QuoteService } from '../../../src/services/quotes/QuoteService'
import { SwapService } from '../../../src/services/swap/SwapService'
import { Route, Pool, PoolType } from '../../../src/core/types'

/**
 * Integration tests for the complete router swap flow.
 *
 * These tests verify the end-to-end functionality of:
 * - Pool discovery
 * - Route finding (direct and multi-hop)
 * - Quote calculation
 * - Swap transaction building
 *
 * Requirements:
 * - Local node running at localhost:8545 (e.g., anvil fork)
 * - DEV_ADDRESS environment variable set to a valid address with token balances
 *
 * @group integration
 * @group local
 */
describe('Router Swap Flow Integration', () => {
  const RPC_URL = process.env.LOCAL_RPC_URL || 'http://localhost:8545'
  const CHAIN_ID = 42220 // Celo mainnet chain ID

  const publicClient = createPublicClient({
    transport: http(RPC_URL),
  })

  const poolService = new PoolService(publicClient, CHAIN_ID)
  const routeService = new RouteService(publicClient, CHAIN_ID, poolService)
  const quoteService = new QuoteService(publicClient, CHAIN_ID, routeService)
  const swapService = new SwapService(publicClient, CHAIN_ID, routeService, quoteService)

  // Test fixtures populated from on-chain data
  let pools: Pool[]
  let directRoutes: Route[]
  let allRoutes: readonly Route[]

  beforeAll(async () => {
    // Discover pools and routes from the chain
    pools = await poolService.getPools()
    directRoutes = await routeService.getDirectRoutes()
    allRoutes = await routeService.getRoutes({ cached: false })
  })

  describe('Pool Discovery', () => {
    it('should discover pools from the protocol', async () => {
      expect(pools).toBeDefined()
      expect(Array.isArray(pools)).toBe(true)
      expect(pools.length).toBeGreaterThan(0)
    })

    it('should return pools with valid structure', async () => {
      pools.forEach((pool) => {
        expect(pool).toHaveProperty('factoryAddr')
        expect(pool).toHaveProperty('poolAddr')
        expect(pool).toHaveProperty('token0')
        expect(pool).toHaveProperty('token1')
        expect(pool).toHaveProperty('poolType')

        // Properties should be valid
        expect(pool.factoryAddr).toMatch(/^0x[a-fA-F0-9]{40}$/)
        expect(pool.poolAddr).toMatch(/^0x[a-fA-F0-9]{40}$/)
        expect(pool.token0).toMatch(/^0x[a-fA-F0-9]{40}$/)
        expect(pool.token1).toMatch(/^0x[a-fA-F0-9]{40}$/)
        expect(pool.poolType).toBeDefined()
        expect(Object.values(PoolType)).toContain(pool.poolType)
      })
    })
  })

  describe('Route Discovery', () => {
    it('should generate direct routes from pools', async () => {
      expect(directRoutes).toBeDefined()
      expect(Array.isArray(directRoutes)).toBe(true)
      expect(directRoutes.length).toBeGreaterThan(0)
    })

    it('should have direct routes with single-hop paths', async () => {
      directRoutes.forEach((route) => {
        expect(route.path).toHaveLength(1)
        expect(route.tokens).toHaveLength(2)
        expect(route.id).toBeDefined()
      })
    })

    it('should generate all routes including multi-hop', async () => {
      expect(allRoutes).toBeDefined()
      expect(allRoutes.length).toBeGreaterThanOrEqual(directRoutes.length)
    })

    it('should have routes with valid token metadata', async () => {
      allRoutes.forEach((route) => {
        route.tokens.forEach((token) => {
          expect(token.address).toMatch(/^0x[a-fA-F0-9]{40}$/)
          expect(token.symbol).toBeDefined()
          expect(token.symbol.length).toBeGreaterThan(0)
        })
      })
    })
  })

  describe('Route Finding', () => {
    it('should find route by token addresses', async () => {
      // Use the first direct route's tokens as test data
      const testRoute = directRoutes[0]
      const tokenIn = testRoute.tokens[0].address as Address
      const tokenOut = testRoute.tokens[1].address as Address

      const foundRoute = await routeService.findRoute(tokenIn, tokenOut)

      expect(foundRoute).toBeDefined()
      expect(foundRoute.id).toBe(testRoute.id)
    })

    it('should find route regardless of token order', async () => {
      const testRoute = directRoutes[0]
      const tokenA = testRoute.tokens[0].address as Address
      const tokenB = testRoute.tokens[1].address as Address

      const routeAtoB = await routeService.findRoute(tokenA, tokenB)
      const routeBtoA = await routeService.findRoute(tokenB, tokenA)

      expect(routeAtoB.id).toBe(routeBtoA.id)
    })

    it('should throw error for non-existent route', async () => {
      const fakeToken1 = '0x0000000000000000000000000000000000000001' as Address
      const fakeToken2 = '0x0000000000000000000000000000000000000002' as Address

      await expect(routeService.findRoute(fakeToken1, fakeToken2)).rejects.toThrow()
    })
  })

  describe('Quote Service', () => {
    it('should calculate output amount for a swap', async () => {
      const testRoute = directRoutes[0]
      const tokenIn = testRoute.tokens[0].address as Address
      const tokenOut = testRoute.tokens[1].address as Address
      const amountIn = 1000000000000000000n // 1 token (18 decimals)

      const amountOut = await quoteService.getAmountOut(tokenIn, tokenOut, amountIn, testRoute)

      expect(amountOut).toBeDefined()
      expect(typeof amountOut).toBe('bigint')
      expect(amountOut).toBeGreaterThan(0n)
    })

    it('should auto-discover route when not provided', async () => {
      const testRoute = directRoutes[0]
      const tokenIn = testRoute.tokens[0].address as Address
      const tokenOut = testRoute.tokens[1].address as Address
      const amountIn = 1000000000000000000n

      // Call without providing route - should discover automatically
      const amountOut = await quoteService.getAmountOut(tokenIn, tokenOut, amountIn)

      expect(amountOut).toBeDefined()
      expect(amountOut).toBeGreaterThan(0n)
    })

    it('should return consistent quotes for same inputs', async () => {
      const testRoute = directRoutes[0]
      const tokenIn = testRoute.tokens[0].address as Address
      const tokenOut = testRoute.tokens[1].address as Address
      const amountIn = 1000000000000000000n

      const quote1 = await quoteService.getAmountOut(tokenIn, tokenOut, amountIn, testRoute)
      const quote2 = await quoteService.getAmountOut(tokenIn, tokenOut, amountIn, testRoute)

      expect(quote1).toBe(quote2)
    })
  })

  describe('Swap Transaction Building', () => {
    const devAddress = process.env.DEV_ADDRESS as Address | undefined

    it('should build swap parameters', async () => {
      const testRoute = directRoutes[0]
      const tokenIn = testRoute.tokens[0].address as Address
      const tokenOut = testRoute.tokens[1].address as Address
      const amountIn = 1000000000000000000n
      const recipient = devAddress || '0x0000000000000000000000000000000000000001'

      const swapDetails = await swapService.buildSwapParams(
        tokenIn,
        tokenOut,
        amountIn,
        recipient as Address,
        { slippageTolerance: 0.5 }
      )

      expect(swapDetails).toBeDefined()
      expect(swapDetails.params).toHaveProperty('to')
      expect(swapDetails.params).toHaveProperty('data')
      expect(swapDetails.params).toHaveProperty('value')
      expect(swapDetails.amountIn).toBe(amountIn)
      expect(swapDetails.expectedAmountOut).toBeGreaterThan(0n)
      expect(swapDetails.amountOutMin).toBeLessThanOrEqual(swapDetails.expectedAmountOut)
      expect(swapDetails.deadline).toBeGreaterThan(0n)
    })

    it('should calculate correct minimum output with slippage', async () => {
      const testRoute = directRoutes[0]
      const tokenIn = testRoute.tokens[0].address as Address
      const tokenOut = testRoute.tokens[1].address as Address
      const amountIn = 1000000000000000000n
      const recipient = devAddress || '0x0000000000000000000000000000000000000001'
      const slippageTolerance = 0.5 // 0.5%

      const swapDetails = await swapService.buildSwapParams(
        tokenIn,
        tokenOut,
        amountIn,
        recipient as Address,
        { slippageTolerance }
      )

      // Verify slippage calculation: amountOutMin should be expectedAmountOut * (1 - slippage)
      const expectedMin = (swapDetails.expectedAmountOut * 9950n) / 10000n // 0.5% = 50 basis points
      expect(swapDetails.amountOutMin).toBe(expectedMin)
    })

    it('should build complete swap transaction with approval check', async function () {
      if (!devAddress) {
        console.log('Skipping test: DEV_ADDRESS not set')
        return
      }

      const testRoute = directRoutes[0]
      const tokenIn = testRoute.tokens[0].address as Address
      const tokenOut = testRoute.tokens[1].address as Address
      const amountIn = 1000000000000000000n

      const { approval, swap } = await swapService.buildSwapTransaction(
        tokenIn,
        tokenOut,
        amountIn,
        devAddress,
        devAddress,
        { slippageTolerance: 0.5 }
      )

      // Approval may or may not be needed depending on existing allowance
      if (approval !== null) {
        expect(approval).toHaveProperty('to')
        expect(approval).toHaveProperty('data')
        expect(approval.to.toLowerCase()).toBe(tokenIn.toLowerCase())
      }

      // Swap should always be present
      expect(swap).toBeDefined()
      expect(swap.route).toBeDefined()
      expect(swap.routerRoutes).toBeDefined()
      expect(Array.isArray(swap.routerRoutes)).toBe(true)
    })

    it('should support custom deadline', async () => {
      const testRoute = directRoutes[0]
      const tokenIn = testRoute.tokens[0].address as Address
      const tokenOut = testRoute.tokens[1].address as Address
      const amountIn = 1000000000000000000n
      const recipient = devAddress || '0x0000000000000000000000000000000000000001'
      const customDeadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 60) // 1 hour

      const swapDetails = await swapService.buildSwapParams(
        tokenIn,
        tokenOut,
        amountIn,
        recipient as Address,
        { slippageTolerance: 0.5, deadline: customDeadline }
      )

      expect(swapDetails.deadline).toBe(customDeadline)
    })

    it('should use provided route when specified', async () => {
      const testRoute = directRoutes[0]
      const tokenIn = testRoute.tokens[0].address as Address
      const tokenOut = testRoute.tokens[1].address as Address
      const amountIn = 1000000000000000000n
      const recipient = devAddress || '0x0000000000000000000000000000000000000001'

      const swapDetails = await swapService.buildSwapParams(
        tokenIn,
        tokenOut,
        amountIn,
        recipient as Address,
        { slippageTolerance: 0.5 },
        testRoute
      )

      expect(swapDetails.route.id).toBe(testRoute.id)
    })
  })

  describe('Multi-hop Routes', () => {
    it('should handle multi-hop routes if available', async () => {
      // Find a multi-hop route (path length > 1)
      const multiHopRoute = allRoutes.find((route) => route.path.length > 1)

      if (!multiHopRoute) {
        console.log('No multi-hop routes available in test environment')
        return
      }

      const tokenIn = multiHopRoute.tokens[0].address as Address
      const tokenOut = multiHopRoute.tokens[1].address as Address
      const amountIn = 1000000000000000000n

      const amountOut = await quoteService.getAmountOut(tokenIn, tokenOut, amountIn, multiHopRoute as Route)

      expect(amountOut).toBeDefined()
      expect(amountOut).toBeGreaterThan(0n)
    })
  })
})
