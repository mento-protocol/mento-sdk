import { ISupplyCalculator } from '../services'

export interface BaseToken {
  name: string
  symbol: string
  address: string
  decimals: number
}

export interface StableToken extends BaseToken {
  totalSupply: string
}

export type CollateralAsset = BaseToken

/**
 * A supply adjustment is a calculator that is used to adjust the supply of a token.
 * It takes the address of the token and will return the amount that should be removed 
 * from the total supply.
 *
 * @param calculator - The calculator to use to adjust the supply.
 */
export interface SupplyAdjustment {
  calculator: ISupplyCalculator
}

export interface TokenSupplyConfig {
  [tokenSymbol: string]: SupplyAdjustment[]
}
