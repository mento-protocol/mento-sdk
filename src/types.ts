export type Address = string

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

export interface ContractAddressMap {
  [chainId: string]: ContractAddresses
}

export interface ContractAddresses {
  Airgrab: string
  Emission: string
  Factory: string
  MentoGovernor: string
  MentoToken: string
  TimelockController: string
}
