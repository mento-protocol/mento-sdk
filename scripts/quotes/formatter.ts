import chalk from 'chalk'
import { formatUnits } from 'ethers/lib/utils'
import { TradablePair } from '../../src/mento'
import { TradablePairWithSpread } from '../cacheTradablePairs/config'
import { FormattedRoute, RouteInfo, RouteQuote } from './types'
import { roundToMaxDecimals } from './utils/token'

export function formatSpread(spread: number): string {
  if (spread < 0) {
    return chalk.green(`${Math.abs(spread).toFixed(4)}% gain`)
  } else if (spread <= 0.3) {
    return chalk.green(`${spread.toFixed(4)}%`)
  } else if (spread <= 1) {
    return chalk.yellow(`${spread.toFixed(4)}%`)
  } else {
    return chalk.red(`${spread.toFixed(4)}%`)
  }
}

export function getEmojiForRank(rank: number, spread: number): string {
  if (rank === 1) {
    return '🥇'
  } else if (rank === 2) {
    return '🥈'
  } else if (rank === 3) {
    return '🥉'
  } else {
    return spread < 0.5 ? '💚' : spread < 2 ? '💛' : '🔴'
  }
}

/**
 * Prepares formatted routes for display by calculating padding and sorting by output amount.
 * This ensures consistent table formatting regardless of number precision.
 */
export function prepareFormattedRoutes(
  routeQuotes: RouteQuote[],
  toDecimals: number
): FormattedRoute[] {
  // Filter successful routes and format output amounts
  const successfulRoutes = routeQuotes
    .filter((q) => q.successful && q.outputAmount)
    .map((route, index) => ({
      route: route.route,
      amount: roundToMaxDecimals(formatUnits(route.outputAmount!, toDecimals)),
      paddedAmount: '', // Will be set after we determine max width
      index,
      routeDisplay: route.routeDisplay,
      fixedSpread: route.fixedSpread,
      outputAmount: route.outputAmount,
      successful: route.successful,
    }))

  // Sort by output amount (highest first = best routes)
  successfulRoutes.sort((a, b) => {
    const aNum = parseFloat(a.amount)
    const bNum = parseFloat(b.amount)
    return bNum - aNum // Descending order
  })

  // Calculate padding for consistent table alignment
  const maxAmountWidth = Math.max(
    ...successfulRoutes.map((r) => r.amount.length)
  )

  // Apply padding to all amounts
  return successfulRoutes.map((route) => ({
    ...route,
    paddedAmount: route.amount.padStart(maxAmountWidth),
  }))
}

/**
 * Displays detailed technical information about a specific route.
 * Shows exchange IDs, asset addresses, and multi-hop structure.
 */
export function displayRouteDetails(
  route: TradablePair,
  routeNumber: number,
  isOptimal: boolean,
  prefix?: string,
  label?: string
): void {
  const rankingBadge = isOptimal
    ? chalk.green('🏆 OPTIMAL')
    : chalk.yellow(`#${routeNumber + 1}`)

  console.log(
    chalk.magenta(`📋 Route ${routeNumber + 1} ${rankingBadge} Details:`)
  )
  console.log(`   ${chalk.yellow('Pair ID:')} ${chalk.cyan(route.id)}`)
  console.log(
    `   ${chalk.yellow('Assets:')} ${route.assets
      .map((a) => `${chalk.cyan(a.symbol)} ${chalk.gray(`(${a.address})`)}`)
      .join(` ${chalk.magenta('↔')} `)}`
  )

  // Show route structure information
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
 * Displays the header section with swap information and context.
 * Shows the trading pair, chain, and whether quotes are being calculated.
 */
export function displayHeader(
  fromSymbol: string,
  toSymbol: string,
  chainName: string,
  amount?: string
): void {
  console.log()
  if (amount) {
    console.log(
      chalk.bold.blue(
        `🔍 Swap Information: ${amount} ${fromSymbol} → ${toSymbol}`
      ) + chalk.dim(` (Chain: ${chainName})`)
    )
  } else {
    console.log(
      chalk.bold.blue(`🔍 Swap Information: ${fromSymbol} → ${toSymbol}`) +
        chalk.dim(` (Chain: ${chainName}) | Route Analysis Only)`)
    )
  }
}

/**
 * Displays all routes with calculated quotes in a ranked format.
 * Shows actual output amounts and ranks routes by performance.
 */
export function displayAllRoutesWithQuotes(
  formattedRoutes: FormattedRoute[],
  failedRoutes: RouteQuote[],
  toSymbol: string,
  verbose: boolean,
  allPairs: readonly TradablePair[] | readonly TradablePairWithSpread[]
): void {
  console.log()
  console.log(chalk.bold('💱 All Routes with Quotes'))

  const maxRouteWidth = calculateMaxRouteWidth(formattedRoutes, toSymbol)

  formattedRoutes.forEach((quote) => {
    displayFormattedRouteQuote(quote, toSymbol, maxRouteWidth)

    if (verbose) {
      displayRouteDetails(quote.route, quote.index, quote.index === 0)
    }
  })

  if (failedRoutes.length > 0) {
    displayFailedRoutes(failedRoutes)
  }
}

/**
 * Displays all available routes without quote calculations.
 * Shows routes sorted by spread (best to worst).
 */
export function displayAllRoutesWithoutQuotes(
  routeInfos: RouteInfo[],
  verbose: boolean,
  allPairs: readonly TradablePair[] | readonly TradablePairWithSpread[]
): void {
  console.log()
  console.log(chalk.bold('💱 All Available Routes'))

  const maxWidth = Math.max(
    ...routeInfos.map(
      (info) =>
        `${info.index + 1}. ${info.routeDisplay} (${info.routeType})`.length
    )
  )

  routeInfos.forEach(
    ({ route, routeDisplay, routeType, spread }, sortedIndex) => {
      const routePrefix = `${sortedIndex + 1}. ${routeDisplay} (${routeType})`
      const padding = ' '.repeat(maxWidth - routePrefix.length)
      const spreadColor = formatSpread(spread)

      console.log(
        `${sortedIndex + 1}. ${chalk.white(routeDisplay)} ${chalk.dim(
          `(${routeType})`
        )}${padding} | Spread: ${spreadColor}`
      )

      if (verbose) {
        displayRouteDetails(route, sortedIndex, false)
      }
    }
  )
}

/**
 * Displays the optimal (best) route with or without quote information.
 * This is used when --all flag is not specified.
 */
export function displayOptimalRoute(
  routeDisplay: string,
  routeType: string,
  spread: number,
  outputAmount?: string,
  toSymbol?: string,
  failed?: boolean
): void {
  const spreadFormatted = formatSpread(spread)

  console.log()
  if (outputAmount && toSymbol && !failed) {
    console.log(
      chalk.bold('💱 Optimal Route: ') +
        `${chalk.cyan(outputAmount)} ${toSymbol} | ${chalk.white(
          routeDisplay
        )} ${chalk.dim(`(${routeType})`)} | Spread: ${spreadFormatted}`
    )
  } else if (failed) {
    console.log(
      chalk.bold('💱 Optimal Route: ') +
        `${chalk.red('Failed')} | ${chalk.white(routeDisplay)} ${chalk.dim(
          `(${routeType})`
        )} | Spread: ${spreadFormatted}`
    )
  } else {
    console.log(
      chalk.bold('💱 Optimal Route: ') +
        `${chalk.white(routeDisplay)} ${chalk.dim(
          `(${routeType})`
        )} | Spread: ${spreadFormatted}`
    )
  }
}

function padDecimalPlaces(amount: string, maxDecimalPlaces: number): string {
  const decimalIndex = amount.indexOf('.')
  if (decimalIndex === -1) {
    return amount + '.' + '0'.repeat(maxDecimalPlaces)
  } else {
    const currentDecimalPlaces = amount.length - decimalIndex - 1
    const paddingNeeded = maxDecimalPlaces - currentDecimalPlaces
    return amount + '0'.repeat(paddingNeeded)
  }
}

function calculateMaxRouteWidth(
  formattedRoutes: FormattedRoute[],
  toSymbol: string
): number {
  return Math.max(
    ...formattedRoutes.map((quote) => {
      return `${quote.paddedAmount} ${toSymbol} | ${quote.routeDisplay}`.length
    })
  )
}

function displayFormattedRouteQuote(
  quote: FormattedRoute,
  toSymbol: string,
  maxRouteWidth: number
): void {
  const spread = quote.fixedSpread
  const spreadFormatted = formatSpread(spread)
  const bestBadge = quote.index === 0 ? chalk.yellow(' 🏆 BEST') : ''
  const emoji = getEmojiForRank(quote.index + 1, spread)

  const routePrefix = `${quote.paddedAmount} ${toSymbol} | ${quote.routeDisplay}`
  const padding = ' '.repeat(Math.max(0, maxRouteWidth - routePrefix.length))

  console.log(
    `${emoji} ${chalk.cyan(quote.paddedAmount)} ${chalk.gray(
      toSymbol
    )} ${chalk.gray('|')} ${chalk.white(
      quote.routeDisplay
    )}${padding} ${chalk.gray('|')} Spread: ${spreadFormatted}${bestBadge}`
  )
}

function displayFailedRoutes(failedRoutes: RouteQuote[]): void {
  console.log()
  console.log(chalk.dim('Failed routes:'))
  failedRoutes.forEach((quote) => {
    console.log(
      `${chalk.red('❌ Failed')} ${chalk.gray('|')} ${chalk.dim(
        quote.routeDisplay
      )} ${chalk.gray('|')} ${chalk.red('Error calculating quote')}`
    )
  })
}
