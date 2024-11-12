export interface BaseToken {
	name: string;
	symbol: string;
	address: string;
	decimals: number;
}

export interface StableToken extends BaseToken {
	totalSupply: bigint;
}

export type CollateralAsset = BaseToken
