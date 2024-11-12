// TODO: Update to use jest
// import { EthersAdapter } from '../../src/adapters/'
// import { JsonRpcProvider } from 'ethers'
// import { CollateralAssetService, StableTokenService } from 'services'
// import { createCollateralAssetTests, createStableTokenTests } from 'shared'

// Deno.test('EthersAdapter Integration Tests', async (t) => {
//   // Setup
//   const ethersProvider = new JsonRpcProvider('https://forno.celo.org')
//   const adapter = new EthersAdapter(ethersProvider)
//   const stableTokenService = new StableTokenService(adapter)
//   const collateralAssetService = new CollateralAssetService(adapter)

//   // Run shared tests
//   await createStableTokenTests(stableTokenService)(t)
//   await createCollateralAssetTests(collateralAssetService)(t)
// })
