import { providers } from 'ethers'
import { Mento, Token } from '../../src/mento'
import { rpcUrls, SupportedChainId } from '../shared/network'
import { parseCommandLineArgs, printUsageTips } from './cli'
import { generateFileContent, writeToFile } from './fileGenerator'
import { generateTokensIndexFile } from './tokensIndexGenerator'

/**
 * Fetch tokens for a specific chain
 */
async function fetchTokensForChain(
  chainId: SupportedChainId
): Promise<Token[]> {
  const provider = new providers.JsonRpcProvider(rpcUrls[chainId])
  const mento = await Mento.create(provider)

  console.log(`📡 Fetching tokens from blockchain...`)
  const tokens = await mento.getTokensAsync({ cached: false })
  console.log(`✅ Fetched ${tokens.length} unique tokens`)

  return tokens
}

/**
 * Generate and cache tokens for a specific chain
 */
async function generateAndCacheTokens(
  chainId: SupportedChainId
): Promise<Token[]> {
  const tokens = await fetchTokensForChain(chainId)

  // Generate and write the TypeScript file
  const content = generateFileContent(chainId, tokens)
  const fileName = writeToFile(chainId, content, __dirname)

  console.log(
    `\n✅ Successfully cached ${tokens.length} tokens to ${fileName}\n`
  )

  return tokens
}

/**
 * Main function that orchestrates the entire caching process
 */
export async function main(): Promise<void> {
  const args = parseCommandLineArgs()

  // Determine which chain IDs to process
  const chainIdsToProcess =
    args.targetChainIds ||
    (Object.keys(rpcUrls).map(Number) as SupportedChainId[])

  console.log(`📡 Cache tokens for chain(s): ${chainIdsToProcess.join(', ')}`)

  // Store tokens by chain for index file generation
  const tokensByChain: { [chainId: number]: Token[] } = {}

  // Generate tokens for specified chain IDs
  for (const chainId of chainIdsToProcess) {
    console.log(`\n🔄 \x1b[1mGenerating tokens for chain ${chainId}...\x1b[0m`)
    try {
      const tokens = await generateAndCacheTokens(chainId as SupportedChainId)
      tokensByChain[chainId] = tokens
    } catch (error) {
      console.error(`❌ Error generating tokens for chain ${chainId}:`, error)
    }
  }

  // Generate the main tokens.ts index file with enums and mappings
  console.log(`\n🔄 \x1b[1mGenerating tokens.ts index file...\x1b[0m`)
  generateTokensIndexFile(tokensByChain, __dirname)

  printUsageTips()
}

// Run the script if called directly
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}
