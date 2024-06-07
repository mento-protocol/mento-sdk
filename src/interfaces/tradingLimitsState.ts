import { Address } from './tradingLimit'

export interface TradingLimitsState {
  asset: Address
  lastUpdated0: number
  lastUpdated1: number
  netflow0: number
  netflow1: number
  netflowGlobal: number
}
