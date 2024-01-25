export type Address = string

export interface TradingLimit {
  asset: Address
  maxIn: number
  maxOut: number
  until: number
}
