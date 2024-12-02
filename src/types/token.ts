import { ISupplyCalculator } from '../services'

export interface IERC20Token {
  name: string
  symbol: string
  address: string
  decimals: number
}

export interface StableToken extends IERC20Token {
  totalSupply: string
  fiatTicker: string
}

export type CollateralAsset = IERC20Token

export interface SupplyAdjustment {
  calculator: ISupplyCalculator
}

export interface TokenSupplyConfig {
  [tokenSymbol: string]: SupplyAdjustment[]
}
