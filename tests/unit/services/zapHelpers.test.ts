import { Address } from 'viem'
import { RouteService } from '../../../src/services/routes/RouteService'
import { PoolType } from '../../../src/core/types'
import {
  splitAmount,
  estimateLiquidityFromZapIn,
  findZapInRoutes,
  findZapOutRoutes,
  encodeZapInCall,
  encodeZapOutCall,
} from '../../../src/services/liquidity/zapHelpers'

/**
 * Unit tests for zap helper functions
 *
 * Tests focus on:
 * - Splitting calculations and edge cases
 * - Liquidity estimation accuracy
 * - Route finding logic
 * - Encoding validation
 */
describe('Zap Helpers', () => {
  describe('splitAmount', () => {
    it('should split amount 50/50', () => {
      const amount = 1000000000000000000n // 1 token
      const ratio = 0.5

      const result = splitAmount(amount, ratio)

      expect(result.amountA).toBe(500000000000000000n)
      expect(result.amountB).toBe(500000000000000000n)
      expect(result.amountA + result.amountB).toBe(amount)
    })

    it('should split amount 25/75', () => {
      const amount = 1000000000000000000n
      const ratio = 0.25

      const result = splitAmount(amount, ratio)

      expect(result.amountA).toBe(250000000000000000n)
      expect(result.amountB).toBe(750000000000000000n)
      expect(result.amountA + result.amountB).toBe(amount)
    })

    it('should split amount 75/25', () => {
      const amount = 1000000000000000000n
      const ratio = 0.75

      const result = splitAmount(amount, ratio)

      expect(result.amountA).toBe(750000000000000000n)
      expect(result.amountB).toBe(250000000000000000n)
      expect(result.amountA + result.amountB).toBe(amount)
    })

    it('should handle ratio = 0 (all to B)', () => {
      const amount = 1000000000000000000n
      const ratio = 0

      const result = splitAmount(amount, ratio)

      expect(result.amountA).toBe(0n)
      expect(result.amountB).toBe(amount)
      expect(result.amountA + result.amountB).toBe(amount)
    })

    it('should handle ratio = 1 (all to A)', () => {
      const amount = 1000000000000000000n
      const ratio = 1

      const result = splitAmount(amount, ratio)

      expect(result.amountA).toBe(amount)
      expect(result.amountB).toBe(0n)
      expect(result.amountA + result.amountB).toBe(amount)
    })

    it('should handle very small amounts', () => {
      const amount = 100n // 100 wei
      const ratio = 0.5

      const result = splitAmount(amount, ratio)

      expect(result.amountA + result.amountB).toBe(amount)
      expect(result.amountA).toBeGreaterThanOrEqual(0n)
      expect(result.amountB).toBeGreaterThanOrEqual(0n)
    })

    it('should handle odd amounts with rounding', () => {
      const amount = 999n // Odd number
      const ratio = 0.5

      const result = splitAmount(amount, ratio)

      // Should round down for A, remainder goes to B
      expect(result.amountA + result.amountB).toBe(amount)
    })

    it('should handle very large amounts', () => {
      const amount = 1000000000000000000000000n // 1 million tokens
      const ratio = 0.33

      const result = splitAmount(amount, ratio)

      expect(result.amountA + result.amountB).toBe(amount)
      // ~33% of amount
      expect(result.amountA).toBeGreaterThan(amount / 4n)
      expect(result.amountA).toBeLessThan(amount / 2n)
    })

    it('should throw error for ratio < 0', () => {
      const amount = 1000000000000000000n
      const ratio = -0.1

      expect(() => splitAmount(amount, ratio)).toThrow(/must be between 0 and 1/)
    })

    it('should throw error for ratio > 1', () => {
      const amount = 1000000000000000000n
      const ratio = 1.1

      expect(() => splitAmount(amount, ratio)).toThrow(/must be between 0 and 1/)
    })

    it('should maintain precision for decimal ratios', () => {
      const amount = 10000000000000000000n // 10 tokens
      const ratio = 0.333 // 33.3%

      const result = splitAmount(amount, ratio)

      // Verify precision is maintained
      const expectedA = (amount * 3330n) / 10000n
      expect(result.amountA).toBe(expectedA)
      expect(result.amountA + result.amountB).toBe(amount)
    })
  })

  describe('estimateLiquidityFromZapIn', () => {
    it('should calculate liquidity for first provision (geometric mean)', () => {
      const amountOutA = 1000000000000000000n // 1 token
      const amountOutB = 1000000000000000000n // 1 token
      const reserve0 = 0n
      const reserve1 = 0n
      const totalSupply = 0n

      const result = estimateLiquidityFromZapIn(
        amountOutA,
        amountOutB,
        reserve0,
        reserve1,
        totalSupply
      )

      // Geometric mean of 1*1 = 1
      expect(result).toBe(1000000000000000000n)
    })

    it('should calculate liquidity for first provision (asymmetric)', () => {
      const amountOutA = 1000000000000000000n // 1 token
      const amountOutB = 4000000000000000000n // 4 tokens
      const reserve0 = 0n
      const reserve1 = 0n
      const totalSupply = 0n

      const result = estimateLiquidityFromZapIn(
        amountOutA,
        amountOutB,
        reserve0,
        reserve1,
        totalSupply
      )

      // Geometric mean of 1*4 = 2
      expect(result).toBe(2000000000000000000n)
    })

    it('should calculate liquidity for existing pool (proportional)', () => {
      const amountOutA = 1000000000000000000n // 1 token
      const amountOutB = 1000000000000000000n // 1 token
      const reserve0 = 10000000000000000000n // 10 tokens
      const reserve1 = 10000000000000000000n // 10 tokens
      const totalSupply = 10000000000000000000n // 10 LP tokens

      const result = estimateLiquidityFromZapIn(
        amountOutA,
        amountOutB,
        reserve0,
        reserve1,
        totalSupply
      )

      // Adding 10% of reserves, should get 10% of supply = 1 LP token
      expect(result).toBe(1000000000000000000n)
    })

    it('should return smaller ratio when amounts are imbalanced', () => {
      const amountOutA = 2000000000000000000n // 2 tokens (20% of reserves)
      const amountOutB = 1000000000000000000n // 1 token (10% of reserves)
      const reserve0 = 10000000000000000000n
      const reserve1 = 10000000000000000000n
      const totalSupply = 10000000000000000000n

      const result = estimateLiquidityFromZapIn(
        amountOutA,
        amountOutB,
        reserve0,
        reserve1,
        totalSupply
      )

      // Should use smaller ratio (10% from tokenB)
      expect(result).toBe(1000000000000000000n)
    })

    it('should handle very small existing pool', () => {
      const amountOutA = 1000000000000000000n
      const amountOutB = 1000000000000000000n
      const reserve0 = 1000n // Tiny reserves
      const reserve1 = 1000n
      const totalSupply = 1000n

      const result = estimateLiquidityFromZapIn(
        amountOutA,
        amountOutB,
        reserve0,
        reserve1,
        totalSupply
      )

      // Should still calculate correctly
      expect(result).toBeGreaterThan(0n)
    })

    it('should handle very large pool', () => {
      const amountOutA = 1000000000000000000n
      const amountOutB = 1000000000000000000n
      const reserve0 = 1000000000000000000000000n // 1M tokens
      const reserve1 = 1000000000000000000000000n
      const totalSupply = 1000000000000000000000000n

      const result = estimateLiquidityFromZapIn(
        amountOutA,
        amountOutB,
        reserve0,
        reserve1,
        totalSupply
      )

      // Tiny addition to large pool
      expect(result).toBeGreaterThan(0n)
      expect(result).toBeLessThanOrEqual(amountOutA)
    })
  })

  describe('findZapInRoutes', () => {
    let mockRouteService: jest.Mocked<RouteService>
    const TOKEN_IN = '0x1111000000000000000000000000000000000000' as Address
    const TOKEN_0 = '0xaaaa000000000000000000000000000000000000' as Address
    const TOKEN_1 = '0xbbbb000000000000000000000000000000000000' as Address
    const POOL_ADDRESS = '0x1000000000000000000000000000000000000001' as Address
    const FACTORY = '0xfacf000000000000000000000000000000000000' as Address

    beforeEach(() => {
      mockRouteService = {
        findRoute: jest.fn(),
      } as unknown as jest.Mocked<RouteService>
    })

    it('should find routes when tokenIn differs from both pool tokens', async () => {
      mockRouteService.findRoute.mockResolvedValue({
        id: 'route-id',
        path: [
          {
            poolAddr: POOL_ADDRESS,
            token0: TOKEN_IN,
            token1: TOKEN_0,
            factoryAddr: FACTORY,
            poolType: PoolType.FPMM,
          },
        ],
        tokens: [
          { address: TOKEN_IN, symbol: 'TKN', decimals: 18 },
          { address: TOKEN_0, symbol: 'TK0', decimals: 18 },
        ],
      } as any)

      const result = await findZapInRoutes(mockRouteService, TOKEN_IN, TOKEN_0, TOKEN_1)

      expect(result.routesA).toBeDefined()
      expect(result.routesB).toBeDefined()
      expect(result.routesA.length).toBeGreaterThan(0)
      expect(result.routesB.length).toBeGreaterThan(0)
      expect(mockRouteService.findRoute).toHaveBeenCalledTimes(2)
    })

    it('should return empty route when tokenIn equals token0', async () => {
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

      const result = await findZapInRoutes(mockRouteService, TOKEN_0, TOKEN_0, TOKEN_1)

      expect(result.routesA).toEqual([])
      expect(result.routesB).toBeDefined()
      expect(mockRouteService.findRoute).toHaveBeenCalledTimes(1) // Only for tokenB
    })

    it('should return empty route when tokenIn equals token1', async () => {
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
          { address: TOKEN_1, symbol: 'TK1', decimals: 18 },
          { address: TOKEN_0, symbol: 'TK0', decimals: 18 },
        ],
      } as any)

      const result = await findZapInRoutes(mockRouteService, TOKEN_1, TOKEN_0, TOKEN_1)

      expect(result.routesA).toBeDefined()
      expect(result.routesB).toEqual([])
      expect(mockRouteService.findRoute).toHaveBeenCalledTimes(1) // Only for tokenA
    })

    it('should be case-insensitive for token comparison', async () => {
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

      const upperTokenIn = TOKEN_0.toUpperCase() as Address

      const result = await findZapInRoutes(mockRouteService, upperTokenIn, TOKEN_0, TOKEN_1)

      // Should recognize as same token (case-insensitive)
      expect(result.routesA).toEqual([])
      expect(mockRouteService.findRoute).toHaveBeenCalledTimes(1)
    })
  })

  describe('findZapOutRoutes', () => {
    let mockRouteService: jest.Mocked<RouteService>
    const TOKEN_OUT = '0x1111000000000000000000000000000000000000' as Address
    const TOKEN_0 = '0xaaaa000000000000000000000000000000000000' as Address
    const TOKEN_1 = '0xbbbb000000000000000000000000000000000000' as Address
    const POOL_ADDRESS = '0x1000000000000000000000000000000000000001' as Address
    const FACTORY = '0xfacf000000000000000000000000000000000000' as Address

    beforeEach(() => {
      mockRouteService = {
        findRoute: jest.fn(),
      } as unknown as jest.Mocked<RouteService>

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
    })

    it('should find routes when tokenOut differs from both pool tokens', async () => {
      const result = await findZapOutRoutes(mockRouteService, TOKEN_0, TOKEN_1, TOKEN_OUT)

      expect(result.routesA).toBeDefined()
      expect(result.routesB).toBeDefined()
      expect(mockRouteService.findRoute).toHaveBeenCalledTimes(2)
    })

    it('should return empty route when tokenOut equals token0', async () => {
      const result = await findZapOutRoutes(mockRouteService, TOKEN_0, TOKEN_1, TOKEN_0)

      expect(result.routesA).toEqual([])
      expect(result.routesB).toBeDefined()
      expect(mockRouteService.findRoute).toHaveBeenCalledTimes(1) // Only for token1
    })

    it('should return empty route when tokenOut equals token1', async () => {
      const result = await findZapOutRoutes(mockRouteService, TOKEN_0, TOKEN_1, TOKEN_1)

      expect(result.routesA).toBeDefined()
      expect(result.routesB).toEqual([])
      expect(mockRouteService.findRoute).toHaveBeenCalledTimes(1) // Only for token0
    })

    it('should be case-insensitive for token comparison', async () => {
      const upperTokenOut = TOKEN_1.toUpperCase() as Address

      const result = await findZapOutRoutes(mockRouteService, TOKEN_0, TOKEN_1, upperTokenOut)

      expect(result.routesB).toEqual([])
      expect(mockRouteService.findRoute).toHaveBeenCalledTimes(1)
    })
  })

  describe('encodeZapInCall', () => {
    const TOKEN_IN = '0x1111000000000000000000000000000000000000' as Address
    const TOKEN_A = '0xaaaa000000000000000000000000000000000000' as Address
    const TOKEN_B = '0xbbbb000000000000000000000000000000000000' as Address
    const FACTORY = '0xfacf000000000000000000000000000000000000' as Address
    const RECIPIENT = '0xecec000000000000000000000000000000000000' as Address

    it('should encode zapIn function call', () => {
      const zapParams = {
        tokenA: TOKEN_A,
        tokenB: TOKEN_B,
        factory: FACTORY,
        amountAMin: 100n,
        amountBMin: 200n,
        amountOutMinA: 300n,
        amountOutMinB: 400n,
      }

      const result = encodeZapInCall(
        TOKEN_IN,
        500n,
        500n,
        zapParams,
        [],
        [],
        RECIPIENT
      )

      expect(result).toBeTruthy()
      expect(result.startsWith('0x')).toBe(true)
      expect(result.length).toBeGreaterThan(10) // Has function selector + params
    })

    it('should handle zero amounts', () => {
      const zapParams = {
        tokenA: TOKEN_A,
        tokenB: TOKEN_B,
        factory: FACTORY,
        amountAMin: 0n,
        amountBMin: 0n,
        amountOutMinA: 0n,
        amountOutMinB: 0n,
      }

      const result = encodeZapInCall(TOKEN_IN, 0n, 0n, zapParams, [], [], RECIPIENT)

      expect(result).toBeTruthy()
      expect(result.startsWith('0x')).toBe(true)
    })
  })

  describe('encodeZapOutCall', () => {
    const TOKEN_OUT = '0x1111000000000000000000000000000000000000' as Address
    const TOKEN_A = '0xaaaa000000000000000000000000000000000000' as Address
    const TOKEN_B = '0xbbbb000000000000000000000000000000000000' as Address
    const FACTORY = '0xfacf000000000000000000000000000000000000' as Address

    it('should encode zapOut function call', () => {
      const zapParams = {
        tokenA: TOKEN_A,
        tokenB: TOKEN_B,
        factory: FACTORY,
        amountAMin: 100n,
        amountBMin: 200n,
        amountOutMinA: 300n,
        amountOutMinB: 400n,
      }

      const result = encodeZapOutCall(TOKEN_OUT, 1000n, zapParams, [], [])

      expect(result).toBeTruthy()
      expect(result.startsWith('0x')).toBe(true)
      expect(result.length).toBeGreaterThan(10)
    })

    it('should handle zero liquidity', () => {
      const zapParams = {
        tokenA: TOKEN_A,
        tokenB: TOKEN_B,
        factory: FACTORY,
        amountAMin: 0n,
        amountBMin: 0n,
        amountOutMinA: 0n,
        amountOutMinB: 0n,
      }

      const result = encodeZapOutCall(TOKEN_OUT, 0n, zapParams, [], [])

      expect(result).toBeTruthy()
      expect(result.startsWith('0x')).toBe(true)
    })
  })
})
