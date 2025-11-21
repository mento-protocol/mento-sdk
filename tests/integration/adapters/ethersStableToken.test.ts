import { EthersAdapter } from '../../../src/adapters'
import { JsonRpcProvider } from 'ethers'
import { StableTokenService } from '../../../src/services'
import { createStableTokenTests } from '../shared'
import { TEST_CONFIG } from '../../config'

/**
 * Integration tests for StableTokenService using Ethers v6 adapter
 * Tests against Celo mainnet via RPC
 */
describe('StableTokenService with EthersAdapter - Integration Tests', () => {
  // Setup Ethers adapter and service
  const ethersProvider = new JsonRpcProvider(TEST_CONFIG.rpcUrl)
  const adapter = new EthersAdapter(ethersProvider)
  const stableTokenService = new StableTokenService(adapter)

  // Run shared test suite
  createStableTokenTests(stableTokenService)

  // Ethers-specific tests (if any)
  describe('Ethers-specific behavior', () => {
    it('should use Ethers v6 provider for contract calls', async () => {
      const tokens = await stableTokenService.getStableTokens()

      // Verify we got results (proves Ethers provider is working)
      expect(tokens.length).toBeGreaterThan(0)
    })
  })
})
