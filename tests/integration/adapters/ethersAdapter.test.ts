import { EthersAdapter } from '../../../src/adapters'
import { JsonRpcProvider } from 'ethers'
import {
  CollateralAssetService,
  ExchangeService,
  StableTokenService,
} from '../../../src/services'
import {
  createCollateralAssetTests,
  createStableTokenTests,
  createExchangeTests,
} from '../shared'
import { TEST_CONFIG } from '../../config'

describe('EthersAdapter Integration Tests', async () => {
  // Setup shared test instances
  const ethersProvider = new JsonRpcProvider(TEST_CONFIG.rpcUrl)
  const adapter = new EthersAdapter(ethersProvider)
  const chainId = await adapter.getChainId()

  const stableTokenService = new StableTokenService(adapter)
  const collateralAssetService = new CollateralAssetService(adapter)
  const exchangeService = new ExchangeService(adapter)

  // Run shared test suites
  createStableTokenTests(stableTokenService)
  createCollateralAssetTests(collateralAssetService)
  createExchangeTests(exchangeService, chainId)
})
