import { ISupplyCalculator } from '../services'

export interface BaseToken {
  name: string
  symbol: string
  address: string
  decimals: number
}

export interface StableToken extends BaseToken {
  totalSupply: string
  fiatTicker: string
}

export type CollateralAsset = BaseToken

export interface SupplyAdjustment {
  calculator: ISupplyCalculator
}

export interface TokenSupplyConfig {
  [tokenSymbol: string]: SupplyAdjustment[]
}
