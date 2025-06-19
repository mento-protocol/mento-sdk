import yargsParser from 'yargs-parser'

// Network name to chainId mapping
const NETWORK_MAP: Record<string, number> = {
  celo: 42220,
  alfajores: 44787,
  baklava: 62320,
}

// RPC URLs for different networks
const rpcUrls = {
  42220: 'https://forno.celo.org',
  62320: 'https://baklava-forno.celo-testnet.org',
  44787: 'https://alfajores-forno.celo-testnet.org',
} as const

export interface CommandLineArgs {
  token?: string
  exchange?: string
  chainId?: number
  rpcUrl?: string
}

export function parseCommandLineArgs(): CommandLineArgs {
  const args = yargsParser(process.argv.slice(2), {
    string: ['token', 'exchange', 'chainId', 'network'],
    alias: {
      token: ['t'],
      exchange: ['e'],
      chainId: ['c'],
      network: ['n'],
    },
  })

  // Parse network flag to chainId and rpcUrl
  let chainId: number | undefined
  let rpcUrl: string | undefined

  if (args.network) {
    const networkName = args.network.toLowerCase()
    if (!NETWORK_MAP[networkName]) {
      console.error(
        `❌ Invalid network "${args.network}". Valid networks: ${Object.keys(
          NETWORK_MAP
        ).join(', ')}`
      )
      process.exit(1)
    }
    chainId = NETWORK_MAP[networkName]
    rpcUrl = rpcUrls[chainId as keyof typeof rpcUrls]
  } else if (args.chainId) {
    chainId = Number(args.chainId)
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

  return {
    token: args.token,
    exchange: args.exchange,
    chainId,
    rpcUrl,
  }
}
