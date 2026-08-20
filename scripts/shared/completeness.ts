/**
 * Prevent a cache write when any requested chain failed generation.
 *
 * Call this after every requested chain has been attempted and before the
 * consolidated cache content is generated. Without it a transient RPC failure
 * on one chain still writes the file, dropping that chain's entries from the
 * cache that ships in the npm package.
 */
export function assertCompleteChainGeneration(
  cacheName: string,
  requestedChainIds: readonly number[],
  failedChainIds: readonly number[]
) {
  if (failedChainIds.length === 0) return

  throw new Error(
    `${cacheName} cache generation failed for chain(s) ${failedChainIds.join(', ')} of requested chain(s) ` +
      `${requestedChainIds.join(', ')} - cache file left untouched`
  )
}
