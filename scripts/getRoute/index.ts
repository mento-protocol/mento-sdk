import { BigNumber, providers } from 'ethers'
import { formatUnits } from 'ethers/lib/utils'
import yargsParser from 'yargs-parser'
import { Asset, Mento, TradablePair } from '../../src/mento'
import { findTokenBySymbol } from '../../src/utils'

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
}

const rpcUrls: Record<number, string> = {
  42220: 'https://forno.celo.org',
  44787: 'https://alfajores-forno.celo-testnet.org',
}

interface RouteArgs {
  from: string
  to: string
  chainId?: number
  chain?: string
  mode?: 'fast' | 'accurate'
}

interface RouteWithCost extends TradablePair {
  outputAmount?: BigNumber
  effectiveRate?: number
  costRank?: number
  testAmount?: BigNumber
}

function parseCommandLineArgs(): RouteArgs {
  const argv = yargsParser(process.argv.slice(2), {
    string: ['from', 'to', 'chainId', 'chain', 'mode'],
    alias: {
      f: 'from',
      t: 'to',
      c: 'chain', // Changed to map to chain instead of chainId
      m: 'mode',
    },
    default: {
      chainId: '42220', // Default to Celo mainnet
      mode: 'fast', // Default to fast heuristic mode
    },
  })

  if (!argv.from || !argv.to) {
    console.error(
      `${colors.red}Usage: ts-node getRoute.ts --from <tokenSymbol> --to <tokenSymbol> [--chain <chainName>|--chainId <chainId>] [--mode <fast|accurate>]${colors.reset}`
    )
    console.error(
      `${colors.yellow}Example: ts-node getRoute.ts --from cUSD --to USDC --chain celo${colors.reset}`
    )
    console.error(
      `${colors.yellow}Example: ts-node getRoute.ts --from cUSD --to USDC --chain alfajores --mode accurate${colors.reset}`
    )
    console.error(
      `${colors.blue}Available chains: celo, alfajores${colors.reset}`
    )
    console.error(
      `${colors.blue}Available chain IDs: 42220 (Celo), 44787 (Alfajores)${colors.reset}`
    )
    console.error(
      `${colors.blue}Modes: fast (heuristic-based), accurate (cost simulation)${colors.reset}`
    )
    process.exit(1)
  }

  // Validate mode
  if (argv.mode && argv.mode !== 'fast' && argv.mode !== 'accurate') {
    console.error(
      `${colors.red}Invalid mode "${argv.mode}". Available modes: fast, accurate${colors.reset}`
    )
    process.exit(1)
  }

  // Handle USDT special character transformation
  const transformTokenSymbol = (symbol: string) => {
    return symbol === 'USDT' ? 'USD₮' : symbol
  }

  // Handle chain name to chainId mapping
  const getChainId = (): number => {
    if (argv.chain) {
      const chainName = argv.chain.toLowerCase()
      switch (chainName) {
        case 'celo':
          return 42220
        case 'alfajores':
          return 44787
        default:
          console.error(
            `${colors.red}Invalid chain name "${argv.chain}". Available chains: celo, alfajores${colors.reset}`
          )
          process.exit(1)
      }
    }
    return Number(argv.chainId)
  }

  return {
    from: transformTokenSymbol(argv.from),
    to: transformTokenSymbol(argv.to),
    chainId: getChainId(),
    chain: argv.chain,
    mode: (argv.mode as 'fast' | 'accurate') || 'fast',
  }
}

/**
 * Find all possible routes between two tokens
 * We need to build all routes ourselves since getTradablePairsWithPath() only returns one route per token pair
 * @param mento Mento instance
 * @param tokenIn Address of the input token
 * @param tokenOut Address of the output token
 * @returns Array of all possible TradablePair routes
 */
async function findAllRoutesForTokens(
  mento: Mento,
  tokenIn: string,
  tokenOut: string
): Promise<TradablePair[]> {
  const routes: TradablePair[] = []

  // Get direct pairs to work with
  const directPairs = await mento.getDirectPairs()

  // Find direct routes
  const directRoutes = directPairs.filter(
    (pair) =>
      pair.path.length === 1 &&
      pair.path[0].assets.includes(tokenIn) &&
      pair.path[0].assets.includes(tokenOut)
  )
  routes.push(...directRoutes)

  // Find all 2-hop routes by examining all possible intermediate tokens
  const tokenInDirectPairs = directPairs.filter((pair) =>
    pair.path[0].assets.includes(tokenIn)
  )

  for (const firstHopPair of tokenInDirectPairs) {
    // Find the intermediate token (the other token in the first hop)
    const firstHop = firstHopPair.path[0]
    const intermediateToken = firstHop.assets.find((addr) => addr !== tokenIn)

    if (!intermediateToken) continue

    // Find all pairs that connect the intermediate token to the output token
    const secondHopPairs = directPairs.filter(
      (pair) =>
        pair.path[0].assets.includes(intermediateToken) &&
        pair.path[0].assets.includes(tokenOut)
    )

    for (const secondHopPair of secondHopPairs) {
      const secondHop = secondHopPair.path[0]

      // Create a 2-hop route
      const route: TradablePair = {
        id: `${firstHopPair.assets[0].symbol}-${
          firstHopPair.assets[1].symbol
        }-via-${
          firstHopPair.assets.find((a) => a.address === intermediateToken)
            ?.symbol
        }-${secondHopPair.assets[0].symbol}-${secondHopPair.assets[1].symbol}`,
        assets: [
          firstHopPair.assets.find((a) => a.address === tokenIn)!,
          secondHopPair.assets.find((a) => a.address === tokenOut)!,
        ] as [Asset, Asset],
        path: [firstHop, secondHop],
      }

      // Check if this route already exists (avoid duplicates)
      const routeExists = routes.some(
        (existing) =>
          existing.path.length === 2 &&
          existing.path[0].id === firstHop.id &&
          existing.path[1].id === secondHop.id
      )

      if (!routeExists) {
        routes.push(route)
      }
    }
  }

  return routes
}

/**
 * Build route display string for a tradable pair
 */
function buildRouteDisplay(
  tradablePair: TradablePair,
  allPairs: readonly TradablePair[],
  fromSymbol: string,
  toSymbol: string
): string {
  let routeDisplay = fromSymbol

  if (tradablePair.path.length > 1) {
    // Multi-hop route - show intermediate tokens
    const intermediateTokens = new Set<string>()

    // For multi-hop, we need to trace through the path to find intermediate tokens
    for (let i = 0; i < tradablePair.path.length - 1; i++) {
      const currentHop = tradablePair.path[i]
      const nextHop = tradablePair.path[i + 1]

      // Find the common token between current and next hop
      const commonAsset = currentHop.assets.find((asset) =>
        nextHop.assets.includes(asset)
      )

      if (commonAsset) {
        const tokenSymbol =
          allPairs
            .find((p) => p.assets.some((a) => a.address === commonAsset))
            ?.assets.find((a) => a.address === commonAsset)?.symbol ||
          commonAsset.slice(0, 8) + '...'
        intermediateTokens.add(tokenSymbol)
      }
    }

    // Add intermediate tokens to route display
    intermediateTokens.forEach((token) => {
      routeDisplay += ` => ${token}`
    })
  }
  routeDisplay += ` => ${toSymbol}`

  return routeDisplay
}

/**
 * Display detailed information about a route
 */
function displayRouteDetails(
  tradablePair: TradablePair | RouteWithCost,
  allPairs: readonly TradablePair[],
  routeIndex: number,
  totalRoutes: number,
  isOptimal = false
) {
  const routeWithCost = tradablePair as RouteWithCost // Type assertion for optional properties

  const rankingBadge = isOptimal
    ? `${colors.green}🏆 OPTIMAL${colors.reset}`
    : routeWithCost.costRank
    ? `${colors.yellow}#${routeWithCost.costRank}${colors.reset}`
    : `${colors.gray}N/A${colors.reset}`

  console.log(
    `${colors.magenta}📋 Route ${
      routeIndex + 1
    }/${totalRoutes} ${rankingBadge} Details:${colors.reset}`
  )
  console.log(
    `   ${colors.yellow}Pair ID:${colors.reset} ${colors.cyan}${tradablePair.id}${colors.reset}`
  )
  console.log(
    `   ${colors.yellow}Assets:${colors.reset} ${tradablePair.assets
      .map(
        (a) =>
          `${colors.cyan}${a.symbol}${colors.gray} (${a.address})${colors.reset}`
      )
      .join(` ${colors.magenta}↔${colors.reset} `)}`
  )

  if (tradablePair.path.length === 1) {
    console.log(`   ${colors.green}🔄 Direct swap (single hop)${colors.reset}`)
  } else {
    console.log(
      `   ${colors.yellow}🔄 Multi-hop route (${tradablePair.path.length} hops)${colors.reset}`
    )
  }

  // Display cost metrics if available
  if (routeWithCost.effectiveRate !== undefined) {
    console.log(
      `   ${colors.yellow}💸 Effective Rate:${colors.reset} ${
        colors.cyan
      }${routeWithCost.effectiveRate.toFixed(6)}${colors.reset} ${
        colors.gray
      }(output/input ratio)${colors.reset}`
    )
    console.log(
      `   ${colors.yellow}📈 Spread:${colors.reset} ${colors.cyan}${(
        (1 - routeWithCost.effectiveRate) *
        100
      ).toFixed(2)}%${colors.reset}`
    )
  }

  if (routeWithCost.outputAmount && routeWithCost.testAmount) {
    const testAmountFormatted = formatUnits(routeWithCost.testAmount, 18)
    const outputAmountFormatted = formatUnits(routeWithCost.outputAmount, 18)
    console.log(
      `   ${colors.yellow}📊 Test Results:${colors.reset} ${
        colors.cyan
      }${parseFloat(testAmountFormatted).toFixed(6)}${colors.reset} input → ${
        colors.cyan
      }${parseFloat(outputAmountFormatted).toFixed(6)}${colors.reset} output`
    )
  }

  tradablePair.path.forEach((hop, index) => {
    console.log(`   ${colors.blue}Step ${index + 1}:${colors.reset}`)
    console.log(
      `     ${colors.yellow}Provider:${colors.reset} ${colors.gray}${hop.providerAddr}${colors.reset}`
    )
    console.log(
      `     ${colors.yellow}Exchange ID:${colors.reset} ${colors.gray}${hop.id}${colors.reset}`
    )
    console.log(
      `     ${colors.yellow}Assets:${colors.reset} ${colors.gray}${hop.assets[0]} → ${hop.assets[1]}${colors.reset}`
    )

    // Try to find token symbols for the hop assets
    const asset1Symbol =
      allPairs
        .find((p) => p.assets.some((a) => a.address === hop.assets[0]))
        ?.assets.find((a) => a.address === hop.assets[0])?.symbol ||
      hop.assets[0].slice(0, 8) + '...'

    const asset2Symbol =
      allPairs
        .find((p) => p.assets.some((a) => a.address === hop.assets[1]))
        ?.assets.find((a) => a.address === hop.assets[1])?.symbol ||
      hop.assets[1].slice(0, 8) + '...'

    console.log(
      `     ${colors.yellow}Symbols:${colors.reset} ${colors.cyan}${asset1Symbol}${colors.reset} ${colors.magenta}→${colors.reset} ${colors.cyan}${asset2Symbol}${colors.reset}`
    )
  })
  console.log()
}

/**
 * Calculate the cost/efficiency of routes by comparing output amounts
 * @param mento Mento instance
 * @param routes Array of routes to evaluate
 * @param tokenIn Input token address
 * @param tokenOut Output token address
 * @param testAmount Amount to use for testing (default: 1 token)
 * @returns Routes with cost information added
 */
async function calculateRouteCosts(
  mento: Mento,
  routes: TradablePair[],
  tokenIn: string,
  tokenOut: string,
  testAmount: BigNumber = BigNumber.from('1000000000000000000') // 1 token with 18 decimals
): Promise<RouteWithCost[]> {
  const routesWithCost: RouteWithCost[] = []

  console.log(`${colors.blue}💰 Calculating route costs...${colors.reset}`)
  console.log()

  // Try different test amounts if we get overflow errors
  const testAmounts = [
    testAmount,
    BigNumber.from('100000000000000000'), // 0.1 token
    BigNumber.from('10000000000000000'), // 0.01 token
    BigNumber.from('1000000000000000'), // 0.001 token
  ]

  for (const route of routes) {
    let success = false
    let outputAmount: BigNumber | undefined
    let effectiveRate: number | undefined
    let usedTestAmount: BigNumber = testAmount

    // Try with different amounts if we get overflow
    for (const amount of testAmounts) {
      try {
        // Calculate output amount for this route
        outputAmount = await mento.getAmountOut(
          tokenIn,
          tokenOut,
          amount,
          route
        )

        // Calculate effective exchange rate (output/input)
        effectiveRate =
          outputAmount.mul(1000000).div(amount).toNumber() / 1000000
        usedTestAmount = amount
        success = true
        break
      } catch (error) {
        if (!error?.toString().includes('overflow')) {
          // If it's not an overflow error, log it and break
          console.warn(
            `${colors.yellow}⚠️  Could not calculate cost for route ${
              route.id
            }: ${error instanceof Error ? error.message : String(error)}${
              colors.reset
            }`
          )
          break
        }
        // Otherwise, continue with smaller amount
      }
    }

    if (!success) {
      console.warn(
        `${colors.yellow}⚠️  Could not calculate cost for route ${route.id} - all test amounts failed${colors.reset}`
      )
    }

    routesWithCost.push({
      ...route,
      outputAmount,
      effectiveRate,
      testAmount: success ? usedTestAmount : undefined,
    })
  }

  // Sort by effective rate (highest first = best route)
  routesWithCost.sort((a, b) => {
    if (!a.effectiveRate && !b.effectiveRate) return 0
    if (!a.effectiveRate) return 1
    if (!b.effectiveRate) return -1
    return b.effectiveRate - a.effectiveRate
  })

  // Add cost ranking
  let rank = 1
  routesWithCost.forEach((route) => {
    if (route.effectiveRate) {
      route.costRank = rank++
    }
  })

  return routesWithCost
}

async function main() {
  const args = parseCommandLineArgs()
  const chainId = args.chainId!

  if (!rpcUrls[chainId]) {
    console.error(
      `${
        colors.red
      }Chain id ${chainId} not supported. Supported chain ids: ${Object.keys(
        rpcUrls
      ).join(', ')}${colors.reset}`
    )
    process.exit(1)
  }

  const rpcUrl = rpcUrls[chainId]
  const provider = new providers.JsonRpcProvider(rpcUrl)

  // Create a Mento instance using the provider
  const mento = await Mento.create(provider)

  // Optional: verify that the provider's network matches the requested chain id.
  const network = await provider.getNetwork()
  if (network.chainId !== chainId) {
    console.warn(
      `${colors.yellow}⚠️  Warning: provider network chain id (${network.chainId}) does not match requested chain id (${chainId})${colors.reset}`
    )
  }

  // Get all tradable pairs to find token addresses
  const allPairs = await mento.getTradablePairsWithPath()

  // Find token addresses by symbols
  const fromAddress = findTokenBySymbol(allPairs, args.from)
  const toAddress = findTokenBySymbol(allPairs, args.to)

  if (!fromAddress) {
    console.error(
      `${colors.red}Token symbol "${args.from}" not found on chain ${chainId}${colors.reset}`
    )
    console.log(`${colors.cyan}Available tokens:${colors.reset}`)
    const uniqueTokens = new Set<string>()
    allPairs.forEach((pair) => {
      pair.assets.forEach((asset) => uniqueTokens.add(asset.symbol))
    })
    console.log(
      `${colors.gray}${[...uniqueTokens].sort().join(', ')}${colors.reset}`
    )
    process.exit(1)
  }

  if (!toAddress) {
    console.error(
      `${colors.red}Token symbol "${args.to}" not found on chain ${chainId}${colors.reset}`
    )
    console.log(`${colors.cyan}Available tokens:${colors.reset}`)
    const uniqueTokens = new Set<string>()
    allPairs.forEach((pair) => {
      pair.assets.forEach((asset) => uniqueTokens.add(asset.symbol))
    })
    console.log(
      `${colors.gray}${[...uniqueTokens].sort().join(', ')}${colors.reset}`
    )
    process.exit(1)
  }

  console.log(
    `${colors.blue}🔍 Finding all routes for ${colors.cyan}${args.from}${colors.blue} → ${colors.cyan}${args.to}${colors.blue} on chain ${colors.yellow}${chainId}${colors.reset}`
  )
  console.log(
    `${colors.blue}📍 From: ${colors.cyan}${args.from}${colors.gray} (${fromAddress})${colors.reset}`
  )
  console.log(
    `${colors.blue}📍 To: ${colors.cyan}${args.to}${colors.gray} (${toAddress})${colors.reset}`
  )
  console.log(
    `${colors.blue}🚀 Mode: ${colors.cyan}${
      args.mode === 'accurate'
        ? 'Accurate (all routes with simulation)'
        : 'Fast (spread-based from pool configs)'
    }${colors.reset}`
  )
  console.log()

  try {
    if (args.mode === 'fast') {
      // Fast mode: Use the SDK's heuristic-based route selection
      const tradablePair = await mento.findPairForTokens(fromAddress, toAddress)

      console.log(
        `${colors.bright}${colors.green}✅ Optimal route found (spread-based):${colors.reset}`
      )
      console.log()

      const routeDisplay = buildRouteDisplay(
        tradablePair,
        allPairs,
        args.from,
        args.to
      )
      const routeType =
        tradablePair.path.length === 1
          ? 'Direct'
          : `${tradablePair.path.length}-hop`

      console.log(
        `   ${colors.green}[SELECTED]${colors.reset} ${colors.white}${routeDisplay}${colors.reset} ${colors.dim}(${routeType})${colors.reset}`
      )
      console.log()

      // Show route details
      displayRouteDetails(tradablePair, allPairs, 0, 1, true)

      // Quick cost estimate for the selected route
      console.log(
        `${colors.magenta}💰 Route spread information:${colors.reset}`
      )

      // Check if the route has spread data
      const routeWithSpread = tradablePair as any
      if (routeWithSpread.spreadData) {
        console.log(
          `   ${colors.yellow}Total Spread:${colors.reset} ${
            colors.cyan
          }${routeWithSpread.spreadData.totalSpreadPercent.toFixed(2)}%${
            colors.reset
          } ${colors.green}(from pool configurations)${colors.reset}`
        )
        if (routeWithSpread.spreadData.hops) {
          routeWithSpread.spreadData.hops.forEach((hop: any, idx: number) => {
            console.log(
              `   ${colors.gray}Hop ${idx + 1}: ${hop.spreadPercent.toFixed(
                2
              )}% (${hop.exchangeId.substring(0, 8)}...)${colors.reset}`
            )
          })
        }
      } else {
        // Fallback to simulation if no spread data
        try {
          const testAmount = BigNumber.from('1000000000000000000') // 1 token
          const outputAmount = await mento.getAmountOut(
            fromAddress,
            toAddress,
            testAmount,
            tradablePair
          )
          const effectiveRate =
            outputAmount.mul(1000000).div(testAmount).toNumber() / 1000000
          const spread = (1 - effectiveRate) * 100

          console.log(
            `   ${colors.yellow}Effective Rate:${colors.reset} ${
              colors.cyan
            }${effectiveRate.toFixed(6)}${colors.reset}`
          )
          console.log(
            `   ${colors.yellow}Estimated Spread:${colors.reset} ${
              colors.cyan
            }${spread.toFixed(2)}%${colors.reset} ${colors.gray}(simulated)${
              colors.reset
            }`
          )
        } catch (error) {
          console.log(
            `   ${colors.gray}Could not estimate spread${colors.reset}`
          )
        }
      }
    } else {
      // Accurate mode: Find all routes and calculate costs
      const allRoutes = await findAllRoutesForTokens(
        mento,
        fromAddress,
        toAddress
      )

      if (allRoutes.length === 0) {
        console.error(
          `${colors.red}❌ No routes found between ${args.from} and ${args.to}${colors.reset}`
        )
        console.log()
        console.log(
          `${colors.yellow}💡 This could indicate that:${colors.reset}`
        )
        console.log(
          `   ${colors.gray}• No direct or routed path exists between these tokens${colors.reset}`
        )
        console.log(
          `   ${colors.gray}• The tokens are not supported on this chain${colors.reset}`
        )
        process.exit(1)
      }

      // Calculate costs for all routes
      const routesWithCost = await calculateRouteCosts(
        mento,
        allRoutes,
        fromAddress,
        toAddress
      )

      console.log(
        `${colors.bright}${colors.green}✅ Found ${
          routesWithCost.length
        } route${routesWithCost.length > 1 ? 's' : ''}:${colors.reset}`
      )
      console.log()

      // Display summary of all routes sorted by cost
      console.log(
        `${colors.magenta}🛣️  Routes Ranked by Cost Efficiency:${colors.reset}`
      )
      routesWithCost.forEach((route, index) => {
        const routeDisplay = buildRouteDisplay(
          route,
          allPairs,
          args.from,
          args.to
        )
        const routeType =
          route.path.length === 1 ? 'Direct' : `${route.path.length}-hop`

        const isOptimal = index === 0 && route.effectiveRate !== undefined
        const rankDisplay = isOptimal
          ? `${colors.green}[BEST]${colors.reset}`
          : route.costRank
          ? `${colors.yellow}[#${route.costRank}]${colors.reset}`
          : `${colors.gray}[N/A]${colors.reset}`

        console.log(
          `   ${rankDisplay} ${colors.white}${routeDisplay}${colors.reset} ${colors.dim}(${routeType})${colors.reset}`
        )

        if (route.effectiveRate !== undefined) {
          console.log(
            `       ${colors.gray}Rate: ${route.effectiveRate.toFixed(6)} | ` +
              `Spread: ${((1 - route.effectiveRate) * 100).toFixed(2)}%${
                colors.reset
              }`
          )
        }
      })
      console.log()

      // Display detailed information for each route
      routesWithCost.forEach((route, index) => {
        const isOptimal = index === 0 && route.effectiveRate !== undefined
        displayRouteDetails(
          route,
          allPairs,
          index,
          routesWithCost.length,
          isOptimal
        )
      })

      // Summary statistics
      const directRoutes = routesWithCost.filter((r) => r.path.length === 1)
      const multiHopRoutes = routesWithCost.filter((r) => r.path.length > 1)
      const routesWithPricing = routesWithCost.filter(
        (r) => r.effectiveRate !== undefined
      )

      console.log(`${colors.magenta}📊 Route Statistics:${colors.reset}`)
      console.log(
        `   ${colors.yellow}Total routes:${colors.reset} ${colors.cyan}${routesWithCost.length}${colors.reset}`
      )
      console.log(
        `   ${colors.yellow}Direct routes:${colors.reset} ${colors.cyan}${directRoutes.length}${colors.reset}`
      )
      console.log(
        `   ${colors.yellow}Multi-hop routes:${colors.reset} ${colors.cyan}${multiHopRoutes.length}${colors.reset}`
      )
      console.log(
        `   ${colors.yellow}Routes with pricing:${colors.reset} ${colors.cyan}${routesWithPricing.length}${colors.reset}`
      )

      if (multiHopRoutes.length > 0) {
        const maxHops = Math.max(...multiHopRoutes.map((r) => r.path.length))
        console.log(
          `   ${colors.yellow}Maximum hops:${colors.reset} ${colors.cyan}${maxHops}${colors.reset}`
        )
      }

      // Highlight the optimal route
      if (
        routesWithPricing.length > 0 &&
        routesWithCost[0].effectiveRate !== undefined
      ) {
        console.log()
        console.log(
          `${colors.bright}${colors.green}🏆 Recommended Route:${colors.reset}`
        )
        const optimalRoute = routesWithCost[0]
        const routeDisplay = buildRouteDisplay(
          optimalRoute,
          allPairs,
          args.from,
          args.to
        )
        console.log(`   ${colors.white}${routeDisplay}${colors.reset}`)
        console.log(
          `   ${colors.gray}This route offers the best exchange rate with ` +
            `${((1 - optimalRoute.effectiveRate!) * 100).toFixed(2)}% spread${
              colors.reset
            }`
        )
      }
    }
  } catch (error) {
    console.error(
      `${colors.red}❌ ${
        error instanceof Error ? error.message : String(error)
      }${colors.reset}`
    )
    console.log()
    console.log(`${colors.yellow}💡 This could indicate that:${colors.reset}`)
    console.log(
      `   ${colors.gray}• No direct or routed path exists between these tokens${colors.reset}`
    )
    console.log(
      `   ${colors.gray}• There was an error fetching route information${colors.reset}`
    )
    console.log(
      `   ${colors.gray}• The tokens are not supported on this chain${colors.reset}`
    )
    process.exit(1)
  }
}

main().catch((error) => {
  console.error('Error:', error)
  process.exit(1)
})
