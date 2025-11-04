import { providers, Wallet } from 'ethers-v5';
import { EthersV5Adapter } from '../../../src/adapters/implementations/ethersV5Adapter';
import { createWriteTransactionTests } from '../shared';
import { TEST_CONFIG } from '../../config';

/**
 * Integration tests for Ethers v5 write operations
 *
 * Tests write transaction functionality using Ethers v5 provider.
 * Requires a funded test account with private key in TEST_SIGNER_PRIVATE_KEY env var.
 *
 * These tests will initially FAIL as write methods are not yet implemented.
 */
describe('EthersV5 Write Operations Integration Tests', () => {
	// Skip tests if no private key provided
	const privateKey = process.env.TEST_SIGNER_PRIVATE_KEY;

	if (!privateKey) {
		it.skip('skipping write tests - TEST_SIGNER_PRIVATE_KEY not set', () => {
			// Tests require a funded test account
		});
		return;
	}

	// Setup provider and signer
	const provider = new providers.JsonRpcProvider(TEST_CONFIG.rpcUrl);
	const signer = new Wallet(privateKey, provider);
	const adapter = new EthersV5Adapter(provider, signer);

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
