import { EthersV5Adapter } from '../../../src/adapters/implementations/ethersV5Adapter';
import { ValidationError } from '../../../src/types/errors';

/**
 * Unit tests for EthersV5Adapter write operations
 *
 * Tests write methods in isolation using mocked Ethers v5 provider/signer.
 * These tests will FAIL until the write methods are implemented.
 */
describe('EthersV5Adapter - Write Operations', () => {
	// Mock provider and signer
	let mockProvider: any;
	let mockSigner: any;
	let adapter: EthersV5Adapter;

	beforeEach(() => {
		// Mock Ethers v5 provider
		mockProvider = {
			getNetwork: jest.fn().mockResolvedValue({ chainId: 42220n }),
			call: jest.fn(),
		};

		// Mock Ethers v5 signer
		mockSigner = {
			getAddress: jest.fn().mockResolvedValue('0x1234567890123456789012345678901234567890'),
			getTransactionCount: jest.fn().mockResolvedValue(5),
			sendTransaction: jest.fn().mockResolvedValue({
				hash: '0xabcdef1234567890123456789012345678901234567890123456789012345678',
				wait: jest.fn().mockResolvedValue({
					transactionHash:
						'0xabcdef1234567890123456789012345678901234567890123456789012345678',
					blockNumber: 1000n,
					blockHash:
						'0x9876543210987654321098765432109876543210987654321098765432109876',
					status: 1,
					gasUsed: 50000n,
					effectiveGasPrice: 5000000000n,
					cumulativeGasUsed: 100000n,
					transactionIndex: 0,
					from: '0x1234567890123456789012345678901234567890',
					to: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
					logs: [],
				}),
			}),
			estimateGas: jest.fn().mockResolvedValue(45000n),
			provider: mockProvider,
		};

		adapter = new EthersV5Adapter(mockProvider, mockSigner);
	});

	describe('writeContract()', () => {
		it('should be defined', () => {
			expect(adapter.writeContract).toBeDefined();
			expect(typeof adapter.writeContract).toBe('function');
		});

		it('should validate contract address', async () => {
			await expect(
				adapter.writeContract({
					address: 'invalid-address',
					abi: ['function approve(address spender, uint256 amount)'],
					functionName: 'approve',
					args: ['0x0000000000000000000000000000000000000001', 1000000n],
				}),
			).rejects.toThrow(ValidationError);
		});

		it('should throw ValidationError if no signer', async () => {
			const adapterWithoutSigner = new EthersV5Adapter(mockProvider);

			await expect(
				adapterWithoutSigner.writeContract({
					address: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
					abi: ['function approve(address spender, uint256 amount)'],
					functionName: 'approve',
					args: ['0x0000000000000000000000000000000000000001', 1000000n],
				}),
			).rejects.toThrow(ValidationError);
		});

		it('should validate gas parameters', async () => {
			await expect(
				adapter.writeContract({
					address: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
					abi: ['function approve(address spender, uint256 amount)'],
					functionName: 'approve',
					args: ['0x0000000000000000000000000000000000000001', 1000000n],
					gasLimit: -1n,
				}),
			).rejects.toThrow(ValidationError);
		});

		it('should reject conflicting gas parameters', async () => {
			await expect(
				adapter.writeContract({
					address: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
					abi: ['function approve(address spender, uint256 amount)'],
					functionName: 'approve',
					args: ['0x0000000000000000000000000000000000000001', 1000000n],
					gasPrice: 1000000000n,
					maxFeePerGas: 2000000000n,
				}),
			).rejects.toThrow(ValidationError);
		});
	});

	describe('estimateGas()', () => {
		it('should be defined', () => {
			expect(adapter.estimateGas).toBeDefined();
			expect(typeof adapter.estimateGas).toBe('function');
		});

		it('should validate contract address', async () => {
			await expect(
				adapter.estimateGas({
					address: 'invalid-address',
					abi: ['function approve(address spender, uint256 amount)'],
					functionName: 'approve',
					args: ['0x0000000000000000000000000000000000000001', 1000000n],
				}),
			).rejects.toThrow();
		});
	});

	describe('getSignerAddress()', () => {
		it('should be defined', () => {
			expect(adapter.getSignerAddress).toBeDefined();
			expect(typeof adapter.getSignerAddress).toBe('function');
		});

		it('should throw ValidationError if no signer', async () => {
			const adapterWithoutSigner = new EthersV5Adapter(mockProvider);

			await expect(adapterWithoutSigner.getSignerAddress()).rejects.toThrow(
				ValidationError,
			);
		});
	});

	describe('getTransactionCount()', () => {
		it('should be defined', () => {
			expect(adapter.getTransactionCount).toBeDefined();
			expect(typeof adapter.getTransactionCount).toBe('function');
		});

		it('should throw ValidationError if no signer', async () => {
			const adapterWithoutSigner = new EthersV5Adapter(mockProvider);

			await expect(
				adapterWithoutSigner.getTransactionCount(),
			).rejects.toThrow(ValidationError);
		});
	});

	describe('Backward compatibility', () => {
		it('should support read-only operations without signer', async () => {
			const readOnlyAdapter = new EthersV5Adapter(mockProvider);

			// Mock readContract to work
			mockProvider.call = jest.fn().mockResolvedValue('0x01');

			// Should still work
			expect(readOnlyAdapter.readContract).toBeDefined();
			expect(readOnlyAdapter.getChainId).toBeDefined();
		});
	});
});
