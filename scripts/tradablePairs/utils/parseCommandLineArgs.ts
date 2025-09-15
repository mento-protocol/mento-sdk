import yargsParser from 'yargs-parser'
import { parseNetworkArgs } from '../../shared/network'

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

  // Parse network configuration using shared utility
  const networkConfig = parseNetworkArgs(args.network, args.chainId)

  return {
    token: args.token,
    exchange: args.exchange,
    chainId: networkConfig.chainId,
    rpcUrl: networkConfig.rpcUrl,
  }
}
