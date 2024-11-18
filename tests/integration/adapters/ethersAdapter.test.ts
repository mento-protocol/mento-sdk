import { EthersAdapter } from '../../../src/adapters'
import { JsonRpcProvider } from 'ethers'
import { CollateralAssetService, StableTokenService } from '../../../src/services'
import { createCollateralAssetTests, createStableTokenTests } from '../shared'

describe('EthersAdapter Integration Tests', () => {
  // Setup shared test instances
  const ethersProvider = new JsonRpcProvider('https://forno.celo.org')
  const adapter = new EthersAdapter(ethersProvider)
  const stableTokenService = new StableTokenService(adapter)
  const collateralAssetService = new CollateralAssetService(adapter)

  // Run shared test suites
  createStableTokenTests(stableTokenService)
  createCollateralAssetTests(collateralAssetService)
})
