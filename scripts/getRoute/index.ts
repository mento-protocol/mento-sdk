import { providers } from 'ethers'
import yargsParser from 'yargs-parser'
import { Asset, Mento, TradablePair } from '../../src/mento'

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
}

function parseCommandLineArgs(): RouteArgs {
  const argv = yargsParser(process.argv.slice(2), {
    string: ['from', 'to', 'chainId', 'chain'],
    alias: {
      f: 'from',
      t: 'to',
      c: 'chain', // Changed to map to chain instead of chainId
    },
    default: {
      chainId: '42220', // Default to Celo mainnet
    },
  })

  if (!argv.from || !argv.to) {
    console.error(
      `${colors.red}Usage: ts-node getRoute.ts --from <tokenSymbol> --to <tokenSymbol> [--chain <chainName>|--chainId <chainId>]${colors.reset}`
    )
    console.error(
      `${colors.yellow}Example: ts-node getRoute.ts --from cUSD --to USDC --chain celo${colors.reset}`
    )
    console.error(
      `${colors.yellow}Example: ts-node getRoute.ts --from cUSD --to USDC --chain alfajores${colors.reset}`
    )
    console.error(
      `${colors.blue}Available chains: celo, alfajores${colors.reset}`
    )
    console.error(
      `${colors.blue}Available chain IDs: 42220 (Celo), 44787 (Alfajores)${colors.reset}`
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
  }
}

function findTokenBySymbol(
  pairs: readonly TradablePair[],
  symbol: string
): string | null {
  for (const pair of pairs) {
    for (const asset of pair.assets) {
      if (asset.symbol.toLowerCase() === symbol.toLowerCase()) {
        return asset.address
      }
    }
  }
  return null
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
  tradablePair: TradablePair,
  allPairs: readonly TradablePair[],
  routeIndex: number,
  totalRoutes: number
) {
  console.log(
    `${colors.magenta}📋 Route ${routeIndex + 1}/${totalRoutes} Details:${
      colors.reset
    }`
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
  console.log()

  try {
    // Find all possible routes between the tokens
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
      console.log(`${colors.yellow}💡 This could indicate that:${colors.reset}`)
      console.log(
        `   ${colors.gray}• No direct or routed path exists between these tokens${colors.reset}`
      )
      console.log(
        `   ${colors.gray}• The tokens are not supported on this chain${colors.reset}`
      )
      process.exit(1)
    }

    // Sort routes by path length (direct routes first, then by number of hops)
    allRoutes.sort((a, b) => a.path.length - b.path.length)

    console.log(
      `${colors.bright}${colors.green}✅ Found ${allRoutes.length} route${
        allRoutes.length > 1 ? 's' : ''
      }:${colors.reset}`
    )
    console.log()

    // Display summary of all routes
    console.log(`${colors.magenta}🛣️  Available Routes Summary:${colors.reset}`)
    allRoutes.forEach((route, index) => {
      const routeDisplay = buildRouteDisplay(
        route,
        allPairs,
        args.from,
        args.to
      )
      const routeType =
        route.path.length === 1 ? 'Direct' : `${route.path.length}-hop`
      console.log(
        `   ${colors.yellow}${index + 1}.${colors.reset} ${
          colors.white
        }${routeDisplay}${colors.reset} ${colors.dim}(${routeType})${
          colors.reset
        }`
      )
    })
    console.log()

    // Display detailed information for each route
    allRoutes.forEach((route, index) => {
      displayRouteDetails(route, allPairs, index, allRoutes.length)
    })

    // Summary statistics
    const directRoutes = allRoutes.filter((r) => r.path.length === 1)
    const multiHopRoutes = allRoutes.filter((r) => r.path.length > 1)

    console.log(`${colors.magenta}📊 Route Statistics:${colors.reset}`)
    console.log(
      `   ${colors.yellow}Total routes:${colors.reset} ${colors.cyan}${allRoutes.length}${colors.reset}`
    )
    console.log(
      `   ${colors.yellow}Direct routes:${colors.reset} ${colors.cyan}${directRoutes.length}${colors.reset}`
    )
    console.log(
      `   ${colors.yellow}Multi-hop routes:${colors.reset} ${colors.cyan}${multiHopRoutes.length}${colors.reset}`
    )

    if (multiHopRoutes.length > 0) {
      const maxHops = Math.max(...multiHopRoutes.map((r) => r.path.length))
      console.log(
        `   ${colors.yellow}Maximum hops:${colors.reset} ${colors.cyan}${maxHops}${colors.reset}`
      )
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
