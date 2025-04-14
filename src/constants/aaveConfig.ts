import { ChainId } from './chainId'

/**
 * Maps original tokens to their corresponding AAVE aToken addresses on different chains.
 * When tokens are supplied to AAVE, they are wrapped into aTokens that represent the
 * deposit position.
 */
export const AAVE_TOKEN_MAPPINGS: Record<number, Record<string, string>> = {
  [ChainId.CELO]: {
    // cUSD -> aCelcUSD
    '0x765DE816845861e75A25fCA122bb6898B8B1282a':
      '0xBba98352628B0B0c4b40583F593fFCb630935a45',
    // cEUR -> aCelcEUR
    '0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73':
      '0x34c02571094e08E935B8cf8dC10F1Ad6795f1f81',
  },
} as const
