import { EthersAdapter } from '../../../src/adapters'
import { JsonRpcProvider } from 'ethers'
import { ExchangeService } from '../../../src/services/ExchangeService'
import { createExchangeDiscoveryTests } from '../shared/exchangeDiscovery'
import { TEST_CONFIG } from '../../config'

/**
 * Integration tests for Exchange Discovery using Ethers v6 adapter
 * Tests against Celo mainnet via RPC
 */
describe('ExchangeService with EthersAdapter - Integration Tests', () => {
  // Setup Ethers adapter and service
  const ethersProvider = new JsonRpcProvider(TEST_CONFIG.rpcUrl)
  const adapter = new EthersAdapter(ethersProvider)
  const exchangeService = new ExchangeService(adapter)

  // Run shared test suite
  createExchangeDiscoveryTests(exchangeService)

  // Ethers-specific tests (if any)
  describe('Ethers-specific behavior', () => {
    it('should use Ethers v6 provider for contract calls', async () => {
      const exchanges = await exchangeService.getExchanges()

      // Verify we got results (proves Ethers provider is working)
      expect(exchanges.length).toBeGreaterThan(0)
    })
  })
})
