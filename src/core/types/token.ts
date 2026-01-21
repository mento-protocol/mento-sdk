import { ISupplyCalculator } from '../../services'

/**
 * Minimal token info for routing purposes.
 * Contains only the fields needed to identify and route between tokens.
 */
export interface RouteToken {
  address: string
  symbol: string
}

/**
 * Full token info for consumer-facing operations.
 * Extends RouteToken with display and transaction fields.
 */
export interface Token extends RouteToken {
  name: string
  decimals: number
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
