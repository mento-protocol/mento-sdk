export const STABLE_TOKEN_SYMBOLS = {
  cUSD: 'cUSD',
  cEUR: 'cEUR',
  cREAL: 'cREAL',
  cKES: 'cKES',
  PUSO: 'PUSO',
  cCOP: 'cCOP',
  eXOF: 'eXOF',
  cGHS: 'cGHS',
} as const

export type StableTokenSymbol = keyof typeof STABLE_TOKEN_SYMBOLS
