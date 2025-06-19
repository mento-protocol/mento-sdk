import { providers } from 'ethers'
import { TradablePair } from '../../src/mento'
import { TradablePairWithSpread } from './config'
import { calculateSpreadForPair } from './spread'

/**
 * Process pairs in batches with controlled concurrency
 */
export async function processPairsInBatches(
  pairs: readonly TradablePair[],
  provider: providers.Provider,
  batchSize = 10
): Promise<TradablePairWithSpread[]> {
  const results: TradablePairWithSpread[] = []
  let processed = 0
  let errors = 0

  console.log(`📊 Fetching spreads from pool configurations...`)
  console.log(`   Using batch size of ${batchSize} concurrent requests`)

  for (let i = 0; i < pairs.length; i += batchSize) {
    const batch = pairs.slice(i, i + batchSize)

    // Process batch concurrently with error handling
    const batchPromises = batch.map(async (pair) => {
      try {
        const result = await calculateSpreadForPair(pair, provider)
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

        // Return a pair with no spread data on error
        return {
          ...pair,
          spreadData: undefined,
        } as TradablePairWithSpread
      }
    })

    const batchResults = await Promise.all(batchPromises)
    results.push(...batchResults)
  }

  if (errors > 0) {
    console.log(`\n   ⚠️  ${errors} routes failed to fetch spread data`)
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
