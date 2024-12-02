import { IERC20Token } from './token'

export interface Exchange {
  exchangeId: string
  providerAddress: string
  assets: string[]
}

export interface EnrichedExchange {
  exchangeId: string
  providerAddress: string
  assets: IERC20Token[]
}
