import { ExchangeService } from '../../../src/services'
import { EnrichedExchange } from '../../../src/types'

export function createExchangeTests(service: ExchangeService) {
  describe('Exchange Tests', () => {
    it('should retrieve exchanges', async () => {
      const exchanges: EnrichedExchange[] = await service.getExchanges()
      expect(exchanges.length).toBeGreaterThan(0)
    })
  })
}
