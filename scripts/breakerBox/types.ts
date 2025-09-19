import { Mento } from '../../src/mento'

// Interface for exchange data
export interface ExchangeData {
  id: string
  assets: string[]
  providerAddr?: string
}

// Export types from SDK to avoid importing from multiple places
export { Mento }
