// eslint-disable-next-line @typescript-eslint/no-var-requires
const yargsParser = require('yargs-parser') as typeof import('yargs-parser')
import { parseNetworkArgs } from '../shared/network'

export interface CliArgs {
  targetChainIds?: number[]
}

export function parseCommandLineArgs(): CliArgs {
  const argv = yargsParser(process.argv.slice(2), {
    string: ['chainId', 'network', 'chain-ids'],
    alias: {
      c: 'chainId',
      n: 'network',
    },
  })

  // Support both individual network/chainId flags and comma-separated chain-ids
  let targetChainIds: number[] | undefined

  if (argv['chain-ids']) {
    // Parse comma-separated chain IDs
    targetChainIds = argv['chain-ids']
      .split(',')
      .map((id: string) => parseInt(id.trim(), 10))
  } else if (argv.network || argv.chainId) {
    // Parse single network configuration
    const networkConfig = parseNetworkArgs(argv.network, argv.chainId)
    targetChainIds = [networkConfig.chainId]
  }

  return { targetChainIds }
}

export function printUsageTips(): void {
  console.log('\nTip: You can cache specific networks only:')
  console.log('   pnpm cacheTokens --network celo           # Cache only Celo mainnet')
  console.log('   pnpm cacheTokens --chainId 42220          # Same as above')
  console.log('   pnpm cacheTokens -n celo-sepolia          # Cache only Celo Sepolia')
  console.log('   pnpm cacheTokens --chain-ids 42220,11142220  # Multiple chains')
}
