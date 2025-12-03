import type { Route, RouteWithSpread } from '../../src/core/types'
import type { PublicClient } from 'viem'
import { calculateSpreadForPair } from './spread'

/**
 * Process pairs in batches with controlled concurrency
 */
export async function processPairsInBatches(
  pairs: readonly Route[],
  publicClient: PublicClient,
  batchSize = 10
): Promise<RouteWithSpread[]> {
  const results: RouteWithSpread[] = []
  let processed = 0
  let errors = 0

  for (let i = 0; i < pairs.length; i += batchSize) {
    const batch = pairs.slice(i, i + batchSize)

    // Process batch concurrently with error handling
    const batchPromises = batch.map(async (pair) => {
      try {
        const result = await calculateSpreadForPair(pair, publicClient)
        processed++
        process.stdout.write(
          `\r   Processing ${processed}/${pairs.length} routes... (${errors} errors)`
        )
        return result
      } catch (error) {
        errors++
        process.stdout.write(
          `\r   Processing ${processed}/${pairs.length} routes... (${errors} errors)`
        )

        // Return null for failed pairs - we'll filter them out later
        return null
      }
    })

    const batchResults = await Promise.all(batchPromises)

    // Filter out null results (failed calculations) and add valid ones
    for (const result of batchResults) {
      if (result !== null) {
        results.push(result)
      }
    }
  }

  if (errors > 0) {
    console.log(
      `\n   ${errors} routes failed to fetch spread data (excluded from cache)`
    )
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
