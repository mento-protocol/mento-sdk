#!/usr/bin/env ts-node

/**
 * Get a clean quote for token swaps
 * Usage: yarn getQuote -f USDC -t cUSD -a 1000
 * Usage: yarn getQuote -f USDC -t cUSD -a 1000 --all  (show all routes)
 * Output: Quote amount and route information
 */

import chalk from 'chalk'
import { BigNumber, Contract, providers } from 'ethers'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import ora from 'ora'
import yargsParser from 'yargs-parser'
import { Asset, Mento, TradablePair } from '../src/mento'
import { findTokenBySymbol } from '../src/utils'
import { TradablePairWithSpread } from './cacheTradablePairs/config'

const rpcUrls: Record<number, string> = {
  42220: 'https://forno.celo.org',
  44787: 'https://alfajores-forno.celo-testnet.org',
}

interface QuoteArgs {
  from: string
  to: string
  amount: string
  chainId?: number
  chain?: string
  all?: boolean
}

interface RouteQuote {
  route: TradablePair
  outputAmount: BigNumber
  effectiveRate: number
  routeDisplay: string
  successful: boolean
  fixedSpread: number
}

function parseCommandLineArgs(): QuoteArgs {
  const argv = yargsParser(process.argv.slice(2), {
    string: ['from', 'to', 'amount', 'chainId', 'chain'],
    boolean: ['all'],
    alias: {
      f: 'from',
      t: 'to',
      a: 'amount',
      c: 'chain',
      A: 'all',
    },
    default: {
      chainId: '42220', // Default to Celo mainnet
      all: false,
    },
  })

  if (!argv.from || !argv.to || !argv.amount) {
    console.error(
      'Usage: yarn getQuote -f <fromToken> -t <toToken> -a <amount> [--chain <chainName>] [--all]'
    )
    console.error('Example: yarn getQuote -f USDC -t cUSD -a 1000')
    console.error(
      'Example: yarn getQuote -f USDC -t cUSD -a 1000 --all  (show all routes)'
    )
    process.exit(1)
  }

  // Handle USDT special character
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
            `Invalid chain name "${argv.chain}". Available chains: celo, alfajores`
          )
          process.exit(1)
      }
    }
    return Number(argv.chainId)
  }

  return {
    from: transformTokenSymbol(argv.from),
    to: transformTokenSymbol(argv.to),
    amount: argv.amount,
    chainId: getChainId(),
    chain: argv.chain,
    all: argv.all,
  }
}

/**
 * Find all possible routes between two tokens
 * Adapted from getRoute script
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

    // Skip if no intermediate token found or intermediate is same as target
    if (!intermediateToken || intermediateToken === tokenOut) continue

    // Find all pairs that connect the intermediate token to the output token
    const secondHopPairs = directPairs.filter(
      (pair) =>
        pair.path[0].assets.includes(intermediateToken) &&
        pair.path[0].assets.includes(tokenOut) &&
        // Ensure we don't go in circles - second hop shouldn't include the input token
        !pair.path[0].assets.includes(tokenIn)
    )

    for (const secondHopPair of secondHopPairs) {
      const secondHop = secondHopPair.path[0]

      // Additional safety check - skip routes that would be circular
      if (secondHop.assets.includes(tokenIn)) continue

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
 * Calculate quote for a single route with timeout
 */
async function calculateSingleQuote(
  mento: Mento,
  route: TradablePair,
  tokenIn: string,
  tokenOut: string,
  amountIn: BigNumber,
  timeoutMs = 10000
): Promise<{
  outputAmount: BigNumber
  effectiveRate: number
  successful: boolean
}> {
  const calculateQuote = async (): Promise<{
    outputAmount: BigNumber
    effectiveRate: number
    successful: boolean
  }> => {
    // Try different amounts if we get overflow errors, but limit attempts
    const testAmounts = [
      amountIn,
      amountIn.div(10), // 1/10th of the amount
      amountIn.div(100), // 1/100th of the amount
    ]

    for (const testAmount of testAmounts) {
      try {
        let outputAmount = await mento.getAmountOut(
          tokenIn,
          tokenOut,
          testAmount,
          route
        )

        // Scale back up if we used a smaller test amount
        if (!testAmount.eq(amountIn)) {
          const ratio = amountIn.div(testAmount)
          outputAmount = outputAmount.mul(ratio)
        }

        // Remove effectiveRate calculation as it causes overflow and is unused
        // (we use getFixedSpreadForRoute instead)
        return { outputAmount, effectiveRate: 0, successful: true }
      } catch (error) {
        if (!error?.toString().includes('overflow')) {
          // If it's not an overflow error, break
          break
        }
        // Otherwise, continue with smaller amount
      }
    }
    return {
      outputAmount: BigNumber.from(0),
      effectiveRate: 0,
      successful: false,
    }
  }

  // Race the calculation against a timeout
  try {
    let timeoutId: NodeJS.Timeout
    const timeoutPromise = new Promise<{
      outputAmount: BigNumber
      effectiveRate: number
      successful: boolean
    }>((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error('Timeout')), timeoutMs)
    })

    const result = await Promise.race([calculateQuote(), timeoutPromise])

    // Clear the timeout to prevent hanging
    if (timeoutId!) {
      clearTimeout(timeoutId)
    }

    return result
  } catch (error) {
    return {
      outputAmount: BigNumber.from(0),
      effectiveRate: 0,
      successful: false,
    }
  }
}

/**
 * Get the fixed spread for a route from the cached tradable pairs data
 */
function getFixedSpreadForRoute(
  route: TradablePair,
  allPairs: readonly TradablePair[] | readonly TradablePairWithSpread[]
): number {
  // Find the matching pair in the cached data that has spread information
  const matchingPair = allPairs.find((pair) => {
    // Check if it's the same route by comparing path structure
    if (pair.path.length !== route.path.length) return false

    // Check if all hops match
    return route.path.every((hop, index) => {
      const pairHop = pair.path[index]
      return (
        hop.id === pairHop.id &&
        hop.providerAddr === pairHop.providerAddr &&
        hop.assets[0] === pairHop.assets[0] &&
        hop.assets[1] === pairHop.assets[1]
      )
    })
  })

  // If we found a matching pair with spread data, use it
  if (
    matchingPair &&
    'spreadData' in matchingPair &&
    matchingPair.spreadData &&
    typeof matchingPair.spreadData === 'object' &&
    'totalSpreadPercent' in matchingPair.spreadData
  ) {
    return (matchingPair.spreadData as { totalSpreadPercent: number })
      .totalSpreadPercent
  }

  // Fallback: estimate spread based on path length (this should rarely happen with cached data)
  return route.path.length * 0.25 // 0.25% per hop as fallback
}

/**
 * Calculate quotes for all routes with parallelization and progress tracking
 */
async function calculateQuotesForAllRoutes(
  mento: Mento,
  routes: TradablePair[],
  tokenIn: string,
  tokenOut: string,
  amountIn: BigNumber,
  fromSymbol: string,
  toSymbol: string,
  allPairs: readonly TradablePair[] | readonly TradablePairWithSpread[]
): Promise<RouteQuote[]> {
  const spinner = ora('Calculating quotes for all routes...').start()

  try {
    // Limit the number of routes to avoid excessive computation
    const limitedRoutes = routes.slice(0, 10) // Limit to first 10 routes

    if (routes.length > 10) {
      spinner.text = `Calculating quotes for ${limitedRoutes.length} routes (limited from ${routes.length} total)...`
    }

    // Process routes in batches to avoid overwhelming the RPC
    const batchSize = 10
    const routeQuotes: RouteQuote[] = []

    for (let i = 0; i < limitedRoutes.length; i += batchSize) {
      const batch = limitedRoutes.slice(i, i + batchSize)
      const batchNumber = Math.floor(i / batchSize) + 1
      const totalBatches = Math.ceil(limitedRoutes.length / batchSize)

      spinner.text = `Processing batch ${batchNumber}/${totalBatches}...`

      // Process batch in parallel
      const batchPromises = batch.map(async (route) => {
        const result = await calculateSingleQuote(
          mento,
          route,
          tokenIn,
          tokenOut,
          amountIn
        )
        const routeDisplay = buildRouteDisplaySync(
          route,
          fromSymbol,
          toSymbol,
          allPairs
        )

        // Use fixed spread from cached data instead of calculating from effective rate
        const fixedSpread = getFixedSpreadForRoute(route, allPairs)

        return {
          route,
          outputAmount: result.outputAmount,
          effectiveRate: result.effectiveRate, // Keep for potential future use
          routeDisplay,
          successful: result.successful,
          fixedSpread, // Add the fixed spread to the result
        }
      })

      const batchResults = await Promise.all(batchPromises)
      routeQuotes.push(...batchResults)

      // Small delay between batches to be nice to the RPC
      if (i + batchSize < limitedRoutes.length) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
    }

    // Sort by fixed spread (lowest first = best route)
    routeQuotes.sort((a, b) => {
      if (!a.successful && !b.successful) return 0
      if (!a.successful) return 1
      if (!b.successful) return -1
      return a.fixedSpread - b.fixedSpread // Lower spread is better
    })

    spinner.succeed(
      `Found quotes for ${routeQuotes.filter((q) => q.successful).length}/${
        routeQuotes.length
      } routes`
    )
    return routeQuotes
  } catch (error) {
    spinner.fail('Failed to calculate quotes')
    throw error
  }
}

/**
 * Get token decimals from contract
 */
async function getTokenDecimals(
  tokenAddress: string,
  provider: providers.Provider
): Promise<number> {
  try {
    const tokenContract = new Contract(
      tokenAddress,
      [
        {
          name: 'decimals',
          type: 'function',
          inputs: [],
          outputs: [{ type: 'uint8' }],
          stateMutability: 'view',
        },
      ],
      provider
    )
    return await tokenContract.decimals()
  } catch (error) {
    return 18 // Default to 18 decimals
  }
}

/**
 * Build a clean route display string (synchronous version)
 */
function buildRouteDisplaySync(
  tradablePair: TradablePair,
  fromSymbol: string,
  toSymbol: string,
  allPairs: readonly TradablePair[] | readonly TradablePairWithSpread[]
): string {
  if (tradablePair.path.length === 1) {
    return `${fromSymbol} → ${toSymbol}`
  }

  // For multi-hop routes, trace through the path to show intermediate tokens
  const routeSymbols = [fromSymbol]

  // Create a map of address to symbol for quick lookup
  const addressToSymbol = new Map<string, string>()
  allPairs.forEach((pair) => {
    pair.assets.forEach((asset: Asset) => {
      addressToSymbol.set(asset.address.toLowerCase(), asset.symbol)
    })
  })

  // Trace through each hop in the path
  for (let i = 0; i < tradablePair.path.length; i++) {
    const hop = tradablePair.path[i]

    if (i === tradablePair.path.length - 1) {
      // Last hop - destination is the target token
      routeSymbols.push(toSymbol)
    } else {
      // Intermediate hop - find the token that's not the current token
      const currentToken =
        i === 0
          ? tradablePair.assets[0].address.toLowerCase() // First hop starts with input token
          : routeSymbols[routeSymbols.length - 1] // Use the last symbol we found

      // Find the other token in this hop
      const intermediateAddress = hop.assets.find(
        (addr: string) => addr.toLowerCase() !== currentToken
      )

      if (intermediateAddress) {
        const intermediateSymbol = addressToSymbol.get(
          intermediateAddress.toLowerCase()
        )
        if (intermediateSymbol && !routeSymbols.includes(intermediateSymbol)) {
          routeSymbols.push(intermediateSymbol)
        }
      }
    }
  }

  // If we couldn't trace the full path, fall back to hop count
  if (routeSymbols.length < tradablePair.path.length + 1) {
    return `${fromSymbol} → ${toSymbol} (${tradablePair.path.length} hops)`
  }

  return routeSymbols.join(' → ')
}

/**
 * Format a quote result with colors and emojis
 */
function formatQuoteOutput(
  outputAmount: string,
  routeDisplay: string,
  spread: number,
  toSymbol: string,
  isBest = false,
  failed = false,
  rank?: number
): string {
  if (failed) {
    return `${chalk.red('❌ Failed')} ${chalk.gray('|')} ${chalk.dim(
      routeDisplay
    )} ${chalk.gray('|')} ${chalk.red('Error calculating quote')}`
  }

  const spreadFormatted = (() => {
    if (spread < 0) {
      // Negative spread means gain, always show in green
      return chalk.green(`${Math.abs(spread).toFixed(4)}% gain`)
    } else if (spread <= 0.3) {
      // Very good spread (0-0.3%), show in green
      return chalk.green(`${spread.toFixed(4)}%`)
    } else if (spread <= 1) {
      // Moderate spread (0.3-1%), show in yellow
      return chalk.yellow(`${spread.toFixed(4)}%`)
    } else {
      // Poor spread (>1%), show in red
      return chalk.red(`${spread.toFixed(4)}%`)
    }
  })()

  const bestBadge = isBest ? chalk.yellow(' 🏆 BEST') : ''

  // Assign emojis based on rank for top 3, then spread-based for others
  let emoji: string
  if (rank === 1 || isBest) {
    emoji = '🥇'
  } else if (rank === 2) {
    emoji = '🥈'
  } else if (rank === 3) {
    emoji = '🥉'
  } else {
    emoji = spread < 0.5 ? '💚' : spread < 2 ? '💛' : '🔴'
  }

  return `${emoji} ${chalk.cyan(outputAmount)} ${chalk.gray(
    toSymbol
  )} ${chalk.gray('|')} ${chalk.white(routeDisplay)} ${chalk.gray(
    '|'
  )} Spread: ${spreadFormatted}${bestBadge}`
}

/**
 * Calculate and display a single quote (unified format)
 */
async function displaySingleQuote(
  mento: Mento,
  fromAddress: string,
  toAddress: string,
  amountIn: BigNumber,
  tradablePair: TradablePair,
  fromSymbol: string,
  toSymbol: string,
  provider: providers.Provider,
  allPairs: readonly TradablePair[] | readonly TradablePairWithSpread[]
): Promise<void> {
  try {
    const amountOut = await mento.getAmountOut(
      fromAddress,
      toAddress,
      amountIn,
      tradablePair
    )
    // Get token decimals for proper calculation
    const toDecimals = await getTokenDecimals(toAddress, provider)

    const outputAmount = formatUnits(amountOut, toDecimals)
    const routeDisplay = buildRouteDisplaySync(
      tradablePair,
      fromSymbol,
      toSymbol,
      allPairs
    )

    // Use fixed spread from cached data instead of calculating from effective rate
    const spread = getFixedSpreadForRoute(tradablePair, allPairs)

    console.log('')
    console.log(chalk.bold.blue('💱 Quote:'))
    console.log(
      formatQuoteOutput(outputAmount, routeDisplay, spread, toSymbol, false)
    )
    console.log('')
  } catch (error) {
    console.log('')
    console.log(chalk.bold.blue('💱 Quote:'))
    console.log(
      formatQuoteOutput(
        '0',
        buildRouteDisplaySync(tradablePair, fromSymbol, toSymbol, allPairs),
        0,
        toSymbol,
        false,
        true
      )
    )
    console.log('')
  }
}

async function main() {
  const args = parseCommandLineArgs()
  const chainId = args.chainId!

  if (!rpcUrls[chainId]) {
    console.error(
      `Chain id ${chainId} not supported. Supported chain ids: ${Object.keys(
        rpcUrls
      ).join(', ')}`
    )
    process.exit(1)
  }

  const rpcUrl = rpcUrls[chainId]
  const provider = new providers.JsonRpcProvider(rpcUrl)

  try {
    // Create Mento instance
    const mento = await Mento.create(provider)

    // Get all tradable pairs
    const allPairs = await mento.getTradablePairsWithPath()

    // Find token addresses
    const fromAddress = findTokenBySymbol(allPairs, args.from)
    const toAddress = findTokenBySymbol(allPairs, args.to)

    if (!fromAddress) {
      console.error(`Token "${args.from}" not found`)
      process.exit(1)
    }

    if (!toAddress) {
      console.error(`Token "${args.to}" not found`)
      process.exit(1)
    }

    // Get token decimals and parse amount
    const fromDecimals = await getTokenDecimals(fromAddress, provider)
    const toDecimals = await getTokenDecimals(toAddress, provider)
    const amountIn = parseUnits(args.amount, fromDecimals)

    if (args.all) {
      // Find all routes and calculate quotes for each
      const routeSpinner = ora('Finding all possible routes...').start()
      const allRoutes = await findAllRoutesForTokens(
        mento,
        fromAddress,
        toAddress
      )

      if (allRoutes.length === 0) {
        routeSpinner.fail('No routes found')
        console.error(`No routes found between ${args.from} and ${args.to}`)
        process.exit(1)
      }

      routeSpinner.succeed(`Found ${allRoutes.length} possible routes`)

      const routeQuotes = await calculateQuotesForAllRoutes(
        mento,
        allRoutes,
        fromAddress,
        toAddress,
        amountIn,
        args.from,
        args.to,
        allPairs
      )

      // Output all routes
      console.log('')
      console.log(chalk.bold.blue('💱 All Available Routes:'))
      console.log('')

      const successfulRoutes = routeQuotes.filter((q) => q.successful)
      const failedRoutes = routeQuotes.filter((q) => !q.successful)

      successfulRoutes.forEach((quote, index) => {
        const outputAmount = formatUnits(quote.outputAmount, toDecimals)
        const spread = quote.fixedSpread // Use the fixed spread from cached data
        const isBest = index === 0
        const rank = index + 1 // Convert 0-based index to 1-based rank
        console.log(
          formatQuoteOutput(
            outputAmount,
            quote.routeDisplay,
            spread,
            args.to,
            isBest,
            false,
            rank
          )
        )
      })

      if (failedRoutes.length > 0) {
        console.log('')
        console.log(chalk.dim('Failed routes:'))
        failedRoutes.forEach((quote) => {
          console.log(
            formatQuoteOutput('0', quote.routeDisplay, 0, args.to, false, true)
          )
        })
      }

      // Summary
      console.log('')
      console.log(
        `📊 Summary: ${chalk.cyan(
          successfulRoutes.length
        )} successful, ${chalk.red(failedRoutes.length)} failed routes`
      )
      console.log('')
    } else {
      // Single best route (original behavior) - now with unified format
      const spinner = ora('Finding best route...').start()
      const tradablePair = await mento.findPairForTokens(fromAddress, toAddress)
      spinner.succeed('Found optimal route')

      await displaySingleQuote(
        mento,
        fromAddress,
        toAddress,
        amountIn,
        tradablePair,
        args.from,
        args.to,
        provider,
        allPairs
      )
    }
  } catch (error) {
    console.error(
      `Error: ${error instanceof Error ? error.message : String(error)}`
    )
    process.exit(1)
  } finally {
    // Clean up provider connections to allow process to exit cleanly
    if (provider) {
      // Remove all event listeners to prevent lingering connections
      provider.removeAllListeners()

      // For JsonRpcProvider, manually terminate any persistent connections
      if ('polling' in provider) {
        provider.polling = false
      }
    }
  }
}

main().catch((error) => {
  console.error('Error:', error)
  process.exit(1)
})
