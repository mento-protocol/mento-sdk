import { StableToken } from '../../../src/core/types'
import { SupplyAdjustmentService } from '../../../src/services'
import { addresses, ChainId } from '../../../src/core/constants'
import { TEST_CONFIG } from '../../config'
import { DefaultCalculatorFactory } from '../../../src/services/tokens/supply'
import { createPublicClient, http } from 'viem'
import { celo } from 'viem/chains'
import { ERC20_ABI } from '../../../src/core/abis'

describe('SupplyAdjustmentService Integration Tests', () => {
  // Setup public client
  const publicClient = createPublicClient({
    chain: celo,
    transport: http(TEST_CONFIG.rpcUrl),
  })
  const supplyAdjustmentService = new SupplyAdjustmentService(
    publicClient as any,
    ChainId.CELO,
    new DefaultCalculatorFactory()
  )
  describe('adjustSupply()', () => {
    it(`should return the adjusted USDm supply`, async function () {
      const stableTokenAddress = addresses[ChainId.CELO].StableToken
      if (!stableTokenAddress) {
        throw new Error('StableToken address not found for CELO')
      }

      const totalSupply = (await publicClient.readContract({
        address: stableTokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'totalSupply',
        args: [],
      })) as bigint

      const usdm: StableToken = {
        address: stableTokenAddress,
        symbol: 'USDm',
        totalSupply: totalSupply.toString(),
        name: 'Mento Dollar',
        decimals: 18,
      }

      const adjustedSupply = await supplyAdjustmentService.getAdjustedSupply(
        usdm
      )

      // Testing the value is not practical here as the actual amounts locked
      // in the uniswap pools are dynamic. So we just assert the value is less
      // than the value returned by the token contract and is greater than 0
      expect(BigInt(adjustedSupply)).toBeLessThan(BigInt(usdm.totalSupply))
      expect(BigInt(adjustedSupply)).toBeGreaterThan(BigInt(0))
    })
  })
})
