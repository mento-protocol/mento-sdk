import { celo, type Chain } from 'viem/chains'
import { defineChain } from 'viem'
import { ChainId } from '../core/constants/chainId'

// Celo Sepolia chain definition (not available in viem/chains yet)
const celoSepolia = defineChain({
  id: 11142220,
  name: 'Celo Sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'CELO',
    symbol: 'CELO',
  },
  rpcUrls: {
    default: {
      http: ['https://forno.celo-sepolia.celo-testnet.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Celo Explorer',
      url: 'https://sepolia.celoscan.io',
    },
  },
  testnet: true,
})

/**
 * Get the default RPC URL for a given chain ID
 * @param chainId - The chain ID
 * @returns The default RPC URL for the chain
 * @throws Error if chain ID is not supported
 */
export function getDefaultRpcUrl(chainId: number): string {
  switch (chainId) {
    case ChainId.CELO:
      return 'https://forno.celo.org'
    case ChainId.CELO_SEPOLIA:
      return 'https://forno.celo-sepolia.celo-testnet.org'
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`)
  }
}

/**
 * Get the viem chain configuration for a given chain ID
 * @param chainId - The chain ID
 * @returns The viem chain configuration
 * @throws Error if chain ID is not supported
 */
export function getChainConfig(chainId: number): Chain {
  switch (chainId) {
    case ChainId.CELO:
      return celo
    case ChainId.CELO_SEPOLIA:
      return celoSepolia
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`)
  }
}
