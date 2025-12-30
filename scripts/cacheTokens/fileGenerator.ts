import * as fs from 'fs'
import * as path from 'path'
import type { Token } from '../../src/core/types'

/**
 * Sanitize token symbol for use in TypeScript enums
 * Removes special characters and replaces spaces with underscores
 */
export function sanitizeSymbol(symbol: string): string {
  return symbol.replace(/[^a-zA-Z0-9_]/g, '_')
}

/**
 * Get the cache directory path
 */
function getCacheDir(scriptDir: string): string {
  return path.join(scriptDir, '..', '..', 'src', 'cache')
}

/**
 * Generate the consolidated tokens.ts cache file content
 */
export function generateConsolidatedContent(
  tokensByChain: { [chainId: number]: Token[] }
): string {
  const chainIds = Object.keys(tokensByChain)
    .map(Number)
    .sort((a, b) => a - b)

  // Collect all unique token symbols across all chains
  const allSymbols = new Set<string>()
  Object.values(tokensByChain).forEach((tokens) => {
    tokens.forEach((token) => allSymbols.add(token.symbol))
  })
  const sortedSymbols = Array.from(allSymbols).sort()

  // Generate TokenSymbol enum
  const enumEntries = sortedSymbols.map((symbol) => {
    const sanitized = sanitizeSymbol(symbol)
    return `  ${sanitized} = '${symbol}',`
  })

  // Generate cachedTokens entries per chain
  const cachedTokensEntries = chainIds.map((chainId) => {
    const tokens = tokensByChain[chainId]
    const tokenEntries = tokens.map((token) => {
      const sanitized = sanitizeSymbol(token.symbol)
      return `    {
      address: '${token.address}',
      symbol: TokenSymbol.${sanitized},
      name: '${token.name}',
      decimals: ${token.decimals},
    }`
    })
    return `  // Chain ${chainId}
  ${chainId}: [
${tokenEntries.join(',\n')}
  ],`
  })

  // Generate TOKEN_ADDRESSES_BY_CHAIN mapping
  const tokenAddressesByChainEntries = chainIds.map((chainId) => {
    const tokens = tokensByChain[chainId]
    const tokenEntries = tokens.map((token) => {
      const sanitized = sanitizeSymbol(token.symbol)
      return `    [TokenSymbol.${sanitized}]: '${token.address}',`
    })
    return `  ${chainId}: {
${tokenEntries.join('\n')}
  },`
  })

  return `// This file is auto-generated. Do not edit manually.
// Generated on ${new Date().toISOString()}

import type { Token } from '../core/types'

/**
 * Enum of all token symbols across all supported chains
 */
export enum TokenSymbol {
${enumEntries.join('\n')}
}

/**
 * Cached tokens indexed by chain ID
 */
export const cachedTokens: Record<number, readonly Token[]> = {
${cachedTokensEntries.join('\n')}
}

/**
 * Mapping of token addresses by chain ID and token symbol
 * Useful for quickly looking up a token address by its symbol on a specific chain
 */
export const TOKEN_ADDRESSES_BY_CHAIN: {
  [chainId: number]: { [tokenSymbol in TokenSymbol]?: string }
} = {
${tokenAddressesByChainEntries.join('\n')}
}

/**
 * Get cached tokens for a specific chain
 * @param chainId - The chain ID
 * @returns The cached tokens array, or empty array if not available
 */
export function getCachedTokens(chainId: number): readonly Token[] {
  return cachedTokens[chainId] ?? []
}

/**
 * Get cached tokens synchronously for a specific chain
 * @param chainId - The chain ID to get tokens for
 * @returns The cached tokens array
 * @throws Error if tokens are not available for the chain
 */
export function getCachedTokensSync(chainId: number): readonly Token[] {
  const tokens = cachedTokens[chainId]
  if (!tokens || tokens.length === 0) {
    throw new Error(\`No cached tokens available for chain \${chainId}\`)
  }
  return tokens
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
  const tokens = cachedTokens[chainId]
  if (!tokens) return undefined
  return tokens.find((t) => t.symbol === symbol)
}
`
}

/**
 * Write the consolidated tokens cache file
 */
export function writeConsolidatedFile(
  content: string,
  scriptDir: string
): string {
  const cacheDir = getCacheDir(scriptDir)
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true })
  }

  const fileName = 'tokens.ts'
  const filePath = path.join(cacheDir, fileName)
  fs.writeFileSync(filePath, content)

  return fileName
}
