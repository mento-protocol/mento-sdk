import { ChainId } from './chainId'

/**
 * Known AddressesRegistry contracts per chain, keyed by debt token symbol.
 * Each registry is the entry point for one Bold deployment.
 */
export const borrowRegistries: Record<number, Record<string, string>> = {
  [ChainId.CELO]: {
    GBPm: '0xB3136DBadB14Ab587FFa91545538126938Fe0C6E',
    CHFm: '0xCa70801D91576d069190d1D4CFDDEbdc237A4537',
    JPYm: '0x8f99Aac2FE09A1390617D4AcDD1519f775eE931A',
  },
  [ChainId.CELO_SEPOLIA]: {
    GBPm: '0x8b33D626E8d79388889d404fBC515Ed131c9508e',
    CHFm: '0x1e3CCCC62cEBd9Bf2a26Ba512E3abee086816c58',
    JPYm: '0x812e5ccEC5E55B81F4270898FDF1C916e3a284Fb',
  },
}

export function getBorrowRegistry(chainId: number, debtTokenSymbol: string): string {
  const registries = borrowRegistries[chainId]
  if (!registries) {
    throw new Error(`No borrow registries found for chain ID ${chainId}`)
  }
  const registry = registries[debtTokenSymbol]
  if (!registry) {
    const available = Object.keys(registries).join(', ') || 'none'
    throw new Error(
      `No borrow registry found for "${debtTokenSymbol}" on chain ${chainId}. Available: ${available}`
    )
  }
  return registry
}
