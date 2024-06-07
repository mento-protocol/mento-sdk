import {
  Address,
  TradingLimit,
  TradingLimitsConfig,
  TradingLimitsState,
} from './interfaces'

import { Broker } from '@mento-protocol/mento-core-ts'
import { strict as assert } from 'assert'
import { utils } from 'ethers'

/**
 * Returns the limit configuration in the broker for the given exchange and asset
 * @param broker an instance of the broker
 * @param exchangeId the id of the exchange
 * @param asset the address of the limited asset
 * @returns the limit configuration
 */
export async function getLimitsConfig(
  broker: Broker,
  exchangeId: string,
  asset: Address
): Promise<TradingLimitsConfig> {
  const limitId = getLimitId(exchangeId, asset)
  const cfg = await broker.tradingLimitsConfig(limitId)

  return {
    asset,
    timestep0: cfg['timestep0'],
    timestep1: cfg['timestep1'],
    limit0: cfg['limit0'],
    limit1: cfg['limit1'],
    limitGlobal: cfg['limitGlobal'],
    flags: cfg['flags'],
  }
}

/**
 * Returns the limit state in the broker for the given exchange and asset
 * @param broker an instance of the broker
 * @param exchangeId the id of the exchange
 * @param asset the address of the limited asset
 * @returns the limit state
 */
export async function getLimitsState(
  broker: Broker,
  exchangeId: string,
  asset: Address
): Promise<TradingLimitsState> {
  const limitId = getLimitId(exchangeId, asset)

  const [cfg, state] = await Promise.all([
    getLimitsConfig(broker, exchangeId, asset),
    broker.tradingLimitsState(limitId),
  ])

  const isL0Enabled = cfg.timestep0 > 0
  const isL1Enabled = cfg.timestep1 > 0

  const nowEpoch = Math.floor(Date.now() / 1000)
  const isL0Outdated =
    isL0Enabled && nowEpoch > state['lastUpdated0'] + cfg.timestep0
  const isL1Outdated =
    isL1Enabled && nowEpoch > state['lastUpdated1'] + cfg.timestep1

  return {
    asset,
    lastUpdated0: isL0Outdated ? nowEpoch : state['lastUpdated0'],
    lastUpdated1: isL1Outdated ? nowEpoch : state['lastUpdated1'],
    netflow0: isL0Outdated ? 0 : state['netflow0'],
    netflow1: isL1Outdated ? 0 : state['netflow1'],
    netflowGlobal: state['netflowGlobal'],
  }
}

/**
 * Returns a human-friendly representation of the limits for the given exchange and asset
 * @param broker an instance of the broker
 * @param exchangeId the id of the exchange
 * @param asset the address of the asset with the limit
 * @returns a list of TradingLimit objects
 */
export async function getLimits(
  broker: Broker,
  exchangeId: string,
  asset: Address
): Promise<TradingLimit[]> {
  const [cfg, state] = await Promise.all([
    getLimitsConfig(broker, exchangeId, asset),
    getLimitsState(broker, exchangeId, asset),
  ])

  const limits: TradingLimit[] = []
  if (cfg.limit0 > 0) {
    limits.push({
      asset: asset,
      maxIn: cfg.limit0 - state.netflow0,
      maxOut: cfg.limit0 + state.netflow0,
      until: state.lastUpdated0 + cfg.timestep0,
    })
  }

  if (cfg.limit1 > 0) {
    limits.push({
      asset: asset,
      maxIn: cfg.limit1 - state.netflow1,
      maxOut: cfg.limit1 + state.netflow1,
      until: state.lastUpdated1 + cfg.timestep1,
    })
  }

  if (cfg.limitGlobal > 0) {
    const timestampIn2030 = 1893456000 // a far away timestamp
    limits.push({
      asset: asset,
      maxIn: cfg.limitGlobal - state.netflowGlobal,
      maxOut: cfg.limitGlobal + state.netflowGlobal,
      until: timestampIn2030,
    })
  }

  // Limits with a smaller timeframe are restricted by the ones with a larger one
  // e.g: if maxIn is 0 in LG, it should also be 0 in L1 and L0
  for (let i = limits.length - 1; i > 0; i--) {
    limits[i - 1].maxIn = Math.min(limits[i - 1].maxIn, limits[i].maxIn)
    limits[i - 1].maxOut = Math.min(limits[i - 1].maxOut, limits[i].maxOut)
  }

  return limits
}

/**
 * Returns the limit id for the given exchange and asset
 * @param exchangeId the id of the exchange
 * @param asset the address of the asset with the limit
 * @returns the limit id
 */
export function getLimitId(exchangeId: string, asset: Address): string {
  const assetBytes32 = utils.zeroPad(asset, 32)
  const exchangeIdBytes = utils.arrayify(exchangeId)
  const assetBytes = utils.arrayify(assetBytes32)
  assert(
    exchangeIdBytes.length === assetBytes.length,
    'exchangeId and asset0 must be the same length'
  )

  return utils.hexlify(exchangeIdBytes.map((b, i) => b ^ assetBytes[i]))
}
