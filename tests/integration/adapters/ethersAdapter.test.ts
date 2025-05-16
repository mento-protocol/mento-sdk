import { EthersAdapter } from '../../../src/adapters'
import { JsonRpcProvider } from 'ethers'
import { CollateralAssetService, StableTokenService, SwapService } from '../../../src/services'
import { createCollateralAssetTests, createStableTokenTests, createSwapTests } from '../shared'
import { TEST_CONFIG } from '../../config'

describe('EthersAdapter Integration Tests', () => {
  // Setup shared test instances
  const ethersProvider = new JsonRpcProvider(TEST_CONFIG.rpcUrl)
  const adapter = new EthersAdapter(ethersProvider)
  const stableTokenService = new StableTokenService(adapter)
  const collateralAssetService = new CollateralAssetService(adapter)
  const swapService = new SwapService(adapter)

  // Run shared test suites
  createStableTokenTests(stableTokenService)
  createCollateralAssetTests(collateralAssetService)
  // createSwapTests(swapService)
})
