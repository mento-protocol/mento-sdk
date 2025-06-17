import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

export interface CommandLineArgs {
  token?: string
  exchange?: string
}

export function parseCommandLineArgs(): CommandLineArgs {
  const argv = yargs(hideBin(process.argv))
    .option('token', {
      alias: 't',
      type: 'string',
      description: 'Filter by token symbol',
    })
    .option('exchange', {
      alias: 'e',
      type: 'string',
      description: 'Filter by exchange ID',
    })
    .help()
    .alias('help', 'h')
    .parseSync()

  return {
    token: argv.token,
    exchange: argv.exchange,
  }
} 