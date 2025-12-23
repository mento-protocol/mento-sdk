import { PublicClient, Address } from 'viem'
import type {
  Pool,
  TradingLimit,
  TradingLimitsConfigV1,
  TradingLimitsStateV1,
  TradingLimitsConfigV2,
  TradingLimitsStateV2,
} from '../../core/types'
import { PoolType } from '../../core/types'
import { FPMM_ABI, BROKER_ABI } from '../../core/abis'
import { getContractAddress, ChainId } from '../../core/constants'
import {
  computeLimitId,
  calculateTradingLimitsV1,
  calculateTradingLimitsV2,
  hasConfiguredLimitsV1,
  hasConfiguredLimitsV2,
} from '../../utils/tradingLimits'

/**
 * Service for querying trading limits from the Mento protocol.
 * Supports both FPMM pools (TradingLimitsV2) and Virtual pools (TradingLimitsV1).
 */
export class TradingLimitsService {
  constructor(
    private publicClient: PublicClient,
    private chainId: number
  ) {}

  /**
   * Get trading limits for a pool.
   * Returns an array of TradingLimit objects for each configured limit.
   *
   * @param pool - The pool to get trading limits for
   * @returns Array of TradingLimit objects with maxIn/maxOut/until
   */
  async getPoolTradingLimits(pool: Pool): Promise<TradingLimit[]> {
    if (pool.poolType === PoolType.FPMM) {
      return this.getFPMMTradingLimits(pool)
    } else {
      return this.getVirtualPoolTradingLimits(pool)
    }
  }

  /**
   * Get trading limits for an FPMM pool.
   * FPMM pools use TradingLimitsV2 with fixed timeframes.
   */
  private async getFPMMTradingLimits(pool: Pool): Promise<TradingLimit[]> {
    const limits: TradingLimit[] = []

    // Get trading limits for both tokens
    const [token0Limits, token1Limits] = await Promise.all([
      this.getFPMMTokenLimits(pool.poolAddr, pool.token0),
      this.getFPMMTokenLimits(pool.poolAddr, pool.token1),
    ])

    limits.push(...token0Limits)
    limits.push(...token1Limits)

    return limits
  }

  /**
   * Get trading limits for a specific token in an FPMM pool.
   */
  private async getFPMMTokenLimits(
    poolAddr: string,
    token: string
  ): Promise<TradingLimit[]> {
    try {
      const result = await this.publicClient.readContract({
        address: poolAddr as Address,
        abi: FPMM_ABI,
        functionName: 'getTradingLimits',
        args: [token as Address],
      })

      // Result is a tuple: [config, state]
      const [configTuple, stateTuple] = result as [
        { limit0: bigint; limit1: bigint; decimals: number },
        { lastUpdated0: number; lastUpdated1: number; netflow0: bigint; netflow1: bigint }
      ]

      const config: TradingLimitsConfigV2 = {
        limit0: configTuple.limit0,
        limit1: configTuple.limit1,
        decimals: configTuple.decimals,
      }

      const state: TradingLimitsStateV2 = {
        lastUpdated0: Number(stateTuple.lastUpdated0),
        lastUpdated1: Number(stateTuple.lastUpdated1),
        netflow0: stateTuple.netflow0,
        netflow1: stateTuple.netflow1,
      }

      if (!hasConfiguredLimitsV2(config)) {
        return []
      }

      return calculateTradingLimitsV2(config, state, token)
    } catch {
      // Token may not have limits configured, or invalid token
      return []
    }
  }

  /**
   * Get trading limits for a Virtual pool.
   * Virtual pools use TradingLimitsV1 via the Broker contract.
   */
  private async getVirtualPoolTradingLimits(pool: Pool): Promise<TradingLimit[]> {
    if (!pool.exchangeId) {
      console.warn(`Virtual pool ${pool.poolAddr} missing exchangeId - cannot query trading limits`)
      return []
    }

    const limits: TradingLimit[] = []

    // Get trading limits for both tokens
    const [token0Limits, token1Limits] = await Promise.all([
      this.getVirtualPoolTokenLimits(pool.exchangeId, pool.token0),
      this.getVirtualPoolTokenLimits(pool.exchangeId, pool.token1),
    ])

    limits.push(...token0Limits)
    limits.push(...token1Limits)

    return limits
  }

  /**
   * Get trading limits for a specific token in a Virtual pool.
   */
  private async getVirtualPoolTokenLimits(
    exchangeId: string,
    token: string
  ): Promise<TradingLimit[]> {
    const brokerAddr = getContractAddress(this.chainId as ChainId, 'Broker')
    const limitId = computeLimitId(exchangeId, token)

    try {
      // Fetch config and state in parallel
      const [configResult, stateResult] = await Promise.all([
        this.publicClient.readContract({
          address: brokerAddr as Address,
          abi: BROKER_ABI,
          functionName: 'tradingLimitsConfig',
          args: [limitId],
        }),
        this.publicClient.readContract({
          address: brokerAddr as Address,
          abi: BROKER_ABI,
          functionName: 'tradingLimitsState',
          args: [limitId],
        }),
      ])

      // Parse config result
      const configTuple = configResult as [number, number, bigint, bigint, bigint, number]
      const config: TradingLimitsConfigV1 = {
        timestep0: Number(configTuple[0]),
        timestep1: Number(configTuple[1]),
        limit0: configTuple[2],
        limit1: configTuple[3],
        limitGlobal: configTuple[4],
        flags: Number(configTuple[5]),
      }

      // Parse state result
      const stateTuple = stateResult as [number, number, bigint, bigint, bigint]
      const state: TradingLimitsStateV1 = {
        lastUpdated0: Number(stateTuple[0]),
        lastUpdated1: Number(stateTuple[1]),
        netflow0: stateTuple[2],
        netflow1: stateTuple[3],
        netflowGlobal: stateTuple[4],
      }

      // Only return limits if configured
      if (!hasConfiguredLimitsV1(config)) {
        return []
      }

      // Get token decimals (V1 uses 0 decimals internally, but we track token decimals for display)
      // For now, return 0 as the reference - consumers should query token decimals separately
      const tokenDecimals = 0 // V1 stores values with 0 decimal precision

      return calculateTradingLimitsV1(config, state, token, tokenDecimals)
    } catch {
      // Trading limits may not be configured for this token
      return []
    }
  }
}
