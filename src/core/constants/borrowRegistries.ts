import { ChainId } from './chainId'

/**
 * Known AddressesRegistry contracts per chain, keyed by debt token symbol.
 * Each registry is the entry point for one Bold deployment.
 */
export const borrowRegistries: Record<number, Record<string, string>> = {
  // TODO: Consider making the key for the address registry strongly typed (TokenSymbol)
  [ChainId.CELO]: {
    GBPm: '0xC54519F356459c6E48dA5468885f2F61eAB4a001',
  },
  [ChainId.CELO_SEPOLIA]: {
    GBPm: '0x8b33D626E8d79388889d404fBC515Ed131c9508e',
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
