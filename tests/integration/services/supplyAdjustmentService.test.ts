import { EthersAdapter } from '../../../src/adapters'
import { JsonRpcProvider } from 'ethers'
import {
  SupplyAdjustmentService,
  StableTokenService,
} from '../../../src/services'
import { STABLE_TOKEN_SYMBOLS } from '../../../src/constants'

describe.only('SupplyAdjustmentService Integration Tests', () => {
  // Setup provider and adapter
  const ethersProvider = new JsonRpcProvider('https://forno.celo.org')
  const adapter = new EthersAdapter(ethersProvider)
  const supplyAdjustmentService = new SupplyAdjustmentService(adapter)
  const stableTokenService = new StableTokenService(adapter)

  describe('adjustSupply()', () => {
    it(`should return the correct cUSD supply`, async function () {
      const stableTokens = await stableTokenService.getStableTokens()
      const cusd = stableTokens.find(
        (token) => token.symbol === STABLE_TOKEN_SYMBOLS.cUSD
      )

      if (!cusd) throw new Error('cUSD token not found...')

      const adjustedSupply = await supplyAdjustmentService.getAdjustedSupply(
        cusd
      )

      // Testing the value is not practical here as the actual amounts locked
      // in the uniswap pools are dynamic. So we just assert the value is less
      // than the value returned by the token contract and is greater than 0
      expect(BigInt(adjustedSupply)).toBeLessThan(BigInt(cusd.totalSupply))
      expect(BigInt(adjustedSupply)).toBeGreaterThan(BigInt(0))
    })
  })
})
