import { JsonRpcProvider, Wallet } from 'ethers';
import { EthersAdapter } from '../../../src/adapters/implementations/ethersAdapter';
import { createWriteTransactionTests } from '../shared';
import { TEST_CONFIG } from '../../config';

/**
 * Integration tests for Ethers v6 write operations
 *
 * Tests write transaction functionality using Ethers v6 provider.
 * Requires a funded test account with private key in TEST_SIGNER_PRIVATE_KEY env var.
 *
 * These tests will initially FAIL as write methods are not yet implemented.
 */
describe('Ethers (v6) Write Operations Integration Tests', () => {
	// Skip tests if no private key provided
	const privateKey = process.env.TEST_SIGNER_PRIVATE_KEY;

	if (!privateKey) {
		it.skip('skipping write tests - TEST_SIGNER_PRIVATE_KEY not set', () => {
			// Tests require a funded test account
		});
		return;
	}

	// Setup provider and signer
	const provider = new JsonRpcProvider(TEST_CONFIG.rpcUrl);
	const signer = new Wallet(privateKey, provider);
	const adapter = new EthersAdapter(provider, signer);

	// Test configuration
	// Using USDC on Celo mainnet for testing
	const testConfig = {
		// USDC on Celo: 0x765DE816845861e75A25fCA122bb6898B8B1282a (6 decimals)
		erc20TokenAddress: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
		signerAddress: signer.address,
		// Use a known contract address as spender (e.g., Mento Broker)
		spenderAddress: '0x0000000000000000000000000000000000000001',
	};

	// Run shared test suite
	createWriteTransactionTests(adapter, testConfig);
});
