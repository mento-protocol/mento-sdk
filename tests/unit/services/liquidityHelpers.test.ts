import { Address, PublicClient, decodeFunctionData } from 'viem'
import { PoolService } from '../../../src/services/pools/PoolService'
import { PoolType } from '../../../src/core/types'
import { ERC20_ABI } from '../../../src/core/abis'
import {
  calculateMinAmount,
  validatePoolTokens,
  buildApprovalParams,
  getAllowance,
  getPoolInfo,
} from '../../../src/services/liquidity/liquidityHelpers'
import { ChainId } from '../../../src/core/constants'

/**
 * Unit tests for liquidity helper functions
 *
 * Tests focus on:
 * - Edge cases and boundary conditions
 * - Error handling for invalid inputs
 * - Calculation accuracy
 * - Validation logic
 */
describe('Liquidity Helpers', () => {
  describe('calculateMinAmount', () => {
    it('should calculate correct minimum for standard slippage', () => {
      const amount = 1000000000000000000n // 1 token
      const slippage = 0.5 // 0.5%

      const result = calculateMinAmount(amount, slippage)

      // Expected: 1 * (1 - 0.005) = 0.995 = 1 * 9950 / 10000
      const expected = (amount * 9950n) / 10000n
      expect(result).toBe(expected)
    })

    it('should handle zero slippage', () => {
      const amount = 1000000000000000000n
      const slippage = 0

      const result = calculateMinAmount(amount, slippage)

      // No slippage means min = amount
      expect(result).toBe(amount)
    })

    it('should handle maximum safe slippage (99.99%)', () => {
      const amount = 1000000000000000000n
      const slippage = 99.99

      const result = calculateMinAmount(amount, slippage)

      // 99.99% slippage leaves 0.01% = 1 basis point
      const expected = (amount * 1n) / 10000n
      expect(result).toBe(expected)
    })

    it('should handle very small amounts', () => {
      const amount = 1n // 1 wei
      const slippage = 0.5

      const result = calculateMinAmount(amount, slippage)

      // With rounding, should be 0 or 1
      expect(result).toBeGreaterThanOrEqual(0n)
      expect(result).toBeLessThanOrEqual(amount)
    })

    it('should handle very large amounts', () => {
      const amount = 1000000000000000000000000n // 1 million tokens
      const slippage = 0.5

      const result = calculateMinAmount(amount, slippage)

      const expected = (amount * 9950n) / 10000n
      expect(result).toBe(expected)
      expect(result).toBeLessThan(amount)
    })

    it('should throw error for negative slippage', () => {
      const amount = 1000000000000000000n
      const slippage = -0.5

      expect(() => calculateMinAmount(amount, slippage)).toThrow(/cannot be negative/)
    })

    it('should throw error for slippage over 100%', () => {
      const amount = 1000000000000000000n
      const slippage = 100.1

      expect(() => calculateMinAmount(amount, slippage)).toThrow(/cannot exceed 100%/)
    })

    it('should round down correctly', () => {
      const amount = 99n // Amount that will have rounding
      const slippage = 0.5

      const result = calculateMinAmount(amount, slippage)

      // (99 * 9950) / 10000 = 985050 / 10000 = 98 (rounded down)
      expect(result).toBe(98n)
    })

    it('should handle fractional basis points correctly', () => {
      const amount = 1000000n
      const slippage = 0.33 // 0.33% = 33 basis points

      const result = calculateMinAmount(amount, slippage)

      // (1000000 * 9967) / 10000 = 996700
      expect(result).toBe(996700n)
    })
  })

  describe('validatePoolTokens', () => {
    const TOKEN_0 = '0xaaaa000000000000000000000000000000000000' as Address
    const TOKEN_1 = '0xbbbb000000000000000000000000000000000000' as Address
    const WRONG_TOKEN = '0x9999000000000000000000000000000000000000'

    it('should accept tokens in pool order', () => {
      expect(() => {
        validatePoolTokens(TOKEN_0, TOKEN_1, TOKEN_0, TOKEN_1)
      }).not.toThrow()
    })

    it('should accept tokens in reversed order', () => {
      expect(() => {
        validatePoolTokens(TOKEN_0, TOKEN_1, TOKEN_1, TOKEN_0)
      }).not.toThrow()
    })

    it('should be case-insensitive', () => {
      const upperToken0 = TOKEN_0.toUpperCase()
      const lowerToken1 = TOKEN_1.toLowerCase()

      expect(() => {
        validatePoolTokens(TOKEN_0, TOKEN_1, upperToken0, lowerToken1)
      }).not.toThrow()
    })

    it('should reject when tokenA not in pool', () => {
      expect(() => {
        validatePoolTokens(TOKEN_0, TOKEN_1, WRONG_TOKEN, TOKEN_1)
      }).toThrow(/don't match pool/)
    })

    it('should reject when tokenB not in pool', () => {
      expect(() => {
        validatePoolTokens(TOKEN_0, TOKEN_1, TOKEN_0, WRONG_TOKEN)
      }).toThrow(/don't match pool/)
    })

    it('should reject when both tokens not in pool', () => {
      const anotherWrong = '0x8888000000000000000000000000000000000000'

      expect(() => {
        validatePoolTokens(TOKEN_0, TOKEN_1, WRONG_TOKEN, anotherWrong)
      }).toThrow(/don't match pool/)
    })

    it('should reject same token twice', () => {
      expect(() => {
        validatePoolTokens(TOKEN_0, TOKEN_1, TOKEN_0, TOKEN_0)
      }).toThrow(/must be different/)
    })

    it('should reject same token twice (case-insensitive)', () => {
      const upperToken0 = TOKEN_0.toUpperCase()

      expect(() => {
        validatePoolTokens(TOKEN_0, TOKEN_1, TOKEN_0, upperToken0)
      }).toThrow(/must be different/)
    })

    it('should provide clear error message for mismatched tokens', () => {
      try {
        validatePoolTokens(TOKEN_0, TOKEN_1, WRONG_TOKEN, TOKEN_1)
        fail('Should have thrown')
      } catch (error: any) {
        expect(error.message).toContain(TOKEN_0)
        expect(error.message).toContain(TOKEN_1)
        expect(error.message).toContain(WRONG_TOKEN)
      }
    })
  })

  describe('buildApprovalParams', () => {
    const TOKEN = '0xaaaa000000000000000000000000000000000000' as Address
    const SPENDER = '0x2222222222222222222222222222222222222222' as Address
    const AMOUNT = 1000000000000000000n

    it('should build valid approval params', () => {
      const params = buildApprovalParams(ChainId.CELO, TOKEN, AMOUNT)

      expect(params).toHaveProperty('to', TOKEN)
      expect(params).toHaveProperty('data')
      expect(params).toHaveProperty('value', '0')
      expect(params.data).toBeTruthy()
      expect(params.data.startsWith('0x')).toBe(true)
    })

    it('should encode approve function with router address', () => {
      const params = buildApprovalParams(ChainId.CELO, TOKEN, AMOUNT)

      // First 4 bytes should be approve function selector: approve(address,uint256)
      // Function selector for approve is 0x095ea7b3
      expect(params.data.substring(0, 10)).toBe('0x095ea7b3')
    })

    it('should handle zero amount approval', () => {
      const params = buildApprovalParams(ChainId.CELO, TOKEN, 0n)

      expect(params).toHaveProperty('data')
      expect(params.data.startsWith('0x')).toBe(true)
    })

    it('should handle max uint256 approval', () => {
      const maxUint256 = 2n ** 256n - 1n
      const params = buildApprovalParams(ChainId.CELO, TOKEN, maxUint256)

      expect(params).toHaveProperty('data')
      expect(params.data.startsWith('0x')).toBe(true)
    })

    it('should encode a custom approval spender when provided', () => {
      const params = buildApprovalParams(ChainId.CELO, TOKEN, AMOUNT, SPENDER)
      const decoded = decodeFunctionData({
        abi: ERC20_ABI,
        data: params.data as `0x${string}`,
      })

      expect(decoded.functionName).toBe('approve')
      expect(decoded.args).toEqual([SPENDER, AMOUNT])
    })
  })

  describe('getAllowance', () => {
    let mockPublicClient: jest.Mocked<PublicClient>
    const TOKEN = '0xaaaa000000000000000000000000000000000000' as Address
    const OWNER = '0x1111111111111111111111111111111111111111' as Address
    const SPENDER = '0x2222222222222222222222222222222222222222' as Address

    beforeEach(() => {
      mockPublicClient = {
        readContract: jest.fn(),
      } as unknown as jest.Mocked<PublicClient>
    })

    it('should return allowance from contract', async () => {
      const expectedAllowance = 1000000000000000000n
      mockPublicClient.readContract.mockResolvedValue(expectedAllowance)

      const result = await getAllowance(mockPublicClient, TOKEN, OWNER, ChainId.CELO)

      expect(result).toBe(expectedAllowance)
      expect(mockPublicClient.readContract).toHaveBeenCalledWith(
        expect.objectContaining({
          address: TOKEN,
          functionName: 'allowance',
        })
      )
    })

    it('should handle zero allowance', async () => {
      mockPublicClient.readContract.mockResolvedValue(0n)

      const result = await getAllowance(mockPublicClient, TOKEN, OWNER, ChainId.CELO)

      expect(result).toBe(0n)
    })

    it('should handle max allowance', async () => {
      const maxUint256 = 2n ** 256n - 1n
      mockPublicClient.readContract.mockResolvedValue(maxUint256)

      const result = await getAllowance(mockPublicClient, TOKEN, OWNER, ChainId.CELO)

      expect(result).toBe(maxUint256)
    })

    it('should propagate contract errors', async () => {
      mockPublicClient.readContract.mockRejectedValue(new Error('Contract call failed'))

      await expect(
        getAllowance(mockPublicClient, TOKEN, OWNER, ChainId.CELO)
      ).rejects.toThrow('Contract call failed')
    })

    it('should query allowance with a custom spender when provided', async () => {
      mockPublicClient.readContract.mockResolvedValue(123n)

      await getAllowance(mockPublicClient, TOKEN, OWNER, ChainId.CELO, SPENDER)

      expect(mockPublicClient.readContract).toHaveBeenCalledWith(
        expect.objectContaining({
          address: TOKEN,
          functionName: 'allowance',
          args: [OWNER, SPENDER],
        })
      )
    })
  })

  describe('getPoolInfo', () => {
    let mockPoolService: jest.Mocked<PoolService>
    const POOL_ADDRESS = '0x1000000000000000000000000000000000000001'
    const TOKEN_0 = '0xaaaa000000000000000000000000000000000000' as Address
    const TOKEN_1 = '0xbbbb000000000000000000000000000000000000' as Address
    const FACTORY = '0xfacf000000000000000000000000000000000000' as Address

    beforeEach(() => {
      mockPoolService = {
        getPools: jest.fn(),
      } as unknown as jest.Mocked<PoolService>
    })

    it('should return pool info for valid FPMM pool', async () => {
      mockPoolService.getPools.mockResolvedValue([
        {
          poolAddr: POOL_ADDRESS,
          token0: TOKEN_0,
          token1: TOKEN_1,
          factoryAddr: FACTORY,
          poolType: PoolType.FPMM,
        },
      ])

      const result = await getPoolInfo(mockPoolService, POOL_ADDRESS)

      expect(result).toEqual({
        token0: TOKEN_0,
        token1: TOKEN_1,
        factoryAddr: FACTORY,
      })
    })

    it('should throw error for non-existent pool', async () => {
      mockPoolService.getPools.mockResolvedValue([])

      await expect(
        getPoolInfo(mockPoolService, POOL_ADDRESS)
      ).rejects.toThrow(/Pool not found/)
    })

    it('should throw error for non-FPMM pool', async () => {
      mockPoolService.getPools.mockResolvedValue([
        {
          poolAddr: POOL_ADDRESS,
          token0: TOKEN_0,
          token1: TOKEN_1,
          factoryAddr: FACTORY,
          poolType: PoolType.Virtual,
        },
      ])

      await expect(
        getPoolInfo(mockPoolService, POOL_ADDRESS)
      ).rejects.toThrow(/Only FPMM pools/)
    })

    it('should handle case-insensitive pool address matching', async () => {
      const mixedCasePool = '0x1000000000000000000000000000000000000001' // Mixed case but valid

      mockPoolService.getPools.mockResolvedValue([
        {
          poolAddr: POOL_ADDRESS.toLowerCase(),
          token0: TOKEN_0,
          token1: TOKEN_1,
          factoryAddr: FACTORY,
          poolType: PoolType.FPMM,
        },
      ])

      const result = await getPoolInfo(mockPoolService, mixedCasePool)

      expect(result.token0).toBe(TOKEN_0)
    })

    it('should provide helpful error message with pool address', async () => {
      mockPoolService.getPools.mockResolvedValue([])

      try {
        await getPoolInfo(mockPoolService, POOL_ADDRESS)
        fail('Should have thrown')
      } catch (error: any) {
        expect(error.message).toContain(POOL_ADDRESS)
        expect(error.message).toContain('FPMM')
      }
    })
  })
})
