export const RPC_URLS: Record<number, string> = {
  42220: 'https://forno.celo.org',
}

export const CHAIN_NAMES: Record<number, string> = {
  42220: 'Celo',
}

export const CHAIN_NAME_TO_ID: Record<string, number> = {
  celo: 42220,
}

export const DEFAULT_CHAIN_ID = 42220
export const DEFAULT_TIMEOUT_MS = 10000
export const QUOTE_TIMEOUT_MS = 8000 // Timeout for individual quote calculations
export const DEFAULT_BATCH_SIZE = 10
export const DEFAULT_BATCH_DELAY_MS = 100
export const DEFAULT_SPREAD_FALLBACK = 0.25
export const MAX_DECIMAL_PLACES = 4

// ERC20 token ABI fragment for decimals
export const TOKEN_ABI_FRAGMENT = [
  {
    name: 'decimals',
    type: 'function',
    inputs: [],
    outputs: [{ type: 'uint8' }],
    stateMutability: 'view',
  },
] as const

export const DEFAULT_DECIMALS = 18
