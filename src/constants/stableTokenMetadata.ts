export const STABLE_TOKEN_FIAT_MAPPING: Record<string, string> = {
  cUSD: 'USD',
  cEUR: 'EUR',
  cREAL: 'BRL',
  cKES: 'KES',
  PUSO: 'PHP',
  cCOP: 'COP',
  eXOF: 'XOF',
} as const

// Helper function to get FIAT ticker from token symbol
export function getFiatTicker(symbol: string): string {
  const ticker = STABLE_TOKEN_FIAT_MAPPING[symbol]
  if (!ticker) {
    // Don't throw an error if the ticker is not found, just return a blank string.
    // TODO: Need some better feedback for the consumer
    return ''
  }
  return ticker
}
