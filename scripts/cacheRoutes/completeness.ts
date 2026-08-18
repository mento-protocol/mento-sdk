/**
 * Prevent a cache write when any requested chain failed generation.
 *
 * Call this after every requested chain has been attempted and before the
 * consolidated cache content is generated.
 */
export function assertCompleteChainGeneration(requestedChainIds: readonly number[], failedChainIds: readonly number[]) {
  if (failedChainIds.length === 0) return

  throw new Error(
    `Route cache generation failed for chain(s) ${failedChainIds.join(', ')} of requested chain(s) ` +
      `${requestedChainIds.join(', ')} - cache file left untouched`
  )
}
