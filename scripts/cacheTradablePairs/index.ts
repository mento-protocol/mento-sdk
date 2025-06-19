import { providers } from 'ethers'
import { Mento } from '../../src/mento'
import { processPairsInBatches } from './batchProcessor'
import { parseCommandLineArgs, printUsageTips } from './cli'
import { rpcUrls, SupportedChainId } from './config'
import { generateFileContent, writeToFile } from './fileGenerator'
import { sortPairsBySpread } from './spread'
import { calculateStatistics, displayStatistics } from './statistics'

/**
 * Generate and cache tradable pairs for a specific chain
 */
async function generateAndCacheTradablePairs(
  chainId: SupportedChainId,
  batchSize = 10
): Promise<void> {
  const provider = new providers.JsonRpcProvider(rpcUrls[chainId])
  const mento = await Mento.create(provider)

  // Get all tradable pairs with all available routes - force fresh generation and skip cache
  console.log(`📡 Fetching all tradable pairs with all available routes...`)
  const pairs = await mento.getTradablePairsWithPath({
    cached: false,
    returnAllRoutes: true,
  })

  // Process pairs with controlled concurrency
  console.log(`📊 Fetching spreads from pool configurations...`)
  console.log(`   Using batch size of ${batchSize} concurrent requests`)
  const pairsWithSpread = await processPairsInBatches(
    pairs,
    provider,
    batchSize
  )
  console.log(`\n✅ Spread data fetched for all routes`)

  // Sort all routes by spread (best routes first) to provide fallback alternatives
  const pairsToCache = sortPairsBySpread(pairsWithSpread)

  // Calculate and display statistics
  const statistics = calculateStatistics(pairsToCache)
  displayStatistics(statistics)

  // Generate and write the TypeScript file
  const content = generateFileContent(chainId, pairsToCache)
  const fileName = writeToFile(chainId, content, __dirname)

  console.log(
    `\n✅ Successfully cached ${statistics.totalRoutes} total routes (covering ${statistics.uniquePairs} unique pairs) with spread data to ${fileName}\n`
  )
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

  // Use configured batch size or default to 10
  const batchSize = args.batchSize || 10

  console.log(
    `📡 Cache all available routes for chain(s): ${chainIdsToProcess.join(
      ', '
    )} (batch size: ${batchSize})`
  )

  // Generate tradable pairs for specified chain IDs
  for (const chainId of chainIdsToProcess) {
    console.log(
      `\n🔄 \x1b[1mGenerating tradable pairs for chain ${chainId}...\x1b[0m`
    )
    try {
      await generateAndCacheTradablePairs(
        chainId as SupportedChainId,
        batchSize
      )
    } catch (error) {
      console.error(`❌ Error generating pairs for chain ${chainId}:`, error)
    }
  }

  console.log('\n✨ All done!')

  if (!args.targetChainIds) {
    printUsageTips()
  }
}

// Only run main if this file is executed directly
if (require.main === module) {
  main().catch(console.error)
}
