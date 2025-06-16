import yargsParser from 'yargs-parser'

export interface CommandLineArgs {
  token?: string
  exchange?: string
}

export function parseCommandLineArgs(): CommandLineArgs {
  const args = yargsParser(process.argv.slice(2), {
    string: ['token', 'exchange'],
    alias: {
      token: ['t'],
      exchange: ['e'],
    },
  })

  return {
    token: args.token,
    exchange: args.exchange,
  }
} 