import { createPublicClient, http } from 'viem'
import { celo } from 'viem/chains'
import { defineChain } from 'viem'
import type { Route, RouteWithCost } from '../../src/core/types'
import {
  buildConnectivityStructures,
  generateAllRoutes,
  selectOptimalRoutes,
} from '../../src/utils/routeUtils'
import { deduplicateRoutes } from '../shared/routeDeduplication'
import { processRoutesInBatches } from './batchProcessor'
import { parseCommandLineArgs, printUsageTips } from './cli'
import { rpcUrls, type SupportedChainId } from './config'
import { generateConsolidatedContent, writeConsolidatedFile } from './fileGenerator'
import { sortRoutesBySpread } from './spread'
import { calculateStatistics, displayStatistics } from './statistics'
import { PoolService, RouteService } from '../../src/services'

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
 * Generate all available routes (not just optimal)
 */
async function getAllRoutes(routeService: RouteService): Promise<Route[]> {
  // Get direct routes
  const directRoutes = await routeService.getDirectRoutes()

  if (directRoutes.length === 0) {
    return []
  }

  // Build connectivity structures for route finding
  const connectivity = buildConnectivityStructures(directRoutes)

  // Generate all possible routes (direct + 2-hop)
  const allRoutes = generateAllRoutes(connectivity)

  const optimalRoutes = selectOptimalRoutes(allRoutes, true, connectivity.addrToSymbol)

  return optimalRoutes as Route[]
}

/**
 * Generate routes for a specific chain
 */
async function generateRoutesForChain(
  chainId: SupportedChainId,
  batchSize = 10
): Promise<RouteWithCost[]> {
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
  const routeService = new RouteService(publicClient, chainId, poolService)

  // Get all tradable pairs with all available routes - force fresh generation
  console.log(`Fetching all tradable pairs with all available routes...`)
  const pairs = await getAllRoutes(routeService)

  if (pairs.length === 0) {
    console.log(`No routes found for chain ${chainId}`)
    return []
  }

  // Process pairs with controlled concurrency using viem
  console.log(`Fetching spreads from pool configurations...`)
  console.log(`   Using batch size of ${batchSize} concurrent requests`)
  const pairsWithSpread = await processRoutesInBatches(pairs, publicClient as any, batchSize)
  console.log(`\nSpread data fetched for all routes`)

  // Deduplicate routes to eliminate redundant symmetric pairs
  console.log(`Deduplicating redundant routes...`)
  const routesBeforeDedup = pairsWithSpread.length
  const deduplicatedRoutes = deduplicateRoutes(pairsWithSpread)
  const routesAfterDedup = deduplicatedRoutes.length
  console.log(
    `   Removed ${routesBeforeDedup - routesAfterDedup} redundant routes (${(
      ((routesBeforeDedup - routesAfterDedup) / routesBeforeDedup) *
      100
    ).toFixed(1)}% reduction)`
  )

  // Sort all routes by spread (best routes first) to provide fallback alternatives
  const pairsToCache = sortRoutesBySpread(deduplicatedRoutes)

  // Calculate and display statistics
  const statistics = calculateStatistics(pairsToCache)
  displayStatistics(statistics)

  return pairsToCache
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

  // Generate routes for all chains
  const routesByChain: { [chainId: number]: RouteWithCost[] } = {}

  for (const chainId of chainIdsToProcess) {
    console.log(
      `\n\x1b[1mGenerating tradable pairs for chain ${chainId}...\x1b[0m`
    )
    try {
      const routes = await generateRoutesForChain(chainId as SupportedChainId, batchSize)
      routesByChain[chainId] = routes
    } catch (error) {
      console.error(`Error generating pairs for chain ${chainId}:`, error)
      // Use empty array for failed chains
      routesByChain[chainId] = []
    }
  }

  // Generate consolidated cache file
  console.log(`\n\x1b[1mGenerating consolidated routes cache file...\x1b[0m`)
  const content = generateConsolidatedContent(routesByChain)
  const fileName = writeConsolidatedFile(content, __dirname)

  const totalRoutes = Object.values(routesByChain).reduce((sum, routes) => sum + routes.length, 0)
  console.log(`\n✅ Successfully cached ${totalRoutes} routes across ${chainIdsToProcess.length} chains to src/cache/${fileName}`)

  console.log('\nAll done!')

  if (!args.targetChainIds) {
    printUsageTips()
  }
}

// Run main function (this file is designed to be executed directly)
main().catch(console.error)
