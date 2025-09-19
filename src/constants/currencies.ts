/**
 * List of supported currencies for rate feed generation and validation
 */
export const CURRENCIES = [
  "AUD",
  "USD", 
  "PHP",
  "ZAR",
  "CAD",
  "EUR",
  "BRL",
  "XOF",
  "COP",
  "GHS",
  "CHF",
  "NGN",
  "JPY",
  "GBP",
  "KES",
  "CELO",
  "ETH",
  "EURC",
  "EUROC",
  "USDC",
  "USDT"
] as const

export type Currency = typeof CURRENCIES[number]
