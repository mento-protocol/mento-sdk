import BigNumber from 'bignumber.js'
import { ExchangeService } from '../../../src/services'
import { EnrichedExchange, IERC20Token } from '../../../src/types'
import {
  getContractAddress,
  STABLETOKEN,
  STABLETOKENEUR,
} from '../../../src/constants'

export function createExchangeTests(service: ExchangeService, chainId: number) {
  const cEURAddress = getContractAddress(chainId, STABLETOKENEUR)
  const cUSDAddress = getContractAddress(chainId, STABLETOKEN)

  describe.only('Exchange Tests', () => {
    it('should retrieve exchanges', async () => {
      const exchanges: EnrichedExchange[] = await service.getExchanges()
      expect(exchanges.length).toBeGreaterThan(0)
    })

    it('should retrieve tradeable pairs', async () => {
      const pairs: [IERC20Token, IERC20Token][] =
        await service.getTradeablePairs()
      expect(pairs.length).toBeGreaterThan(0)
    })

    it('should get amount out', async () => {
      const tokenIn = cEURAddress
      const tokenOut = cUSDAddress
      const amountIn = BigNumber(1)
        .times(10 ** 18)
        .toString()

      const amountOut = await service.getAmountOut(tokenIn, tokenOut, amountIn)
      const amountOutBN = BigNumber(amountOut)

      expect(amountOutBN.gt(0)).toBe(true)
    })
  })
}
