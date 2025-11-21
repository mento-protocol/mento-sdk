import { ViemAdapter } from '../../../src/adapters'
import { createPublicClient, http } from 'viem'
import { ExchangeService } from '../../../src/services/ExchangeService'
import { createExchangeDiscoveryTests } from '../shared/exchangeDiscovery.test'
import { TEST_CONFIG } from '../../config'

/**
 * Integration tests for Exchange Discovery using Viem adapter
 * Tests against Celo mainnet via RPC
 */
describe('ExchangeService with ViemAdapter - Integration Tests', () => {
  // Setup Viem adapter and service
  const viemClient = createPublicClient({
    transport: http(TEST_CONFIG.rpcUrl),
  })
  const adapter = new ViemAdapter(viemClient)
  const exchangeService = new ExchangeService(adapter)

  // Run shared test suite
  createExchangeDiscoveryTests(exchangeService)

  // Viem-specific tests (if any)
  describe('Viem-specific behavior', () => {
    it('should use Viem public client for contract calls', async () => {
      const exchanges = await exchangeService.getExchanges()

      // Verify we got results (proves Viem client is working)
      expect(exchanges.length).toBeGreaterThan(0)
    })
  })
})
