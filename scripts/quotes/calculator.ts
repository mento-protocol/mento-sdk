import { BigNumber } from 'ethers'
import { Mento, TradablePair } from '../../src/mento'
import { TradablePairWithSpread } from '../cacheTradablePairs/config'
import {
  DEFAULT_BATCH_DELAY_MS,
  DEFAULT_BATCH_SIZE,
  QUOTE_TIMEOUT_MS,
} from './config'
import { buildRouteDisplay, calculateCompoundSpread } from './spread'
import { RouteQuote } from './types'

/**
 * Calculates quotes for all provided routes and returns results with success/failure status.
 * Uses Promise.allSettled to handle routes that might fail or timeout independently.
 *
 * @param mento - Mento SDK instance for quote calculations
 * @param routes - Array of routes to calculate quotes for
 * @param tokenIn - Input token address
 * @param tokenOut - Output token address
 * @param amountIn - Input amount in token's smallest unit (wei)
 * @param fromSymbol - Input token symbol for display
 * @param toSymbol - Output token symbol for display
 * @param allPairs - All pairs data for route analysis
 * @returns Array of quote results with success/failure status
 */
export async function calculateAllRouteQuotes(
  mento: Mento,
  routes: TradablePair[],
  tokenIn: string,
  tokenOut: string,
  amountIn: BigNumber,
  fromSymbol: string,
  toSymbol: string,
  allPairs: readonly TradablePair[] | readonly TradablePairWithSpread[]
): Promise<RouteQuote[]> {
  const routeQuotes: RouteQuote[] = []

  // Process in batches to avoid overwhelming RPC
  for (let i = 0; i < routes.length; i += DEFAULT_BATCH_SIZE) {
    const batch = routes.slice(i, i + DEFAULT_BATCH_SIZE)

    const batchPromises = batch.map(async (route) => {
      const result = await calculateSingleQuote(
        mento,
        route,
        tokenIn,
        tokenOut,
        amountIn
      )
      const routeDisplay = buildRouteDisplay(
        route,
        fromSymbol,
        toSymbol,
        allPairs
      )
      const fixedSpread = calculateCompoundSpread(route, allPairs)

      return {
        route,
        outputAmount: result.outputAmount,
        effectiveRate: 0, // We don't calculate effective rate in this version
        routeDisplay,
        successful: result.successful,
        fixedSpread,
      }
    })

    const batchResults = await Promise.all(batchPromises)
    routeQuotes.push(...batchResults)

    if (i + DEFAULT_BATCH_SIZE < routes.length) {
      await sleep(DEFAULT_BATCH_DELAY_MS)
    }
  }

  // Sort by fixed spread (lowest first)
  return routeQuotes.sort((a, b) => {
    if (!a.successful && !b.successful) return 0
    if (!a.successful) return 1
    if (!b.successful) return -1
    return a.fixedSpread - b.fixedSpread
  })
}

/**
 * Calculates a quote for a single route with timeout protection.
 * Prevents individual route failures from blocking the entire operation.
 *
 * @param mento - Mento SDK instance
 * @param route - Trading route to calculate quote for
 * @param tokenIn - Input token address
 * @param tokenOut - Output token address
 * @param amountIn - Input amount in smallest units
 * @param index - Route index for result tracking
 * @returns Promise that resolves to RouteQuote or rejects on timeout/error
 */
async function calculateQuoteWithTimeout(
  mento: Mento,
  route: TradablePair,
  tokenIn: string,
  tokenOut: string,
  amountIn: BigNumber,
  index: number
): Promise<RouteQuote> {
  return new Promise((resolve, reject) => {
    // Set up timeout to prevent hanging
    const timeout = setTimeout(() => {
      reject(
        new Error(`Quote calculation timed out after ${QUOTE_TIMEOUT_MS}ms`)
      )
    }, QUOTE_TIMEOUT_MS)

    // Calculate the actual quote
    mento
      .getAmountOut(tokenIn, tokenOut, amountIn, route)
      .then((outputAmount) => {
        clearTimeout(timeout)
        resolve({
          route,
          successful: true,
          outputAmount,
          routeDisplay: '',
          fixedSpread: 0,
          effectiveRate: 0,
        })
      })
      .catch((error) => {
        clearTimeout(timeout)
        resolve({
          route,
          successful: false,
          outputAmount: BigNumber.from(0),
          routeDisplay: '',
          fixedSpread: 0,
          effectiveRate: 0,
        })
      })
  })
}

/**
 * Calculates a quote for a single route without timeout handling.
 * Used for optimal route calculation where we want to handle errors at a higher level.
 *
 * @param mento - Mento SDK instance
 * @param route - Trading route to calculate quote for
 * @param tokenIn - Input token address
 * @param tokenOut - Output token address
 * @param amountIn - Input amount in smallest units
 * @returns Promise with quote calculation result
 */
export async function calculateSingleQuote(
  mento: Mento,
  route: TradablePair,
  tokenIn: string,
  tokenOut: string,
  amountIn: BigNumber
): Promise<{ successful: boolean; outputAmount: BigNumber; error?: string }> {
  try {
    const outputAmount = await mento.getAmountOut(
      tokenIn,
      tokenOut,
      amountIn,
      route
    )
    return { successful: true, outputAmount }
  } catch (error) {
    return {
      successful: false,
      outputAmount: BigNumber.from(0),
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

async function executeWithTimeout<T>(
  operation: () => Promise<T>,
  timeoutMs: number
): Promise<T> {
  let timeoutId: NodeJS.Timeout

  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('Timeout')), timeoutMs)
  })

  try {
    const result = await Promise.race([operation(), timeoutPromise])
    if (timeoutId!) {
      clearTimeout(timeoutId)
    }
    return result
  } catch {
    return {
      outputAmount: BigNumber.from(0),
      effectiveRate: 0,
      successful: false,
    } as T
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
