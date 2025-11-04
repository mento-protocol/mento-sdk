import { ViemAdapter } from '../../../src/adapters/implementations/viemAdapter';
import { ValidationError } from '../../../src/types/errors';

/**
 * Unit tests for ViemAdapter write operations
 *
 * Tests write methods in isolation using mocked Viem clients.
 * These tests will FAIL until the write methods are implemented.
 */
describe('ViemAdapter - Write Operations', () => {
	// Mock clients
	let mockPublicClient: any;
	let mockWalletClient: any;
	let adapter: ViemAdapter;

	beforeEach(() => {
		// Mock Viem public client
		mockPublicClient = {
			chain: { id: 42220 },
			readContract: jest.fn(),
			estimateGas: jest.fn().mockResolvedValue(45000n),
			getTransactionReceipt: jest.fn(),
		};

		// Mock Viem wallet client
		mockWalletClient = {
			account: {
				address: '0x1234567890123456789012345678901234567890',
			},
			chain: { id: 42220 },
			writeContract: jest.fn().mockResolvedValue(
				'0xabcdef1234567890123456789012345678901234567890123456789012345678',
			),
			getTransactionCount: jest.fn().mockResolvedValue(5),
		};

		adapter = new ViemAdapter(mockPublicClient, mockWalletClient);
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

		it('should throw ValidationError if no wallet client', async () => {
			const adapterWithoutWallet = new ViemAdapter(mockPublicClient);

			await expect(
				adapterWithoutWallet.writeContract({
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

		it('should throw ValidationError if no wallet client', async () => {
			const adapterWithoutWallet = new ViemAdapter(mockPublicClient);

			await expect(adapterWithoutWallet.getSignerAddress()).rejects.toThrow(
				ValidationError,
			);
		});
	});

	describe('getTransactionCount()', () => {
		it('should be defined', () => {
			expect(adapter.getTransactionCount).toBeDefined();
			expect(typeof adapter.getTransactionCount).toBe('function');
		});

		it('should throw ValidationError if no wallet client', async () => {
			const adapterWithoutWallet = new ViemAdapter(mockPublicClient);

			await expect(
				adapterWithoutWallet.getTransactionCount(),
			).rejects.toThrow(ValidationError);
		});
	});

	describe('Backward compatibility', () => {
		it('should support read-only operations without wallet client', async () => {
			const readOnlyAdapter = new ViemAdapter(mockPublicClient);

			// Should still work
			expect(readOnlyAdapter.readContract).toBeDefined();
			expect(readOnlyAdapter.getChainId).toBeDefined();
		});
	});
});
