import { StableToken } from './../../../dist/types/token.d'
import { EthersAdapter } from '../../../src/adapters'
import { JsonRpcProvider } from 'ethers'
import {
  SupplyAdjustmentService,
  TokenMetadataService,
} from '../../../src/services'
import {
  addresses,
  ChainId,
  STABLE_TOKEN_SYMBOLS,
} from '../../../src/constants'
import { TEST_CONFIG } from '../../config'

describe('SupplyAdjustmentService Integration Tests', () => {
  // Setup provider and adapter
  const ethersProvider = new JsonRpcProvider(TEST_CONFIG.rpcUrl)
  const adapter = new EthersAdapter(ethersProvider)
  const supplyAdjustmentService = new SupplyAdjustmentService(adapter)
  const tokenMetadataService = new TokenMetadataService(adapter)
  describe('adjustSupply()', () => {
    it(`should return the adjusted cUSD supply`, async function () {
      const cusdOnChainSupply = await tokenMetadataService.getTotalSupply(
        addresses[ChainId.CELO].StableToken
      )

      const cusd: StableToken = {
        address: addresses[ChainId.CELO].StableToken,
        symbol: STABLE_TOKEN_SYMBOLS.cUSD,
        totalSupply: cusdOnChainSupply,
        name: 'Celo Dollar',
        decimals: 18,
      }
      
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
