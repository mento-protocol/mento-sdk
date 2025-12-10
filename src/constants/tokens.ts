// This file is auto-generated. Do not edit manually.
// Generated on 2025-12-10T13:15:03.085Z

import { Token } from '../mento'

/**
 * Gets cached tokens for a specific chain ID
 * @param chainId - The chain ID to get cached tokens for
 * @returns Promise resolving to the cached tokens or undefined if not available
 */
export async function getCachedTokens(
  chainId: number
): Promise<readonly Token[] | undefined> {
  switch (chainId) {
    case 42220:
      return await import('./tokens.42220').then(
        (module) => module.tokens42220
      )
    case 11142220:
      return await import('./tokens.11142220').then(
        (module) => module.tokens11142220
      )
    default:
      return undefined
  }
}

/**
 * Synchronously gets cached tokens for a specific chain ID
 * Note: This function throws if no cached tokens are available.
 * Use getCachedTokens() for async loading or when you want to handle missing cache gracefully.
 *
 * @param chainId - The chain ID to get cached tokens for
 * @returns The cached tokens
 * @throws Error if no cached tokens are available for the chain
 */
export function getCachedTokensSync(chainId: number): readonly Token[] {
  switch (chainId) {
    case 42220:
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      return require('./tokens.42220').tokens42220
    case 11142220:
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      return require('./tokens.11142220').tokens11142220
    default:
      throw new Error(
        `No cached tokens available for chain ID ${chainId}. ` +
        `Supported chains: 42220 (Celo), 11142220 (Celo Sepolia)`
      )
  }
}

/**
 * Token symbol enum for type-safe access across all chains
 * Note: Not all tokens are available on all chains - check TOKEN_ADDRESSES_BY_CHAIN
 */
export enum TokenSymbol {
  AUDm = 'AUDm',
  BRLm = 'BRLm',
  CADm = 'CADm',
  CELO = 'CELO',
  CHFm = 'CHFm',
  COPm = 'COPm',
  EURm = 'EURm',
  GBPm = 'GBPm',
  GHSm = 'GHSm',
  JPYm = 'JPYm',
  KESm = 'KESm',
  NGNm = 'NGNm',
  PHPm = 'PHPm',
  PUSO = 'PUSO',
  USDC = 'USDC',
  USDm = 'USDm',
  USD_ = 'USD₮',
  XOFm = 'XOFm',
  ZARm = 'ZARm',
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
 * Token addresses mapped by chain ID and symbol
 * Use this for type-safe token address lookups
 */
export const TOKEN_ADDRESSES_BY_CHAIN: {
  [chainId: number]: Partial<Record<TokenSymbol, string>>
} = {
  42220: {
    axlEUROC: '0x061cc5a2C863E0C1Cb404006D559dB18A34C762d',
    axlUSDC: '0xEB466342C4d449BC9f53A865D5Cb90586f405215',
    cAUD: '0x7175504C455076F15c04A2F90a8e352281F492F9',
    cCAD: '0xff4Ab19391af240c311c54200a492233052B6325',
    cCHF: '0xb55a79F398E759E43C95b979163f30eC87Ee131D',
    cCOP: '0x8A567e2aE79CA692Bd748aB832081C45de4041eA',
    CELO: '0x471EcE3750Da237f93B8E339c536989b8978a438',
    cEUR: '0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73',
    cGBP: '0xCCF663b1fF11028f0b19058d0f7B674004a40746',
    cGHS: '0xfAeA5F3404bbA20D3cc2f8C4B0A888F55a3c7313',
    cJPY: '0xc45eCF20f3CD864B32D9794d6f76814aE8892e20',
    cKES: '0x456a3D042C0DbD3db53D5489e98dFb038553B0d0',
    cNGN: '0xE2702Bd97ee33c88c8f6f92DA3B733608aa76F71',
    cREAL: '0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787',
    cUSD: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
    cZAR: '0x4c35853A3B4e647fD266f4de678dCc8fEC410BF6',
    eXOF: '0x73F93dcc49cB8A239e2032663e9475dd5ef29A08',
    PUSO: '0x105d4A9306D2E55a71d2Eb95B81553AE1dC20d7B',
    'USD₮': '0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e',
    USDC: '0xcebA9300f2b948710d2653dD7B07f33A8B32118C',
  },
  11142220: {
    AUDm: '0x5873Faeb42F3563dcD77F0fbbdA818E6d6DA3139',
    axlEUROC: '0x9883d788d40F1C7595a780ed881Ea833C7743B4B',
    axlUSDC: '0x6285De9DA7C1d329C0451628638908915002d9d1',
    BRLm: '0x2294298942fdc79417DE9E0D740A4957E0e7783a',
    CADm: '0xF151c9a13b78C84f93f50B8b3bC689fedc134F60',
    CELO: '0x471EcE3750Da237f93B8E339c536989b8978a438',
    CHFm: '0x284E9b7B623eAE866914b7FA0eB720C2Bb3C2980',
    COPm: '0x5F8d55c3627d2dc0a2B4afa798f877242F382F67',
    EURm: '0xA99dC247d6b7B2E3ab48a1fEE101b83cD6aCd82a',
    GBPm: '0x85F5181Abdbf0e1814Fc4358582Ae07b8eBA3aF3',
    GHSm: '0x5e94B8C872bD47BC4255E60ECBF44D5E66e7401C',
    JPYm: '0x85Bee67D435A39f7467a8a9DE34a5B73D25Df426',
    KESm: '0xC7e4635651E3e3Af82b61d3E23c159438daE3BbF',
    NGNm: '0x3d5ae86F34E2a82771496D140daFAEf3789dF888',
    PHPm: '0x0352976d940a2C3FBa0C3623198947Ee1d17869E',
    'USD₮': '0xd077A400968890Eacc75cdc901F0356c943e4fDb',
    USDC: '0x01C5C0122039549AD1493B8220cABEdD739BC44E',
    USDm: '0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b',
    XOFm: '0x5505b70207aE3B826c1A7607F19F3Bf73444A082',
    ZARm: '0x10CCfB235b0E1Ed394bACE4560C3ed016697687e',
  },
}
