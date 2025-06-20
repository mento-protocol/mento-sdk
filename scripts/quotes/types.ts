import { BigNumber } from 'ethers'
import { TradablePair } from '../../src/mento'

export interface SwapInfoArgs {
  from: string
  to: string
  amount?: string
  chainId?: number
  chain?: string
  all?: boolean
  verbose?: boolean
}

export interface RouteQuote {
  route: TradablePair
  outputAmount?: BigNumber
  effectiveRate?: number
  routeDisplay: string
  successful: boolean
  fixedSpread: number
  costRank?: number
}

export interface RouteInfo {
  route: TradablePair
  routeDisplay: string
  routeType: string
  spread: number
  index: number
}

export interface QuoteResult {
  outputAmount: BigNumber
  effectiveRate: number
  successful: boolean
}

export interface FormattedRoute {
  route: TradablePair
  paddedAmount: string
  index: number
  routeDisplay: string
  fixedSpread: number
  outputAmount?: BigNumber
  successful: boolean
}
