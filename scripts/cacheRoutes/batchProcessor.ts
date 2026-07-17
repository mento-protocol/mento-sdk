import type { Route, RouteWithCost } from '../../src/core/types'
import type { PublicClient } from 'viem'
import { calculateCostForRoute } from './spread'

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

interface FailedRoute {
  route: Route
  error: string
}

/**
 * Run a single cost-fetch pass over the given routes
 */
async function runCostFetchPass(
  routes: readonly Route[],
  publicClient: PublicClient,
  batchSize: number
): Promise<{ succeeded: RouteWithCost[]; failed: FailedRoute[] }> {
  const succeeded: RouteWithCost[] = []
  const failed: FailedRoute[] = []
  let processed = 0
  let errors = 0

  for (let i = 0; i < routes.length; i += batchSize) {
    const batch = routes.slice(i, i + batchSize)

    const batchPromises = batch.map(async (route) => {
      try {
        const result = await calculateCostForRoute(route, publicClient)
        processed++
        process.stdout.write(`\r   Processing ${processed}/${routes.length} routes... (${errors} errors)`)
        return result
      } catch (error) {
        errors++
        failed.push({ route, error: (error as Error).message })
        process.stdout.write(`\r   Processing ${processed}/${routes.length} routes... (${errors} errors)`)
        return null
      }
    })

    const batchResults = await Promise.all(batchPromises)
    for (const result of batchResults) {
      if (result !== null) {
        succeeded.push(result)
      }
    }
  }

  return { succeeded, failed }
}

/**
 * Process routes in batches with controlled concurrency.
 *
 * Routes whose cost fetch fails (typically RPC rate limiting on public testnet
 * endpoints) are retried in follow-up passes after a cooldown, so transient
 * failures don't silently drop routes from the generated cache. Routes still
 * failing after all passes are omitted from the result - callers are expected
 * to verify completeness before writing the cache file.
 */
export async function processRoutesInBatches(
  routes: readonly Route[],
  publicClient: PublicClient,
  batchSize = 10,
  maxPasses = 5,
  cooldownMs = 30_000
): Promise<RouteWithCost[]> {
  const results: RouteWithCost[] = []
  let remaining: readonly Route[] = routes
  let lastFailures: FailedRoute[] = []

  for (let pass = 1; pass <= maxPasses && remaining.length > 0; pass++) {
    if (pass > 1) {
      console.log(
        `\n   Retry pass ${pass}/${maxPasses}: ${remaining.length} routes failed - retrying after ${
          cooldownMs / 1000
        }s cooldown...`
      )
      await sleep(cooldownMs)
    }

    const { succeeded, failed } = await runCostFetchPass(remaining, publicClient, batchSize)
    results.push(...succeeded)
    remaining = failed.map((f) => f.route)
    lastFailures = failed
  }

  if (lastFailures.length > 0) {
    console.log(`\n   ${lastFailures.length} routes still failing after ${maxPasses} passes:`)
    lastFailures.forEach(({ route, error }) => {
      console.log(`     - ${route.id}: ${error}`)
    })
  }

  return results
}

/**
 * Generic batch processor for any async operation
 * Useful for other scripts that need controlled concurrency
 */
export async function processBatch<T, R>(
  items: readonly T[],
  processor: (item: T) => Promise<R>,
  options: {
    batchSize?: number
    onProgress?: (processed: number, total: number, errors: number) => void
    onError?: (error: Error, item: T) => R | undefined
  } = {}
): Promise<R[]> {
  const { batchSize = 10, onProgress, onError } = options
  const results: R[] = []
  let processed = 0
  let errors = 0

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)

    const batchPromises = batch.map(async (item) => {
      try {
        const result = await processor(item)
        processed++
        onProgress?.(processed, items.length, errors)
        return result
      } catch (error) {
        errors++
        onProgress?.(processed, items.length, errors)

        if (onError) {
          return onError(error as Error, item)
        }
        throw error
      }
    })

    const batchResults = await Promise.allSettled(batchPromises)

    for (const result of batchResults) {
      if (result.status === 'fulfilled' && result.value !== undefined) {
        results.push(result.value)
      }
    }
  }

  return results
}
