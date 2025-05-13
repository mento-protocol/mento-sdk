import yargsParser from 'yargs-parser'
import { ScriptArgs } from '../types'
// Import type extensions instead of redeclaring them
import './typeExtensions'

/**
 * Parse command line arguments using yargs-parser
 * Supports both "--token=cGHS" and "--token cGHS" formats, as well as short flags (-t, -e)
 *
 * @returns Object containing parsed arguments
 */
export function parseCommandLineArgs(): ScriptArgs {
  const argv = yargsParser(process.argv.slice(2), {
    string: ['token', 'exchange'],
    alias: {
      t: 'token',
      e: 'exchange',
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

  return {
    token: argv.token,
    exchange: argv.exchange,
  }
}
