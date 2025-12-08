// This file is auto-generated. Do not edit manually.
// Generated on 2025-12-08T15:57:38.695Z

import type { Token } from '../core/types'

/**
 * Enum of all token symbols across all supported chains
 */
export enum TokenSymbol {
  CELO = 'CELO',
  PUSO = 'PUSO',
  USDC = 'USDC',
  USD_ = 'USD₮',
  axlEUROC = 'axlEUROC',
  axlUSDC = 'axlUSDC',
  cAUD = 'cAUD',
  cCAD = 'cCAD',
  cCHF = 'cCHF',
  cCOP = 'cCOP',
  cEUR = 'cEUR',
  cGBP = 'cGBP',
  cGHS = 'cGHS',
  cJPY = 'cJPY',
  cKES = 'cKES',
  cNGN = 'cNGN',
  cREAL = 'cREAL',
  cUSD = 'cUSD',
  cZAR = 'cZAR',
  eXOF = 'eXOF',
}

/**
 * Get cached tokens for a specific chain ID
 * @param chainId - The chain ID to get tokens for
 * @returns Promise resolving to the cached tokens array, or undefined if not available
 */
export async function getCachedTokens(
  chainId: number
): Promise<readonly Token[] | undefined> {
  switch (chainId) {
    case 42220:
      return await import('../cache/tokens.42220').then((module) => module.tokens42220)
    default:
      return undefined
  }
}

/**
 * Get cached tokens synchronously for a specific chain ID
 * @param chainId - The chain ID to get tokens for
 * @returns The cached tokens array
 * @throws Error if tokens are not available for the chain
 */
export function getCachedTokensSync(chainId: number): readonly Token[] {
  switch (chainId) {
    case 42220:
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      return require('../cache/tokens.42220').tokens42220
    default:
      throw new Error(`No cached tokens available for chain ${chainId}`)
  }
}

/**
 * Mapping of token addresses by chain ID and token symbol
 * Useful for quickly looking up a token address by its symbol on a specific chain
 */
export const TOKEN_ADDRESSES_BY_CHAIN: {
  [chainId: number]: { [tokenSymbol in TokenSymbol]?: string }
} = {
  42220: {
      [TokenSymbol.cUSD]: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
      [TokenSymbol.cEUR]: '0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73',
      [TokenSymbol.cREAL]: '0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787',
      [TokenSymbol.eXOF]: '0x73F93dcc49cB8A239e2032663e9475dd5ef29A08',
      [TokenSymbol.cKES]: '0x456a3D042C0DbD3db53D5489e98dFb038553B0d0',
      [TokenSymbol.PUSO]: '0x105d4A9306D2E55a71d2Eb95B81553AE1dC20d7B',
      [TokenSymbol.cCOP]: '0x8A567e2aE79CA692Bd748aB832081C45de4041eA',
      [TokenSymbol.cGHS]: '0xfAeA5F3404bbA20D3cc2f8C4B0A888F55a3c7313',
      [TokenSymbol.cGBP]: '0xCCF663b1fF11028f0b19058d0f7B674004a40746',
      [TokenSymbol.cZAR]: '0x4c35853A3B4e647fD266f4de678dCc8fEC410BF6',
      [TokenSymbol.cCAD]: '0xff4Ab19391af240c311c54200a492233052B6325',
      [TokenSymbol.cAUD]: '0x7175504C455076F15c04A2F90a8e352281F492F9',
      [TokenSymbol.cCHF]: '0xb55a79F398E759E43C95b979163f30eC87Ee131D',
      [TokenSymbol.cNGN]: '0xE2702Bd97ee33c88c8f6f92DA3B733608aa76F71',
      [TokenSymbol.cJPY]: '0xc45eCF20f3CD864B32D9794d6f76814aE8892e20',
      [TokenSymbol.CELO]: '0x471EcE3750Da237f93B8E339c536989b8978a438',
      [TokenSymbol.axlEUROC]: '0x061cc5a2C863E0C1Cb404006D559dB18A34C762d',
      [TokenSymbol.USDC]: '0xcebA9300f2b948710d2653dD7B07f33A8B32118C',
      [TokenSymbol.axlUSDC]: '0xEB466342C4d449BC9f53A865D5Cb90586f405215',
      [TokenSymbol.USD_]: '0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e',
    },
}

/**
 * Get token address by chain ID and symbol
 * @param chainId - The chain ID
 * @param symbol - The token symbol
 * @returns The token address or undefined if not found
 */
export function getTokenAddress(
  chainId: number,
  symbol: TokenSymbol
): string | undefined {
  return TOKEN_ADDRESSES_BY_CHAIN[chainId]?.[symbol]
}

/**
 * Find a token by its symbol on a specific chain
 * @param chainId - The chain ID
 * @param symbol - The token symbol
 * @returns The token object or undefined if not found
 */
export function findTokenBySymbol(
  chainId: number,
  symbol: TokenSymbol
): Token | undefined {
  try {
    const tokens = getCachedTokensSync(chainId)
    return tokens.find((t) => t.symbol === symbol)
  } catch {
    return undefined
  }
}
