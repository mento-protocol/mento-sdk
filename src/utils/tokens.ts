// This file is auto-generated. Do not edit manually.
// Generated on 2025-12-03T19:52:12.955Z

import type { BaseToken } from '../core/types'

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
): Promise<readonly BaseToken[] | undefined> {
  switch (chainId) {
    case 42220:
      return await import('../cache/tokens.42220').then((module) => module.tokens42220)
    case 11142220:
      return await import('../cache/tokens.11142220').then((module) => module.tokens11142220)
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
export function getCachedTokensSync(chainId: number): readonly BaseToken[] {
  switch (chainId) {
    case 42220:
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      return require('../cache/tokens.42220').tokens42220
    case 11142220:
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      return require('../cache/tokens.11142220').tokens11142220
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
  11142220: {
      [TokenSymbol.cUSD]: '0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b',
      [TokenSymbol.cEUR]: '0xA99dC247d6b7B2E3ab48a1fEE101b83cD6aCd82a',
      [TokenSymbol.cREAL]: '0x2294298942fdc79417DE9E0D740A4957E0e7783a',
      [TokenSymbol.eXOF]: '0x5505b70207aE3B826c1A7607F19F3Bf73444A082',
      [TokenSymbol.cKES]: '0xC7e4635651E3e3Af82b61d3E23c159438daE3BbF',
      [TokenSymbol.PUSO]: '0x0352976d940a2C3FBa0C3623198947Ee1d17869E',
      [TokenSymbol.cCOP]: '0x5F8d55c3627d2dc0a2B4afa798f877242F382F67',
      [TokenSymbol.cGHS]: '0x5e94B8C872bD47BC4255E60ECBF44D5E66e7401C',
      [TokenSymbol.cGBP]: '0x85F5181Abdbf0e1814Fc4358582Ae07b8eBA3aF3',
      [TokenSymbol.cZAR]: '0x10CCfB235b0E1Ed394bACE4560C3ed016697687e',
      [TokenSymbol.cCAD]: '0xF151c9a13b78C84f93f50B8b3bC689fedc134F60',
      [TokenSymbol.cAUD]: '0x5873Faeb42F3563dcD77F0fbbdA818E6d6DA3139',
      [TokenSymbol.cCHF]: '0x284E9b7B623eAE866914b7FA0eB720C2Bb3C2980',
      [TokenSymbol.cJPY]: '0x85Bee67D435A39f7467a8a9DE34a5B73D25Df426',
      [TokenSymbol.cNGN]: '0x3d5ae86F34E2a82771496D140daFAEf3789dF888',
      [TokenSymbol.axlUSDC]: '0x6285De9DA7C1d329C0451628638908915002d9d1',
      [TokenSymbol.CELO]: '0x471EcE3750Da237f93B8E339c536989b8978a438',
      [TokenSymbol.axlEUROC]: '0x9883d788d40F1C7595a780ed881Ea833C7743B4B',
      [TokenSymbol.USD_]: '0xd077A400968890Eacc75cdc901F0356c943e4fDb',
      [TokenSymbol.USDC]: '0x01C5C0122039549AD1493B8220cABEdD739BC44E',
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
): BaseToken | undefined {
  const tokens = getCachedTokensSync(chainId)
  return tokens.find((t) => t.symbol === symbol)
}
