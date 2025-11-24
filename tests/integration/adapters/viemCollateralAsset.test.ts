import { ViemAdapter } from '../../../src/adapters'
import { createPublicClient, http } from 'viem'
import { CollateralAssetService } from '../../../src/services'
import { createCollateralAssetTests } from '../shared'
import { TEST_CONFIG } from '../../config'

/**
 * Integration tests for CollateralAssetService using Viem adapter
 * Tests against Celo mainnet via RPC
 */
describe('CollateralAssetService with ViemAdapter - Integration Tests', () => {
  // Setup Viem adapter and service
  const viemClient = createPublicClient({
    transport: http(TEST_CONFIG.rpcUrl),
  })
  const adapter = new ViemAdapter(viemClient)
  const collateralAssetService = new CollateralAssetService(adapter)

  // Run shared test suite
  createCollateralAssetTests(collateralAssetService)

  // Viem-specific tests (if any)
  describe('Viem-specific behavior', () => {
    it('should use Viem public client for contract calls', async () => {
      const assets = await collateralAssetService.getCollateralAssets()

      // Verify we got results (proves Viem client is working)
      expect(assets.length).toBeGreaterThan(0)
    })
  })
})
