import yargsParser from 'yargs-parser'
import { parseNetworkArgs } from '../../shared/network'

export interface CommandLineArgs {
  chainId?: number
  rpcUrl?: string
}

export function parseCommandLineArgs(): CommandLineArgs {
  const args = yargsParser(process.argv.slice(2), {
    string: ['chainId', 'network', 'rpcUrl'],
    alias: {
      chainId: ['c'],
      network: ['n'],
      rpcUrl: ['r'],
    },
  })

  // If no network or chainId specified, return empty to indicate all networks
  if (!args.network && !args.chainId && !args.rpcUrl) {
    return {}
  }

  // Parse network configuration using shared utility
  const networkConfig = parseNetworkArgs(args.network, args.chainId)

  return {
    chainId: networkConfig.chainId,
    rpcUrl: args.rpcUrl || networkConfig.rpcUrl,
  }
}
