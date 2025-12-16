import { SupportedChainId } from '../shared/network'

export interface CommandLineArgs {
  targetChainIds?: SupportedChainId[]
}

/**
 * Parse command line arguments for token caching script
 */
export function parseCommandLineArgs(): CommandLineArgs {
  const args: CommandLineArgs = {}

  // Check if specific chain IDs were requested
  const chainIdArg = process.argv.find((arg) => arg.startsWith('--chain-ids='))
  if (chainIdArg) {
    const chainIdsStr = chainIdArg.split('=')[1]
    args.targetChainIds = chainIdsStr
      .split(',')
      .map((id) => parseInt(id.trim(), 10) as SupportedChainId)
  }

  return args
}

/**
 * Print usage tips for the token caching script
 */
export function printUsageTips(): void {
  console.log('\n💡 Usage tips:')
  console.log('   - To cache tokens for specific chains:')
  console.log('     yarn cacheTokens --chain-ids=42220,11142220')
  console.log('   - To cache tokens for all chains:')
  console.log('     yarn cacheTokens')
}
