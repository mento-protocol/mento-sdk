// TODO: Update to use jest	
// import { StableTokenService } from "services";
// import { StableToken } from "types";
// import { expect } from "jsr:@std/expect";
// import { isAddress } from "ethers";

// export function createStableTokenTests(service: StableTokenService) {
// 	return async (t: Deno.TestContext) => {
// 		await t.step("should retrieve stable tokens", async () => {
// 			const tokens: StableToken[] = await service.getStableTokens();

// 			expect(tokens.length).toBeGreaterThan(0);

// 			const expectedTokens = ["cUSD", "cEUR", "cREAL", "eXOF", "PUSO", "cCOP", "cKES"];
// 			const tokenSymbols = tokens.map((token) => token.symbol);
// 			expectedTokens.forEach((symbol) => {
// 				expect(tokenSymbols).toContain(symbol);
// 			});
// 		});

// 		await t.step("should verify token structure", async () => {
// 			const tokens: StableToken[] = await service.getStableTokens();

// 			tokens.forEach((token) => {
// 				expect(token).toMatchObject({
// 					symbol: expect.any(String),
// 					address: expect.any(String),
// 					decimals: expect.any(Number),
// 				});
// 				expect(isAddress(token.address)).toBe(true);
// 			});
// 		});
// 	};
// }
