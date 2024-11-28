import { ViemAdapter } from '../../../src/adapters'
import { createPublicClient, http } from 'viem'
import {
  CollateralAssetService,
  StableTokenService,
} from '../../../src/services'
import { createCollateralAssetTests, createStableTokenTests } from '../shared'
import { TEST_CONFIG } from '../../config'

describe('ViemAdapter Integration Tests', () => {
  // Setup shared test instances
  const viemClient = createPublicClient({
    transport: http(TEST_CONFIG.rpcUrl),
  })
  const adapter = new ViemAdapter(viemClient)
  const stableTokenService = new StableTokenService(adapter)
  const collateralAssetService = new CollateralAssetService(adapter)

  // Run shared test suites
  createStableTokenTests(stableTokenService)
  createCollateralAssetTests(collateralAssetService)
})
