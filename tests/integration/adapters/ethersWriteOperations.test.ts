import { JsonRpcProvider, Wallet } from 'ethers'
import { EthersAdapter } from '../../../src/adapters/implementations/ethersAdapter'
import { createWriteTransactionTests } from '../shared'
import { TEST_CONFIG } from '../../config'
import { addresses, BROKER, ChainId, STABLETOKEN } from '../../../src/constants'

/**
 * Integration tests for Ethers v6 write operations
 *
 * Tests write transaction functionality using Ethers v6 provider.
 * Requires a funded test account with private key in TEST_SIGNER_PRIVATE_KEY env var.
 *
 */
describe('Ethers (v6) Write Operations Integration Tests', () => {
  // Skip tests if no private key provided
  const privateKey = process.env.TEST_SIGNER_PRIVATE_KEY

  if (!privateKey) {
    it.skip('skipping write tests - TEST_SIGNER_PRIVATE_KEY not set', () => {
      // Tests require a funded test account
    })
    return
  }

  // Setup provider and signer
  const provider = new JsonRpcProvider(TEST_CONFIG.rpcUrl)
  const signer = new Wallet(privateKey, provider)
  const adapter = new EthersAdapter(provider, signer)

  const brokerAddress = addresses[ChainId.CELO][BROKER]
  const cUSDAddress = addresses[ChainId.CELO][STABLETOKEN]

  if (!brokerAddress) {
    throw new Error('Broker address not found for CELO')
  }
  if (!cUSDAddress) {
    throw new Error('StableToken address not found for CELO')
  }

  // Test configuration
  const testConfig = {
    erc20TokenAddress: cUSDAddress,
    signerAddress: signer.address,
    spenderAddress: brokerAddress,
  }

  // Run shared test suite
  createWriteTransactionTests(adapter, testConfig)
})
