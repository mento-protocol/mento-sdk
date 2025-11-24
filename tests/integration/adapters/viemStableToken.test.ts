import { ViemAdapter } from '../../../src/adapters'
import { createPublicClient, http } from 'viem'
import { StableTokenService } from '../../../src/services'
import { createStableTokenTests } from '../shared'
import { TEST_CONFIG } from '../../config'

/**
 * Integration tests for StableTokenService using Viem adapter
 * Tests against Celo mainnet via RPC
 */
describe('StableTokenService with ViemAdapter - Integration Tests', () => {
  // Setup Viem adapter and service
  const viemClient = createPublicClient({
    transport: http(TEST_CONFIG.rpcUrl),
  })
  const adapter = new ViemAdapter(viemClient)
  const stableTokenService = new StableTokenService(adapter)

  // Run shared test suite
  createStableTokenTests(stableTokenService)

  // Viem-specific tests (if any)
  describe('Viem-specific behavior', () => {
    it('should use Viem public client for contract calls', async () => {
      const tokens = await stableTokenService.getStableTokens()

      // Verify we got results (proves Viem client is working)
      expect(tokens.length).toBeGreaterThan(0)
    })
  })
})
