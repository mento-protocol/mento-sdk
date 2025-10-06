// This file is auto-generated. Do not edit manually.
// Generated on 2025-10-06T16:08:43.519Z

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
    case 44787:
      return await import('./tokens.44787').then(
        (module) => module.tokens44787
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
    case 44787:
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      return require('./tokens.44787').tokens44787
    case 11142220:
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      return require('./tokens.11142220').tokens11142220
    default:
      throw new Error(
        `No cached tokens available for chain ID ${chainId}. ` +
        `Supported chains: 42220 (Celo), 44787 (Alfajores), 11142220 (Celo Sepolia)`
      )
  }
}

/**
 * Token symbol enum for type-safe access across all chains
 * Note: Not all tokens are available on all chains - check TOKEN_ADDRESSES_BY_CHAIN
 */
export enum TokenSymbol {
  BridgedEUROC = 'BridgedEUROC',
  BridgedUSDC = 'BridgedUSDC',
  CELO = 'CELO',
  PUSO = 'PUSO',
  USDC = 'USDC',
  USDT = 'USDT',
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
  44787: {
    BridgedEUROC: '0x6e673502c5b55F3169657C004e5797fFE5be6653',
    BridgedUSDC: '0x87D61dA3d668797786D73BC674F053f87111570d',
    cAUD: '0x84CBD49F5aE07632B6B88094E81Cce8236125Fe0',
    cCAD: '0x02EC9E0D2Fd73e89168C1709e542a48f58d7B133',
    cCHF: '0xADC57C2C34aD021Df4421230a6532F4e2E1dCE4F',
    cCOP: '0xe6A57340f0df6E020c1c0a80bC6E13048601f0d4',
    CELO: '0xF194afDf50B03e69Bd7D057c1Aa9e10c9954E4C9',
    cEUR: '0x10c892A6EC43a53E45D0B916B4b7D383B1b78C0F',
    cGBP: '0x47f2Fb88105155a18c390641C8a73f1402B2BB12',
    cGHS: '0x295B66bE7714458Af45E6A6Ea142A5358A6cA375',
    cJPY: '0x2E51F41238cA36a421C9B8b3e189e8Cc7653FE67',
    cKES: '0x1E0433C1769271ECcF4CFF9FDdD515eefE6CdF92',
    cNGN: '0x4a5b03B8b16122D330306c65e4CA4BC5Dd6511d0',
    cREAL: '0xE4D517785D091D3c54818832dB6094bcc2744545',
    cUSD: '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1',
    cZAR: '0x1e5b44015Ff90610b54000DAad31C89b3284df4d',
    eXOF: '0xB0FA15e002516d0301884059c0aaC0F0C72b019D',
    PUSO: '0x5E0E3c9419C42a1B04e2525991FB1A2C467AB8bF',
    USDC: '0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B',
    USDT: '0xBba91F588d031469ABCCA566FE80fB1Ad8Ee3287',
  },
  11142220: {
    axlEUROC: '0x9883d788d40F1C7595a780ed881Ea833C7743B4B',
    axlUSDC: '0x6285De9DA7C1d329C0451628638908915002d9d1',
    cAUD: '0x5873Faeb42F3563dcD77F0fbbdA818E6d6DA3139',
    cCAD: '0xF151c9a13b78C84f93f50B8b3bC689fedc134F60',
    cCHF: '0x284E9b7B623eAE866914b7FA0eB720C2Bb3C2980',
    cCOP: '0x5F8d55c3627d2dc0a2B4afa798f877242F382F67',
    CELO: '0x471EcE3750Da237f93B8E339c536989b8978a438',
    cEUR: '0xA99dC247d6b7B2E3ab48a1fEE101b83cD6aCd82a',
    cGBP: '0x85F5181Abdbf0e1814Fc4358582Ae07b8eBA3aF3',
    cGHS: '0x5e94B8C872bD47BC4255E60ECBF44D5E66e7401C',
    cJPY: '0x85Bee67D435A39f7467a8a9DE34a5B73D25Df426',
    cKES: '0xC7e4635651E3e3Af82b61d3E23c159438daE3BbF',
    cNGN: '0x3d5ae86F34E2a82771496D140daFAEf3789dF888',
    cREAL: '0x2294298942fdc79417DE9E0D740A4957E0e7783a',
    cUSD: '0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b',
    cZAR: '0x10CCfB235b0E1Ed394bACE4560C3ed016697687e',
    eXOF: '0x5505b70207aE3B826c1A7607F19F3Bf73444A082',
    PUSO: '0x0352976d940a2C3FBa0C3623198947Ee1d17869E',
    USDC: '0xBD63e46Be8eF8D89dFde3054E7b9ECAEb8Ad83e9',
    USDT: '0xCA53d9b72646B254d29EBeEb4c5cde7BB4bb59e0',
  },
}
