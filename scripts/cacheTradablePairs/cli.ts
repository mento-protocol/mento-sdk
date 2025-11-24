// eslint-disable-next-line @typescript-eslint/no-var-requires
const yargsParser = require('yargs-parser') as typeof import('yargs-parser')
import { parseNetworkArgs } from '../shared/network'

export interface CliArgs {
  targetChainIds?: number[]
  batchSize?: number
}

export function parseCommandLineArgs(): CliArgs {
  const argv = yargsParser(process.argv.slice(2), {
    string: ['chainId', 'network'],
    number: ['batchSize'],
    alias: {
      c: 'chainId',
      n: 'network',
      b: 'batchSize',
    },
  })

  // Parse network configuration using shared utility
  let targetChainIds: number[] | undefined

  if (argv.network || argv.chainId) {
    const networkConfig = parseNetworkArgs(argv.network, argv.chainId)
    targetChainIds = [networkConfig.chainId]
  }

  // Parse batch size with validation
  const batchSize = argv.batchSize
  if (batchSize !== undefined) {
    if (batchSize < 1 || batchSize > 50) {
      console.error(
        `Invalid batchSize "${batchSize}". Must be between 1 and 50.`
      )
      process.exit(1)
    }
  }

  return {
    targetChainIds,
    batchSize,
  }
}

export function printUsageTips(): void {
  console.log('\nTip: You can cache specific networks only:')
  console.log(
    '   pnpm cacheTradablePairs --network celo        # Cache only Celo mainnet'
  )
  console.log(
    '   pnpm cacheTradablePairs --chainId 42220       # Same as above'
  )
  console.log(
    '   pnpm cacheTradablePairs -n alfajores          # Cache only Alfajores'
  )
}
