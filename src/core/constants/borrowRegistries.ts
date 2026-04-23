import { ChainId } from './chainId'

/**
 * Known AddressesRegistry contracts per chain, keyed by debt token symbol.
 * Each registry is the entry point for one Bold deployment.
 */
export const borrowRegistries: Record<number, Record<string, string>> = {
  [ChainId.CELO]: {
    GBPm: '0xB3136DBadB14Ab587FFa91545538126938Fe0C6E',
  },
  [ChainId.CELO_SEPOLIA]: {
    GBPm: '0x8b33D626E8d79388889d404fBC515Ed131c9508e',
    CHFm: '0x1e3CCCC62cEBd9Bf2a26Ba512E3abee086816c58',
    JPYm: '0x812e5ccec5e55b81f4270898fdf1c916e3a284fb',
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
