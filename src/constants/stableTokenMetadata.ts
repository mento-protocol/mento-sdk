export const STABLE_TOKEN_SYMBOLS = {
  cUSD: 'cUSD',
  cEUR: 'cEUR',
  cREAL: 'cREAL',
  cKES: 'cKES',
  PUSO: 'PUSO',
  cCOP: 'cCOP',
  eXOF: 'eXOF',
} as const

export type StableTokenSymbol = keyof typeof STABLE_TOKEN_SYMBOLS

export const STABLE_TOKEN_FIAT_MAPPING: Record<StableTokenSymbol, string> = {
  cUSD: 'USD',
  cEUR: 'EUR',
  cREAL: 'BRL',
  cKES: 'KES',
  PUSO: 'PHP',
  cCOP: 'COP',
  eXOF: 'XOF',
} as const

export function getFiatTicker(symbol: StableTokenSymbol): string {
  const ticker = STABLE_TOKEN_FIAT_MAPPING[symbol]
  if (!ticker) {
    throw new Error(`No fiat ticker found for token symbol: ${symbol}`)
  }
  return ticker
}
