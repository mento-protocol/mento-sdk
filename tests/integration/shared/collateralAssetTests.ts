import { isAddress } from 'ethers'
import { CollateralAssetService } from '../../../src/services'
import { CollateralAsset } from '../../../src/types'

export function createCollateralAssetTests(service: CollateralAssetService) {
  describe('CollateralAsset Tests', () => {
    it('should retrieve collateral assets', async () => {
      const assets: CollateralAsset[] = await service.getCollateralAssets()

      expect(assets.length).toBeGreaterThan(0)

      const expectedAssets = ['CELO', 'USDC', 'axlUSDC', 'axlEUROC', 'USD₮']
      const assetSymbols = assets.map((asset) => asset.symbol)
      expectedAssets.forEach((symbol) => {
        expect(assetSymbols).toContain(symbol)
      })
    })

    it('should verify asset structure', async () => {
      const assets: CollateralAsset[] = await service.getCollateralAssets()

      assets.forEach((asset) => {
        expect(asset).toMatchObject({
          symbol: expect.any(String),
          address: expect.any(String),
          decimals: expect.any(Number),
        })
        expect(isAddress(asset.address)).toBe(true)
      })
    })
  })
}
