import * as fs from 'fs'
import * as path from 'path'
import { Token } from '../../src/mento'

interface TokensByChain {
  [chainId: number]: Token[]
}

/**
 * Generate the main tokens.ts file with enums and helper functions
 * This file is dynamically generated from the cached token data
 */
export function generateTokensIndexFile(
  tokensByChain: TokensByChain,
  scriptDir: string
): void {
  // Collect all unique token symbols across all chains
  const allSymbols = new Set<string>()
  const tokenAddressesByChain: {
    [chainId: number]: { [symbol: string]: string }
  } = {}

  for (const [chainId, tokens] of Object.entries(tokensByChain)) {
    tokenAddressesByChain[Number(chainId)] = {}

    tokens.forEach((token: Token) => {
      allSymbols.add(token.symbol)
      tokenAddressesByChain[Number(chainId)][token.symbol] = token.address
    })
  }

  // Sort symbols alphabetically for consistent output
  const sortedSymbols = Array.from(allSymbols).sort()

  // Generate enum entries with safe identifiers
  const enumEntries = sortedSymbols
    .map((symbol) => {
      // Create a safe enum key (replace special characters)
      const safeKey = symbol.replace(/[^a-zA-Z0-9_]/g, '_')
      return `  ${safeKey} = '${symbol}',`
    })
    .join('\n')

  // Generate chain case statements for getCachedTokens
  const getCachedTokensCases = Object.keys(tokensByChain)
    .map((chainId) => {
      return `    case ${chainId}:
      return await import('./tokens.${chainId}').then(
        (module) => module.tokens${chainId}
      )`
    })
    .join('\n')

  // Generate chain case statements for getCachedTokensSync
  const getCachedTokensSyncCases = Object.keys(tokensByChain)
    .map((chainId) => {
      return `    case ${chainId}:
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      return require('./tokens.${chainId}').tokens${chainId}`
    })
    .join('\n')

  // Generate supported chains list for error messages
  const supportedChainsList = Object.keys(tokensByChain)
    .map((chainId) => {
      const names: { [key: string]: string } = {
        '42220': 'Celo',
        '44787': 'Alfajores',
        '11142220': 'Celo Sepolia',
      }
      return `${chainId} (${names[chainId] || 'Unknown'})`
    })
    .join(', ')

  // Generate TOKEN_ADDRESSES_BY_CHAIN mapping
  const tokenAddressesMapping = Object.entries(tokenAddressesByChain)
    .map(([chainId, tokens]) => {
      const entries = Object.entries(tokens)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([symbol, address]) => {
          const safeKey = symbol.replace(/[^a-zA-Z0-9_]/g, '_')
          return `    [TokenSymbol.${safeKey}]: '${address}',`
        })
        .join('\n')

      return `  ${chainId}: {\n${entries}\n  },`
    })
    .join('\n')

  const now = new Date().toISOString()

  const content = `// This file is auto-generated. Do not edit manually.
// Generated on ${now}

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
${getCachedTokensCases}
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
${getCachedTokensSyncCases}
    default:
      throw new Error(
        \`No cached tokens available for chain ID \${chainId}. \` +
        \`Supported chains: ${supportedChainsList}\`
      )
  }
}

/**
 * Type-safe token symbols available across all chains
 * Note: Not all tokens are available on all chains - check TOKEN_ADDRESSES_BY_CHAIN
 */
export enum TokenSymbol {
${enumEntries}
}

/**
 * Token addresses mapped by chain ID and symbol
 * Use this for type-safe token address lookups
 */
export const TOKEN_ADDRESSES_BY_CHAIN: {
  [chainId: number]: Partial<Record<TokenSymbol, string>>
} = {
${tokenAddressesMapping}
}

/**
 * Helper function to get token address by symbol for a specific chain
 * @param symbol - The token symbol
 * @param chainId - The chain ID
 * @returns The token address or undefined if not found
 */
export function getTokenAddress(
  symbol: TokenSymbol,
  chainId: number
): string | undefined {
  return TOKEN_ADDRESSES_BY_CHAIN[chainId]?.[symbol]
}

/**
 * Helper function to find a token by symbol in the cached tokens
 * @param symbol - The token symbol to search for
 * @param chainId - The chain ID
 * @returns The token object or undefined if not found
 */
export function findTokenBySymbol(
  symbol: string,
  chainId: number
): Token | undefined {
  const tokens = getCachedTokensSync(chainId)
  return tokens.find((token) => token.symbol === symbol)
}
`

  // Write the tokens.ts file to src/constants/
  const outputDir = path.resolve(scriptDir, '../../src/constants')
  const filePath = path.join(outputDir, 'tokens.ts')
  fs.writeFileSync(filePath, content)

  console.log(
    `✅ Generated tokens.ts with ${sortedSymbols.length} unique token symbols`
  )
}
