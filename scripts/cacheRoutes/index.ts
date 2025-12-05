import { createPublicClient, http } from 'viem'
import { celo } from 'viem/chains'
import { defineChain } from 'viem'
import type { Route } from '../../src/core/types'
import {
  buildConnectivityStructures,
  generateAllRoutes,
  selectOptimalRoutes,
} from '../../src/utils/routeUtils'
import { deduplicateRoutes } from '../shared/routeDeduplication'
import { processPairsInBatches } from './batchProcessor'
import { parseCommandLineArgs, printUsageTips } from './cli'
import { rpcUrls, type SupportedChainId } from './config'
import { generateFileContent, writeToFile } from './fileGenerator'
import { sortPairsBySpread } from './spread'
import { calculateStatistics, displayStatistics } from './statistics'
import { PoolService, RouterService } from '../../src/services'

const celoSepolia = defineChain({
  id: 11142220,
  name: 'Celo Sepolia',
  nativeCurrency: {
    name: 'CELO',
    symbol: 'CELO',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://forno.celo-sepolia.celo-testnet.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Celo Sepolia Explorer',
      url: 'https://celo-sepolia.blockscout.com',
    },
  },
  testnet: true,
})

// Map chain IDs to viem chain configs
const chainConfigs = {
  42220: celo,
  11142220: celoSepolia,
} as const

/**
 * Generate all tradable pairs with ALL available routes (not just optimal)
 */
async function getAllRoutesWithRoutes(
  routerService: RouterService
): Promise<Route[]> {
  // Get direct pairs
  const directPairs = await routerService.getDirectRoutes()

  if (directPairs.length === 0) {
    return []
  }

  // Build connectivity structures for route finding
  const connectivity = buildConnectivityStructures(directPairs)

  // Generate all possible routes (direct + 2-hop)
  const allRoutes = generateAllRoutes(connectivity)

  // Return ALL routes (returnAllRoutes = true) for cache generation
  const allPairs = selectOptimalRoutes(
    allRoutes,
    true,
    connectivity.addrToSymbol
  )

  return allPairs as Route[]
}

/**
 * Generate and cache tradable pairs for a specific chain
 */
async function generateAndCacheRoutes(
  chainId: SupportedChainId,
  batchSize = 10
): Promise<void> {
  const rpcUrl = rpcUrls[chainId]
  const chain = chainConfigs[chainId]

  if (!chain) {
    throw new Error(`Unsupported chain ID: ${chainId}`)
  }

  // Create viem PublicClient
  const publicClient = createPublicClient({
    chain,
    transport: http(rpcUrl),
  }) as any

  const poolService = new PoolService(publicClient, chainId)
  const routerService = new RouterService(publicClient, chainId, poolService)

  // Get all tradable pairs with all available routes - force fresh generation
  console.log(`Fetching all tradable pairs with all available routes...`)
  const pairs = await getAllRoutesWithRoutes(routerService)

  // Process pairs with controlled concurrency using viem
  console.log(`Fetching spreads from pool configurations...`)
  console.log(`   Using batch size of ${batchSize} concurrent requests`)
  const pairsWithSpread = await processPairsInBatches(pairs, publicClient as any, batchSize)
  console.log(`\nSpread data fetched for all routes`)

  // Deduplicate routes to eliminate redundant symmetric pairs
  console.log(`Deduplicating redundant routes...`)
  const routesBeforeDedup = pairsWithSpread.length
  const deduplicatedPairs = deduplicateRoutes(pairsWithSpread)
  const routesAfterDedup = deduplicatedPairs.length
  console.log(
    `   Removed ${routesBeforeDedup - routesAfterDedup} redundant routes (${(
      ((routesBeforeDedup - routesAfterDedup) / routesBeforeDedup) *
      100
    ).toFixed(1)}% reduction)`
  )

  // Sort all routes by spread (best routes first) to provide fallback alternatives
  const pairsToCache = sortPairsBySpread(deduplicatedPairs)

  // Calculate and display statistics
  const statistics = calculateStatistics(pairsToCache)
  displayStatistics(statistics)

  // Generate and write the TypeScript file
  const content = generateFileContent(chainId, pairsToCache)
  // Pass the script directory path
  const fileName = writeToFile(chainId, content, __dirname)

  console.log(
    `\nSuccessfully cached ${statistics.totalRoutes} total routes (covering ${statistics.uniquePairs} unique pairs) with spread data to ${fileName}\n`
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
    `Cache all available routes for chain(s): ${chainIdsToProcess.join(
      ', '
    )} (batch size: ${batchSize})`
  )

  // Generate tradable pairs for specified chain IDs
  for (const chainId of chainIdsToProcess) {
    console.log(
      `\n\x1b[1mGenerating tradable pairs for chain ${chainId}...\x1b[0m`
    )
    try {
      await generateAndCacheRoutes(chainId as SupportedChainId, batchSize)
    } catch (error) {
      console.error(`Error generating pairs for chain ${chainId}:`, error)
    }
  }

  console.log('\nAll done!')

  if (!args.targetChainIds) {
    printUsageTips()
  }
}

// Run main function (this file is designed to be executed directly)
main().catch(console.error)
