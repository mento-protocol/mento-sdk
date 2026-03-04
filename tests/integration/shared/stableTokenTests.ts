import { StableTokenService } from '../../../src/services'
import { StableToken } from '../../../src/types'
import { isAddress } from 'ethers'

export function createStableTokenTests(service: StableTokenService) {
  describe('StableToken Tests', () => {
    it('should retrieve stable tokens', async () => {
      const tokens: StableToken[] = await service.getStableTokens()

      expect(tokens.length).toBeGreaterThan(0)

      const expectedTokens = [
        'USDm',
        'EURm',
        'BRLm',
        'XOFm',
        'PHPm',
        'COPm',
        'KESm',
      ]
      const tokenSymbols = tokens.map((token) => token.symbol)
      expectedTokens.forEach((symbol) => {
        expect(tokenSymbols).toContain(symbol)
      })
    })

    it('should verify token structure', async () => {
      const tokens: StableToken[] = await service.getStableTokens()

      tokens.forEach((token) => {
        expect(token).toMatchObject({
          symbol: expect.any(String),
          address: expect.any(String),
          decimals: expect.any(Number),
        })
        expect(isAddress(token.address)).toBe(true)
      })
    })
  })
}
