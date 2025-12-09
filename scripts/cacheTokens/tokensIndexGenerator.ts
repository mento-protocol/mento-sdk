import * as fs from 'fs'
import * as path from 'path'
import type { Token } from '../../src/core/types'
import { sanitizeSymbol } from './fileGenerator'

/**
 * Get the cache directory path
 */
function getCacheDir(scriptDir: string): string {
  return path.join(scriptDir, '..', '..', 'src', 'cache')
}

/**
 * Discover existing cached chain IDs by scanning the cache directory
 */
function getExistingCachedChainIds(cacheDir: string): number[] {
  if (!fs.existsSync(cacheDir)) {
    return []
  }

  const files = fs.readdirSync(cacheDir)
  const chainIds: number[] = []

  for (const file of files) {
    const match = file.match(/^tokens\.(\d+)\.ts$/)
    if (match) {
      chainIds.push(parseInt(match[1], 10))
    }
  }

  return chainIds
}

/**
 * Reverse the sanitization to get the original symbol
 * Note: This is a best-effort reverse lookup - some symbols like USD₮ become USD_
 */
function unsanitizeSymbol(sanitized: string): string {
  // Known special cases that lose information during sanitization
  const knownMappings: Record<string, string> = {
    USD_: 'USD₮',
  }

  return knownMappings[sanitized] || sanitized
}

/**
 * Parse tokens from an existing cache file
 * Uses regex to extract token data since the cache files use TokenSymbol references
 */
function parseTokensFromCacheFile(filePath: string): Token[] {
  const content = fs.readFileSync(filePath, 'utf-8')
  const tokens: Token[] = []

  // Match each token object in the array
  // Pattern matches: { address: '0x...', symbol: TokenSymbol.XXX, name: '...', decimals: N }
  const tokenRegex =
    /\{\s*address:\s*'(0x[a-fA-F0-9]+)',\s*symbol:\s*TokenSymbol\.(\w+),\s*name:\s*'([^']*)',\s*decimals:\s*(\d+),?\s*\}/g

  let match
  while ((match = tokenRegex.exec(content)) !== null) {
    const [, address, sanitizedSymbol, name, decimals] = match
    tokens.push({
      address,
      symbol: unsanitizeSymbol(sanitizedSymbol),
      name,
      decimals: parseInt(decimals, 10),
    })
  }

  return tokens
}

/**
 * Merge incoming token data with existing cached data for chains not being updated
 */
function mergeWithExistingCache(
  tokensByChain: { [chainId: number]: Token[] },
  scriptDir: string
): { [chainId: number]: Token[] } {
  const cacheDir = getCacheDir(scriptDir)
  const existingChainIds = getExistingCachedChainIds(cacheDir)

  // Create a mutable copy of the incoming data
  const merged: { [chainId: number]: Token[] } = { ...tokensByChain }

  // For chains not in the current run, load from existing cache
  for (const existingChainId of existingChainIds) {
    if (!(existingChainId in merged)) {
      const cacheFilePath = path.join(cacheDir, `tokens.${existingChainId}.ts`)
      try {
        const tokens = parseTokensFromCacheFile(cacheFilePath)
        if (tokens.length > 0) {
          merged[existingChainId] = tokens
          console.log(
            `  📂 Loaded ${tokens.length} tokens from existing cache for chain ${existingChainId}`
          )
        }
      } catch (error) {
        console.warn(
          `  ⚠️ Could not parse existing cache file for chain ${existingChainId}:`,
          error
        )
      }
    }
  }

  return merged
}

/**
 * Generate the main tokens.ts file with enums and helper functions
 */
export function generateTokensIndexFile(
  tokensByChain: { [chainId: number]: Token[] },
  scriptDir: string
): void {
  // Merge with existing cached data for chains not in current run
  const mergedTokensByChain = mergeWithExistingCache(tokensByChain, scriptDir)

  const chainIds = Object.keys(mergedTokensByChain)
    .map(Number)
    .sort((a, b) => a - b)

  // Collect all unique token symbols across all chains
  const allSymbols = new Set<string>()
  Object.values(mergedTokensByChain).forEach((tokens) => {
    tokens.forEach((token) => allSymbols.add(token.symbol))
  })
  const sortedSymbols = Array.from(allSymbols).sort()

  // Generate TokenSymbol enum
  const enumEntries = sortedSymbols.map((symbol) => {
    const sanitized = sanitizeSymbol(symbol)
    return `  ${sanitized} = '${symbol}',`
  })

  // Generate getCachedTokens function with switch cases
  const getCachedTokensCases = chainIds.map((chainId) => {
    return `    case ${chainId}:
      return await import('../cache/tokens.${chainId}').then((module) => module.tokens${chainId})`
  })

  // Generate getCachedTokensSync function with switch cases
  const getCachedTokensSyncCases = chainIds.map((chainId) => {
    return `    case ${chainId}:
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      return require('../cache/tokens.${chainId}').tokens${chainId}`
  })

  // Generate TOKEN_ADDRESSES_BY_CHAIN mapping
  const tokenAddressesByChainEntries = chainIds.map((chainId) => {
    const tokens = mergedTokensByChain[chainId]
    const tokenEntries = tokens.map((token) => {
      const sanitized = sanitizeSymbol(token.symbol)
      return `      [TokenSymbol.${sanitized}]: '${token.address}',`
    })
    return `  ${chainId}: {
${tokenEntries.join('\n')}
    },`
  })

  const content = `// This file is auto-generated. Do not edit manually.
// Generated on ${new Date().toISOString()}

import type { Token } from '../core/types'

/**
 * Enum of all token symbols across all supported chains
 */
export enum TokenSymbol {
${enumEntries.join('\n')}
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
${getCachedTokensCases.join('\n')}
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
${getCachedTokensSyncCases.join('\n')}
    default:
      throw new Error(\`No cached tokens available for chain \${chainId}\`)
  }
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
`

  // Write to src/utils/tokens.ts
  const utilsDir = path.join(scriptDir, '..', '..', 'src', 'utils')
  if (!fs.existsSync(utilsDir)) {
    fs.mkdirSync(utilsDir, { recursive: true })
  }

  const filePath = path.join(utilsDir, 'tokens.ts')
  fs.writeFileSync(filePath, content)

  console.log(
    `\n✅ Successfully generated tokens index file at src/utils/tokens.ts`
  )
}
