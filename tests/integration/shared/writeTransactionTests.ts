import type { ProviderAdapter } from '../../../src/types/provider';
import type { TransactionResponse } from '../../../src/types/transaction';
import { ValidationError, ExecutionError, NetworkError } from '../../../src/types/errors';

/**
 * Shared test suite for write transaction operations
 *
 * Tests the write transaction infrastructure across all provider adapters.
 * Ensures consistent behavior for Ethers v6 and Viem.
 *
 * @param adapter - Provider adapter instance (with signer)
 * @param testConfig - Test configuration with contract addresses and test accounts
 */
export function createWriteTransactionTests(
	adapter: ProviderAdapter,
	testConfig: {
		erc20TokenAddress: string;
		signerAddress: string;
		spenderAddress: string;
	},
) {
	describe('Write Transaction Tests', () => {
		describe('writeContract()', () => {
			it('should execute ERC20 approval transaction', async () => {
				const approvalAmount = 1000000n; // 1 USDC (6 decimals)

				const tx: TransactionResponse = await adapter.writeContract({
					address: testConfig.erc20TokenAddress,
					abi: ['function approve(address spender, uint256 amount) returns (bool)'],
					functionName: 'approve',
					args: [testConfig.spenderAddress, approvalAmount],
				});

				// Verify transaction response structure
				expect(tx).toMatchObject({
					hash: expect.any(String),
					chainId: expect.any(BigInt),
					from: expect.any(String),
					to: expect.any(String),
					nonce: expect.any(BigInt),
					gasLimit: expect.any(BigInt),
					data: expect.any(String),
					value: expect.any(BigInt),
				});

				// Verify hash format
				expect(tx.hash).toMatch(/^0x[a-fA-F0-9]{64}$/);

				// Verify from address matches signer
				expect(tx.from.toLowerCase()).toBe(
					testConfig.signerAddress.toLowerCase(),
				);

				// Verify to address matches token contract
				expect(tx.to.toLowerCase()).toBe(
					testConfig.erc20TokenAddress.toLowerCase(),
				);

				// Verify transaction has wait method
				expect(typeof tx.wait).toBe('function');

				// Verify transaction has getReceipt method
				expect(typeof tx.getReceipt).toBe('function');
			}, 30000);

			it('should wait for transaction confirmation', async () => {
				const approvalAmount = 2000000n; // 2 USDC

				const tx = await adapter.writeContract({
					address: testConfig.erc20TokenAddress,
					abi: ['function approve(address spender, uint256 amount) returns (bool)'],
					functionName: 'approve',
					args: [testConfig.spenderAddress, approvalAmount],
				});

				// Wait for 1 confirmation
				const receipt = await tx.wait();

				// Verify receipt structure
				expect(receipt).toMatchObject({
					hash: expect.any(String),
					blockNumber: expect.any(BigInt),
					blockHash: expect.any(String),
					status: 'success',
					gasUsed: expect.any(BigInt),
					effectiveGasPrice: expect.any(BigInt),
					cumulativeGasUsed: expect.any(BigInt),
					transactionIndex: expect.any(Number),
					from: expect.any(String),
					to: expect.any(String),
					logs: expect.any(Array),
				});

				// Verify receipt hash matches transaction hash
				expect(receipt.hash).toBe(tx.hash);

				// Verify receipt shows success
				expect(receipt.status).toBe('success');

				// Verify gas was used
				expect(receipt.gasUsed).toBeGreaterThan(0n);

				// Verify logs contain Approval event
				expect(receipt.logs.length).toBeGreaterThan(0);
			}, 60000);

			it('should throw ValidationError for invalid address', async () => {
				await expect(
					adapter.writeContract({
						address: 'invalid-address',
						abi: ['function approve(address spender, uint256 amount)'],
						functionName: 'approve',
						args: [testConfig.spenderAddress, 1000000n],
					}),
				).rejects.toThrow(ValidationError);
			});

			it('should throw ValidationError for invalid gas parameters', async () => {
				await expect(
					adapter.writeContract({
						address: testConfig.erc20TokenAddress,
						abi: ['function approve(address spender, uint256 amount)'],
						functionName: 'approve',
						args: [testConfig.spenderAddress, 1000000n],
						gasLimit: -1n, // Invalid negative gas limit
					}),
				).rejects.toThrow(ValidationError);
			});

			it('should throw ValidationError for conflicting gas parameters', async () => {
				await expect(
					adapter.writeContract({
						address: testConfig.erc20TokenAddress,
						abi: ['function approve(address spender, uint256 amount)'],
						functionName: 'approve',
						args: [testConfig.spenderAddress, 1000000n],
						gasPrice: 1000000000n,
						maxFeePerGas: 2000000000n, // Cannot specify both
					}),
				).rejects.toThrow(ValidationError);
			});

			it('should accept custom gas parameters', async () => {
				const tx = await adapter.writeContract({
					address: testConfig.erc20TokenAddress,
					abi: ['function approve(address spender, uint256 amount)'],
					functionName: 'approve',
					args: [testConfig.spenderAddress, 3000000n],
					gasLimit: 100000n,
				});

				expect(tx.gasLimit).toBe(100000n);
			}, 30000);
		});

		describe('estimateGas()', () => {
			it('should estimate gas for ERC20 approval', async () => {
				const estimatedGas = await adapter.estimateGas({
					address: testConfig.erc20TokenAddress,
					abi: ['function approve(address spender, uint256 amount)'],
					functionName: 'approve',
					args: [testConfig.spenderAddress, 1000000n],
				});

				// Verify estimate is a positive BigInt
				expect(typeof estimatedGas).toBe('bigint');
				expect(estimatedGas).toBeGreaterThan(0n);

				expect(estimatedGas).toBeGreaterThan(25000n);
				expect(estimatedGas).toBeLessThan(100000n);
			});

			it('should throw ValidationError for invalid contract address', async () => {
				await expect(
					adapter.estimateGas({
						address: 'invalid-address',
						abi: ['function approve(address spender, uint256 amount)'],
						functionName: 'approve',
						args: [testConfig.spenderAddress, 1000000n],
					}),
				).rejects.toThrow();
			});

			it('should throw error for transaction that would revert', async () => {
				// Try to call a non-existent function
				await expect(
					adapter.estimateGas({
						address: testConfig.erc20TokenAddress,
						abi: ['function nonExistentFunction()'],
						functionName: 'nonExistentFunction',
						args: [],
					}),
				).rejects.toThrow();
			});
		});

		describe('getSignerAddress()', () => {
			it('should return signer address', async () => {
				const address = await adapter.getSignerAddress();

				// Verify address format
				expect(address).toMatch(/^0x[a-fA-F0-9]{40}$/);

				// Verify it matches expected signer
				expect(address.toLowerCase()).toBe(
					testConfig.signerAddress.toLowerCase(),
				);
			});
		});

		describe('getTransactionCount()', () => {
			it('should return signer transaction count (nonce)', async () => {
				const nonce = await adapter.getTransactionCount();

				// Verify nonce is a non-negative BigInt
				expect(typeof nonce).toBe('bigint');
				expect(nonce).toBeGreaterThanOrEqual(0n);
			});

			it('should increment after transaction', async () => {
				const nonceBefore = await adapter.getTransactionCount();

				// Execute a transaction
				const tx = await adapter.writeContract({
					address: testConfig.erc20TokenAddress,
					abi: ['function approve(address spender, uint256 amount)'],
					functionName: 'approve',
					args: [testConfig.spenderAddress, 4000000n],
				});

				await tx.wait();

				const nonceAfter = await adapter.getTransactionCount();

				// Nonce should have incremented by at least 1
				expect(nonceAfter).toBeGreaterThanOrEqual(nonceBefore + 1n);
			}, 60000);
		});

		describe('Transaction tracking', () => {
			it('should support getReceipt() before confirmation', async () => {
				const tx = await adapter.writeContract({
					address: testConfig.erc20TokenAddress,
					abi: ['function approve(address spender, uint256 amount)'],
					functionName: 'approve',
					args: [testConfig.spenderAddress, 5000000n],
				});

				// Immediately check receipt (should be null or pending)
				const receiptBefore = await tx.getReceipt();

				// Receipt should either be null (not mined) or have a status
				if (receiptBefore !== null) {
					expect(receiptBefore).toHaveProperty('status');
				}

				// Wait for confirmation
				const receiptAfter = await tx.wait();

				// After wait, receipt should exist and be successful
				expect(receiptAfter).not.toBeNull();
				expect(receiptAfter.status).toBe('success');
			}, 60000);

			it('should support multiple wait() calls on same transaction', async () => {
				const tx = await adapter.writeContract({
					address: testConfig.erc20TokenAddress,
					abi: ['function approve(address spender, uint256 amount)'],
					functionName: 'approve',
					args: [testConfig.spenderAddress, 6000000n],
				});

				// Wait multiple times
				const receipt1 = await tx.wait();
				const receipt2 = await tx.wait();

				// Both receipts should be identical
				expect(receipt1.hash).toBe(receipt2.hash);
				expect(receipt1.blockNumber).toBe(receipt2.blockNumber);
				expect(receipt1.status).toBe(receipt2.status);
			}, 60000);
		});

		describe('Error handling', () => {
			it('should verify allowance increased after approval', async () => {
				// Get allowance before
				const allowanceBefore = (await adapter.readContract({
					address: testConfig.erc20TokenAddress,
					abi: ['function allowance(address owner, address spender) view returns (uint256)'],
					functionName: 'allowance',
					args: [testConfig.signerAddress, testConfig.spenderAddress],
				})) as bigint;

				// Execute approval
				const approvalAmount = 7000000n;
				const tx = await adapter.writeContract({
					address: testConfig.erc20TokenAddress,
					abi: ['function approve(address spender, uint256 amount)'],
					functionName: 'approve',
					args: [testConfig.spenderAddress, approvalAmount],
				});

				await tx.wait();

				// Get allowance after
				const allowanceAfter = (await adapter.readContract({
					address: testConfig.erc20TokenAddress,
					abi: ['function allowance(address owner, address spender) view returns (uint256)'],
					functionName: 'allowance',
					args: [testConfig.signerAddress, testConfig.spenderAddress],
				})) as bigint;

				// Verify allowance was set correctly
				expect(allowanceAfter).toBe(approvalAmount);
			}, 60000);
		});
	});
}
