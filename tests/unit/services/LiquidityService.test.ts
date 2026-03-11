import { LiquidityService } from '../../../src/services/liquidity/LiquidityService'
import { PoolService } from '../../../src/services/pools/PoolService'
import { RouteService } from '../../../src/services/routes/RouteService'
import type { PublicClient, Address } from 'viem'
import { ChainId } from '../../../src/core/constants'
import { PoolType } from '../../../src/core/types'
import { deadlineFromMinutes } from '../../../src/utils/deadline'

/**
 * Unit tests for LiquidityService
 *
 * Tests the liquidity service functionality with mocked dependencies:
 * - Basic liquidity operations (add/remove)
 * - Zap operations (single-token liquidity)
 * - Quote functions
 * - Approval logic
 * - Validation behavior
 */
describe('LiquidityService', () => {
  let mockPublicClient: jest.Mocked<PublicClient>
  let mockPoolService: jest.Mocked<PoolService>
  let mockRouteService: jest.Mocked<RouteService>
  let liquidityService: LiquidityService

  // Test addresses (using valid checksummed addresses)
  const POOL_ADDRESS = '0x1000000000000000000000000000000000000001' as Address
  const TOKEN_A = '0xaaaa000000000000000000000000000000000000' as Address
  const TOKEN_B = '0xbbbb000000000000000000000000000000000000' as Address
  const TOKEN_0 = '0xaaaa000000000000000000000000000000000000' as Address // Same as TOKEN_A
  const TOKEN_1 = '0xbbbb000000000000000000000000000000000000' as Address // Same as TOKEN_B
  const FACTORY_ADDRESS = '0xfacf000000000000000000000000000000000000' as Address
  const ROUTER_ADDRESS = '0x0000000000000000000000000000000000000000' as Address // Will be from getContractAddress
  const RECIPIENT = '0xecec000000000000000000000000000000000000' as Address
  const OWNER = '0x1111111111111111111111111111111111111111' as Address

  beforeEach(() => {
    // Mock PublicClient
    const readContract = jest.fn()
    mockPublicClient = {
      readContract,
      call: jest.fn(),
      multicall: jest.fn().mockImplementation(async ({ contracts }: { contracts: any[] }) => {
        return Promise.all(
          contracts.map(async (contract: any) => {
            try {
              const result = await readContract({
                ...contract,
                args: contract.args ?? [],
              })
              return { status: 'success', result }
            } catch (error) {
              return { status: 'failure', error }
            }
          })
        )
      }),
    } as unknown as jest.Mocked<PublicClient>

    // Mock PoolService
    mockPoolService = {
      getPools: jest.fn(),
      getPoolDetails: jest.fn(),
    } as unknown as jest.Mocked<PoolService>

    // Mock RouteService
    mockRouteService = {
      findRoute: jest.fn(),
      getRoutes: jest.fn(),
    } as unknown as jest.Mocked<RouteService>

    liquidityService = new LiquidityService(mockPublicClient, ChainId.CELO, mockPoolService, mockRouteService)
  })

  describe('Add Liquidity - Basic Operations', () => {
    beforeEach(() => {
      // Mock getPools to return test pool
      mockPoolService.getPools.mockResolvedValue([
        {
          poolAddr: POOL_ADDRESS,
          token0: TOKEN_0,
          token1: TOKEN_1,
          factoryAddr: FACTORY_ADDRESS,
          poolType: PoolType.FPMM,
        },
      ])

      // Mock contract reads for add liquidity quote and allowances
      mockPublicClient.readContract.mockImplementation(async ({ functionName }: any) => {
        if (functionName === 'quoteAddLiquidity') {
          // Return: [amountA, amountB, liquidity]
          return [1000000000000000000n, 2000000000000000000n, 1414213562373095048n] // √(1*2) ≈ 1.414
        }
        if (functionName === 'allowance') {
          return 0n // No existing allowance
        }
        return 0n
      })
    })

    it('should quote add liquidity with tokenA/tokenB API', async () => {
      const quote = await liquidityService.quoteAddLiquidity(
        POOL_ADDRESS,
        TOKEN_A,
        1000000000000000000n,
        TOKEN_B,
        2000000000000000000n
      )

      expect(quote).toEqual({
        amountA: 1000000000000000000n,
        amountB: 2000000000000000000n,
        liquidity: 1414213562373095048n,
      })

      // Should call Router.quoteAddLiquidity with tokenA/tokenB
      expect(mockPublicClient.readContract).toHaveBeenCalledWith(
        expect.objectContaining({
          functionName: 'quoteAddLiquidity',
          args: expect.arrayContaining([TOKEN_A, TOKEN_B, FACTORY_ADDRESS]),
        })
      )
    })

    it('should accept tokens in any order (tokenA/tokenB flexibility)', async () => {
      // Test with reversed token order
      const quote = await liquidityService.quoteAddLiquidity(
        POOL_ADDRESS,
        TOKEN_B, // Reversed
        2000000000000000000n,
        TOKEN_A, // Reversed
        1000000000000000000n
      )

      expect(quote.liquidity).toBeGreaterThan(0n)
    })

    it('should build add liquidity params with correct structure', async () => {
      const params = await liquidityService.buildAddLiquidityParams({
        poolAddress: POOL_ADDRESS,
        tokenA: TOKEN_A,
        amountA: 1000000000000000000n,
        tokenB: TOKEN_B,
        amountB: 2000000000000000000n,
        recipient: RECIPIENT,
        options: { slippageTolerance: 0.5, deadline: deadlineFromMinutes(20) },
      })

      expect(params).toHaveProperty('params')
      expect(params.params).toHaveProperty('to')
      expect(params.params).toHaveProperty('data')
      expect(params.params).toHaveProperty('value', '0')

      expect(params).toHaveProperty('poolAddress', POOL_ADDRESS)
      expect(params).toHaveProperty('tokenA', TOKEN_A)
      expect(params).toHaveProperty('tokenB', TOKEN_B)
      expect(params).toHaveProperty('amountADesired', 1000000000000000000n)
      expect(params).toHaveProperty('amountBDesired', 2000000000000000000n)
      expect(params).toHaveProperty('amountAMin')
      expect(params).toHaveProperty('amountBMin')
      expect(params).toHaveProperty('estimatedMinLiquidity')
      expect(params).toHaveProperty('deadline')
    })

    it('should apply slippage tolerance correctly', async () => {
      const slippageTolerance = 0.5 // 0.5%
      const params = await liquidityService.buildAddLiquidityParams({
        poolAddress: POOL_ADDRESS,
        tokenA: TOKEN_A,
        amountA: 1000000000000000000n,
        tokenB: TOKEN_B,
        amountB: 2000000000000000000n,
        recipient: RECIPIENT,
        options: { slippageTolerance, deadline: deadlineFromMinutes(20) },
      })

      // Expected mins: amount * (1 - 0.005) = amount * 0.995 = amount * 9950 / 10000
      const expectedAmountAMin = (1000000000000000000n * 9950n) / 10000n
      const expectedAmountBMin = (2000000000000000000n * 9950n) / 10000n

      expect(params.amountAMin).toBe(expectedAmountAMin)
      expect(params.amountBMin).toBe(expectedAmountBMin)
    })

    it('should build transaction with approvals when allowance is zero', async () => {
      const transaction = await liquidityService.buildAddLiquidityTransaction({
        poolAddress: POOL_ADDRESS,
        tokenA: TOKEN_A,
        amountA: 1000000000000000000n,
        tokenB: TOKEN_B,
        amountB: 2000000000000000000n,
        recipient: RECIPIENT,
        owner: OWNER,
        options: { slippageTolerance: 0.5, deadline: deadlineFromMinutes(20) },
      })

      expect(transaction).toHaveProperty('approvalA')
      expect(transaction).toHaveProperty('approvalB')
      expect(transaction).toHaveProperty('addLiquidity')

      // Both approvals should be present (allowance is 0)
      expect(transaction.approvalA).not.toBeNull()
      expect(transaction.approvalB).not.toBeNull()

      expect(transaction.approvalA).toHaveProperty('token', TOKEN_A)
      expect(transaction.approvalA).toHaveProperty('amount', 1000000000000000000n)
      expect(transaction.approvalA).toHaveProperty('params')

      expect(transaction.approvalB).toHaveProperty('token', TOKEN_B)
      expect(transaction.approvalB).toHaveProperty('amount', 2000000000000000000n)
    })

    it('should not build approvals when allowance is sufficient', async () => {
      // Mock sufficient allowances
      mockPublicClient.readContract.mockImplementation(async ({ functionName }: any) => {
        if (functionName === 'quoteAddLiquidity') {
          return [1000000000000000000n, 2000000000000000000n, 1414213562373095048n]
        }
        if (functionName === 'allowance') {
          return 10000000000000000000n // 10 tokens (sufficient)
        }
        return 0n
      })

      const transaction = await liquidityService.buildAddLiquidityTransaction({
        poolAddress: POOL_ADDRESS,
        tokenA: TOKEN_A,
        amountA: 1000000000000000000n,
        tokenB: TOKEN_B,
        amountB: 2000000000000000000n,
        recipient: RECIPIENT,
        owner: OWNER,
        options: { slippageTolerance: 0.5, deadline: deadlineFromMinutes(20) },
      })

      // Both approvals should be null (allowance is sufficient)
      expect(transaction.approvalA).toBeNull()
      expect(transaction.approvalB).toBeNull()
    })
  })

  describe('Remove Liquidity - Basic Operations', () => {
    beforeEach(() => {
      mockPoolService.getPools.mockResolvedValue([
        {
          poolAddr: POOL_ADDRESS,
          token0: TOKEN_0,
          token1: TOKEN_1,
          factoryAddr: FACTORY_ADDRESS,
          poolType: PoolType.FPMM,
        },
      ])

      mockPublicClient.readContract.mockImplementation(async ({ functionName }: any) => {
        if (functionName === 'quoteRemoveLiquidity') {
          // Return: [amount0, amount1]
          return [1000000000000000000n, 2000000000000000000n]
        }
        if (functionName === 'allowance') {
          return 0n // No existing allowance
        }
        return 0n
      })
    })

    it('should quote remove liquidity', async () => {
      const quote = await liquidityService.quoteRemoveLiquidity(POOL_ADDRESS, 1414213562373095048n)

      expect(quote).toEqual({
        amount0: 1000000000000000000n,
        amount1: 2000000000000000000n,
      })
    })

    it('should build remove liquidity params', async () => {
      const params = await liquidityService.buildRemoveLiquidityParams({
        poolAddress: POOL_ADDRESS,
        liquidity: 1414213562373095048n,
        recipient: RECIPIENT,
        options: { slippageTolerance: 0.5, deadline: deadlineFromMinutes(20) },
      })

      expect(params).toHaveProperty('params')
      expect(params).toHaveProperty('poolAddress', POOL_ADDRESS)
      expect(params).toHaveProperty('liquidity', 1414213562373095048n)
      expect(params).toHaveProperty('amount0Min')
      expect(params).toHaveProperty('amount1Min')
      expect(params).toHaveProperty('expectedAmount0', 1000000000000000000n)
      expect(params).toHaveProperty('expectedAmount1', 2000000000000000000n)
    })

    it('should build transaction with LP token approval when needed', async () => {
      const transaction = await liquidityService.buildRemoveLiquidityTransaction({
        poolAddress: POOL_ADDRESS,
        liquidity: 1414213562373095048n,
        recipient: RECIPIENT,
        owner: OWNER,
        options: { slippageTolerance: 0.5, deadline: deadlineFromMinutes(20) },
      })

      expect(transaction).toHaveProperty('approval')
      expect(transaction).toHaveProperty('removeLiquidity')

      // Approval should be present (LP token allowance is 0)
      expect(transaction.approval).not.toBeNull()
      expect(transaction.approval).toHaveProperty('token', POOL_ADDRESS) // Pool IS the LP token
      expect(transaction.approval).toHaveProperty('amount', 1414213562373095048n)
    })
  })

  describe('LP Token Balance', () => {
    beforeEach(() => {
      mockPoolService.getPools.mockResolvedValue([
        {
          poolAddr: POOL_ADDRESS,
          token0: TOKEN_0,
          token1: TOKEN_1,
          factoryAddr: FACTORY_ADDRESS,
          poolType: PoolType.FPMM,
        },
      ])

      mockPublicClient.readContract.mockImplementation(async ({ functionName }: any) => {
        if (functionName === 'balanceOf') {
          return 1000000000000000000n // 1 LP token
        }
        if (functionName === 'totalSupply') {
          return 10000000000000000000n // 10 LP tokens total
        }
        return 0n
      })
    })

    it('should get LP token balance and calculate share percentage', async () => {
      const balance = await liquidityService.getLPTokenBalance(POOL_ADDRESS, OWNER)

      expect(balance).toEqual({
        poolAddress: POOL_ADDRESS,
        balance: 1000000000000000000n,
        token0: TOKEN_0,
        token1: TOKEN_1,
        totalSupply: 10000000000000000000n,
        sharePercent: 10, // 1/10 = 10%
      })
    })

    it('should handle zero total supply', async () => {
      mockPublicClient.readContract.mockImplementation(async ({ functionName }: any) => {
        if (functionName === 'balanceOf') return 0n
        if (functionName === 'totalSupply') return 0n
        return 0n
      })

      const balance = await liquidityService.getLPTokenBalance(POOL_ADDRESS, OWNER)

      expect(balance.sharePercent).toBe(0)
    })
  })

  describe('Validation', () => {
    it('should validate pool address', async () => {
      await expect(
        liquidityService.quoteAddLiquidity('invalid', TOKEN_A, 1n, TOKEN_B, 1n)
      ).rejects.toThrow()
    })

    it('should validate token addresses', async () => {
      mockPoolService.getPools.mockResolvedValue([
        {
          poolAddr: POOL_ADDRESS,
          token0: TOKEN_0,
          token1: TOKEN_1,
          factoryAddr: FACTORY_ADDRESS,
          poolType: PoolType.FPMM,
        },
      ])

      await expect(
        liquidityService.quoteAddLiquidity(POOL_ADDRESS, 'invalid', 1n, TOKEN_B, 1n)
      ).rejects.toThrow()
    })

    it('should validate tokens belong to pool', async () => {
      mockPoolService.getPools.mockResolvedValue([
        {
          poolAddr: POOL_ADDRESS,
          token0: TOKEN_0,
          token1: TOKEN_1,
          factoryAddr: FACTORY_ADDRESS,
          poolType: PoolType.FPMM,
        },
      ])

      const WRONG_TOKEN = '0x9999000000000000000000000000000000000000' as Address

      await expect(
        liquidityService.quoteAddLiquidity(POOL_ADDRESS, TOKEN_A, 1n, WRONG_TOKEN, 1n)
      ).rejects.toThrow(/don't match pool/)
    })

    it('should validate tokens are different', async () => {
      mockPoolService.getPools.mockResolvedValue([
        {
          poolAddr: POOL_ADDRESS,
          token0: TOKEN_0,
          token1: TOKEN_1,
          factoryAddr: FACTORY_ADDRESS,
          poolType: PoolType.FPMM,
        },
      ])

      await expect(
        liquidityService.quoteAddLiquidity(POOL_ADDRESS, TOKEN_A, 1n, TOKEN_A, 1n) // Same token twice
      ).rejects.toThrow(/must be different/)
    })

    it('should throw error for non-existent pool', async () => {
      mockPoolService.getPools.mockResolvedValue([])

      await expect(
        liquidityService.quoteAddLiquidity(POOL_ADDRESS, TOKEN_A, 1n, TOKEN_B, 1n)
      ).rejects.toThrow(/Pool not found/)
    })

    it('should throw error for non-FPMM pool', async () => {
      mockPoolService.getPools.mockResolvedValue([
        {
          poolAddr: POOL_ADDRESS,
          token0: TOKEN_0,
          token1: TOKEN_1,
          factoryAddr: FACTORY_ADDRESS,
          poolType: PoolType.Virtual, // Wrong type
        },
      ])

      await expect(
        liquidityService.quoteAddLiquidity(POOL_ADDRESS, TOKEN_A, 1n, TOKEN_B, 1n)
      ).rejects.toThrow(/Only FPMM pools/)
    })
  })

  describe('Zap Operations', () => {
    const TOKEN_IN = TOKEN_A
    const AMOUNT_IN = 1000000000000000000n
    const AMOUNT_IN_SPLIT = 0.5 // 50/50 split

    beforeEach(() => {
      mockPoolService.getPools.mockResolvedValue([
        {
          poolAddr: POOL_ADDRESS,
          token0: TOKEN_0,
          token1: TOKEN_1,
          factoryAddr: FACTORY_ADDRESS,
          poolType: PoolType.FPMM,
        },
      ])

      mockPoolService.getPoolDetails.mockResolvedValue({
        poolAddr: POOL_ADDRESS,
        token0: TOKEN_0,
        token1: TOKEN_1,
        reserve0: 10000000000000000000n,
        reserve1: 20000000000000000000n,
        poolType: 'FPMM',
      } as any)

      mockRouteService.findRoute.mockResolvedValue({
        id: 'route-id',
        path: [{
          poolAddr: POOL_ADDRESS,
          token0: TOKEN_0,
          token1: TOKEN_1,
          factoryAddr: FACTORY_ADDRESS,
          poolType: PoolType.FPMM,
        }],
        tokens: [
          { address: TOKEN_0, symbol: 'TKNA', decimals: 18 },
          { address: TOKEN_1, symbol: 'TKNB', decimals: 18 },
        ],
      } as any)

      mockPublicClient.readContract.mockImplementation(async ({ functionName }: any) => {
        if (functionName === 'generateZapInParams') {
          // Return: [amountOutMinA, amountOutMinB, amountAMin, amountBMin]
          return [400000000000000000n, 400000000000000000n, 400000000000000000n, 400000000000000000n]
        }
        if (functionName === 'generateZapOutParams') {
          // Return: [amountOutMinA, amountOutMinB, amountAMin, amountBMin]
          return [500000000000000000n, 500000000000000000n, 500000000000000000n, 500000000000000000n]
        }
        if (functionName === 'getReserves') {
          return [10000000000000000000n, 20000000000000000000n, 1700000000n]
        }
        if (functionName === 'totalSupply') {
          return 10000000000000000000n
        }
        if (functionName === 'allowance') {
          return 0n
        }
        return 0n
      })
    })

    it('should quote zap in operation', async () => {
      const quote = await liquidityService.quoteZapIn(
        POOL_ADDRESS,
        TOKEN_IN,
        AMOUNT_IN,
        AMOUNT_IN_SPLIT,
        { slippageTolerance: 0.5, deadline: deadlineFromMinutes(20) }
      )

      expect(quote).toHaveProperty('amountOutFromA')
      expect(quote).toHaveProperty('amountOutFromB')
      expect(quote).toHaveProperty('amountAMin')
      expect(quote).toHaveProperty('amountBMin')
      expect(quote).toHaveProperty('estimatedMinLiquidity')
    })

    it('should prepare zap in without calling full pool details enrichment', async () => {
      const prepared = await liquidityService.prepareZapIn({
        poolAddress: POOL_ADDRESS,
        tokenIn: TOKEN_IN,
        amountIn: AMOUNT_IN,
        amountInSplit: AMOUNT_IN_SPLIT,
        recipient: RECIPIENT,
        options: { slippageTolerance: 0.5, deadline: deadlineFromMinutes(20) },
      })

      expect(prepared.quote.estimatedMinLiquidity).toBeGreaterThanOrEqual(0n)
      expect(prepared.details.routesA).toEqual(prepared.routesA)
      expect(prepared.details.routesB).toEqual(prepared.routesB)
      expect(mockPoolService.getPoolDetails).not.toHaveBeenCalled()
      expect(mockPublicClient.readContract).toHaveBeenCalledWith(
        expect.objectContaining({
          functionName: 'getReserves',
        })
      )
    })

    it('should build zap in transaction with approval', async () => {
      const transaction = await liquidityService.buildZapInTransaction({
        poolAddress: POOL_ADDRESS,
        tokenIn: TOKEN_IN,
        amountIn: AMOUNT_IN,
        amountInSplit: AMOUNT_IN_SPLIT,
        recipient: RECIPIENT,
        owner: OWNER,
        options: { slippageTolerance: 0.5, deadline: deadlineFromMinutes(20) },
      })

      expect(transaction).toHaveProperty('approval')
      expect(transaction).toHaveProperty('zapIn')

      // Approval should be present (allowance is 0)
      expect(transaction.approval).not.toBeNull()
      expect(transaction.approval).toHaveProperty('token', TOKEN_IN)
      expect(transaction.approval).toHaveProperty('amount', AMOUNT_IN)
    })

    it('should quote zap out operation', async () => {
      const LIQUIDITY = 1000000000000000000n

      const quote = await liquidityService.quoteZapOut(
        POOL_ADDRESS,
        TOKEN_A,
        LIQUIDITY,
        { slippageTolerance: 0.5, deadline: deadlineFromMinutes(20) }
      )

      expect(quote).toHaveProperty('amountOutFromA')
      expect(quote).toHaveProperty('amountOutFromB')
      expect(quote).toHaveProperty('amountAMin')
      expect(quote).toHaveProperty('amountBMin')
      expect(quote).toHaveProperty('estimatedMinTokenOut')
    })

    it('should prepare zap out and expose the quote alongside details', async () => {
      const LIQUIDITY = 1000000000000000000n

      const prepared = await liquidityService.prepareZapOut({
        poolAddress: POOL_ADDRESS,
        tokenOut: TOKEN_A,
        liquidity: LIQUIDITY,
        recipient: RECIPIENT,
        options: { slippageTolerance: 0.5, deadline: deadlineFromMinutes(20) },
      })

      expect(prepared.quote.estimatedMinTokenOut).toBeGreaterThan(0n)
      expect(prepared.details.estimatedMinTokenOut).toBe(prepared.quote.estimatedMinTokenOut)
      expect(prepared.approval).toBeUndefined()
    })

    it('should build zap out transaction with LP token approval', async () => {
      const LIQUIDITY = 1000000000000000000n

      const transaction = await liquidityService.buildZapOutTransaction({
        poolAddress: POOL_ADDRESS,
        tokenOut: TOKEN_A,
        liquidity: LIQUIDITY,
        recipient: RECIPIENT,
        owner: OWNER,
        options: { slippageTolerance: 0.5, deadline: deadlineFromMinutes(20) },
      })

      expect(transaction).toHaveProperty('approval')
      expect(transaction).toHaveProperty('zapOut')

      // LP token approval should be present (allowance is 0)
      expect(transaction.approval).not.toBeNull()
      expect(transaction.approval).toHaveProperty('token', POOL_ADDRESS)
      expect(transaction.approval).toHaveProperty('amount', LIQUIDITY)
    })

    it('should preflight zap out when allowance is sufficient', async () => {
      const LIQUIDITY = 1000000000000000000n

      mockPublicClient.readContract.mockImplementation(async ({ functionName }: any) => {
        if (functionName === 'generateZapOutParams') {
          return [500000000000000000n, 500000000000000000n, 500000000000000000n, 500000000000000000n]
        }
        if (functionName === 'allowance') {
          return LIQUIDITY
        }
        return 0n
      })
      ;(mockPublicClient.call as jest.Mock).mockResolvedValue({ data: '0x' })

      const transaction = await liquidityService.buildZapOutTransaction({
        poolAddress: POOL_ADDRESS,
        tokenOut: TOKEN_A,
        liquidity: LIQUIDITY,
        recipient: RECIPIENT,
        owner: OWNER,
        options: { slippageTolerance: 0.5, deadline: deadlineFromMinutes(20) },
      })

      expect(transaction.approval).toBeNull()
      expect(mockPublicClient.call).toHaveBeenCalled()
    })

    it('should throw when no viable zap out route can be simulated', async () => {
      const LIQUIDITY = 1000000000000000000n

      mockPublicClient.readContract.mockImplementation(async ({ functionName }: any) => {
        if (functionName === 'generateZapOutParams') {
          return [500000000000000000n, 500000000000000000n, 500000000000000000n, 500000000000000000n]
        }
        if (functionName === 'allowance') {
          return LIQUIDITY
        }
        return 0n
      })
      ;(mockPublicClient.call as jest.Mock).mockRejectedValue(new Error('execution reverted: 0xbb55fd27'))
      ;(mockRouteService.getRoutes as jest.Mock).mockResolvedValue([])

      await expect(
        liquidityService.buildZapOutTransaction({
          poolAddress: POOL_ADDRESS,
          tokenOut: TOKEN_A,
          liquidity: LIQUIDITY,
          recipient: RECIPIENT,
          owner: OWNER,
          options: { slippageTolerance: 0.5, deadline: deadlineFromMinutes(20) },
        })
      ).rejects.toThrow(/No viable zap-out route/)
    })
  })

  describe('Custom Options', () => {
    beforeEach(() => {
      mockPoolService.getPools.mockResolvedValue([
        {
          poolAddr: POOL_ADDRESS,
          token0: TOKEN_0,
          token1: TOKEN_1,
          factoryAddr: FACTORY_ADDRESS,
          poolType: PoolType.FPMM,
        },
      ])

      mockPublicClient.readContract.mockImplementation(async ({ functionName }: any) => {
        if (functionName === 'quoteAddLiquidity') {
          return [1000000000000000000n, 2000000000000000000n, 1414213562373095048n]
        }
        return 0n
      })
    })

    it('should support custom deadline', async () => {
      const customDeadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 60) // 1 hour

      const params = await liquidityService.buildAddLiquidityParams({
        poolAddress: POOL_ADDRESS,
        tokenA: TOKEN_A,
        amountA: 1000000000000000000n,
        tokenB: TOKEN_B,
        amountB: 2000000000000000000n,
        recipient: RECIPIENT,
        options: { slippageTolerance: 0.5, deadline: customDeadline },
      })

      expect(params.deadline).toBe(customDeadline)
    })

  })
})
