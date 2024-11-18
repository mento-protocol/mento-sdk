import { ViemAdapter } from '../../../src/adapters'
import { createPublicClient, http } from 'viem'
import {
  CollateralAssetService,
  StableTokenService,
} from '../../../src/services'
import { createCollateralAssetTests, createStableTokenTests } from '../shared'

describe('ViemAdapter Integration Tests', () => {
  // Setup shared test instances
  const viemClient = createPublicClient({
    transport: http('https://forno.celo.org'),
  })
  const adapter = new ViemAdapter(viemClient)
  const stableTokenService = new StableTokenService(adapter)
  const collateralAssetService = new CollateralAssetService(adapter)

  // Run shared test suites
  createStableTokenTests(stableTokenService)
  createCollateralAssetTests(collateralAssetService)
})
