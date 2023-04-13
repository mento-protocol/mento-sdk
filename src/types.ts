export type Address = string

export enum TradingMode {
  BI_DIRECTIONAL = 0,
}

export interface TradingLimit {
  asset: Address
  maxIn: number
  maxOut: number
  until: number
}

export interface TradingLimitsConfig {
  timestep0: number
  timestep1: number
  limit0: number
  limit1: number
  limitGlobal: number
  flags: number
}

export interface TradingLimitsState {
  lastUpdated0: number
  lastUpdated1: number
  netflow0: number
  netflow1: number
  netflowGlobal: number
}
