export interface ContractCallOptions {
	address: string;
	abi: string[] | unknown[];
	functionName: string;
	args?: unknown[];
}

export interface ProviderAdapter {
	readContract(options: ContractCallOptions): Promise<unknown>;
	getChainId(): Promise<number>;
}
