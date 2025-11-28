import { celo, celoSepolia, type Chain } from 'viem/chains'
import { ChainId } from '../constants/chainId'

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

