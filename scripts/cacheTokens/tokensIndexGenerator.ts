import * as fs from 'fs'
import * as path from 'path'
import type { BaseToken } from '../../src/core/types'
import { sanitizeSymbol } from './fileGenerator'

/**
 * Generate the main tokens.ts file with enums and helper functions
 */
export function generateTokensIndexFile(
  tokensByChain: { [chainId: number]: BaseToken[] },
  scriptDir: string
): void {
  const chainIds = Object.keys(tokensByChain).map(Number).sort((a, b) => a - b)

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
    const tokens = tokensByChain[chainId]
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

import type { BaseToken } from '../core/types'

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
): Promise<readonly BaseToken[] | undefined> {
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
export function getCachedTokensSync(chainId: number): readonly BaseToken[] {
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
`

  // Write to src/utils/tokens.ts
  const utilsDir = path.join(scriptDir, '..', '..', 'src', 'utils')
  if (!fs.existsSync(utilsDir)) {
    fs.mkdirSync(utilsDir, { recursive: true })
  }

  const filePath = path.join(utilsDir, 'tokens.ts')
  fs.writeFileSync(filePath, content)

  console.log(`\n✅ Successfully generated tokens index file at src/utils/tokens.ts`)
}
