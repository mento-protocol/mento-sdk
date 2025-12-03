import { StableToken } from './../../../dist/types/token.d'
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
import { DefaultCalculatorFactory } from '../../../src/services/supply'
import { createPublicClient, http } from 'viem'
import { celo } from 'viem/chains'

describe('SupplyAdjustmentService Integration Tests', () => {
  // Setup public client
  const publicClient = createPublicClient({
    chain: celo,
    transport: http(TEST_CONFIG.rpcUrl),
  })
  const supplyAdjustmentService = new SupplyAdjustmentService(
    publicClient,
    ChainId.CELO,
    new DefaultCalculatorFactory()
  )
  const tokenMetadataService = new TokenMetadataService(publicClient)
  describe('adjustSupply()', () => {
    it(`should return the adjusted cUSD supply`, async function () {
      const stableTokenAddress = addresses[ChainId.CELO].StableToken
      if (!stableTokenAddress) {
        throw new Error('StableToken address not found for CELO')
      }

      const cusdOnChainSupply = await tokenMetadataService.getTotalSupply(
        stableTokenAddress
      )

      const cusd: StableToken = {
        address: stableTokenAddress,
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
