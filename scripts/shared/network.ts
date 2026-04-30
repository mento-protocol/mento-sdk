// Network name to chainId mapping
export const NETWORK_MAP: Record<string, number> = {
  celo: 42220,
  ['celo-sepolia']: 11142220,
  monad: 143,
  ['monad-testnet']: 10143,
  ['polygon-amoy']: 80002,
}

// RPC URLs for different networks
// Can be overridden with CELO_RPC_URL and CELO_SEPOLIA_RPC_URL environment variables
export const rpcUrls = {
  42220: process.env.CELO_RPC_URL || 'https://forno.celo.org',
  11142220: process.env.CELO_SEPOLIA_RPC_URL || 'https://forno.celo-sepolia.celo-testnet.org',
  143: process.env.MONAD_RPC_URL || 'https://rpc.monad.xyz',
  10143: process.env.MONAD_TESTNET_RPC_URL || 'https://testnet-rpc.monad.xyz',
  80002: process.env.POLYGON_AMOY_RPC_URL || 'https://polygon-amoy.drpc.org',
} as const

// Type for supported chain IDs
export type SupportedChainId = keyof typeof rpcUrls

// Interface for network configuration
export interface NetworkConfig {
  chainId: number
  rpcUrl: string
}

/**
 * Parse network arguments and return network configuration
 * @param networkArg - The network name argument (e.g., 'celo', 'celo-sepolia')
 * @param chainIdArg - The chainId argument (e.g., '42220', '11142220')
 * @returns NetworkConfig with chainId and rpcUrl
 */
export function parseNetworkArgs(
  networkArg?: string,
  chainIdArg?: string
): NetworkConfig {
  let chainId: number
  let rpcUrl: string

  if (networkArg) {
    const networkName = networkArg.toLowerCase()
    if (!NETWORK_MAP[networkName]) {
      console.error(
        `Invalid network "${networkArg}". Valid networks: ${Object.keys(
          NETWORK_MAP
        ).join(', ')}`
      )
      process.exit(1)
    }
    chainId = NETWORK_MAP[networkName]
    rpcUrl = rpcUrls[chainId as keyof typeof rpcUrls]
  } else if (chainIdArg) {
    chainId = Number(chainIdArg)
    if (!rpcUrls[chainId as keyof typeof rpcUrls]) {
      console.error(
        `Invalid chainId "${chainId}". Valid chainIds: ${Object.keys(
          rpcUrls
        ).join(', ')}`
      )
      process.exit(1)
    }
    rpcUrl = rpcUrls[chainId as keyof typeof rpcUrls]
  } else {
    // Default to Celo mainnet if no network specified
    chainId = 42220
    rpcUrl = rpcUrls[42220]
  }

  return { chainId, rpcUrl }
}

/**
 * Get the network name from chainId
 * @param chainId - The chain ID
 * @returns The network name or 'Unknown' if not found
 */
export function getNetworkName(chainId: number): string {
  const networkEntry = Object.entries(NETWORK_MAP).find(
    ([, id]) => id === chainId
  )
  return networkEntry ? networkEntry[0] : 'Unknown'
}
