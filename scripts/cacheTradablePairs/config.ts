import type { TradablePairWithSpread } from '../../src/types'
import { NETWORK_MAP, rpcUrls } from '../shared/network'
import type { SupportedChainId } from '../shared/network'

// Re-export network constants for backward compatibility
export { NETWORK_MAP, rpcUrls }

// Re-export the interface for backward compatibility
export type { TradablePairWithSpread }

// Type for supported chain IDs
export type { SupportedChainId }
