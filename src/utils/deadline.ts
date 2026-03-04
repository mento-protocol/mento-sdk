/**
 * Creates a deadline timestamp from a duration in minutes.
 *
 * @param minutes - Number of minutes from now
 * @returns Unix timestamp as bigint suitable for router contract deadline parameter
 *
 * @example
 * ```typescript
 * import { deadlineFromMinutes } from '@mento-protocol/mento-sdk'
 *
 * // 5 minute deadline
 * const deadline = deadlineFromMinutes(5)
 *
 * const swap = await mento.swap.buildSwapParams(
 *   tokenIn, tokenOut, amountIn, recipient,
 *   { slippageTolerance: 0.5, deadline }
 * )
 * ```
 */
export function deadlineFromMinutes(minutes: number): bigint {
  return BigInt(Date.now()) / 1000n + BigInt(minutes * 60)
}
