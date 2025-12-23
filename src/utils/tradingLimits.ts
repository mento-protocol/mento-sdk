import { pad, hexToBigInt, numberToHex } from 'viem'
import type {
  TradingLimit,
  TradingLimitsConfigV1,
  TradingLimitsStateV1,
  TradingLimitsConfigV2,
  TradingLimitsStateV2,
} from '../core/types'

/** V2 trading limits use 15 decimals internally */
const V2_INTERNAL_DECIMALS = 15

/** V2 L0 window is fixed at 5 minutes */
const V2_L0_TIMESTEP = 5 * 60 // 300 seconds

/** V2 L1 window is fixed at 1 day */
const V2_L1_TIMESTEP = 24 * 60 * 60 // 86400 seconds

/** Far future timestamp for global limits (year 2030) */
const TIMESTAMP_FAR_FUTURE = 1893456000

/**
 * Compute limit ID for Broker (V1) trading limits.
 * limitId = exchangeId XOR bytes32(uint256(uint160(token)))
 *
 * @param exchangeId - The exchange ID (bytes32)
 * @param token - The token address
 * @returns The limit ID as hex string
 */
export function computeLimitId(exchangeId: string, token: string): `0x${string}` {
  // Pad token address to 32 bytes (left-padded with zeros)
  const tokenBytes32 = pad(token as `0x${string}`, { size: 32 })

  // Convert both to BigInt for XOR operation
  const exchangeIdBigInt = hexToBigInt(exchangeId as `0x${string}`)
  const tokenBigInt = hexToBigInt(tokenBytes32)

  // XOR operation
  const limitIdBigInt = exchangeIdBigInt ^ tokenBigInt

  // Convert back to hex with proper padding
  return pad(numberToHex(limitIdBigInt), { size: 32 })
}

/**
 * Calculate trading limits from V1 config and state (Broker/Virtual pools).
 * Returns human-friendly TradingLimit objects with maxIn/maxOut/until.
 *
 * @param config - V1 trading limits configuration
 * @param state - V1 trading limits state
 * @param asset - Token address
 * @param tokenDecimals - Token decimals for consumer reference
 * @returns Array of TradingLimit objects
 */
export function calculateTradingLimitsV1(
  config: TradingLimitsConfigV1,
  state: TradingLimitsStateV1,
  asset: string,
  tokenDecimals: number
): TradingLimit[] {
  const nowEpoch = Math.floor(Date.now() / 1000)
  const limits: TradingLimit[] = []

  // Check if L0 is enabled (bit 0 of flags)
  const isL0Enabled = (config.flags & 0x01) !== 0
  // Check if L1 is enabled (bit 1 of flags)
  const isL1Enabled = (config.flags & 0x02) !== 0
  // Check if LG is enabled (bit 2 of flags)
  const isLGEnabled = (config.flags & 0x04) !== 0

  // Reset netflows if time windows have passed
  const isL0Outdated = isL0Enabled && nowEpoch > state.lastUpdated0 + config.timestep0
  const isL1Outdated = isL1Enabled && nowEpoch > state.lastUpdated1 + config.timestep1

  const effectiveNetflow0 = isL0Outdated ? 0n : state.netflow0
  const effectiveNetflow1 = isL1Outdated ? 0n : state.netflow1
  const effectiveLastUpdated0 = isL0Outdated ? nowEpoch : state.lastUpdated0
  const effectiveLastUpdated1 = isL1Outdated ? nowEpoch : state.lastUpdated1

  // Add L0 limit if configured
  if (isL0Enabled && config.limit0 > 0n) {
    limits.push({
      asset,
      maxIn: config.limit0 - effectiveNetflow0,
      maxOut: config.limit0 + effectiveNetflow0,
      until: effectiveLastUpdated0 + config.timestep0,
      decimals: tokenDecimals,
    })
  }

  // Add L1 limit if configured
  if (isL1Enabled && config.limit1 > 0n) {
    limits.push({
      asset,
      maxIn: config.limit1 - effectiveNetflow1,
      maxOut: config.limit1 + effectiveNetflow1,
      until: effectiveLastUpdated1 + config.timestep1,
      decimals: tokenDecimals,
    })
  }

  // Add LG (global) limit if configured
  if (isLGEnabled && config.limitGlobal > 0n) {
    limits.push({
      asset,
      maxIn: config.limitGlobal - state.netflowGlobal,
      maxOut: config.limitGlobal + state.netflowGlobal,
      until: TIMESTAMP_FAR_FUTURE,
      decimals: tokenDecimals,
    })
  }

  // Apply cascading restrictions: limits with larger timeframes restrict smaller ones
  // e.g., if maxIn is 0 in LG, it should also be 0 in L1 and L0
  for (let i = limits.length - 1; i > 0; i--) {
    if (limits[i - 1].maxIn > limits[i].maxIn) {
      limits[i - 1] = { ...limits[i - 1], maxIn: limits[i].maxIn }
    }
    if (limits[i - 1].maxOut > limits[i].maxOut) {
      limits[i - 1] = { ...limits[i - 1], maxOut: limits[i].maxOut }
    }
  }

  return limits
}

/**
 * Calculate trading limits from V2 config and state (FPMM pools).
 * V2 uses fixed timeframes: 5 min for L0, 1 day for L1.
 * Values are stored with 15 decimals precision.
 *
 * @param config - V2 trading limits configuration
 * @param state - V2 trading limits state
 * @param asset - Token address
 * @returns Array of TradingLimit objects
 */
export function calculateTradingLimitsV2(
  config: TradingLimitsConfigV2,
  state: TradingLimitsStateV2,
  asset: string
): TradingLimit[] {
  const nowEpoch = Math.floor(Date.now() / 1000)
  const limits: TradingLimit[] = []

  // Check if L0 is configured (limit0 > 0)
  const isL0Enabled = config.limit0 > 0n
  // Check if L1 is configured (limit1 > 0)
  const isL1Enabled = config.limit1 > 0n

  // Reset netflows if time windows have passed
  const isL0Outdated = isL0Enabled && nowEpoch > state.lastUpdated0 + V2_L0_TIMESTEP
  const isL1Outdated = isL1Enabled && nowEpoch > state.lastUpdated1 + V2_L1_TIMESTEP

  const effectiveNetflow0 = isL0Outdated ? 0n : state.netflow0
  const effectiveNetflow1 = isL1Outdated ? 0n : state.netflow1
  const effectiveLastUpdated0 = isL0Outdated ? nowEpoch : state.lastUpdated0
  const effectiveLastUpdated1 = isL1Outdated ? nowEpoch : state.lastUpdated1

  // Add L0 limit if configured
  if (isL0Enabled) {
    limits.push({
      asset,
      maxIn: config.limit0 - effectiveNetflow0,
      maxOut: config.limit0 + effectiveNetflow0,
      until: effectiveLastUpdated0 + V2_L0_TIMESTEP,
      decimals: V2_INTERNAL_DECIMALS, // V2 returns 15 decimal values
    })
  }

  // Add L1 limit if configured
  if (isL1Enabled) {
    limits.push({
      asset,
      maxIn: config.limit1 - effectiveNetflow1,
      maxOut: config.limit1 + effectiveNetflow1,
      until: effectiveLastUpdated1 + V2_L1_TIMESTEP,
      decimals: V2_INTERNAL_DECIMALS, // V2 returns 15 decimal values
    })
  }

  // Apply cascading restrictions
  for (let i = limits.length - 1; i > 0; i--) {
    if (limits[i - 1].maxIn > limits[i].maxIn) {
      limits[i - 1] = { ...limits[i - 1], maxIn: limits[i].maxIn }
    }
    if (limits[i - 1].maxOut > limits[i].maxOut) {
      limits[i - 1] = { ...limits[i - 1], maxOut: limits[i].maxOut }
    }
  }

  return limits
}

/**
 * Check if any trading limits are configured (flags > 0 for V1, or limit0/limit1 > 0 for V2)
 */
export function hasConfiguredLimitsV1(config: TradingLimitsConfigV1): boolean {
  return config.flags > 0
}

/**
 * Check if any trading limits are configured for V2
 */
export function hasConfiguredLimitsV2(config: TradingLimitsConfigV2): boolean {
  return config.limit0 > 0n || config.limit1 > 0n
}
