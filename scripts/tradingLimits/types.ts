import { TradingLimit } from '../../src/interfaces'
import { Mento } from '../../src/mento'

// Interface for exchange data
export interface ExchangeData {
  id: string
  assets: string[]
  providerAddr?: string
}

// Command line arguments interface
export interface ScriptArgs {
  token: string
  exchange: string
}

// Export types from SDK to avoid importing from multiple places
export { Mento, TradingLimit }
