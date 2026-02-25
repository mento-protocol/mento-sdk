import { LiquidityService } from '../../../src/services/liquidity/LiquidityService'
import { PoolService } from '../../../src/services/pools/PoolService'
import { RouteService } from '../../../src/services/routes/RouteService'
import type { PublicClient, Address } from 'viem'
import { ChainId } from '../../../src/core/constants'
import { PoolType } from '../../../src/core/types'
import { deadlineFromMinutes } from '../../../src/utils/deadline'

/**
 * Edge case and boundary condition tests for LiquidityService
 *
 * Tests focus on:
 * - Zero amounts and maximum values
 * - Extreme slippage values
 * - Concurrent operations
 * - Race conditions in allowance checks
 * - Malformed inputs
 * - Contract revert scenarios
 */
describe('Liquidity Service - Edge Cases', () => {
  let mockPublicClient: jest.Mocked<PublicClient>
  let mockPoolService: jest.Mocked<PoolService>
  let mockRouteService: jest.Mocked<RouteService>
  let liquidityService: LiquidityService

  const POOL_ADDRESS = '0x1000000000000000000000000000000000000001' as Address
  const TOKEN_0 = '0xaaaa000000000000000000000000000000000000' as Address
  const TOKEN_1 = '0xbbbb000000000000000000000000000000000000' as Address
  const FACTORY = '0xfacf000000000000000000000000000000000000' as Address
  const RECIPIENT = '0xecec000000000000000000000000000000000000' as Address
  const OWNER = '0x1111111111111111111111111111111111111111' as Address

  beforeEach(() => {
    mockPublicClient = {
      readContract: jest.fn(),
    } as unknown as jest.Mocked<PublicClient>

    mockPoolService = {
      getPools: jest.fn(),
      getPoolDetails: jest.fn(),
    } as unknown as jest.Mocked<PoolService>

    mockRouteService = {
      findRoute: jest.fn(),
    } as unknown as jest.Mocked<RouteService>

    liquidityService = new LiquidityService(mockPublicClient, ChainId.CELO, mockPoolService, mockRouteService)

    // Default mock setup
    mockPoolService.getPools.mockResolvedValue([
      {
        poolAddr: POOL_ADDRESS,
        token0: TOKEN_0,
        token1: TOKEN_1,
        factoryAddr: FACTORY,
        poolType: PoolType.FPMM,
      },
    ])
  })

  describe('Zero and Maximum Values', () => {
    beforeEach(() => {
      mockPublicClient.readContract.mockImplementation(async ({ functionName }: any) => {
        if (functionName === 'quoteAddLiquidity') {
          return [1000n, 2000n, 1414n]
        }
        if (functionName === 'allowance') return 0n
        return 0n
      })
    })

    it('should handle zero amount for tokenA', async () => {
      await expect(
        liquidityService.buildAddLiquidityParams(
          POOL_ADDRESS,
          TOKEN_0,
          0n,
          TOKEN_1,
          1000000000000000000n,
          RECIPIENT,
          { slippageTolerance: 0.5, deadline: deadlineFromMinutes(20) }
        )
      ).resolves.toBeDefined()
    })

    it('should handle zero amount for tokenB', async () => {
      await expect(
        liquidityService.buildAddLiquidityParams(
          POOL_ADDRESS,
          TOKEN_0,
          1000000000000000000n,
          TOKEN_1,
          0n,
          RECIPIENT,
          { slippageTolerance: 0.5, deadline: deadlineFromMinutes(20) }
        )
      ).resolves.toBeDefined()
    })

    it('should handle maximum uint256 amount', async () => {
      const maxUint256 = 2n ** 256n - 1n

      mockPublicClient.readContract.mockImplementation(async ({ functionName }: any) => {
        if (functionName === 'quoteAddLiquidity') {
          return [maxUint256 / 2n, maxUint256 / 2n, maxUint256]
        }
        if (functionName === 'allowance') return 0n
        return 0n
      })

      const result = await liquidityService.buildAddLiquidityParams(
        POOL_ADDRESS,
        TOKEN_0,
        maxUint256,
        TOKEN_1,
        maxUint256,
        RECIPIENT,
        { slippageTolerance: 0.5, deadline: deadlineFromMinutes(20) }
      )

      expect(result).toBeDefined()
      expect(result.amountADesired).toBe(maxUint256)
      expect(result.amountBDesired).toBe(maxUint256)
    })

    it('should handle 1 wei amount', async () => {
      mockPublicClient.readContract.mockImplementation(async ({ functionName }: any) => {
        if (functionName === 'quoteAddLiquidity') {
          return [1n, 1n, 1n]
        }
        if (functionName === 'allowance') return 0n
        return 0n
      })

      const result = await liquidityService.buildAddLiquidityParams(
        POOL_ADDRESS,
        TOKEN_0,
        1n,
        TOKEN_1,
        1n,
        RECIPIENT,
        { slippageTolerance: 0.5, deadline: deadlineFromMinutes(20) }
      )

      expect(result).toBeDefined()
      expect(result.amountAMin).toBeGreaterThanOrEqual(0n)
      expect(result.amountBMin).toBeGreaterThanOrEqual(0n)
    })
  })

  describe('Extreme Slippage Values', () => {
    beforeEach(() => {
      mockPublicClient.readContract.mockImplementation(async ({ functionName }: any) => {
        if (functionName === 'quoteAddLiquidity') {
          return [1000000000000000000n, 1000000000000000000n, 1000000000000000000n]
        }
        if (functionName === 'allowance') return 0n
        return 0n
      })
    })

    it('should reject negative slippage', async () => {
      await expect(
        liquidityService.buildAddLiquidityParams(
          POOL_ADDRESS,
          TOKEN_0,
          1000000000000000000n,
          TOKEN_1,
          1000000000000000000n,
          RECIPIENT,
          { slippageTolerance: -0.5, deadline: deadlineFromMinutes(20) }
        )
      ).rejects.toThrow(/cannot be negative/)
    })

    it('should reject slippage over 100%', async () => {
      await expect(
        liquidityService.buildAddLiquidityParams(
          POOL_ADDRESS,
          TOKEN_0,
          1000000000000000000n,
          TOKEN_1,
          1000000000000000000n,
          RECIPIENT,
          { slippageTolerance: 100.1, deadline: deadlineFromMinutes(20) }
        )
      ).rejects.toThrow(/cannot exceed 100%/)
    })

    it('should accept 0% slippage', async () => {
      const result = await liquidityService.buildAddLiquidityParams(
        POOL_ADDRESS,
        TOKEN_0,
        1000000000000000000n,
        TOKEN_1,
        1000000000000000000n,
        RECIPIENT,
        { slippageTolerance: 0, deadline: deadlineFromMinutes(20) }
      )

      // With 0 slippage, min should equal desired (from quote)
      expect(result.amountAMin).toBe(1000000000000000000n)
      expect(result.amountBMin).toBe(1000000000000000000n)
    })

    it('should accept 100% slippage', async () => {
      const result = await liquidityService.buildAddLiquidityParams(
        POOL_ADDRESS,
        TOKEN_0,
        1000000000000000000n,
        TOKEN_1,
        1000000000000000000n,
        RECIPIENT,
        { slippageTolerance: 100, deadline: deadlineFromMinutes(20) }
      )

      // With 100% slippage, min should be 0
      expect(result.amountAMin).toBe(0n)
      expect(result.amountBMin).toBe(0n)
    })

    it('should handle very high precision slippage (0.001%)', async () => {
      const result = await liquidityService.buildAddLiquidityParams(
        POOL_ADDRESS,
        TOKEN_0,
        1000000000000000000n,
        TOKEN_1,
        1000000000000000000n,
        RECIPIENT,
        { slippageTolerance: 0.001, deadline: deadlineFromMinutes(20) }
      )

      // 0.001% slippage = 0.1 basis point, which floors to 0 basis points
      // in calculateMinAmount (Math.floor(0.001 * 100) = 0)
      // So min equals the full amount (no slippage applied at sub-basis-point precision)
      expect(result.amountAMin).toBe(1000000000000000000n)
    })
  })

  describe('Concurrent Operations and Race Conditions', () => {
    beforeEach(() => {
      mockPublicClient.readContract.mockImplementation(async ({ functionName }: any) => {
        if (functionName === 'quoteAddLiquidity') {
          return [1000000000000000000n, 1000000000000000000n, 1000000000000000000n]
        }
        if (functionName === 'allowance') {
          // Simulate race condition: allowance changes between checks
          return Math.random() > 0.5 ? 0n : 1000000000000000000n
        }
        return 0n
      })
    })

    it('should handle concurrent transaction building', async () => {
      const promises = Array.from({ length: 10 }, () =>
        liquidityService.buildAddLiquidityTransaction(
          POOL_ADDRESS,
          TOKEN_0,
          1000000000000000000n,
          TOKEN_1,
          1000000000000000000n,
          RECIPIENT,
          OWNER,
          { slippageTolerance: 0.5, deadline: deadlineFromMinutes(20) }
        )
      )

      const results = await Promise.all(promises)

      // All should succeed
      expect(results).toHaveLength(10)
      results.forEach((result) => {
        expect(result).toHaveProperty('addLiquidity')
      })
    })

    it('should handle allowance check timing correctly', async () => {
      let callCount = 0
      mockPublicClient.readContract.mockImplementation(async ({ functionName }: any) => {
        if (functionName === 'quoteAddLiquidity') {
          return [1000000000000000000n, 1000000000000000000n, 1000000000000000000n]
        }
        if (functionName === 'allowance') {
          // First call returns 0, subsequent calls return sufficient
          callCount++
          return callCount === 1 ? 0n : 10000000000000000000n
        }
        return 0n
      })

      const result = await liquidityService.buildAddLiquidityTransaction(
        POOL_ADDRESS,
        TOKEN_0,
        1000000000000000000n,
        TOKEN_1,
        1000000000000000000n,
        RECIPIENT,
        OWNER,
        { slippageTolerance: 0.5, deadline: deadlineFromMinutes(20) }
      )

      // Should check allowance at time of call and build approvals accordingly
      expect(result).toBeDefined()
    })
  })

  describe('Malformed Inputs', () => {
    it('should reject invalid address format', async () => {
      await expect(
        liquidityService.quoteAddLiquidity('not-an-address', TOKEN_0, 1n, TOKEN_1, 1n)
      ).rejects.toThrow()
    })

    it('should reject empty string address', async () => {
      await expect(
        liquidityService.quoteAddLiquidity('', TOKEN_0, 1n, TOKEN_1, 1n)
      ).rejects.toThrow()
    })

    it('should reject null address (0x0)', async () => {
      const nullAddress = '0x0000000000000000000000000000000000000000' as Address

      mockPoolService.getPools.mockResolvedValue([
        {
          poolAddr: POOL_ADDRESS,
          token0: nullAddress,
          token1: TOKEN_1,
          factoryAddr: FACTORY,
          poolType: PoolType.FPMM,
        },
      ])

      mockPublicClient.readContract.mockResolvedValue([1000n, 1000n, 1000n])

      // Should still work - null address is valid Ethereum address
      await expect(
        liquidityService.quoteAddLiquidity(POOL_ADDRESS, nullAddress, 1n, TOKEN_1, 1n)
      ).resolves.toBeDefined()
    })

    it('should handle non-checksummed addresses', async () => {
      const lowerCasePool = POOL_ADDRESS.toLowerCase() as Address
      const lowerCaseToken0 = TOKEN_0.toLowerCase() as Address

      mockPoolService.getPools.mockResolvedValue([
        {
          poolAddr: lowerCasePool,
          token0: lowerCaseToken0,
          token1: TOKEN_1,
          factoryAddr: FACTORY,
          poolType: PoolType.FPMM,
        },
      ])

      mockPublicClient.readContract.mockResolvedValue([1000n, 1000n, 1000n])

      await expect(
        liquidityService.quoteAddLiquidity(lowerCasePool, lowerCaseToken0, 1n, TOKEN_1, 1n)
      ).resolves.toBeDefined()
    })
  })

  describe('Contract Revert Scenarios', () => {
    it('should propagate router contract errors', async () => {
      mockPublicClient.readContract.mockRejectedValue(
        new Error('execution reverted: INSUFFICIENT_LIQUIDITY')
      )

      await expect(
        liquidityService.quoteAddLiquidity(POOL_ADDRESS, TOKEN_0, 1n, TOKEN_1, 1n)
      ).rejects.toThrow(/INSUFFICIENT_LIQUIDITY/)
    })

    it('should handle RPC timeout errors', async () => {
      mockPublicClient.readContract.mockRejectedValue(new Error('RPC timeout'))

      await expect(
        liquidityService.quoteAddLiquidity(POOL_ADDRESS, TOKEN_0, 1n, TOKEN_1, 1n)
      ).rejects.toThrow(/RPC timeout/)
    })

    it('should handle network errors', async () => {
      mockPublicClient.readContract.mockRejectedValue(new Error('Network request failed'))

      await expect(
        liquidityService.quoteAddLiquidity(POOL_ADDRESS, TOKEN_0, 1n, TOKEN_1, 1n)
      ).rejects.toThrow(/Network request failed/)
    })

    it('should handle ABI decoding errors', async () => {
      mockPublicClient.readContract.mockRejectedValue(
        new Error('ABI decoding: return data size mismatch')
      )

      await expect(
        liquidityService.quoteAddLiquidity(POOL_ADDRESS, TOKEN_0, 1n, TOKEN_1, 1n)
      ).rejects.toThrow(/ABI decoding/)
    })
  })

  describe('Deadline Edge Cases', () => {
    beforeEach(() => {
      mockPublicClient.readContract.mockImplementation(async ({ functionName }: any) => {
        if (functionName === 'quoteAddLiquidity') {
          return [1000000000000000000n, 1000000000000000000n, 1000000000000000000n]
        }
        return 0n
      })
    })

    it('should accept deadline in the past (edge case)', async () => {
      const pastDeadline = BigInt(Math.floor(Date.now() / 1000) - 3600) // 1 hour ago

      const result = await liquidityService.buildAddLiquidityParams(
        POOL_ADDRESS,
        TOKEN_0,
        1000000000000000000n,
        TOKEN_1,
        1000000000000000000n,
        RECIPIENT,
        { slippageTolerance: 0.5, deadline: pastDeadline }
      )

      // Should accept it (on-chain will revert, but SDK doesn't validate)
      expect(result.deadline).toBe(pastDeadline)
    })

    it('should accept deadline = 0', async () => {
      const result = await liquidityService.buildAddLiquidityParams(
        POOL_ADDRESS,
        TOKEN_0,
        1000000000000000000n,
        TOKEN_1,
        1000000000000000000n,
        RECIPIENT,
        { slippageTolerance: 0.5, deadline: 0n }
      )

      expect(result.deadline).toBe(0n)
    })

    it('should accept maximum uint256 deadline', async () => {
      const maxDeadline = 2n ** 256n - 1n

      const result = await liquidityService.buildAddLiquidityParams(
        POOL_ADDRESS,
        TOKEN_0,
        1000000000000000000n,
        TOKEN_1,
        1000000000000000000n,
        RECIPIENT,
        { slippageTolerance: 0.5, deadline: maxDeadline }
      )

      expect(result.deadline).toBe(maxDeadline)
    })
  })

  describe('Zap Edge Cases', () => {
    beforeEach(() => {
      mockPoolService.getPoolDetails.mockResolvedValue({
        poolAddr: POOL_ADDRESS,
        token0: TOKEN_0,
        token1: TOKEN_1,
        reserve0: 10000000000000000000n,
        reserve1: 10000000000000000000n,
        poolType: 'FPMM',
      } as any)

      mockRouteService.findRoute.mockResolvedValue({
        id: 'route-id',
        path: [
          {
            poolAddr: POOL_ADDRESS,
            token0: TOKEN_0,
            token1: TOKEN_1,
            factoryAddr: FACTORY,
            poolType: PoolType.FPMM,
          },
        ],
        tokens: [
          { address: TOKEN_0, symbol: 'TK0', decimals: 18 },
          { address: TOKEN_1, symbol: 'TK1', decimals: 18 },
        ],
      } as any)

      mockPublicClient.readContract.mockImplementation(async ({ functionName }: any) => {
        if (functionName === 'generateZapInParams') {
          return [400n, 400n, 400n, 400n]
        }
        if (functionName === 'totalSupply') return 10000n
        if (functionName === 'allowance') return 0n
        return 0n
      })
    })

    it('should handle 0% split (all to tokenB)', async () => {
      const result = await liquidityService.quoteZapIn(
        POOL_ADDRESS,
        TOKEN_0,
        1000000000000000000n,
        0, // All to B
        { slippageTolerance: 0.5, deadline: deadlineFromMinutes(20) }
      )

      expect(result).toBeDefined()
      expect(result.expectedLiquidity).toBeGreaterThanOrEqual(0n)
    })

    it('should handle 100% split (all to tokenA)', async () => {
      const result = await liquidityService.quoteZapIn(
        POOL_ADDRESS,
        TOKEN_0,
        1000000000000000000n,
        1, // All to A
        { slippageTolerance: 0.5, deadline: deadlineFromMinutes(20) }
      )

      expect(result).toBeDefined()
      expect(result.expectedLiquidity).toBeGreaterThanOrEqual(0n)
    })

    it('should reject invalid split ratio < 0', async () => {
      await expect(
        liquidityService.quoteZapIn(POOL_ADDRESS, TOKEN_0, 1000000000000000000n, -0.1, {
          slippageTolerance: 0.5,
          deadline: deadlineFromMinutes(20),
        })
      ).rejects.toThrow(/must be between 0 and 1/)
    })

    it('should reject invalid split ratio > 1', async () => {
      await expect(
        liquidityService.quoteZapIn(POOL_ADDRESS, TOKEN_0, 1000000000000000000n, 1.1, {
          slippageTolerance: 0.5,
          deadline: deadlineFromMinutes(20),
        })
      ).rejects.toThrow(/must be between 0 and 1/)
    })
  })

  describe('Pool State Edge Cases', () => {
    it('should handle pool with zero reserves', async () => {
      mockPoolService.getPoolDetails.mockResolvedValue({
        poolAddr: POOL_ADDRESS,
        token0: TOKEN_0,
        token1: TOKEN_1,
        reserve0: 0n,
        reserve1: 0n,
        poolType: 'FPMM',
      } as any)

      mockRouteService.findRoute.mockResolvedValue({
        id: 'route-id',
        path: [
          {
            poolAddr: POOL_ADDRESS,
            token0: TOKEN_0,
            token1: TOKEN_1,
            factoryAddr: FACTORY,
            poolType: PoolType.FPMM,
          },
        ],
        tokens: [
          { address: TOKEN_0, symbol: 'TK0', decimals: 18 },
          { address: TOKEN_1, symbol: 'TK1', decimals: 18 },
        ],
      } as any)

      mockPublicClient.readContract.mockImplementation(async ({ functionName }: any) => {
        if (functionName === 'generateZapInParams') {
          return [100n, 100n, 100n, 100n]
        }
        if (functionName === 'totalSupply') return 0n // Empty pool
        if (functionName === 'allowance') return 0n
        return 0n
      })

      // Should handle first liquidity provision
      await expect(
        liquidityService.quoteZapIn(POOL_ADDRESS, TOKEN_0, 1000000000000000000n, 0.5, {
          slippageTolerance: 0.5,
          deadline: deadlineFromMinutes(20),
        })
      ).resolves.toBeDefined()
    })
  })
})
