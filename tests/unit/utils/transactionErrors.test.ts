import {
	normalizeError,
	extractRevertReason,
	isMissingSignerError,
	isChainMismatchError,
} from '../../../src/adapters/utils/transactionErrors';
import {
	ValidationError,
	ExecutionError,
	NetworkError,
} from '../../../src/types/errors';

describe('Transaction Error Normalization', () => {
	describe('normalizeError()', () => {
		describe('ValidationError detection', () => {
			it('should detect INVALID_ARGUMENT error code', () => {
				const error = {
					message: 'invalid argument: address must be a valid Ethereum address',
					code: 'INVALID_ARGUMENT',
				};

				const normalized = normalizeError(error, 'writeContract');

				expect(normalized).toBeInstanceOf(ValidationError);
				expect(normalized.message).toContain('writeContract');
				expect(normalized.message).toContain('invalid argument');
			});

			it('should detect insufficient funds error', () => {
				const error = {
					message: 'insufficient funds for gas * price + value',
					code: 'INSUFFICIENT_FUNDS',
				};

				const normalized = normalizeError(error);

				expect(normalized).toBeInstanceOf(ValidationError);
				expect(normalized.message).toContain('insufficient funds');
				expect(normalized.message).toContain('native tokens for gas fees');
			});

			it('should detect nonce too low error', () => {
				const error = {
					message: 'nonce too low',
				};

				const normalized = normalizeError(error, 'writeContract');

				expect(normalized).toBeInstanceOf(ValidationError);
				expect(normalized.message).toContain('nonce');
				expect(normalized.message).toContain('automatic management');
			});

			it('should detect replacement transaction underpriced', () => {
				const error = {
					message: 'replacement transaction underpriced',
					code: 'REPLACEMENT_UNDERPRICED',
				};

				const normalized = normalizeError(error);

				expect(normalized).toBeInstanceOf(ValidationError);
				expect(normalized.message).toContain('Increase gas price');
			});

			it('should detect invalid address error', () => {
				const error = {
					message: 'invalid address format',
				};

				const normalized = normalizeError(error);

				expect(normalized).toBeInstanceOf(ValidationError);
				expect(normalized.message).toContain('checksummed Ethereum address');
			});
		});

		describe('ExecutionError detection', () => {
			it('should detect CALL_EXCEPTION error code', () => {
				const error = {
					message: 'execution reverted: ERC20: insufficient allowance',
					code: 'CALL_EXCEPTION',
					transactionHash:
						'0x1234567890123456789012345678901234567890123456789012345678901234',
					reason: 'ERC20: insufficient allowance',
				};

				const normalized = normalizeError(error, 'writeContract');

				expect(normalized).toBeInstanceOf(ExecutionError);
				expect(normalized.message).toContain('writeContract failed');
				expect(normalized.message).toContain('Gas fees were consumed');
				expect((normalized as ExecutionError).hash).toBe(error.transactionHash);
				expect((normalized as ExecutionError).revertReason).toContain(
					'allowance',
				);
			});

			it('should detect transaction failed in message', () => {
				const error = {
					message: 'transaction failed with revert',
					hash: '0xabcdef1234567890123456789012345678901234567890123456789012345678',
				};

				const normalized = normalizeError(error);

				expect(normalized).toBeInstanceOf(ExecutionError);
				expect((normalized as ExecutionError).hash).toBe(error.hash);
			});

			it('should detect reverted transaction from receipt', () => {
				const error = {
					message: 'transaction reverted',
					receipt: {
						status: 0,
					},
					transactionHash:
						'0x9876543210987654321098765432109876543210987654321098765432109876',
				};

				const normalized = normalizeError(error);

				expect(normalized).toBeInstanceOf(ExecutionError);
				expect((normalized as ExecutionError).hash).toBe(
					error.transactionHash,
				);
			});

			it('should provide default hash if missing', () => {
				const error = {
					message: 'transaction reverted',
					code: 'CALL_EXCEPTION',
				};

				const normalized = normalizeError(error);

				expect(normalized).toBeInstanceOf(ExecutionError);
				expect((normalized as ExecutionError).hash).toBe(
					'0x0000000000000000000000000000000000000000000000000000000000000000',
				);
			});

			it('should extract revert reason from message', () => {
				const error = {
					message:
						"transaction reverted with reason string 'Insufficient balance'",
					code: 'CALL_EXCEPTION',
					transactionHash:
						'0x1111111111111111111111111111111111111111111111111111111111111111',
				};

				const normalized = normalizeError(error) as ExecutionError;

				expect(normalized).toBeInstanceOf(ExecutionError);
				expect(normalized.revertReason).toBe('Insufficient balance');
			});
		});

		describe('NetworkError detection', () => {
			it('should detect NETWORK_ERROR code', () => {
				const error = {
					message: 'network connection failed',
					code: 'NETWORK_ERROR',
				};

				const normalized = normalizeError(error);

				expect(normalized).toBeInstanceOf(NetworkError);
				expect((normalized as NetworkError).retry).toBe(true);
				expect(normalized.message).toContain('This error may be transient');
			});

			it('should detect timeout error', () => {
				const error = {
					message: 'request timeout after 30s',
					code: 'TIMEOUT',
				};

				const normalized = normalizeError(error, 'estimateGas');

				expect(normalized).toBeInstanceOf(NetworkError);
				expect(normalized.message).toContain('estimateGas');
				expect((normalized as NetworkError).retry).toBe(true);
			});

			it('should detect HTTP 503 error', () => {
				const error = {
					message: 'HTTP 503 Service Unavailable',
				};

				const normalized = normalizeError(error);

				expect(normalized).toBeInstanceOf(NetworkError);
				expect((normalized as NetworkError).retry).toBe(true);
			});

			it('should detect rate limit error', () => {
				const error = {
					message: 'rate limit exceeded, too many requests',
				};

				const normalized = normalizeError(error);

				expect(normalized).toBeInstanceOf(NetworkError);
				expect((normalized as NetworkError).retry).toBe(true);
			});

			it('should mark UNSUPPORTED_OPERATION as non-retryable', () => {
				const error = {
					message: 'operation not supported',
					code: 'UNSUPPORTED_OPERATION',
				};

				const normalized = normalizeError(error);

				expect(normalized).toBeInstanceOf(NetworkError);
				expect((normalized as NetworkError).retry).toBe(false);
				expect(normalized.message).toContain('not retry-able');
			});
		});

		describe('Already normalized errors', () => {
			it('should return ValidationError as-is', () => {
				const error = new ValidationError('Test validation error');

				const normalized = normalizeError(error);

				expect(normalized).toBe(error);
			});

			it('should return ExecutionError as-is', () => {
				const error = new ExecutionError(
					'Test execution error',
					'0x1234567890123456789012345678901234567890123456789012345678901234',
				);

				const normalized = normalizeError(error);

				expect(normalized).toBe(error);
			});

			it('should return NetworkError as-is', () => {
				const error = new NetworkError('Test network error');

				const normalized = normalizeError(error);

				expect(normalized).toBe(error);
			});
		});

		describe('Unknown errors', () => {
			it('should default to NetworkError for unknown error type', () => {
				const error = {
					message: 'some unknown error',
					code: 'UNKNOWN_CODE',
				};

				const normalized = normalizeError(error, 'transaction');

				expect(normalized).toBeInstanceOf(NetworkError);
				expect(normalized.message).toContain('transaction: some unknown error');
				expect((normalized as NetworkError).retry).toBe(false); // UNKNOWN_CODE is not in retryable list
			});

			it('should handle plain string errors', () => {
				const error = 'Simple string error';

				const normalized = normalizeError(error);

				expect(normalized).toBeInstanceOf(NetworkError);
				expect(normalized.message).toContain('Simple string error');
			});
		});
	});

	describe('extractRevertReason()', () => {
		it('should return undefined for successful transaction', () => {
			const receipt = { status: 1 };

			const reason = extractRevertReason(receipt);

			expect(reason).toBeUndefined();
		});

		it('should return generic message for failed transaction without data', () => {
			const receipt = { status: 0 };

			const reason = extractRevertReason(receipt);

			expect(reason).toBe('Transaction reverted without reason');
		});

		it('should handle "failed" string status', () => {
			const receipt = { status: 'failed' };

			const reason = extractRevertReason(receipt);

			expect(reason).toBe('Transaction reverted without reason');
		});

		it('should extract revert data from error data', () => {
			const receipt = { status: 0 };
			const errorData =
				'0x08c379a00000000000000000000000000000000000000000000000000000000000000020';

			const reason = extractRevertReason(receipt, errorData);

			expect(reason).toBe(errorData);
		});

		it('should handle invalid error data gracefully', () => {
			const receipt = { status: 0 };
			const errorData = '0xinvalid';

			const reason = extractRevertReason(receipt, errorData);

			expect(reason).toBe(errorData);
		});
	});

	describe('isMissingSignerError()', () => {
		it('should detect ValidationError with "Signer required"', () => {
			const error = new ValidationError('Signer required for write operations');

			expect(isMissingSignerError(error)).toBe(true);
		});

		it('should detect error message with "no signer"', () => {
			const error = new Error('no signer available');

			expect(isMissingSignerError(error)).toBe(true);
		});

		it('should detect error message with "wallet"', () => {
			const error = new Error('wallet not connected');

			expect(isMissingSignerError(error)).toBe(true);
		});

		it('should detect error message with "account"', () => {
			const error = new Error('account not found');

			expect(isMissingSignerError(error)).toBe(true);
		});

		it('should return false for unrelated errors', () => {
			const error = new Error('insufficient funds');

			expect(isMissingSignerError(error)).toBe(false);
		});
	});

	describe('isChainMismatchError()', () => {
		it('should detect ValidationError with "Chain ID mismatch"', () => {
			const error = new ValidationError('Chain ID mismatch. Expected 42220.');

			expect(isChainMismatchError(error)).toBe(true);
		});

		it('should detect error message with "chain"', () => {
			const error = new Error('wrong chain connected');

			expect(isChainMismatchError(error)).toBe(true);
		});

		it('should detect error message with "network"', () => {
			const error = new Error('network mismatch detected');

			expect(isChainMismatchError(error)).toBe(true);
		});

		it('should return false for unrelated errors', () => {
			const error = new Error('insufficient funds');

			expect(isChainMismatchError(error)).toBe(false);
		});
	});
});
