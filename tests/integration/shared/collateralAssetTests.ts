// TODO: Update to use jest

// import { isAddress } from "ethers";
// import { expect } from "jsr:@std/expect";
// import { CollateralAssetService } from "services";
// import { CollateralAsset } from "types";

// export function createCollateralAssetTests(service: CollateralAssetService) {
// 	return async (t: Deno.TestContext) => {
// 		await t.step("should retrieve collateral assets", async () => {
// 			const assets: CollateralAsset[] = await service.getCollateralAssets();

// 			expect(assets.length).toBeGreaterThan(0);

// 			const expectedAssets = [
// 				"CELO",
// 				"USDC",
// 				"axlUSDC",
// 				"axlEUROC",
// 				"USD₮",
// 			];
// 			const assetSymbols = assets.map((asset) => asset.symbol);
// 			expectedAssets.forEach((symbol) => {
// 				expect(assetSymbols).toContain(symbol);
// 			});
// 		});

// 		await t.step("should verify asset structure", async () => {
// 			const assets: CollateralAsset[] = await service.getCollateralAssets();

// 			assets.forEach((asset) => {
// 				expect(asset).toMatchObject({
// 					symbol: expect.any(String),
// 					address: expect.any(String),
// 					decimals: expect.any(Number),
// 				});
// 				expect(isAddress(asset.address)).toBe(true);
// 			});
// 		});
// 	};
// }
