import { Address } from './tradingLimit'

export interface TradingLimitsConfig {
  asset: Address
  timestep0: number
  timestep1: number
  limit0: number
  limit1: number
  limitGlobal: number
  flags: number
}
