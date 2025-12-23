import { ISupplyCalculator } from '../../services'

export interface Token {
  address: string
  symbol: string
  name?: string
  decimals?: number
}

export interface StableToken extends Token {
  totalSupply: string
}

export type CollateralAsset = Token

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
  [tokenSymbol: string]: readonly SupplyAdjustment[]
}
