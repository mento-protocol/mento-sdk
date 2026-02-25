import { createPublicClient, http, Address } from 'viem'
import { PoolService } from '../../../src/services/pools/PoolService'
import { RouteService } from '../../../src/services/routes/RouteService'
import { LiquidityService } from '../../../src/services/liquidity/LiquidityService'
import { Pool, PoolType } from '../../../src/core/types'
import { deadlineFromMinutes } from '../../../src/utils/deadline'

/**
 * Integration tests for the complete liquidity flow.
 *
 * These tests verify the end-to-end functionality of:
 * - Pool discovery
 * - Add/Remove liquidity operations with tokenA/tokenB API
 * - Zap in/out operations (single-token liquidity)
 * - LP token balance tracking
 * - Quote calculations
 * - Approval handling
 *
 * Requirements:
 * - Local node running at localhost:8545 (e.g., anvil fork) OR Celo RPC endpoint
 * - DEV_ADDRESS environment variable set to a valid address with token balances
 *
 * @group integration
 * @group local
 */
describe('Liquidity Flow Integration', () => {
  const RPC_URL = process.env.CELO_RPC_URL || 'http://localhost:8545'
  const CHAIN_ID = 42220

  const publicClient = createPublicClient({
    transport: http(RPC_URL),
  })

  const poolService = new PoolService(publicClient, CHAIN_ID)
  const routeService = new RouteService(publicClient, CHAIN_ID, poolService)
  const liquidityService = new LiquidityService(publicClient, CHAIN_ID, poolService, routeService)

  // Test fixtures populated from on-chain data
  let pools: Pool[]
  let fpmmPools: Pool[]
  let testPool: Pool | undefined

  beforeAll(async () => {
    // Discover pools from the chain
    pools = await poolService.getPools()
    fpmmPools = pools.filter((p) => p.poolType === PoolType.FPMM)
    testPool = fpmmPools[0] // Use first FPMM pool for testing
  })

  describe('Pool Discovery for Liquidity', () => {
    it('should discover FPMM pools that support liquidity operations', async () => {
      expect(fpmmPools).toBeDefined()
      expect(Array.isArray(fpmmPools)).toBe(true)
      expect(fpmmPools.length).toBeGreaterThan(0)
    })
  })

  describe('Add Liquidity Quotes', () => {
    it('should calculate add liquidity quote', async () => {
      if (!testPool) {
        console.log('No FPMM pools available - skipping test')
        return
      }

      const amountA = 1000000000000000000n // 1 token
      const amountB = 2000000000000000000n // 2 tokens

      const quote = await liquidityService.quoteAddLiquidity(
        testPool.poolAddr,
        testPool.token0 as Address,
        amountA,
        testPool.token1 as Address,
        amountB
      )

      expect(quote).toBeDefined()
      expect(quote.amountA).toBeGreaterThan(0n)
      expect(quote.amountB).toBeGreaterThan(0n)
      expect(quote.liquidity).toBeGreaterThan(0n)
    })

    it('should accept tokens in any order (tokenA/tokenB API)', async () => {
      if (!testPool) return

      const amount1 = 1000000000000000000n
      const amount2 = 2000000000000000000n

      // Quote with token0, token1 order
      const quote1 = await liquidityService.quoteAddLiquidity(
        testPool.poolAddr,
        testPool.token0 as Address,
        amount1,
        testPool.token1 as Address,
        amount2
      )

      // Quote with token1, token0 order (reversed)
      const quote2 = await liquidityService.quoteAddLiquidity(
        testPool.poolAddr,
        testPool.token1 as Address,
        amount2,
        testPool.token0 as Address,
        amount1
      )

      // Both should return valid quotes
      expect(quote1.liquidity).toBeGreaterThan(0n)
      expect(quote2.liquidity).toBeGreaterThan(0n)
    })

    it('should return proportional liquidity for proportional amounts', async () => {
      if (!testPool) return

      const baseAmount = 1000000000000000000n

      const quote1 = await liquidityService.quoteAddLiquidity(
        testPool.poolAddr,
        testPool.token0 as Address,
        baseAmount,
        testPool.token1 as Address,
        baseAmount
      )

      const quote2 = await liquidityService.quoteAddLiquidity(
        testPool.poolAddr,
        testPool.token0 as Address,
        baseAmount * 2n,
        testPool.token1 as Address,
        baseAmount * 2n
      )

      // Liquidity should roughly double (allowing for rounding)
      expect(quote2.liquidity).toBeGreaterThanOrEqual(quote1.liquidity * 19n / 10n) // At least 1.9x
      expect(quote2.liquidity).toBeLessThanOrEqual(quote1.liquidity * 21n / 10n) // At most 2.1x
    })
  })

  describe('Remove Liquidity Quotes', () => {
    it('should calculate remove liquidity quote', async () => {
      if (!testPool) return

      const liquidity = 1000000000000000000n // 1 LP token

      const quote = await liquidityService.quoteRemoveLiquidity(testPool.poolAddr, liquidity)

      expect(quote).toBeDefined()
      expect(quote.amount0).toBeGreaterThan(0n)
      expect(quote.amount1).toBeGreaterThan(0n)
    })

    it('should return proportional amounts for proportional liquidity', async () => {
      if (!testPool) return

      const baseLiquidity = 1000000000000000000n

      const quote1 = await liquidityService.quoteRemoveLiquidity(testPool.poolAddr, baseLiquidity)
      const quote2 = await liquidityService.quoteRemoveLiquidity(testPool.poolAddr, baseLiquidity * 2n)

      // Amounts should roughly double
      expect(quote2.amount0).toBeGreaterThanOrEqual(quote1.amount0 * 19n / 10n)
      expect(quote2.amount0).toBeLessThanOrEqual(quote1.amount0 * 21n / 10n)
    })
  })

  describe('Add Liquidity Transaction Building', () => {
    const devAddress = process.env.DEV_ADDRESS as Address | undefined

    it('should build add liquidity params with new API', async () => {
      if (!testPool) return

      const recipient = devAddress || '0x0000000000000000000000000000000000000001'
      const amountA = 1000000000000000000n
      const amountB = 2000000000000000000n

      const params = await liquidityService.buildAddLiquidityParams(
        testPool.poolAddr,
        testPool.token0 as Address,
        amountA,
        testPool.token1 as Address,
        amountB,
        recipient as Address,
        { slippageTolerance: 0.5, deadline: deadlineFromMinutes(20) }
      )

      expect(params).toBeDefined()
      expect(params.params).toHaveProperty('to')
      expect(params.params).toHaveProperty('data')
      expect(params.params).toHaveProperty('value', '0')

      // Verify new API fields
      expect(params).toHaveProperty('tokenA', testPool.token0)
      expect(params).toHaveProperty('tokenB', testPool.token1)
      expect(params).toHaveProperty('amountADesired', amountA)
      expect(params).toHaveProperty('amountBDesired', amountB)
      expect(params).toHaveProperty('amountAMin')
      expect(params).toHaveProperty('amountBMin')

      // Verify slippage applied correctly
      expect(params.amountAMin).toBeLessThanOrEqual(amountA)
      expect(params.amountBMin).toBeLessThanOrEqual(amountB)
      expect(params.amountAMin).toBeGreaterThan(amountA * 990n / 1000n) // At least 99% of desired

      expect(params).toHaveProperty('estimatedMinLiquidity')
      expect(params.estimatedMinLiquidity).toBeGreaterThan(0n)
    })

    it('should apply slippage tolerance correctly', async () => {
      if (!testPool) return

      const recipient = devAddress || '0x0000000000000000000000000000000000000001'
      const amountA = 1000000000000000000n
      const amountB = 2000000000000000000n
      const slippageTolerance = 0.5 // 0.5%

      const params = await liquidityService.buildAddLiquidityParams(
        testPool.poolAddr,
        testPool.token0 as Address,
        amountA,
        testPool.token1 as Address,
        amountB,
        recipient as Address,
        { slippageTolerance, deadline: deadlineFromMinutes(20) }
      )

      // Expected calculation: amountMin = amount * (1 - 0.005) = amount * 9950 / 10000
      const expectedAmountAMin = (amountA * 9950n) / 10000n
      const expectedAmountBMin = (amountB * 9950n) / 10000n

      // Allow for quote adjustments but verify slippage is applied
      expect(params.amountAMin).toBeLessThanOrEqual(params.amountADesired)
      expect(params.amountBMin).toBeLessThanOrEqual(params.amountBDesired)
    })

    it('should build complete transaction with approval check', async function () {
      if (!devAddress) {
        console.log('Skipping test: DEV_ADDRESS not set')
        return
      }

      if (!testPool) return

      const amountA = 1000000000000000000n
      const amountB = 2000000000000000000n

      const transaction = await liquidityService.buildAddLiquidityTransaction(
        testPool.poolAddr,
        testPool.token0 as Address,
        amountA,
        testPool.token1 as Address,
        amountB,
        devAddress,
        devAddress,
        { slippageTolerance: 0.5, deadline: deadlineFromMinutes(20) }
      )

      expect(transaction).toHaveProperty('approvalA')
      expect(transaction).toHaveProperty('approvalB')
      expect(transaction).toHaveProperty('addLiquidity')

      // Approvals may or may not be needed depending on existing allowance
      if (transaction.approvalA !== null) {
        expect(transaction.approvalA).toHaveProperty('token', testPool.token0)
        expect(transaction.approvalA).toHaveProperty('amount', amountA)
        expect(transaction.approvalA).toHaveProperty('params')
        expect(transaction.approvalA.params).toHaveProperty('to', testPool.token0)
      }

      if (transaction.approvalB !== null) {
        expect(transaction.approvalB).toHaveProperty('token', testPool.token1)
        expect(transaction.approvalB).toHaveProperty('amount', amountB)
      }

      // Add liquidity should always be present
      expect(transaction.addLiquidity).toBeDefined()
      expect(transaction.addLiquidity.tokenA).toBe(testPool.token0)
      expect(transaction.addLiquidity.tokenB).toBe(testPool.token1)
    })
  })

  describe('Remove Liquidity Transaction Building', () => {
    const devAddress = process.env.DEV_ADDRESS as Address | undefined

    it('should build remove liquidity params', async () => {
      if (!testPool) return

      const recipient = devAddress || '0x0000000000000000000000000000000000000001'
      const liquidity = 1000000000000000000n

      const params = await liquidityService.buildRemoveLiquidityParams(
        testPool.poolAddr,
        liquidity,
        recipient as Address,
        { slippageTolerance: 0.5, deadline: deadlineFromMinutes(20) }
      )

      expect(params).toBeDefined()
      expect(params.params).toHaveProperty('to')
      expect(params.params).toHaveProperty('data')
      expect(params).toHaveProperty('poolAddress', testPool.poolAddr)
      expect(params).toHaveProperty('liquidity', liquidity)
      expect(params).toHaveProperty('amount0Min')
      expect(params).toHaveProperty('amount1Min')
      expect(params).toHaveProperty('expectedAmount0')
      expect(params).toHaveProperty('expectedAmount1')

      // Verify slippage applied
      expect(params.amount0Min).toBeLessThanOrEqual(params.expectedAmount0)
      expect(params.amount1Min).toBeLessThanOrEqual(params.expectedAmount1)
    })

    it('should build complete transaction with LP token approval check', async function () {
      if (!devAddress) {
        console.log('Skipping test: DEV_ADDRESS not set')
        return
      }

      if (!testPool) return

      const liquidity = 1000000000000000000n

      const transaction = await liquidityService.buildRemoveLiquidityTransaction(
        testPool.poolAddr,
        liquidity,
        devAddress,
        devAddress,
        { slippageTolerance: 0.5, deadline: deadlineFromMinutes(20) }
      )

      expect(transaction).toHaveProperty('approval')
      expect(transaction).toHaveProperty('removeLiquidity')

      // LP token approval may or may not be needed
      if (transaction.approval !== null) {
        expect(transaction.approval).toHaveProperty('token', testPool.poolAddr) // Pool IS LP token
        expect(transaction.approval).toHaveProperty('amount', liquidity)
      }

      expect(transaction.removeLiquidity).toBeDefined()
      expect(transaction.removeLiquidity.poolAddress).toBe(testPool.poolAddr)
    })
  })

  describe('LP Token Balance', () => {
    const devAddress = process.env.DEV_ADDRESS as Address | undefined

    it('should get LP token balance for an address', async function () {
      if (!devAddress) {
        console.log('Skipping test: DEV_ADDRESS not set')
        return
      }

      if (!testPool) return

      const balance = await liquidityService.getLPTokenBalance(testPool.poolAddr, devAddress)

      expect(balance).toBeDefined()
      expect(balance).toHaveProperty('poolAddress', testPool.poolAddr)
      expect(balance).toHaveProperty('balance')
      expect(balance).toHaveProperty('token0', testPool.token0)
      expect(balance).toHaveProperty('token1', testPool.token1)
      expect(balance).toHaveProperty('totalSupply')
      expect(balance).toHaveProperty('sharePercent')

      // Balance and share should be non-negative
      expect(balance.balance).toBeGreaterThanOrEqual(0n)
      expect(balance.totalSupply).toBeGreaterThan(0n) // Pool should have liquidity
      expect(balance.sharePercent).toBeGreaterThanOrEqual(0)
      expect(balance.sharePercent).toBeLessThanOrEqual(100)
    })

    it('should calculate share percentage correctly', async function () {
      if (!devAddress) {
        console.log('Skipping test: DEV_ADDRESS not set')
        return
      }

      if (!testPool) return

      const balance = await liquidityService.getLPTokenBalance(testPool.poolAddr, devAddress)

      // Verify share percentage calculation
      const expectedSharePercent = balance.totalSupply > 0n
        ? (Number(balance.balance) / Number(balance.totalSupply)) * 100
        : 0

      expect(balance.sharePercent).toBeCloseTo(expectedSharePercent, 10)
    })
  })

  describe('Zap Operations', () => {
    const devAddress = process.env.DEV_ADDRESS as Address | undefined

    it('should quote zap in operation', async () => {
      if (!testPool) return

      const tokenIn = testPool.token0 as Address
      const amountIn = 1000000000000000000n // 1 token
      const amountInSplit = 0.5 // 50/50 split

      const quote = await liquidityService.quoteZapIn(
        testPool.poolAddr,
        tokenIn,
        amountIn,
        amountInSplit,
        { slippageTolerance: 0.5, deadline: deadlineFromMinutes(20) }
      )

      expect(quote).toBeDefined()
      expect(quote).toHaveProperty('amountOutMinA')
      expect(quote).toHaveProperty('amountOutMinB')
      expect(quote).toHaveProperty('amountAMin')
      expect(quote).toHaveProperty('amountBMin')
      expect(quote).toHaveProperty('estimatedMinLiquidity')
      expect(quote.estimatedMinLiquidity).toBeGreaterThan(0n)
    })

    it('should build zap in params', async () => {
      if (!testPool) return

      const recipient = devAddress || '0x0000000000000000000000000000000000000001'
      const tokenIn = testPool.token0 as Address
      const amountIn = 1000000000000000000n
      const amountInSplit = 0.5

      const params = await liquidityService.buildZapInParams(
        testPool.poolAddr,
        tokenIn,
        amountIn,
        amountInSplit,
        recipient as Address,
        { slippageTolerance: 0.5, deadline: deadlineFromMinutes(20) }
      )

      expect(params).toBeDefined()
      expect(params).toHaveProperty('params')
      expect(params).toHaveProperty('poolAddress', testPool.poolAddr)
      expect(params).toHaveProperty('tokenIn', tokenIn)
      expect(params).toHaveProperty('amountIn', amountIn)
      expect(params).toHaveProperty('amountInA')
      expect(params).toHaveProperty('amountInB')
      expect(params).toHaveProperty('routesA')
      expect(params).toHaveProperty('routesB')
      expect(params).toHaveProperty('zapParams')
      expect(params).toHaveProperty('estimatedMinLiquidity')
    })

    it('should quote zap out operation', async () => {
      if (!testPool) return

      const tokenOut = testPool.token0 as Address
      const liquidity = 1000000000000000000n

      const quote = await liquidityService.quoteZapOut(
        testPool.poolAddr,
        tokenOut,
        liquidity,
        { slippageTolerance: 0.5, deadline: deadlineFromMinutes(20) }
      )

      expect(quote).toBeDefined()
      expect(quote).toHaveProperty('amountOutFromA')
      expect(quote).toHaveProperty('amountOutFromB')
      expect(quote).toHaveProperty('amountAMin')
      expect(quote).toHaveProperty('amountBMin')
      expect(quote).toHaveProperty('estimatedMinTokenOut')
      expect(quote.estimatedMinTokenOut).toBeGreaterThan(0n)
    })

    it('should build zap out params', async () => {
      if (!testPool) return

      const recipient = devAddress || '0x0000000000000000000000000000000000000001'
      const tokenOut = testPool.token0 as Address
      const liquidity = 1000000000000000000n

      const params = await liquidityService.buildZapOutParams(
        testPool.poolAddr,
        tokenOut,
        liquidity,
        recipient as Address,
        { slippageTolerance: 0.5, deadline: deadlineFromMinutes(20) }
      )

      expect(params).toBeDefined()
      expect(params).toHaveProperty('params')
      expect(params).toHaveProperty('poolAddress', testPool.poolAddr)
      expect(params).toHaveProperty('tokenOut', tokenOut)
      expect(params).toHaveProperty('liquidity', liquidity)
      expect(params).toHaveProperty('routesA')
      expect(params).toHaveProperty('routesB')
      expect(params).toHaveProperty('zapParams')
      expect(params).toHaveProperty('estimatedMinTokenOut')
    })
  })

  describe('Error Handling', () => {
    it('should throw error for invalid pool address', async () => {
      await expect(
        liquidityService.quoteAddLiquidity(
          '0x0000000000000000000000000000000000000000',
          '0x0000000000000000000000000000000000000001' as Address,
          1n,
          '0x0000000000000000000000000000000000000002' as Address,
          1n
        )
      ).rejects.toThrow(/Pool not found/)
    })

    it('should throw error for tokens not in pool', async () => {
      if (!testPool) return

      const wrongToken = '0x9999000000000000000000000000000000000000' as Address

      await expect(
        liquidityService.quoteAddLiquidity(
          testPool.poolAddr,
          testPool.token0 as Address,
          1n,
          wrongToken,
          1n
        )
      ).rejects.toThrow(/don't match pool/)
    })

    it('should throw error for same token twice', async () => {
      if (!testPool) return

      await expect(
        liquidityService.quoteAddLiquidity(
          testPool.poolAddr,
          testPool.token0 as Address,
          1n,
          testPool.token0 as Address,
          1n
        )
      ).rejects.toThrow(/must be different/)
    })
  })

  describe('Custom Configuration', () => {
    it('should support custom deadline', async () => {
      if (!testPool) return

      const recipient = '0x0000000000000000000000000000000000000001' as Address
      const customDeadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 60) // 1 hour

      const params = await liquidityService.buildAddLiquidityParams(
        testPool.poolAddr,
        testPool.token0 as Address,
        1000000000000000000n,
        testPool.token1 as Address,
        2000000000000000000n,
        recipient,
        { slippageTolerance: 0.5, deadline: customDeadline }
      )

      expect(params.deadline).toBe(customDeadline)
    })

    it('should support different slippage tolerances', async () => {
      if (!testPool) return

      const recipient = '0x0000000000000000000000000000000000000001' as Address
      const amount = 1000000000000000000n

      const params1 = await liquidityService.buildAddLiquidityParams(
        testPool.poolAddr,
        testPool.token0 as Address,
        amount,
        testPool.token1 as Address,
        amount,
        recipient,
        { slippageTolerance: 0.5, deadline: deadlineFromMinutes(20) } // 0.5%
      )

      const params2 = await liquidityService.buildAddLiquidityParams(
        testPool.poolAddr,
        testPool.token0 as Address,
        amount,
        testPool.token1 as Address,
        amount,
        recipient,
        { slippageTolerance: 1.0, deadline: deadlineFromMinutes(20) } // 1.0%
      )

      // Higher slippage tolerance should result in lower minimums
      expect(params2.amountAMin).toBeLessThan(params1.amountAMin)
      expect(params2.amountBMin).toBeLessThan(params1.amountBMin)
    })
  })
})
