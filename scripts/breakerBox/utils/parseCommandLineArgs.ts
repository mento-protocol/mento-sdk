import yargsParser from 'yargs-parser'
import { parseNetworkArgs } from '../../shared/network'

/**
 * Parse command line arguments using yargs-parser
 * Supports both "--token=GHSm" and "--token GHSm" formats, as well as short flags (-t, -e)
 * Also supports network selection via --network/-n and --chainId/-c flags
 *
 * @returns Object containing parsed arguments
 */
export function parseCommandLineArgs() {
  const argv = yargsParser(process.argv.slice(2), {
    string: ['token', 'exchange', 'chainId', 'network'],
    alias: {
      t: 'token',
      e: 'exchange',
      c: 'chainId',
      n: 'network',
    },
    default: {
      token: '',
      exchange: '',
    },
    configuration: {
      'short-option-groups': true,
      'camel-case-expansion': true,
    },
  })

  // Parse network configuration using shared utility
  const networkConfig = parseNetworkArgs(argv.network, argv.chainId)

  return {
    token: argv.token,
    exchange: argv.exchange,
    chainId: networkConfig.chainId,
    rpcUrl: networkConfig.rpcUrl,
  }
}
