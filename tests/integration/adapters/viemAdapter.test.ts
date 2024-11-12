// TODO: Update to use jest

// import { ViemAdapter } from "adapters";
// import { createPublicClient, http } from "jsr:@wevm/viem";
// import { CollateralAssetService, StableTokenService } from "services";
// import { createCollateralAssetTests, createStableTokenTests } from "shared";

// Deno.test("ViemAdapter Integration Tests", async (t) => {
// 	// Setup
// 	const viemClient = createPublicClient({ transport: http("https://forno.celo.org") });
// 	const adapter = new ViemAdapter(viemClient);
// 	const stableTokenService = new StableTokenService(adapter);
// 	const collateralAssetService = new CollateralAssetService(adapter);

// 	// Run shared tests
// 	await createStableTokenTests(stableTokenService)(t);
// 	await createCollateralAssetTests(collateralAssetService)(t);
// });
