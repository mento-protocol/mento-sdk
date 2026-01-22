#!/usr/bin/env ts-node

/**
 * Unified swap information tool - combines route discovery and quote calculation
 *
 * Usage Examples:
 * - Basic route info: yarn quote -f USDC -t USDm
 * - With quote amount: yarn quote -f USDC -t USDm -a 1000
 * - All routes: yarn quote -f USDC -t USDm --all
 * - All routes with quotes: yarn quote -f USDC -t USDm -a 1000 --all
 * - Verbose details: yarn quote -f USDC -t USDm --verbose
 */

import { formatUnits, parseUnits } from 'ethers/lib/utils'
import ora from 'ora'
import { Mento, TradablePair } from '../../src/mento'
import {
  buildConnectivityStructures,
  generateAllRoutes,
  selectOptimalRoutes,
} from '../../src/routeUtils'
import { deduplicateRoutes } from '../shared/routeDeduplication'
import { calculateAllRouteQuotes, calculateSingleQuote } from './calculator'
import { parseCommandLineArgs } from './cli'
import { CHAIN_NAMES } from './config'
import {
  displayAllRoutesWithQuotes,
  displayAllRoutesWithoutQuotes,
  displayHeader,
  displayOptimalRoute,
  displayRouteDetails,
  prepareFormattedRoutes,
} from './formatter'
import { buildRouteDisplay, calculateCompoundSpread } from './spread'
import { RouteInfo } from './types'
import { cleanupProvider, createProvider } from './utils/provider'
import {
  getTokenDecimals,
  roundToMaxDecimals,
  validateTokens,
} from './utils/token'

/**
 * Finds all possible trading routes between two tokens, including direct and multi-hop paths.
 * This is the main entry point for route discovery.
 *
 * OPTIMIZED VERSION: Uses src/routeUtils for efficient graph-based route finding
 * with intelligent route selection and spread-based optimization.
 *
 * @param mento - Mento SDK instance for accessing trading pairs
 * @param tokenIn - Source token address
 * @param tokenOut - Destination token address
 * @returns Array of all possible routes sorted by efficiency
 */
async function findAllRoutesForTokens(
  mento: Mento,
  tokenIn: string,
  tokenOut: string
): Promise<TradablePair[]> {
  // Get direct pairs and build connectivity structures
  const directPairs = await mento.getDirectPairs()
  const connectivityData = buildConnectivityStructures(directPairs)

  // Generate all possible routes using graph traversal
  const allRoutes = generateAllRoutes(connectivityData)

  // For --all flag, we want to return all possible routes, but deduplicated
  // Get all routes with returnAllRoutes=true to see all possibilities
  const allPossibleRoutes = selectOptimalRoutes(
    allRoutes,
    true,
    connectivityData.addrToSymbol
  )

  // Filter to routes that match the specific token pair (tokenIn -> tokenOut)
  const relevantRoutes = allPossibleRoutes.filter((route) => {
    // Check if this route connects our tokens
    const routeAddresses = route.assets.map((asset) => asset.address)
    return routeAddresses.includes(tokenIn) && routeAddresses.includes(tokenOut)
  })

  // Deduplicate routes by path signature to avoid showing identical routes multiple times
  const uniqueRoutes = deduplicateRoutes(relevantRoutes as TradablePair[])

  return uniqueRoutes
}

/**
 * Handles the case when user wants to see all routes WITH quote calculations.
 * This involves calculating quotes for all routes in parallel and displaying ranked results.
 */
async function handleAllRoutesWithQuotes(
  args: ReturnType<typeof parseCommandLineArgs>,
  allRoutes: Awaited<ReturnType<typeof findAllRoutesForTokens>>,
  fromAddress: string,
  toAddress: string,
  allPairs: Awaited<
    ReturnType<
      Awaited<ReturnType<typeof Mento.create>>['getTradablePairsWithPath']
    >
  >,
  mento: Mento,
  provider: ReturnType<typeof createProvider>
): Promise<void> {
  // Get token decimals for proper amount formatting
  const [fromDecimals, toDecimals] = await Promise.all([
    getTokenDecimals(fromAddress, provider),
    getTokenDecimals(toAddress, provider),
  ])

  const amountIn = parseUnits(args.amount!, fromDecimals)
  const spinner = ora('Calculating quotes...').start()

  // Calculate quotes for all routes in parallel
  const routeQuotes = await calculateAllRouteQuotes(
    mento,
    allRoutes,
    fromAddress,
    toAddress,
    amountIn,
    args.from,
    args.to,
    allPairs
  )

  spinner.stop()

  // Format and display results
  const formattedRoutes = prepareFormattedRoutes(routeQuotes, toDecimals)
  const failedRoutes = routeQuotes.filter((q) => !q.successful)

  displayAllRoutesWithQuotes(
    formattedRoutes,
    failedRoutes,
    args.to,
    args.verbose || false
  )
}

/**
 * Handles the case when user wants to see all routes WITHOUT quote calculations.
 * This shows route analysis only (spreads, route types, etc.) without actual quotes.
 */
function handleAllRoutesWithoutQuotes(
  args: ReturnType<typeof parseCommandLineArgs>,
  allRoutes: Awaited<ReturnType<typeof findAllRoutesForTokens>>,
  allPairs: Awaited<
    ReturnType<
      Awaited<ReturnType<typeof Mento.create>>['getTradablePairsWithPath']
    >
  >
): void {
  // Build route information with spreads and sort by efficiency
  const routeInfos: RouteInfo[] = allRoutes
    .map((route, index) => ({
      route,
      routeDisplay: buildRouteDisplay(route, args.from, args.to, allPairs),
      routeType:
        route.path.length === 1 ? 'Direct' : `${route.path.length}-hop`,
      spread: calculateCompoundSpread(route, allPairs),
      index,
    }))
    .sort((a, b) => a.spread - b.spread) // Sort by spread (lowest = best)

  displayAllRoutesWithoutQuotes(routeInfos, args.verbose || false)
}

/**
 * Main handler for the --all flag.
 * Routes to either quote calculation or route analysis based on whether amount is provided.
 */
async function handleAllRoutes(
  args: ReturnType<typeof parseCommandLineArgs>,
  fromAddress: string,
  toAddress: string,
  allPairs: Awaited<
    ReturnType<
      Awaited<ReturnType<typeof Mento.create>>['getTradablePairsWithPath']
    >
  >,
  mento: Mento,
  provider: ReturnType<typeof createProvider>
): Promise<void> {
  const spinner = ora('Finding all possible routes...').start()
  const allRoutes = await findAllRoutesForTokens(mento, fromAddress, toAddress)

  if (allRoutes.length === 0) {
    spinner.fail('No routes found')
    console.error(`No routes found between ${args.from} and ${args.to}`)
    process.exit(1)
  }

  spinner.stop()

  // Route to appropriate handler based on whether quotes are requested
  if (args.amount) {
    await handleAllRoutesWithQuotes(
      args,
      allRoutes,
      fromAddress,
      toAddress,
      allPairs,
      mento,
      provider
    )
  } else {
    handleAllRoutesWithoutQuotes(args, allRoutes, allPairs)
  }
}

/**
 * Handles displaying the optimal route WITH a quote calculation.
 * Shows the best route with actual output amount and detailed information.
 */
async function handleOptimalRouteWithQuote(
  args: ReturnType<typeof parseCommandLineArgs>,
  tradablePair: Awaited<
    ReturnType<Awaited<ReturnType<typeof Mento.create>>['findPairForTokens']>
  >,
  fromAddress: string,
  toAddress: string,
  routeDisplay: string,
  routeType: string,
  spread: number,
  allPairs: Awaited<
    ReturnType<
      Awaited<ReturnType<typeof Mento.create>>['getTradablePairsWithPath']
    >
  >,
  mento: Mento,
  provider: ReturnType<typeof createProvider>
): Promise<void> {
  // Get token decimals for proper formatting
  const [fromDecimals, toDecimals] = await Promise.all([
    getTokenDecimals(fromAddress, provider),
    getTokenDecimals(toAddress, provider),
  ])

  const amountIn = parseUnits(args.amount!, fromDecimals)

  try {
    // Calculate the quote for the optimal route
    const result = await calculateSingleQuote(
      mento,
      tradablePair,
      fromAddress,
      toAddress,
      amountIn
    )

    if (result.successful) {
      const outputAmount = roundToMaxDecimals(
        formatUnits(result.outputAmount, toDecimals)
      )
      displayOptimalRoute(
        routeDisplay,
        routeType,
        spread,
        outputAmount,
        args.to
      )
    } else {
      displayOptimalRoute(
        routeDisplay,
        routeType,
        spread,
        undefined,
        undefined,
        true
      )
    }
  } catch {
    // Handle any unexpected errors during quote calculation
    displayOptimalRoute(
      routeDisplay,
      routeType,
      spread,
      undefined,
      undefined,
      true
    )
  }

  // Show detailed route information if verbose mode is enabled
  if (args.verbose) {
    console.log()
    displayRouteDetails(tradablePair, 0, true)
  }
}

/**
 * Main handler for optimal route display (default behavior when --all is not used).
 * Shows only the best route, with or without quotes based on amount parameter.
 */
async function handleOptimalRoute(
  args: ReturnType<typeof parseCommandLineArgs>,
  fromAddress: string,
  toAddress: string,
  allPairs: Awaited<
    ReturnType<
      Awaited<ReturnType<typeof Mento.create>>['getTradablePairsWithPath']
    >
  >,
  mento: Mento,
  provider: ReturnType<typeof createProvider>
): Promise<void> {
  const spinner = ora('Finding optimal route...').start()
  const tradablePair = await mento.findPairForTokens(fromAddress, toAddress)
  spinner.stop()

  // Build display information for the optimal route
  const routeDisplay = buildRouteDisplay(
    tradablePair,
    args.from,
    args.to,
    allPairs
  )
  const spread = calculateCompoundSpread(tradablePair, allPairs)
  const routeType =
    tradablePair.path.length === 1
      ? 'Direct'
      : `${tradablePair.path.length}-hop`

  // Route to appropriate handler based on whether quotes are requested
  if (args.amount) {
    await handleOptimalRouteWithQuote(
      args,
      tradablePair,
      fromAddress,
      toAddress,
      routeDisplay,
      routeType,
      spread,
      allPairs,
      mento,
      provider
    )
  } else {
    displayOptimalRoute(routeDisplay, routeType, spread)

    if (args.verbose) {
      console.log()
      displayRouteDetails(tradablePair, 0, true)
    }
  }
}

/**
 * Main entry point for the quotes tool.
 * Orchestrates the entire flow from CLI parsing to result display.
 */
async function main(): Promise<void> {
  const args = parseCommandLineArgs()
  const provider = createProvider(args.chainId!)

  try {
    // Initialize Mento SDK and get trading pairs data
    const mento = await Mento.create(provider)
    const allPairs = await mento.getTradablePairsWithPath()

    // Validate and resolve token symbols to addresses
    const { fromAddress, toAddress } = validateTokens(
      allPairs,
      args.from,
      args.to
    )

    // Display header with swap information
    const chainName = CHAIN_NAMES[args.chainId!]
    displayHeader(args.from, args.to, chainName, args.amount)

    // Route to appropriate handler based on --all flag
    if (args.all) {
      await handleAllRoutes(
        args,
        fromAddress,
        toAddress,
        allPairs,
        mento,
        provider
      )
    } else {
      await handleOptimalRoute(
        args,
        fromAddress,
        toAddress,
        allPairs,
        mento,
        provider
      )
    }
  } catch (error) {
    console.error(
      `Error: ${error instanceof Error ? error.message : String(error)}`
    )
    process.exit(1)
  } finally {
    // Clean up provider resources
    cleanupProvider(provider)
  }
}

// Start the application with error handling
main().catch((error) => {
  console.error('Error:', error)
  process.exit(1)
})
