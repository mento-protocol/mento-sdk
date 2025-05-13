import yargsParser from 'yargs-parser'
import { ScriptArgs } from '../types'

// FIXME: This workaround should not be necessary much longer as native groupBy support should be in latest TS already https://github.com/microsoft/TypeScript/pull/56805
// Add TypeScript declaration for Object.groupBy
declare global {
  interface ObjectConstructor {
    groupBy<T, K extends PropertyKey>(
      items: Iterable<T>,
      keySelector: (item: T) => K
    ): Record<K, T[]>
  }
}

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
