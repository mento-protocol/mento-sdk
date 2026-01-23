import { QuoteService } from '../../../src/services/quotes/QuoteService'
import { RouteService } from '../../../src/services/routes'
import { FXMarketClosedError } from '../../../src/core/errors'
import { PoolType } from '../../../src/core/types'
import type { PublicClient } from 'viem'
import { ChainId } from '../../../src/core/constants'

describe('QuoteService', () => {
  let mockPublicClient: jest.Mocked<PublicClient>
  let mockRouteService: jest.Mocked<RouteService>
  let service: QuoteService

  const tokenIn = '0x1111111111111111111111111111111111111111'
  const tokenOut = '0x2222222222222222222222222222222222222222'
  const poolAddr = '0x3333333333333333333333333333333333333333'
  const factoryAddr = '0x4444444444444444444444444444444444444444'

  const mockRoute = {
    id: 'A-B' as const,
    tokens: [
      { address: tokenIn, symbol: 'A' },
      { address: tokenOut, symbol: 'B' },
    ] as [{ address: string; symbol: string }, { address: string; symbol: string }],
    path: [
      {
        factoryAddr,
        poolAddr,
        token0: tokenIn,
        token1: tokenOut,
        poolType: PoolType.FPMM as `${PoolType}`,
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

    service = new QuoteService(mockPublicClient, ChainId.CELO, mockRouteService)
  })

  describe('FXMarketClosed handling', () => {
    it('should throw FXMarketClosedError when router reverts with 0xa407143a', async () => {
      mockPublicClient.readContract.mockRejectedValue(
        new Error('execution reverted: error 0xa407143a')
      )

      await expect(
        service.getAmountOut(tokenIn, tokenOut, 1000000000000000000n, mockRoute)
      ).rejects.toThrow(FXMarketClosedError)
    })

    it('should throw FXMarketClosedError with descriptive message', async () => {
      mockPublicClient.readContract.mockRejectedValue(
        new Error('ContractFunctionExecutionError: 0xa407143a')
      )

      await expect(
        service.getAmountOut(tokenIn, tokenOut, 1000000000000000000n, mockRoute)
      ).rejects.toThrow('FX market is currently closed')
    })

    it('should re-throw other errors unchanged', async () => {
      const rpcError = new Error('RPC timeout')
      mockPublicClient.readContract.mockRejectedValue(rpcError)

      await expect(
        service.getAmountOut(tokenIn, tokenOut, 1000000000000000000n, mockRoute)
      ).rejects.toThrow('RPC timeout')
    })

    it('should return amount on successful call', async () => {
      mockPublicClient.readContract.mockResolvedValue([
        1000000000000000000n,
        950000000000000000n,
      ])

      const result = await service.getAmountOut(tokenIn, tokenOut, 1000000000000000000n, mockRoute)

      expect(result).toBe(950000000000000000n)
    })
  })
})
