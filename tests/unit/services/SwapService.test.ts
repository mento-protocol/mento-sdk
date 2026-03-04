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
      readContract: jest.fn(),
    } as unknown as jest.Mocked<PublicClient>

    mockRouteService = {
      findRoute: jest.fn().mockResolvedValue(mockRoute),
    } as unknown as jest.Mocked<RouteService>

    mockQuoteService = {
      getAmountOut: jest.fn().mockResolvedValue(99000000000000000000n),
    } as unknown as jest.Mocked<QuoteService>

    service = new SwapService(
      mockPublicClient,
      ChainId.CELO,
      mockRouteService,
      mockQuoteService
    )
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
