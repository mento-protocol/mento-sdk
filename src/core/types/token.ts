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
