import { Asset, TradablePair } from '../../src/mento'
import { TradablePairWithSpread } from '../cacheTradablePairs/config'
import { DEFAULT_SPREAD_FALLBACK } from './config'

/**
 * Calculates the total spread for a trading route by compounding spreads across all hops.
 *
 * For multi-hop routes, spreads compound multiplicatively:
 * - Single hop: spread = pairSpread
 * - Multi-hop: spread = (1 - ((1 - spread1) * (1 - spread2) * ...))
 *
 * @param route - The route to calculate spread for
 * @param allPairs - All available pairs with spread data
 * @returns Total spread as a decimal (e.g., 0.005 = 0.5%)
 */
export function calculateCompoundSpread(
  route: TradablePair,
  allPairs: readonly TradablePair[] | readonly TradablePairWithSpread[]
): number {
  if (route.path.length === 1) {
    return getFixedSpreadForRoute(route, allPairs)
  }

  // For multi-hop routes, calculate compound spread
  let compoundRate = 1 // Start with 100% (no loss)

  for (const hop of route.path) {
    const hopSpreadPercent = getHopSpreadPercent(hop, allPairs)
    // Convert spread percentage to rate multiplier
    // If spread is 0.25%, rate multiplier is 0.9975 (1 - 0.0025)
    const hopRate = 1 - hopSpreadPercent / 100
    compoundRate *= hopRate
  }

  // Convert back to spread percentage
  return (1 - compoundRate) * 100
}

/**
 * Creates a human-readable display string for a trading route.
 * Shows token symbols and route structure (e.g., "USDC → USDm → EURm").
 *
 * @param tradablePair - The route to display
 * @param fromSymbol - Symbol of the input token
 * @param toSymbol - Symbol of the output token
 * @param allPairs - All pairs data for symbol resolution
 * @returns Formatted route string
 */
export function buildRouteDisplay(
  tradablePair: TradablePair,
  fromSymbol: string,
  toSymbol: string,
  allPairs: readonly TradablePair[] | readonly TradablePairWithSpread[]
): string {
  if (tradablePair.path.length === 1) {
    return `${fromSymbol} → ${toSymbol}`
  }

  const routeSymbols = buildRouteSymbols(
    tradablePair,
    fromSymbol,
    toSymbol,
    allPairs
  )

  return routeSymbols.length < tradablePair.path.length + 1
    ? `${fromSymbol} → ${toSymbol} (${tradablePair.path.length} hops)`
    : routeSymbols.join(' → ')
}

function getFixedSpreadForRoute(
  route: TradablePair,
  allPairs: readonly TradablePair[] | readonly TradablePairWithSpread[]
): number {
  const matchingPair = findMatchingPair(route, allPairs)

  if (matchingPair && hasSpreadData(matchingPair)) {
    return (matchingPair.spreadData as { totalSpreadPercent: number })
      .totalSpreadPercent
  }

  return route.path.length * DEFAULT_SPREAD_FALLBACK
}

function getHopSpreadPercent(
  hop: unknown,
  allPairs: readonly TradablePair[] | readonly TradablePairWithSpread[]
): number {
  const directPair = allPairs.find(
    (pair) =>
      pair.path.length === 1 &&
      // @ts-ignore - hop structure is known
      pair.path[0].id === hop.id &&
      // @ts-ignore - hop structure is known
      pair.path[0].providerAddr === hop.providerAddr
  )

  if (directPair && hasSpreadData(directPair)) {
    return (directPair.spreadData as { totalSpreadPercent: number })
      .totalSpreadPercent
  }

  return DEFAULT_SPREAD_FALLBACK
}

function findMatchingPair(
  route: TradablePair,
  allPairs: readonly TradablePair[] | readonly TradablePairWithSpread[]
): TradablePair | TradablePairWithSpread | undefined {
  return allPairs.find((pair) => {
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
}

function hasSpreadData(
  pair: TradablePair | TradablePairWithSpread
): pair is TradablePairWithSpread {
  return (
    'spreadData' in pair &&
    pair.spreadData &&
    typeof pair.spreadData === 'object' &&
    'totalSpreadPercent' in pair.spreadData
  )
}

function buildRouteSymbols(
  tradablePair: TradablePair,
  fromSymbol: string,
  toSymbol: string,
  allPairs: readonly TradablePair[] | readonly TradablePairWithSpread[]
): string[] {
  const addressToSymbol = createAddressToSymbolMap(allPairs)

  // Handle special case where user input might be different from actual symbol
  // For example, user inputs "USDT" but actual symbol is "USD₮"
  const actualFromSymbol = findActualSymbolForInput(
    fromSymbol,
    tradablePair.assets
  )
  const actualToSymbol = findActualSymbolForInput(toSymbol, tradablePair.assets)

  // Get the addresses from tradablePair.assets using actual symbols
  const fromAddress = tradablePair.assets
    .find((asset) => asset.symbol === actualFromSymbol)
    ?.address.toLowerCase()
  const toAddress = tradablePair.assets
    .find((asset) => asset.symbol === actualToSymbol)
    ?.address.toLowerCase()

  if (!fromAddress || !toAddress) {
    return [fromSymbol, toSymbol]
  }

  // For multi-hop routes, we need to find the common intermediate tokens
  // First, collect all unique addresses in the path
  const allAddresses = new Set<string>()
  tradablePair.path.forEach((hop) => {
    hop.assets.forEach((addr: string) => {
      allAddresses.add(addr.toLowerCase())
    })
  })

  // Remove our from and to addresses to find intermediates
  allAddresses.delete(fromAddress)
  allAddresses.delete(toAddress)

  // Convert intermediate addresses to symbols
  const intermediateTokens = Array.from(allAddresses)
    .map((addr) => addressToSymbol.get(addr))
    .filter((symbol) => symbol !== undefined) as string[]

  // Build the route: from -> intermediates -> to
  const route = [fromSymbol]

  // Add intermediate tokens
  intermediateTokens.forEach((token) => {
    if (!route.includes(token)) {
      route.push(token)
    }
  })

  // Add destination
  route.push(toSymbol)

  return route
}

/**
 * Finds the actual symbol in the tradable pair assets for a given input symbol.
 * Handles special cases like "USDT" mapping to "USD₮".
 */
function findActualSymbolForInput(
  inputSymbol: string,
  assets: readonly Asset[]
): string {
  // First try exact match
  const exactMatch = assets.find((asset) => asset.symbol === inputSymbol)
  if (exactMatch) {
    return inputSymbol
  }

  // Handle USDT special case
  if (inputSymbol.toLowerCase() === 'usdt') {
    // Look for USD₮ or other USDT variants
    const usdtVariant = assets.find((asset) => {
      const normalizedSymbol = asset.symbol.replace(/[^\w]/g, '').toLowerCase()
      return normalizedSymbol === 'usdt' || asset.symbol === 'USD₮'
    })
    if (usdtVariant) {
      return usdtVariant.symbol
    }
  }

  // Fallback to original input
  return inputSymbol
}

function createAddressToSymbolMap(
  allPairs: readonly TradablePair[] | readonly TradablePairWithSpread[]
): Map<string, string> {
  const addressToSymbol = new Map<string, string>()

  allPairs.forEach((pair) => {
    pair.assets.forEach((asset: Asset) => {
      addressToSymbol.set(asset.address.toLowerCase(), asset.symbol)
    })
  })

  return addressToSymbol
}
