import { SwapService } from '../../../src/services/swap/SwapService'
import type { PublicClient } from 'viem'
import type { RouteService } from '../../../src/services/routes'
import type { QuoteService } from '../../../src/services/quotes'
import { ChainId } from '../../../src/core/constants'
import { deadlineFromMinutes } from '../../../src/utils/deadline'

describe('SwapService', () => {
  let service: SwapService
  let mockPublicClient: jest.Mocked<PublicClient>
  let mockRouteService: jest.Mocked<RouteService>
  let mockQuoteService: jest.Mocked<QuoteService>

  const tokenIn = '0x765DE816845861e75A25fCA122bb6898B8B1282a'
  const tokenOut = '0x471EcE3750Da237f93B8E339c536989b8978a438'
  const recipient = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
  const owner = '0x1111111111111111111111111111111111111111'
  const amountIn = 100000000000000000000n
  const expectedAmountOut = 99000000000000000000n

  const mockRoute = {
    id: 'CELO-USDm' as const,
    tokens: [
      { address: tokenOut, symbol: 'CELO' },
      { address: tokenIn, symbol: 'USDm' },
    ] as [{ address: string; symbol: string }, { address: string; symbol: string }],
    path: [
      {
        token0: tokenIn,
        token1: tokenOut,
        poolAddr: '0xf100000000000000000000000000000000000001',
        factoryAddr: '0xa100000000000000000000000000000000000001',
        poolType: 'FPMM' as const,
      },
    ],
  }

  beforeEach(() => {
    mockPublicClient = {
      readContract: jest.fn().mockImplementation(async ({ functionName }: any) => {
        if (functionName === 'getAmountsOut') {
          return [amountIn, expectedAmountOut]
        }

        if (functionName === 'allowance') {
          return 0n
        }

        return 0n
      }),
    } as unknown as jest.Mocked<PublicClient>

    mockRouteService = {
      findRoute: jest.fn().mockResolvedValue(mockRoute),
    } as unknown as jest.Mocked<RouteService>

    mockQuoteService = {
      getAmountOut: jest.fn(),
    } as unknown as jest.Mocked<QuoteService>

    service = new SwapService(
      mockPublicClient,
      ChainId.CELO,
      mockRouteService,
      mockQuoteService
    )
  })

  describe('prepareSwap()', () => {
    it('prepares quote, approval, and params in one call', async () => {
      const deadline = deadlineFromMinutes(5)

      const prepared = await service.prepareSwap({
        tokenIn,
        tokenOut,
        amountIn,
        recipient,
        owner,
        slippageTolerance: 0.5,
        deadline,
      })

      expect(prepared.route).toEqual(mockRoute)
      expect(prepared.expectedAmountOut).toBe(expectedAmountOut)
      expect(prepared.amountOutMin).toBe((expectedAmountOut * 9950n) / 10000n)
      expect(prepared.approval).toEqual(
        expect.objectContaining({
          to: tokenIn,
          value: '0',
        })
      )
      expect(prepared.params).toEqual(
        expect.objectContaining({
          to: expect.any(String),
          value: '0',
        })
      )
      expect(mockRouteService.findRoute).toHaveBeenCalledTimes(1)
      expect(mockPublicClient.readContract).toHaveBeenCalledWith(
        expect.objectContaining({
          functionName: 'getAmountsOut',
        })
      )
    })

    it('uses the provided route without resolving it again', async () => {
      await service.prepareSwap({
        tokenIn,
        tokenOut,
        amountIn,
        slippageTolerance: 0.5,
        route: mockRoute,
      })

      expect(mockRouteService.findRoute).not.toHaveBeenCalled()
    })

    it('omits approval and params when owner and recipient inputs are omitted', async () => {
      const prepared = await service.prepareSwap({
        tokenIn,
        tokenOut,
        amountIn,
        slippageTolerance: 0.5,
      })

      expect(prepared.approval).toBeUndefined()
      expect(prepared.params).toBeUndefined()
    })
  })

  describe('legacy wrappers', () => {
    it('buildSwapParams returns the same quote data as prepareSwap', async () => {
      const deadline = deadlineFromMinutes(5)
      const prepared = await service.prepareSwap({
        tokenIn,
        tokenOut,
        amountIn,
        recipient,
        slippageTolerance: 0.5,
        deadline,
      })

      const details = await service.buildSwapParams(
        tokenIn,
        tokenOut,
        amountIn,
        recipient,
        { slippageTolerance: 0.5, deadline }
      )

      expect(details.route).toEqual(prepared.route)
      expect(details.expectedAmountOut).toBe(prepared.expectedAmountOut)
      expect(details.amountOutMin).toBe(prepared.amountOutMin)
      expect(details.params).toEqual(prepared.params)
    })

    it('buildSwapTransaction maps prepareSwap approval output to the legacy shape', async () => {
      const deadline = deadlineFromMinutes(5)
      const transaction = await service.buildSwapTransaction(
        tokenIn,
        tokenOut,
        amountIn,
        recipient,
        owner,
        { slippageTolerance: 0.5, deadline }
      )

      expect(transaction.approval).not.toBeNull()
      expect(transaction.swap.expectedAmountOut).toBe(expectedAmountOut)
      expect(transaction.swap.amountOutMin).toBe((expectedAmountOut * 9950n) / 10000n)
    })
  })

  describe('deadline validation', () => {
    it('should reject a deadline in the past', async () => {
      const pastDeadline = BigInt(Math.floor(Date.now() / 1000) - 60)

      await expect(
        service.buildSwapParams(tokenIn, tokenOut, amountIn, recipient, {
          slippageTolerance: 0.5,
          deadline: pastDeadline,
        })
      ).rejects.toThrow('Deadline must be in the future')
    })

    it('should reject a deadline equal to current time', async () => {
      const nowDeadline = BigInt(Math.floor(Date.now() / 1000))

      await expect(
        service.buildSwapParams(tokenIn, tokenOut, amountIn, recipient, {
          slippageTolerance: 0.5,
          deadline: nowDeadline,
        })
      ).rejects.toThrow('Deadline must be in the future')
    })

    it('should accept a deadline in the future', async () => {
      const futureDeadline = deadlineFromMinutes(5)

      const result = await service.buildSwapParams(
        tokenIn,
        tokenOut,
        amountIn,
        recipient,
        { slippageTolerance: 0.5, deadline: futureDeadline },
        mockRoute
      )

      expect(result.deadline).toBe(futureDeadline)
      expect(result.params.data).toBeDefined()
    })
  })

  describe('amountIn validation', () => {
    it('should reject zero amountIn in buildSwapParams', async () => {
      await expect(
        service.buildSwapParams(tokenIn, tokenOut, 0n, recipient, {
          slippageTolerance: 0.5,
          deadline: deadlineFromMinutes(5),
        })
      ).rejects.toThrow('amountIn must be greater than zero')
    })

    it('should reject negative amountIn in buildSwapParams', async () => {
      await expect(
        service.buildSwapParams(tokenIn, tokenOut, -1n, recipient, {
          slippageTolerance: 0.5,
          deadline: deadlineFromMinutes(5),
        })
      ).rejects.toThrow('amountIn must be greater than zero')
    })

    it('should reject zero amountIn in buildSwapTransaction', async () => {
      await expect(
        service.buildSwapTransaction(
          tokenIn,
          tokenOut,
          0n,
          recipient,
          owner,
          { slippageTolerance: 0.5, deadline: deadlineFromMinutes(5) },
          mockRoute
        )
      ).rejects.toThrow('amountIn must be greater than zero')
    })
  })
})
