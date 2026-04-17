import { PublicClient } from 'viem'
import {
  isTradingEnabled,
  Route,
  Pool,
  PoolType,
  TradingLimit,
  PoolTradabilityStatus,
} from '../../core/types'
import { RouteService } from '../routes'
import { TradingLimitsService } from './TradingLimitsService'
import { BIPOOL_MANAGER_ABI, BREAKERBOX_ABI, FPMM_ABI } from '../../core/abis'
import { ChainId, getContractAddress, tryGetContractAddress } from '../../core/constants'
import { multicall } from '../../utils/multicall'

/**
 * Service for checking trading status and circuit breaker state in the Mento protocol.
 * Provides methods to query whether trading is enabled for specific rate feeds,
 * token pairs, or routes. Also integrates trading limit checks.
 */
export class TradingService {
  private tradingLimitsService: TradingLimitsService

  constructor(
    private publicClient: PublicClient,
    private chainId: number,
    private routeService: RouteService
  ) {
    this.tradingLimitsService = new TradingLimitsService(publicClient, chainId)
  }

  /**
   * Returns the current trading mode for a given rate feed.
   *
   * The BreakerBox uses a bitmask approach where 0 means bidirectional trading
   * is enabled, and any non-zero value means trading is suspended.
   *
   * @param rateFeedId - The address of the rate feed
   * @returns The raw trading mode value from BreakerBox (0 = enabled, non-zero = suspended)
   *
   * @example
   * ```typescript
   * const mode = await tradingService.getRateFeedTradingMode(rateFeedId)
   * if (mode === TradingMode.BIDIRECTIONAL) {
   *   console.log('Trading is enabled')
   * }
   * ```
   */
  async getRateFeedTradingMode(rateFeedId: string): Promise<number> {
    const breakerBoxAddr = getContractAddress(this.chainId as ChainId, 'BreakerBox')

    const mode = await this.publicClient.readContract({
      address: breakerBoxAddr as `0x${string}`,
      abi: BREAKERBOX_ABI,
      functionName: 'getRateFeedTradingMode',
      args: [rateFeedId as `0x${string}`],
    })

    return Number(mode)
  }

  /**
   * Checks if a trading pair is currently tradable.
   * For multi-hop routes (e.g., CELO → USDm → USDT), checks that ALL
   * intermediate rate feeds are in BIDIRECTIONAL mode.
   *
   * @param tokenIn - Input token address
   * @param tokenOut - Output token address
   * @returns true if the pair is tradable (all rate feeds BIDIRECTIONAL), false otherwise
   * @throws {RouteNotFoundError} If no route exists between the token pair
   *
   * @example
   * ```typescript
   * const isTradable = await tradingService.isPairTradable(USDm, CELO)
   * if (!isTradable) {
   *   console.log('Trading is currently suspended for this pair')
   * }
   * ```
   */
  async isPairTradable(tokenIn: string, tokenOut: string): Promise<boolean> {
    const route = await this.routeService.findRoute(tokenIn, tokenOut)
    return this.isRouteTradable(route)
  }

  /**
   * Checks if a route is currently tradable.
   * Verifies that all pools in the route's path have their rate feeds
   * in BIDIRECTIONAL mode.
   *
   * @param route - The route to check
   * @returns true if all pools in the route are tradable, false otherwise
   *
   * @example
   * ```typescript
   * const route = await routeService.findRoute(tokenIn, tokenOut)
   * const isRouteTradable = await tradingService.isRouteTradable(route)
   * ```
   */
  async isRouteTradable(route: Route): Promise<boolean> {
    const tradingModes = await this.getTradingModesForPools(route.path)

    // All rate feeds must have trading enabled for the route to be tradable
    return tradingModes.every((tradingMode) => isTradingEnabled(tradingMode))
  }

  /**
   * Get trading limits for a pool.
   *
   * @param pool - The pool to get trading limits for
   * @returns Array of TradingLimit objects with maxIn/maxOut/until
   *
   * @example
   * ```typescript
   * const limits = await tradingService.getPoolTradingLimits(pool)
   * limits.forEach(limit => {
   *   console.log(`${limit.asset}: maxIn=${limit.maxIn}, maxOut=${limit.maxOut}`)
   * })
   * ```
   */
  async getPoolTradingLimits(pool: Pool): Promise<TradingLimit[]> {
    return this.tradingLimitsService.getPoolTradingLimits(pool)
  }

  /**
   * Get complete tradability status for a pool.
   * Returns separate flags for circuit breaker and trading limits,
   * allowing frontends to show different messages for each condition.
   *
   * @param pool - The pool to check
   * @returns PoolTradabilityStatus with tradable, circuitBreakerOk, limitsOk, and limits
   *
   * @example
   * ```typescript
   * const status = await tradingService.getPoolTradabilityStatus(pool)
   * if (!status.circuitBreakerOk) {
   *   showModal("Trading temporarily suspended (circuit breaker)")
   * } else if (!status.limitsOk) {
   *   showModal("Trading limit reached", status.limits)
   * }
   * ```
   */
  async getPoolTradabilityStatus(pool: Pool): Promise<PoolTradabilityStatus> {
    const [[tradingMode], limits] = await Promise.all([
      this.getTradingModesForPools([pool]),
      this.tradingLimitsService.getPoolTradingLimits(pool),
    ])

    const circuitBreakerOk = isTradingEnabled(tradingMode)

    // Limits are OK if no limits configured OR all limits have capacity
    const limitsOk = limits.length === 0 || limits.every((l) => l.maxIn > 0n && l.maxOut > 0n)

    return {
      tradable: circuitBreakerOk && limitsOk,
      circuitBreakerOk,
      tradingMode,
      limitsOk,
      limits,
    }
  }

  /**
   * Get the reference rate feed ID for a pool.
   * FPMM pools expose this via referenceRateFeedID() directly.
   * Virtual pools wrap a BiPoolManager exchange; the rate feed is read from
   * BiPoolManager.getPoolExchange(exchangeId).config.referenceRateFeedID.
   *
   * @param pool - The pool to get rate feed ID for
   * @returns The rate feed ID address
   */
  async getPoolRateFeedId(pool: Pool): Promise<string> {
    const [rateFeedId] = await this.getPoolRateFeedIds([pool])
    return rateFeedId
  }

  private async getTradingModesForPools(pools: readonly Pool[]): Promise<number[]> {
    const rateFeedIds = await this.getPoolRateFeedIds(pools)
    return this.getTradingModesForRateFeeds(rateFeedIds)
  }

  private async getPoolRateFeedIds(pools: readonly Pool[]): Promise<string[]> {
    if (pools.length === 0) {
      return []
    }

    const biPoolManagerAddr = pools.some((pool) => pool.poolType === PoolType.Virtual)
      ? tryGetContractAddress(this.chainId as ChainId, 'BiPoolManager')
      : undefined

    const contracts = pools.map((pool) => {
      if (pool.poolType === PoolType.Virtual) {
        if (!pool.exchangeId) {
          throw new Error(`Virtual pool ${pool.poolAddr} is missing exchangeId`)
        }
        if (!biPoolManagerAddr) {
          throw new Error(
            `BiPoolManager address not configured for chain ID ${this.chainId}; cannot resolve rate feed for virtual pool ${pool.poolAddr}`
          )
        }

        return {
          address: biPoolManagerAddr as `0x${string}`,
          abi: BIPOOL_MANAGER_ABI,
          functionName: 'getPoolExchange',
          args: [pool.exchangeId as `0x${string}`] as const,
        }
      }

      return {
        address: pool.poolAddr as `0x${string}`,
        abi: FPMM_ABI,
        functionName: 'referenceRateFeedID',
        args: [] as const,
      }
    })

    const results = await multicall(this.publicClient, contracts, { allowFailure: false })

    return results.map((result, index) => {
      if (result.status === 'failure') {
        throw result.error
      }

      if (pools[index].poolType === PoolType.Virtual) {
        const exchange = result.result as { config: { referenceRateFeedID: string } }
        return exchange.config.referenceRateFeedID
      }

      return result.result as string
    })
  }

  private async getTradingModesForRateFeeds(rateFeedIds: readonly string[]): Promise<number[]> {
    if (rateFeedIds.length === 0) {
      return []
    }

    const breakerBoxAddr = getContractAddress(this.chainId as ChainId, 'BreakerBox')
    const uniqueRateFeeds = Array.from(
      new Map(rateFeedIds.map((rateFeedId) => [rateFeedId.toLowerCase(), rateFeedId])).values()
    )

    const results = await multicall(
      this.publicClient,
      uniqueRateFeeds.map((rateFeedId) => ({
        address: breakerBoxAddr as `0x${string}`,
        abi: BREAKERBOX_ABI,
        functionName: 'getRateFeedTradingMode',
        args: [rateFeedId as `0x${string}`] as const,
      })),
      { allowFailure: false }
    )

    const tradingModes = new Map<string, number>()
    for (const [index, result] of results.entries()) {
      if (result.status === 'failure') {
        throw result.error
      }

      tradingModes.set(uniqueRateFeeds[index].toLowerCase(), Number(result.result))
    }

    return rateFeedIds.map((rateFeedId) => {
      const tradingMode = tradingModes.get(rateFeedId.toLowerCase())
      if (tradingMode === undefined) {
        throw new Error(`Trading mode not found for rate feed ${rateFeedId}`)
      }

      return tradingMode
    })
  }
}
