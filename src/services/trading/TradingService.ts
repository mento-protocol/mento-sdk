import { PublicClient } from 'viem'
import {
  isTradingEnabled,
  Route,
  Pool,
  TradingLimit,
  PoolTradabilityStatus,
} from '../../core/types'
import { RouteService } from '../routes'
import { TradingLimitsService } from './TradingLimitsService'
import { BREAKERBOX_ABI, FPMM_ABI } from '../../core/abis'
import { getContractAddress, ChainId } from '../../core/constants'

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
   * const isTradable = await tradingService.isPairTradable(cUSD, CELO)
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
    // Get rate feed IDs for each pool in the path and check trading modes
    const rateFeedChecks = await Promise.all(
      route.path.map(async (pool) => {
        const rateFeedId = await this.getPoolRateFeedId(pool)
        const tradingMode = await this.getRateFeedTradingMode(rateFeedId)
        return isTradingEnabled(tradingMode)
      })
    )

    // All rate feeds must have trading enabled for the route to be tradable
    return rateFeedChecks.every((isEnabled) => isEnabled)
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
    const [rateFeedId, limits] = await Promise.all([
      this.getPoolRateFeedId(pool),
      this.tradingLimitsService.getPoolTradingLimits(pool),
    ])

    const tradingMode = await this.getRateFeedTradingMode(rateFeedId)
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
   * Both FPMM and Virtual pools expose this via the referenceRateFeedID() view function.
   *
   * @param pool - The pool to get rate feed ID for
   * @returns The rate feed ID address
   */
  async getPoolRateFeedId(pool: Pool): Promise<string> {
    const rateFeedId = await this.publicClient.readContract({
      address: pool.poolAddr as `0x${string}`,
      abi: FPMM_ABI,
      functionName: 'referenceRateFeedID',
    })

    return rateFeedId as string
  }
}
