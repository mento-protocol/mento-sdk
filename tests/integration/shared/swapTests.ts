import { SwapService } from '../../../src/services'

/**
 * Shared test suite for swap operations, used by all adapter tests.
 * This allows testing the same functionality across all supported provider adapters.
 */
export function createSwapTests(swapService: SwapService) {
  describe('Swap Operations', () => {
    // We need to use specific addresses from the network we're testing against
    // For testing, we'll use cUSD and CELO addresses from the Celo network
    const cUSD_ADDRESS = '0x765DE816845861e75A25fCA122bb6898B8B1282a' // StableToken on Celo
    const CELO_ADDRESS = '0x471EcE3750Da237f93B8E339c536989b8978a438' // CELO address
    
    describe('Rate calculation', () => {
      it('should get amount out', async () => {
        const amountIn = '1000000000000000000' // 1 CELO
        
        const amountOut = await swapService.getAmountOut(
          CELO_ADDRESS,
          cUSD_ADDRESS,
          amountIn
        )
        
        // We expect a valid number as a string representing token amount
        expect(amountOut).toBeTruthy()
        expect(typeof amountOut).toBe('string')
        expect(Number(amountOut)).toBeGreaterThan(0)
      })
      
      it('should get amount in', async () => {
        const amountOut = '1000000000000000000' // 1 cUSD
        
        const amountIn = await swapService.getAmountIn(
          CELO_ADDRESS,
          cUSD_ADDRESS,
          amountOut
        )
        
        // We expect a valid number as a string representing token amount
        expect(amountIn).toBeTruthy()
        expect(typeof amountIn).toBe('string')
        expect(Number(amountIn)).toBeGreaterThan(0)
      })
    })
    
    // Note: We're skipping actual swap tests as they require gas and funds
    // In a real implementation, these would be executed against a testnet
    // with test accounts that have funds
    describe('Swap operations', () => {
      it.skip('should execute swapIn transaction', async () => {
        // This test would require a funded account
        // For testing purposes, we're skipping it
      })
      
      it.skip('should execute swapOut transaction', async () => {
        // This test would require a funded account
        // For testing purposes, we're skipping it
      })
    })
    
    describe('Gas estimation', () => {
      it('should provide a gas estimate for swapIn', async () => {
        const gas = await swapService.estimateGas(
          'swapIn',
          [CELO_ADDRESS, cUSD_ADDRESS, '1000000000000000000', '900000000000000000']
        )
        
        expect(gas).toBeTruthy()
        expect(typeof gas).toBe('string')
        expect(Number(gas)).toBeGreaterThan(0)
      })
      
      it('should provide a gas estimate for swapOut', async () => {
        const gas = await swapService.estimateGas(
          'swapOut',
          [CELO_ADDRESS, cUSD_ADDRESS, '1000000000000000000', '1100000000000000000']
        )
        
        expect(gas).toBeTruthy()
        expect(typeof gas).toBe('string')
        expect(Number(gas)).toBeGreaterThan(0)
      })
    })
  })
}