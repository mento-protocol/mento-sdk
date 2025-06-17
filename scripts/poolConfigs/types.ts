import { Mento } from '../../src'

export interface Asset {
  address: string
  symbol: string
}

export interface ExchangeData {
  exchangeId: string
  asset0: Asset
  asset1: Asset
  spread: number
  referenceRateFeedID: string
  referenceRateResetFrequency: number
  minimumReports: number
  stablePoolResetSize: number
}

export { Mento } 