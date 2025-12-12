// Network name to chainId mapping
export const NETWORK_MAP: Record<string, number> = {
  celo: 42220,
  ['celo-sepolia']: 11142220,
}

// RPC URLs for different networks
export const rpcUrls = {
  42220: 'https://forno.celo.org',
  11142220: 'https://forno.celo-sepolia.celo-testnet.org',
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
 * @param networkArg - The network name argument (e.g., 'celo')
 * @param chainIdArg - The chainId argument (e.g., '42220')
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
        `❌ Invalid network "${networkArg}". Valid networks: ${Object.keys(
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
        `❌ Invalid chainId "${chainId}". Valid chainIds: ${Object.keys(
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
