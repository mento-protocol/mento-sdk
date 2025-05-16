export interface ContractCallOptions {
	address: string;
	abi: string[] | unknown[];
	functionName: string;
	args?: unknown[];
}

export interface ContractWriteOptions extends ContractCallOptions {
	value?: bigint | string;
	gasLimit?: bigint | number | string;
	gasPrice?: bigint | string;
	maxFeePerGas?: bigint | string;
	maxPriorityFeePerGas?: bigint | string;
}

export interface TransactionResponse {
	hash: string;
	wait: (confirmations?: number) => Promise<TransactionReceipt>;
}

export interface TransactionReceipt {
	transactionHash: string;
	blockNumber: number;
	status: number | boolean;
	[key: string]: any;
}

export interface ProviderAdapter {
	readContract(options: ContractCallOptions): Promise<unknown>;
	writeContract(options: ContractWriteOptions): Promise<TransactionResponse>;
	getChainId(): Promise<number>;
}
