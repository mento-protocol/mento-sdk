import { PublicClient } from 'viem'
import { TradingMode, isTradingEnabled, Route, Pool } from '../../core/types'
import { RouteService } from '../routes'
import { BREAKERBOX_ABI, FPMM_ABI } from '../../core/abis'
import { getContractAddress, ChainId } from '../../core/constants'

// TODO: Could be expanded to include trading limit checks

/**
 * Service for checking trading status and circuit breaker state in the Mento protocol.
 * Provides methods to query whether trading is enabled for specific rate feeds,
 * token pairs, or routes.
 */
export class TradingService {
  constructor(
    private publicClient: PublicClient,
    private chainId: number,
    private routeService: RouteService
  ) {}

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
   * Get the reference rate feed ID for a pool.
   * Both FPMM and Virtual pools expose this via the referenceRateFeedID() view function.
   *
   * @param pool - The pool to get rate feed ID for
   * @returns The rate feed ID address
   * @private
   */
  private async getPoolRateFeedId(pool: Pool): Promise<string> {
    const rateFeedId = await this.publicClient.readContract({
      address: pool.poolAddr as `0x${string}`,
      abi: FPMM_ABI,
      functionName: 'referenceRateFeedID',
    })

    return rateFeedId as string
  }
}
