import 'dotenv/config'
import { createPublicClient, http } from 'viem'
import type { Route, RouteWithCost } from '../../src/core/types'
import { getChainConfig } from '../../src/utils/chainConfig'
import { buildConnectivityStructures, generateAllRoutes, selectOptimalRoutes } from '../../src/utils/routeUtils'
import { deduplicateRoutes } from '../shared/routeDeduplication'
import { processRoutesInBatches } from './batchProcessor'
import { parseCommandLineArgs, printUsageTips } from './cli'
import { rpcUrls, type SupportedChainId } from './config'
import { generateConsolidatedContent, writeConsolidatedFile } from './fileGenerator'
import { sortRoutesBySpread } from './spread'
import { calculateStatistics, displayStatistics } from './statistics'
import { PoolService, RouteService } from '../../src/services'
import { cachedRoutes as existingCachedRoutes } from '../../src/cache/routes'
import { assertCompleteChainGeneration } from '../shared/completeness'

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

  // Generate direct, two-hop, and eligible three-hop routes
  const allRoutes = generateAllRoutes(connectivity)

  const optimalRoutes = selectOptimalRoutes(allRoutes, true, connectivity.addrToSymbol)

  return optimalRoutes as Route[]
}

/**
 * Generate routes for a specific chain
 */
async function generateRoutesForChain(chainId: SupportedChainId, batchSize = 10): Promise<RouteWithCost[]> {
  const rpcUrl = rpcUrls[chainId]
  const chain = getChainConfig(chainId)

  // Create viem PublicClient with retries to ride out rate-limited public RPCs
  const publicClient = createPublicClient({
    chain,
    transport: http(rpcUrl, { retryCount: 4, retryDelay: 1000 }),
  }) as any

  const poolService = new PoolService(publicClient, chainId)
  const routeService = new RouteService(publicClient, chainId, poolService)

  // Get all tradable pairs with all available routes - force fresh generation
  console.log(`Fetching all tradable pairs with all available routes...`)
  const pairs = await getAllRoutes(routeService)

  // Pool discovery only throws when ALL factories fail; a single factory
  // failing yields a reduced pool set that would silently shrink the cache.
  const discoveryWarnings = poolService.getDiscoveryWarnings()
  if (discoveryWarnings.length > 0) {
    throw new Error(`Partial pool discovery for chain ${chainId}: ${discoveryWarnings.join('; ')}`)
  }

  if (pairs.length === 0) {
    console.log(`No routes found for chain ${chainId}`)
    return []
  }

  // Reverse traversal discovers the same pool path in both directions. Remove
  // those duplicates before cost reads so they do not consume RPC capacity.
  console.log(`Deduplicating redundant routes before cost reads...`)
  const routesBeforeDedup = pairs.length
  const routesToCost = deduplicateRoutes(pairs)
  const routesAfterDedup = routesToCost.length
  console.log(
    `   Removed ${routesBeforeDedup - routesAfterDedup} redundant routes (${(
      ((routesBeforeDedup - routesAfterDedup) / routesBeforeDedup) *
      100
    ).toFixed(1)}% reduction)`
  )

  // Process pairs with controlled concurrency using viem
  console.log(`Fetching spreads from pool configurations...`)
  console.log(`   Using batch size of ${batchSize} concurrent requests`)
  const pairsWithSpread = await processRoutesInBatches(routesToCost, publicClient as any, batchSize)

  // A route that failed its cost fetch must fail the run, not silently vanish
  // from the cache: findRoute throws RouteNotFoundError for any pair missing
  // from the cached file, even when its pools exist on-chain.
  if (pairsWithSpread.length < routesToCost.length) {
    const fetchedIds = new Set(pairsWithSpread.map((route) => route.id))
    const missingPairs = [...new Set(routesToCost.map((route) => route.id))].filter((id) => !fetchedIds.has(id))
    throw new Error(
      `Cost data missing for ${routesToCost.length - pairsWithSpread.length} of ${routesToCost.length} routes` +
        (missingPairs.length > 0 ? ` (pairs left with no route: ${missingPairs.join(', ')})` : '') +
        ` - refusing to write a partial cache for chain ${chainId}`
    )
  }
  console.log(`\nSpread data fetched for all routes`)

  // Sort all routes by spread (best routes first) to provide fallback alternatives
  const pairsToCache = sortRoutesBySpread(pairsWithSpread)

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
  const chainIdsToProcess = args.targetChainIds || (Object.keys(rpcUrls).map(Number) as SupportedChainId[])

  // Use configured batch size or default to 10
  const batchSize = args.batchSize || 10

  console.log(`Cache all available routes for chain(s): ${chainIdsToProcess.join(', ')} (batch size: ${batchSize})`)

  // Seed from the existing cache so a successful single-chain run does not
  // remove routes for chains that were not requested.
  const routesByChain: { [chainId: number]: RouteWithCost[] } = { ...existingCachedRoutes }
  const failedChains: number[] = []

  for (const chainId of chainIdsToProcess) {
    console.log(`\n\x1b[1mGenerating tradable pairs for chain ${chainId}...\x1b[0m`)
    try {
      const routes = await generateRoutesForChain(chainId as SupportedChainId, batchSize)
      routesByChain[chainId] = routes
    } catch (error) {
      console.error(`Error generating pairs for chain ${chainId}:`, error)
      console.error(`The cache write will be blocked because chain ${chainId} failed`)
      failedChains.push(chainId)
    }
  }

  assertCompleteChainGeneration('Route', chainIdsToProcess, failedChains)

  // Generate consolidated cache file
  console.log(`\n\x1b[1mGenerating consolidated routes cache file...\x1b[0m`)
  const content = generateConsolidatedContent(routesByChain)
  const fileName = writeConsolidatedFile(content, __dirname)

  const succeededChains = chainIdsToProcess.filter((chainId) => !failedChains.includes(chainId))
  const totalRoutes = succeededChains.reduce((sum, chainId) => sum + routesByChain[chainId].length, 0)
  console.log(
    `\n✅ Successfully cached ${totalRoutes} routes across ${succeededChains.length} chain(s) to src/cache/${fileName}`
  )

  console.log('\nAll done!')

  if (!args.targetChainIds) {
    printUsageTips()
  }
}

// Run main function (this file is designed to be executed directly)
main().catch((error) => {
  console.error(error)
  process.exit(1)
})
