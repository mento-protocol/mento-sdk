import { ExchangeService } from '../../../src/services'
import { EnrichedExchange, IERC20Token } from '../../../src/types'

export function createExchangeTests(service: ExchangeService) {
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
  })
}
