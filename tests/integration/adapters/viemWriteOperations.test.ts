import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { celo } from 'viem/chains';
import { ViemAdapter } from '../../../src/adapters/implementations/viemAdapter';
import { createWriteTransactionTests } from '../shared';
import { TEST_CONFIG } from '../../config';

/**
 * Integration tests for Viem write operations
 *
 * Tests write transaction functionality using Viem client.
 * Requires a funded test account with private key in TEST_SIGNER_PRIVATE_KEY env var.
 *
 * These tests will initially FAIL as write methods are not yet implemented.
 */
describe('Viem Write Operations Integration Tests', () => {
	// Skip tests if no private key provided
	const privateKey = process.env.TEST_SIGNER_PRIVATE_KEY;

	if (!privateKey) {
		it.skip('skipping write tests - TEST_SIGNER_PRIVATE_KEY not set', () => {
			// Tests require a funded test account
		});
		return;
	}

	// Setup public and wallet clients
	const publicClient = createPublicClient({
		chain: celo,
		transport: http(TEST_CONFIG.rpcUrl),
	});

	const account = privateKeyToAccount(privateKey as `0x${string}`);

	const walletClient = createWalletClient({
		account,
		chain: celo,
		transport: http(TEST_CONFIG.rpcUrl),
	});

	// Type assertion needed due to Viem's strict chain typing
	const adapter = new ViemAdapter(publicClient as any, walletClient);

	// Test configuration
	// Using USDC on Celo mainnet for testing
	const testConfig = {
		// USDC on Celo: 0x765DE816845861e75A25fCA122bb6898B8B1282a (6 decimals)
		erc20TokenAddress: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
		signerAddress: account.address,
		// Use a known contract address as spender (e.g., Mento Broker)
		spenderAddress: '0x0000000000000000000000000000000000000001',
	};

	// Run shared test suite
	createWriteTransactionTests(adapter, testConfig);
});
