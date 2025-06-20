#!/usr/bin/env ts-node

/**
 * Unified swap information tool - combines route discovery and quote calculation
 *
 * Usage Examples:
 * - Basic route info: yarn swapInfo -f USDC -t cUSD
 * - With quote amount: yarn swapInfo -f USDC -t cUSD -a 1000
 * - All routes: yarn swapInfo -f USDC -t cUSD --all
 * - All routes with quotes: yarn swapInfo -f USDC -t cUSD -a 1000 --all
 * - Verbose details: yarn swapInfo -f USDC -t cUSD --verbose
 */

import chalk from 'chalk'
import { BigNumber, Contract, providers } from 'ethers'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import ora from 'ora'
import yargsParser from 'yargs-parser'
import { Asset, Mento, TradablePair } from '../../src/mento'
import { findTokenBySymbol } from '../../src/utils'
import { TradablePairWithSpread } from '../cacheTradablePairs/config'

interface SwapInfoArgs {
  from: string
  to: string
  amount?: string
  chainId?: number
  chain?: string
  all?: boolean
  verbose?: boolean
}

interface RouteQuote {
  route: TradablePair
  outputAmount?: BigNumber
  effectiveRate?: number
  routeDisplay: string
  successful: boolean
  fixedSpread: number
  costRank?: number
}

const rpcUrls: Record<number, string> = {
  42220: 'https://forno.celo.org',
  44787: 'https://alfajores-forno.celo-testnet.org',
}

function roundToMaxDecimals(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return Number(num.toFixed(4)).toString()
}

function parseCommandLineArgs(): SwapInfoArgs {
  const argv = yargsParser(process.argv.slice(2), {
    string: ['from', 'to', 'amount', 'chainId', 'chain'],
    boolean: ['all', 'verbose'],
    alias: {
      f: 'from',
      t: 'to',
      a: 'amount',
      c: 'chain',
      A: 'all',
      v: 'verbose',
    },
    default: {
      chainId: '42220',
      all: false,
      verbose: false,
    },
  })

  if (!argv.from || !argv.to) {
    console.error('Usage: yarn swapInfo -f <fromToken> -t <toToken> [options]')
    console.error('')
    console.error('Options:')
    console.error(
      '  -a, --amount <amount>    Input amount for quote calculation'
    )
    console.error('  -c, --chain <chain>      Chain name (celo, alfajores)')
    console.error('  -A, --all               Show all available routes')
    console.error('  -v, --verbose           Show detailed route information')
    console.error('')
    console.error('Examples:')
    console.error(
      '  yarn swapInfo -f USDC -t cUSD                    # Basic route info'
    )
    console.error(
      '  yarn swapInfo -f USDC -t cUSD -a 1000           # Quote for 1000 USDC'
    )
    console.error(
      '  yarn swapInfo -f USDC -t cUSD --all             # All routes'
    )
    console.error(
      '  yarn swapInfo -f USDC -t cUSD -a 1000 --all     # All routes with quotes'
    )

    console.error(
      '  yarn swapInfo -f USDC -t cUSD --verbose         # Detailed info'
    )
    process.exit(1)
  }

  const transformTokenSymbol = (symbol: string) => {
    return symbol === 'USDT' ? 'USD₮' : symbol
  }

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
    verbose: argv.verbose,
  }
}

/**
 * Find all possible routes between two tokens
 */
async function findAllRoutesForTokens(
  mento: Mento,
  tokenIn: string,
  tokenOut: string
): Promise<TradablePair[]> {
  const routes: TradablePair[] = []
  const directPairs = await mento.getDirectPairs()

  // Find direct routes
  const directRoutes = directPairs.filter(
    (pair) =>
      pair.path.length === 1 &&
      pair.path[0].assets.includes(tokenIn) &&
      pair.path[0].assets.includes(tokenOut)
  )
  routes.push(...directRoutes)

  // Find 2-hop routes
  const tokenInDirectPairs = directPairs.filter((pair) =>
    pair.path[0].assets.includes(tokenIn)
  )

  for (const firstHopPair of tokenInDirectPairs) {
    const firstHop = firstHopPair.path[0]
    const intermediateToken = firstHop.assets.find((addr) => addr !== tokenIn)

    if (!intermediateToken || intermediateToken === tokenOut) continue

    const secondHopPairs = directPairs.filter(
      (pair) =>
        pair.path[0].assets.includes(intermediateToken) &&
        pair.path[0].assets.includes(tokenOut) &&
        !pair.path[0].assets.includes(tokenIn)
    )

    for (const secondHopPair of secondHopPairs) {
      const secondHop = secondHopPair.path[0]
      if (secondHop.assets.includes(tokenIn)) continue

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
 * Calculate compound spread for multi-hop routes
 */
function calculateCompoundSpread(
  route: TradablePair,
  allPairs: readonly TradablePair[] | readonly TradablePairWithSpread[]
): number {
  if (route.path.length === 1) {
    // For direct routes, use the cached spread data
    return getFixedSpreadForRoute(route, allPairs)
  }

  // For multi-hop routes, calculate compound spread
  let compoundRate = 1 // Start with 100% (no loss)

  for (const hop of route.path) {
    // Find the direct pair for this hop
    const directPair = allPairs.find(
      (pair) =>
        pair.path.length === 1 &&
        pair.path[0].id === hop.id &&
        pair.path[0].providerAddr === hop.providerAddr
    )

    let hopSpreadPercent = 0.25 // Default fallback

    if (directPair && 'spreadData' in directPair && directPair.spreadData) {
      const spreadData = directPair.spreadData as { totalSpreadPercent: number }
      hopSpreadPercent = spreadData.totalSpreadPercent
    }

    // Convert spread percentage to rate multiplier
    // If spread is 0.25%, rate multiplier is 0.9975 (1 - 0.0025)
    const hopRate = 1 - hopSpreadPercent / 100
    compoundRate *= hopRate
  }

  // Convert back to spread percentage
  const compoundSpreadPercent = (1 - compoundRate) * 100
  return compoundSpreadPercent
}

/**
 * Get the fixed spread for a route from cached data
 */
function getFixedSpreadForRoute(
  route: TradablePair,
  allPairs: readonly TradablePair[] | readonly TradablePairWithSpread[]
): number {
  const matchingPair = allPairs.find((pair) => {
    if (pair.path.length !== route.path.length) return false
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

  return route.path.length * 0.25 // Fallback
}

/**
 * Build route display string
 */
function buildRouteDisplay(
  tradablePair: TradablePair,
  fromSymbol: string,
  toSymbol: string,
  allPairs: readonly TradablePair[] | readonly TradablePairWithSpread[]
): string {
  if (tradablePair.path.length === 1) {
    return `${fromSymbol} → ${toSymbol}`
  }

  const routeSymbols = [fromSymbol]
  const addressToSymbol = new Map<string, string>()

  allPairs.forEach((pair) => {
    pair.assets.forEach((asset: Asset) => {
      addressToSymbol.set(asset.address.toLowerCase(), asset.symbol)
    })
  })

  for (let i = 0; i < tradablePair.path.length; i++) {
    const hop = tradablePair.path[i]

    if (i === tradablePair.path.length - 1) {
      routeSymbols.push(toSymbol)
    } else {
      const currentToken =
        i === 0
          ? tradablePair.assets[0].address.toLowerCase()
          : routeSymbols[routeSymbols.length - 1]

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

  return routeSymbols.length < tradablePair.path.length + 1
    ? `${fromSymbol} → ${toSymbol} (${tradablePair.path.length} hops)`
    : routeSymbols.join(' → ')
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
  const calculateQuote = async () => {
    const testAmounts = [amountIn, amountIn.div(10), amountIn.div(100)]

    for (const testAmount of testAmounts) {
      try {
        let outputAmount = await mento.getAmountOut(
          tokenIn,
          tokenOut,
          testAmount,
          route
        )
        if (!testAmount.eq(amountIn)) {
          const ratio = amountIn.div(testAmount)
          outputAmount = outputAmount.mul(ratio)
        }
        return { outputAmount, effectiveRate: 0, successful: true }
      } catch (error) {
        if (!error?.toString().includes('overflow')) {
          break
        }
      }
    }
    return {
      outputAmount: BigNumber.from(0),
      effectiveRate: 0,
      successful: false,
    }
  }

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
 * Get token decimals
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
    return 18
  }
}

/**
 * Display route details (verbose mode)
 */
function displayRouteDetails(
  route: TradablePair,
  allPairs: readonly TradablePair[] | readonly TradablePairWithSpread[],
  index: number,
  isOptimal = false
): void {
  const rankingBadge = isOptimal
    ? chalk.green('🏆 OPTIMAL')
    : chalk.yellow(`#${index + 1}`)

  console.log(chalk.magenta(`📋 Route ${index + 1} ${rankingBadge} Details:`))
  console.log(`   ${chalk.yellow('Pair ID:')} ${chalk.cyan(route.id)}`)
  console.log(
    `   ${chalk.yellow('Assets:')} ${route.assets
      .map((a) => `${chalk.cyan(a.symbol)} ${chalk.gray(`(${a.address})`)}`)
      .join(` ${chalk.magenta('↔')} `)}`
  )

  if (route.path.length === 1) {
    console.log(`   ${chalk.green('🔄 Direct swap (single hop)')}`)
  } else {
    console.log(
      `   ${chalk.yellow(`🔄 Multi-hop route (${route.path.length} hops)`)}`
    )
  }

  route.path.forEach((hop, hopIndex) => {
    console.log(`   ${chalk.blue(`Step ${hopIndex + 1}:`)}`)
    console.log(
      `     ${chalk.yellow('Provider:')} ${chalk.gray(hop.providerAddr)}`
    )
    console.log(`     ${chalk.yellow('Exchange ID:')} ${chalk.gray(hop.id)}`)
    console.log(
      `     ${chalk.yellow('Assets:')} ${chalk.gray(
        `${hop.assets[0]} → ${hop.assets[1]}`
      )}`
    )
  })
  console.log()
}

/**
 * Format quote output with colors
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
      return chalk.green(`${Math.abs(spread).toFixed(4)}% gain`)
    } else if (spread <= 0.3) {
      return chalk.green(`${spread.toFixed(4)}%`)
    } else if (spread <= 1) {
      return chalk.yellow(`${spread.toFixed(4)}%`)
    } else {
      return chalk.red(`${spread.toFixed(4)}%`)
    }
  })()

  const bestBadge = isBest ? chalk.yellow(' 🏆 BEST') : ''

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

  const provider = new providers.JsonRpcProvider(rpcUrls[chainId])

  try {
    const mento = await Mento.create(provider)
    const allPairs = await mento.getTradablePairsWithPath()

    const fromAddress = findTokenBySymbol(allPairs, args.from)
    const toAddress = findTokenBySymbol(allPairs, args.to)

    if (!fromAddress) {
      console.error(`Token "${args.from}" not found`)
      const uniqueTokens = new Set<string>()
      allPairs.forEach((pair) =>
        pair.assets.forEach((asset) => uniqueTokens.add(asset.symbol))
      )
      console.log(`Available tokens: ${[...uniqueTokens].sort().join(', ')}`)
      process.exit(1)
    }

    if (!toAddress) {
      console.error(`Token "${args.to}" not found`)
      const uniqueTokens = new Set<string>()
      allPairs.forEach((pair) =>
        pair.assets.forEach((asset) => uniqueTokens.add(asset.symbol))
      )
      console.log(`Available tokens: ${[...uniqueTokens].sort().join(', ')}`)
      process.exit(1)
    }

    // Parse amount if provided
    let amountIn: BigNumber | undefined
    let fromDecimals: number | undefined
    let toDecimals: number | undefined

    if (args.amount) {
      fromDecimals = await getTokenDecimals(fromAddress, provider)
      toDecimals = await getTokenDecimals(toAddress, provider)
      amountIn = parseUnits(args.amount, fromDecimals)
    }

    const chainName = chainId === 42220 ? 'Celo' : 'Alfajores'

    console.log()
    if (args.amount) {
      console.log(
        chalk.bold.blue(
          `🔍 Swap Information: ${args.amount} ${args.from} → ${args.to}`
        ) + chalk.dim(` (Chain: ${chainName})`)
      )
    } else {
      console.log(
        chalk.bold.blue(`🔍 Swap Information: ${args.from} → ${args.to}`) +
          chalk.dim(` (Chain: ${chainName}) | Route Analysis Only)`)
      )
    }

    if (args.all) {
      // Show all routes
      const spinner = ora('Finding all possible routes...').start()
      const allRoutes = await findAllRoutesForTokens(
        mento,
        fromAddress,
        toAddress
      )

      if (allRoutes.length === 0) {
        spinner.fail('No routes found')
        console.error(`No routes found between ${args.from} and ${args.to}`)
        process.exit(1)
      }

      spinner.stop()

      if (args.amount && amountIn) {
        // Calculate quotes for all routes
        const routeQuotes: RouteQuote[] = []
        const spinner2 = ora('Calculating quotes...').start()

        // Process in batches to avoid overwhelming RPC
        const batchSize = 10
        for (let i = 0; i < allRoutes.length; i += batchSize) {
          const batch = allRoutes.slice(i, i + batchSize)

          const batchPromises = batch.map(async (route) => {
            const result = await calculateSingleQuote(
              mento,
              route,
              fromAddress,
              toAddress,
              amountIn!
            )
            const routeDisplay = buildRouteDisplay(
              route,
              args.from,
              args.to,
              allPairs
            )
            const fixedSpread = calculateCompoundSpread(route, allPairs)

            return {
              route,
              outputAmount: result.outputAmount,
              effectiveRate: result.effectiveRate,
              routeDisplay,
              successful: result.successful,
              fixedSpread,
            }
          })

          const batchResults = await Promise.all(batchPromises)
          routeQuotes.push(...batchResults)

          if (i + batchSize < allRoutes.length) {
            await new Promise((resolve) => setTimeout(resolve, 100))
          }
        }

        // Sort by fixed spread (lowest first)
        routeQuotes.sort((a, b) => {
          if (!a.successful && !b.successful) return 0
          if (!a.successful) return 1
          if (!b.successful) return -1
          return a.fixedSpread - b.fixedSpread
        })

        spinner2.stop()

        console.log()
        console.log(chalk.bold('💱 All Routes with Quotes'))

        const successfulRoutes = routeQuotes.filter((q) => q.successful)

        // Calculate maximum decimal places for alignment
        const maxDecimalPlaces = Math.max(
          ...successfulRoutes.map((quote) => {
            const outputAmount = roundToMaxDecimals(
              formatUnits(quote.outputAmount!, toDecimals!)
            )
            const decimalIndex = outputAmount.indexOf('.')
            return decimalIndex === -1
              ? 0
              : outputAmount.length - decimalIndex - 1
          })
        )

        // Pre-calculate padded amounts and route display widths for alignment
        const paddedRoutes = successfulRoutes.map((quote, index) => {
          const outputAmount = roundToMaxDecimals(
            formatUnits(quote.outputAmount!, toDecimals!)
          )

          const paddedAmount = (() => {
            const decimalIndex = outputAmount.indexOf('.')
            if (decimalIndex === -1) {
              return outputAmount + '.' + '0'.repeat(maxDecimalPlaces)
            } else {
              const currentDecimalPlaces =
                outputAmount.length - decimalIndex - 1
              const paddingNeeded = maxDecimalPlaces - currentDecimalPlaces
              return outputAmount + '0'.repeat(paddingNeeded)
            }
          })()

          return { ...quote, paddedAmount, index }
        })

        // Calculate maximum width for route display alignment
        const maxRouteWidth = Math.max(
          ...paddedRoutes.map((quote) => {
            return `${quote.paddedAmount} ${args.to} | ${quote.routeDisplay}`
              .length
          })
        )

        paddedRoutes.forEach((quote) => {
          // Use the fixed spread from cached data (same as non-amount version)
          const spread = quote.fixedSpread

          const spreadFormatted = (() => {
            if (spread < 0) {
              return chalk.green(`${Math.abs(spread).toFixed(4)}% gain`)
            } else if (spread <= 0.3) {
              return chalk.green(`${spread.toFixed(4)}%`)
            } else if (spread <= 1) {
              return chalk.yellow(`${spread.toFixed(4)}%`)
            } else {
              return chalk.red(`${spread.toFixed(4)}%`)
            }
          })()

          const bestBadge = quote.index === 0 ? chalk.yellow(' 🏆 BEST') : ''

          let emoji: string
          if (quote.index === 0) {
            emoji = '🥇'
          } else if (quote.index === 1) {
            emoji = '🥈'
          } else if (quote.index === 2) {
            emoji = '🥉'
          } else {
            emoji = spread < 0.5 ? '💚' : spread < 2 ? '💛' : '🔴'
          }

          // Calculate padding for spread alignment
          const routePrefix = `${quote.paddedAmount} ${args.to} | ${quote.routeDisplay}`
          const padding = ' '.repeat(
            Math.max(0, maxRouteWidth - routePrefix.length)
          )

          console.log(
            `${emoji} ${chalk.cyan(quote.paddedAmount)} ${chalk.gray(
              args.to
            )} ${chalk.gray('|')} ${chalk.white(
              quote.routeDisplay
            )}${padding} ${chalk.gray(
              '|'
            )} Spread: ${spreadFormatted}${bestBadge}`
          )

          if (args.verbose) {
            displayRouteDetails(
              quote.route,
              allPairs,
              quote.index,
              quote.index === 0
            )
          }
        })

        const failedRoutes = routeQuotes.filter((q) => !q.successful)
        if (failedRoutes.length > 0) {
          console.log()
          console.log(chalk.dim('Failed routes:'))
          failedRoutes.forEach((quote) => {
            console.log(
              formatQuoteOutput(
                '0',
                quote.routeDisplay,
                0,
                args.to,
                false,
                true
              )
            )
          })
        }
      } else {
        // Show routes without quotes
        console.log()
        console.log(chalk.bold('️💱 All Available Routes'))

        // Calculate max width for alignment and sort by spread (cheapest first)
        const routeInfos = allRoutes
          .map((route, index) => {
            const routeDisplay = buildRouteDisplay(
              route,
              args.from,
              args.to,
              allPairs
            )
            const routeType =
              route.path.length === 1 ? 'Direct' : `${route.path.length}-hop`
            const spread = calculateCompoundSpread(route, allPairs)
            return { route, routeDisplay, routeType, spread, index }
          })
          .sort((a, b) => a.spread - b.spread)

        const maxWidth = Math.max(
          ...routeInfos.map(
            (info) =>
              `${info.index + 1}. ${info.routeDisplay} (${info.routeType})`
                .length
          )
        )

        routeInfos.forEach(
          ({ route, routeDisplay, routeType, spread }, sortedIndex) => {
            const routePrefix = `${
              sortedIndex + 1
            }. ${routeDisplay} (${routeType})`
            const padding = ' '.repeat(maxWidth - routePrefix.length)
            const spreadColor =
              spread <= 0.3
                ? chalk.green
                : spread <= 1
                ? chalk.yellow
                : chalk.red

            console.log(
              `${sortedIndex + 1}. ${chalk.white(routeDisplay)} ${chalk.dim(
                `(${routeType})`
              )}${padding} | Spread: ${spreadColor(`${spread.toFixed(6)}%`)}`
            )

            if (args.verbose) {
              displayRouteDetails(route, allPairs, sortedIndex)
            }
          }
        )
      }
    } else {
      // Single best route
      const spinner = ora('Finding optimal route...').start()
      const tradablePair = await mento.findPairForTokens(fromAddress, toAddress)
      spinner.stop()

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
      const spreadColor =
        spread <= 0.3 ? chalk.green : spread <= 1 ? chalk.yellow : chalk.red

      console.log()
      if (args.amount && amountIn) {
        // Show quote with route info
        try {
          const amountOut = await mento.getAmountOut(
            fromAddress,
            toAddress,
            amountIn,
            tradablePair
          )
          const outputAmount = roundToMaxDecimals(
            formatUnits(amountOut, toDecimals!)
          )

          console.log(
            chalk.bold('💱 Optimal Route: ') +
              `${chalk.cyan(outputAmount)} ${args.to} | ${chalk.white(
                routeDisplay
              )} ${chalk.dim(`(${routeType})`)} | Spread: ${spreadColor(
                `${spread.toFixed(6)}%`
              )}`
          )
        } catch (error) {
          console.log(
            chalk.bold('💱 Optimal Route: ') +
              `${chalk.red('Failed')} | ${chalk.white(
                routeDisplay
              )} ${chalk.dim(`(${routeType})`)} | Spread: ${spreadColor(
                `${spread.toFixed(6)}%`
              )}`
          )
        }
      } else {
        // Show route info only
        console.log(
          chalk.bold('💱 Optimal Route: ') +
            `${chalk.white(routeDisplay)} ${chalk.dim(
              `(${routeType})`
            )} | Spread: ${spreadColor(`${spread.toFixed(6)}%`)}`
        )
      }

      if (args.verbose) {
        console.log()
        displayRouteDetails(tradablePair, allPairs, 0, true)
      }
    }
  } catch (error) {
    console.error(
      `Error: ${error instanceof Error ? error.message : String(error)}`
    )
    process.exit(1)
  } finally {
    if (provider) {
      provider.removeAllListeners()
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
