import yargsParser from 'yargs-parser'
import { parseNetworkArgs } from '../../shared/network'
import { ScriptArgs } from '../types'
// Import type extensions instead of redeclaring them
import './typeExtensions'

/**
 * Parse command line arguments using yargs-parser
 * Supports both "--token=GHSm" and "--token GHSm" formats, as well as short flags (-t, -e)
 * Also supports network selection via --network/-n and --chainId/-c flags
 *
 * @returns Object containing parsed arguments
 */
export function parseCommandLineArgs(): ScriptArgs {
  const argv = yargsParser(process.argv.slice(2), {
    string: ['token', 'exchange', 'chainId', 'network'],
    boolean: ['verbose'],
    alias: {
      t: 'token',
      e: 'exchange',
      c: 'chainId',
      n: 'network',
      v: 'verbose',
    },
    default: {
      token: '',
      exchange: '',
      verbose: false,
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
    verbose: argv.verbose,
  }
}
