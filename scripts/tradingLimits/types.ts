import Table from 'cli-table3'
import { ethers } from 'ethers'
import {
  TradingLimit,
  TradingLimitsConfig,
  TradingLimitsState,
} from '../../src/interfaces'
import { Mento } from '../../src/mento'

// Interface for asset information
export interface AssetInfo {
  address: string
  symbol: string
}

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
export { Mento, TradingLimit, TradingLimitsConfig, TradingLimitsState }

// Define function types for external functions to use in processExchange
export type GetLimitIdFunc = (exchangeId: string, asset: string) => string
export type ProcessExchangeFunc = (
  exchange: ExchangeData,
  mento: Mento,
  provider: ethers.providers.Provider,
  args: ScriptArgs,
  limitsTable: Table.Table,
  getLimitId: GetLimitIdFunc
) => Promise<void>
