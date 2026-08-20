import { Pool, PoolType, PoolDetails, PoolRebalancePreview } from '../../core/types'
import { PublicClient } from 'viem'
import {
  fetchFPMMPools,
  fetchVirtualPools,
  isFPMMSourceConfigured,
  isVirtualPoolSourceConfigured,
} from './poolDiscovery'
import {
  fetchFPMMPoolDetailsBatch,
  fetchVirtualPoolDetailsBatch,
} from './poolDetails'
import {
  fetchPoolRebalancePreview,
  fetchPoolRebalancePreviewBatch,
} from './rebalancePreview'

/**
 * Result of pool discovery including any warnings from failed factories
 */
export interface PoolDiscoveryResult {
  pools: Pool[]
  warnings: string[]
}

/**
 * Service for discovering liquidity pools in the Mento protocol.
 * Aggregates pools from multiple factory contracts (FPMM and VirtualPool).
 */
export class PoolService {
  private poolsCache: Pool[] | null = null
  private discoveryWarnings: string[] = []
  private poolsPromise: Promise<Pool[]> | null = null
  private poolDetailsCache = new Map<string, PoolDetails>()
  private poolDetailPromises = new Map<string, Promise<PoolDetails>>()

  constructor(private publicClient: PublicClient, private chainId: number) {}

  /**
   * Returns any warnings from the last pool discovery operation.
   * Useful for debugging when some factories fail but others succeed.
   */
  getDiscoveryWarnings(): string[] {
    return [...this.discoveryWarnings]
  }

  /**
   * Fetches all pools available in the protocol from both FPMM and Virtual pool factories
   * Results are cached in memory for the service instance lifetime
   *
   * @returns Array of all pools available in the protocol
   * @throws {Error} If no pools can be discovered from any factory
   *
   * @example
   * ```typescript
   * const pools = await poolService.getPools()
   * console.log(`Found ${pools.length} pools`)
   * ```
   */
  async getPools(): Promise<Pool[]> {
    if (this.poolsCache) {
      return this.poolsCache
    }

    if (this.poolsPromise) {
      return this.poolsPromise
    }

    this.poolsPromise = this.loadPools()

    try {
      return await this.poolsPromise
    } finally {
      this.poolsPromise = null
    }
  }

  private async loadPools(): Promise<Pool[]> {
    const sources = [
      {
        name: 'FPMM',
        configured: isFPMMSourceConfigured(this.chainId),
        fetch: () => fetchFPMMPools(this.publicClient, this.chainId),
      },
      {
        name: 'Virtual',
        configured: isVirtualPoolSourceConfigured(this.chainId),
        fetch: () => fetchVirtualPools(this.publicClient, this.chainId),
      },
    ]

    const settled = await Promise.allSettled(sources.map((source) => source.fetch()))

    const pools: Pool[] = []
    const warnings: string[] = []
    // Tracked separately so a chain with nothing deployed is not reported as a
    // failed lookup: both cases end with zero pools but need different fixes.
    const emptySources: string[] = []
    const unconfiguredSources: string[] = []

    settled.forEach((result, index) => {
      const { name, configured } = sources[index]

      if (result.status === 'rejected') {
        const reason = result.reason instanceof Error ? result.reason.message : String(result.reason)
        const prefix = `Failed to fetch ${name} pools`
        // The fetchers already prefix their own errors; only add it for a
        // rejection that came from somewhere else.
        warnings.push(reason.startsWith(prefix) ? reason : `${prefix}: ${reason}`)
        return
      }

      if (!configured) {
        unconfiguredSources.push(name)
        return
      }

      if (result.value.length === 0) {
        emptySources.push(name)
        return
      }

      pools.push(...result.value)
    })

    this.discoveryWarnings = warnings

    if (pools.length === 0) {
      throw new Error(this.describeEmptyDiscovery(warnings, emptySources, unconfiguredSources))
    }

    this.poolsCache = pools
    return pools
  }

  /**
   * Builds the error for a discovery run that produced no pools, distinguishing
   * a failed lookup from a chain that has no pools to find.
   */
  private describeEmptyDiscovery(
    warnings: readonly string[],
    emptySources: readonly string[],
    unconfiguredSources: readonly string[]
  ): string {
    const details = [
      ...warnings,
      ...emptySources.map((name) => `${name} factory returned no pools`),
      ...unconfiguredSources.map((name) => `${name} factory is not deployed on this chain`),
    ]

    if (warnings.length === 0) {
      return (
        `No pools exist on chain ${this.chainId}: ${details.join('; ')}. ` +
        'This is not a lookup failure - no factory has any pool to discover.'
      )
    }

    // A source that returned no pools, or that is not deployed here at all, did
    // not fail: saying every query failed would send the reader after an RPC
    // problem that only affected some of them.
    const cause =
      emptySources.length === 0 && unconfiguredSources.length === 0
        ? 'every pool factory query failed'
        : 'no factory produced pools, and at least one query failed'

    return (
      `Pool discovery failed on chain ${this.chainId}: ${cause}. ` +
      `Check network connectivity and RPC endpoint. ${details.join('; ')}`
    )
  }

  /**
   * Fetches enriched on-chain details for a specific pool by address.
   * Resolves the pool type from the discovery cache, then fetches
   * pool-type-specific data (pricing, fees, rebalancing for FPMM; reserves and spread for Virtual).
   *
   * @param poolAddr - The deployed pool contract address
   * @returns Enriched pool details (FPMMPoolDetails or VirtualPoolDetails)
   * @throws {Error} If the pool address is not found in any known factory
   * @throws {Error} If on-chain calls fail
   *
   * @example
   * ```typescript
   * const details = await poolService.getPoolDetails('0x...')
   * if (details.poolType === 'FPMM') {
   *   console.log(details.pricing.oraclePrice)
   *   console.log(details.rebalancing.inBand)
   * } else {
   *   console.log(details.spreadPercent)
   * }
   * ```
   */
  async getPoolDetails(poolAddr: string): Promise<PoolDetails> {
    const [details] = await this.getPoolDetailsBatch([poolAddr])
    return details
  }

  async getPoolRebalancePreview(poolAddr: string): Promise<PoolRebalancePreview | null> {
    const details = await this.getPoolDetails(poolAddr)
    return fetchPoolRebalancePreview(this.publicClient, details)
  }

  async getPoolRebalancePreviewBatch(poolAddresses?: string[]): Promise<Array<PoolRebalancePreview | null>> {
    const details = await this.getPoolDetailsBatch(poolAddresses)
    return fetchPoolRebalancePreviewBatch(this.publicClient, details)
  }

  async getPoolDetailsBatch(poolAddresses?: string[]): Promise<PoolDetails[]> {
    const pools = await this.getPools()
    const targets = poolAddresses
      ? poolAddresses.map((poolAddress) => {
          const pool = pools.find((candidate) => candidate.poolAddr.toLowerCase() === poolAddress.toLowerCase())
          if (!pool) {
            throw new Error(`Pool not found: ${poolAddress}. Ensure the address is a valid pool discovered by getPools().`)
          }
          return pool
        })
      : pools

    const results = new Array<PoolDetails>(targets.length)
    const pendingResults: Promise<void>[] = []
    const missingTargets: Array<{ pool: Pool; index: number; key: string }> = []

    for (const [index, pool] of targets.entries()) {
      const key = pool.poolAddr.toLowerCase()
      const cached = this.poolDetailsCache.get(key)

      if (cached) {
        results[index] = cached
        continue
      }

      const inFlight = this.poolDetailPromises.get(key)
      if (inFlight) {
        pendingResults.push(
          inFlight.then((detail) => {
            results[index] = detail
          })
        )
        continue
      }

      missingTargets.push({ pool, index, key })
    }

    if (missingTargets.length > 0) {
      const grouped = {
        fpmm: missingTargets.filter(({ pool }) => pool.poolType === PoolType.FPMM),
        virtual: missingTargets.filter(({ pool }) => pool.poolType !== PoolType.FPMM),
      }

      const createdPromises = new Map<string, { resolve: (detail: PoolDetails) => void; reject: (error: unknown) => void }>()
      const createdPendingResults: Promise<void>[] = []

      for (const target of missingTargets) {
        const deferred = createDeferred<PoolDetails>()
        this.poolDetailPromises.set(target.key, deferred.promise)
        createdPromises.set(target.key, deferred)
        const pendingResult = deferred.promise.then((detail) => {
          results[target.index] = detail
        })
        pendingResults.push(pendingResult)
        createdPendingResults.push(pendingResult)
      }

      try {
        const [fpmmDetails, virtualDetails] = await Promise.all([
          fetchFPMMPoolDetailsBatch(this.publicClient, this.chainId, grouped.fpmm.map(({ pool }) => pool)),
          fetchVirtualPoolDetailsBatch(this.publicClient, grouped.virtual.map(({ pool }) => pool)),
        ])

        for (const [groupIndex, detail] of fpmmDetails.entries()) {
          const target = grouped.fpmm[groupIndex]
          this.poolDetailsCache.set(target.key, detail)
          createdPromises.get(target.key)?.resolve(detail)
        }

        for (const [groupIndex, detail] of virtualDetails.entries()) {
          const target = grouped.virtual[groupIndex]
          this.poolDetailsCache.set(target.key, detail)
          createdPromises.get(target.key)?.resolve(detail)
        }
      } catch (error) {
        for (const target of missingTargets) {
          createdPromises.get(target.key)?.reject(error)
        }
        await Promise.allSettled(createdPendingResults)
        throw error
      } finally {
        for (const target of missingTargets) {
          this.poolDetailPromises.delete(target.key)
        }
      }
    }

    await Promise.all(pendingResults)
    return results
  }
}

function createDeferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })

  return { promise, resolve, reject }
}
