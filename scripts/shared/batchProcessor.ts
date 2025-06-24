/**
 * Batch process promises with limited concurrency to avoid overwhelming RPC endpoints
 *
 * @param items - Array of items to process
 * @param processor - Function to process each item
 * @param batchSize - Number of items to process concurrently
 * @returns Array of processed results
 */
export async function batchProcess<T, R>(
  items: T[],
  processor: (item: T, index: number) => Promise<R>,
  batchSize = 10
): Promise<R[]> {
  const results: R[] = []

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    const batchResults = await Promise.all(
      batch.map((item, batchIndex) => processor(item, i + batchIndex))
    )
    results.push(...batchResults)
  }

  return results
}

/**
 * Process items in batches with progress tracking
 *
 * @param items - Array of items to process
 * @param processor - Function to process each item
 * @param options - Configuration options
 * @returns Array of processed results
 */
export async function batchProcessWithProgress<T, R>(
  items: T[],
  processor: (item: T, index: number) => Promise<R>,
  options: {
    batchSize?: number
    onProgress?: (completed: number, total: number) => void
    onBatchComplete?: (batchIndex: number, totalBatches: number) => void
  } = {}
): Promise<R[]> {
  const { batchSize = 10, onProgress, onBatchComplete } = options
  const results: R[] = []
  const totalBatches = Math.ceil(items.length / batchSize)

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    const batchResults = await Promise.all(
      batch.map((item, batchIndex) => processor(item, i + batchIndex))
    )
    results.push(...batchResults)

    if (onProgress) {
      onProgress(Math.min(i + batchSize, items.length), items.length)
    }

    if (onBatchComplete) {
      onBatchComplete(Math.floor(i / batchSize) + 1, totalBatches)
    }
  }

  return results
}
