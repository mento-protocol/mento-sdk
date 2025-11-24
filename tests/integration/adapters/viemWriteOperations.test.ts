import { createPublicClient, createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { celo } from 'viem/chains'
import { ViemAdapter } from '../../../src/adapters/implementations/viemAdapter'
import { createWriteTransactionTests } from '../shared'
import { TEST_CONFIG } from '../../config'
import { addresses, BROKER, ChainId, STABLETOKEN } from '../../../src/constants'

/**
 * Integration tests for Viem write operations
 *
 * Tests write transaction functionality using Viem client.
 * Requires a funded test account with private key in TEST_SIGNER_PRIVATE_KEY env var.
 *
 */
describe('Viem Write Operations Integration Tests', () => {
  // Skip tests if no private key provided
  const privateKey = process.env.TEST_SIGNER_PRIVATE_KEY

  if (!privateKey) {
    it.skip('skipping write tests - TEST_SIGNER_PRIVATE_KEY not set', () => {
      // Tests require a funded test account
    })
    return
  }

  // Ensure private key has 0x prefix for Viem
  const formattedPrivateKey = privateKey.startsWith('0x')
    ? privateKey
    : `0x${privateKey}`

  // Setup public and wallet clients
  const publicClient = createPublicClient({
    chain: celo,
    transport: http(TEST_CONFIG.rpcUrl),
  })

  const account = privateKeyToAccount(formattedPrivateKey as `0x${string}`)

  const walletClient = createWalletClient({
    account,
    chain: celo,
    transport: http(TEST_CONFIG.rpcUrl),
  })

  // Type assertion needed due to Viem's strict chain typing
  const adapter = new ViemAdapter(publicClient as any, walletClient)
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
    signerAddress: account.address,
    spenderAddress: brokerAddress,
  }

  // Run shared test suite
  createWriteTransactionTests(adapter, testConfig)
})
