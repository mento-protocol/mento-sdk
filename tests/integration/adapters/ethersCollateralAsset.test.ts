import { EthersAdapter } from '../../../src/adapters'
import { JsonRpcProvider } from 'ethers'
import { CollateralAssetService } from '../../../src/services'
import { createCollateralAssetTests } from '../shared'
import { TEST_CONFIG } from '../../config'

/**
 * Integration tests for CollateralAssetService using Ethers v6 adapter
 * Tests against Celo mainnet via RPC
 */
describe('CollateralAssetService with EthersAdapter - Integration Tests', () => {
  // Setup Ethers adapter and service
  const ethersProvider = new JsonRpcProvider(TEST_CONFIG.rpcUrl)
  const adapter = new EthersAdapter(ethersProvider)
  const collateralAssetService = new CollateralAssetService(adapter)

  // Run shared test suite
  createCollateralAssetTests(collateralAssetService)

  // Ethers-specific tests (if any)
  describe('Ethers-specific behavior', () => {
    it('should use Ethers v6 provider for contract calls', async () => {
      const assets = await collateralAssetService.getCollateralAssets()

      // Verify we got results (proves Ethers provider is working)
      expect(assets.length).toBeGreaterThan(0)
    })
  })
})
