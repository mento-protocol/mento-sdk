import * as fs from 'fs'
import * as path from 'path'
import type { BaseToken } from '../../src/core/types'

/**
 * Sanitize token symbol for use in TypeScript enums
 * Removes special characters and replaces spaces with underscores
 */
export function sanitizeSymbol(symbol: string): string {
  return symbol.replace(/[^a-zA-Z0-9_]/g, '_')
}

/**
 * Generate TypeScript file content for cached tokens
 */
export function generateFileContent(
  chainId: number,
  tokens: BaseToken[]
): string {
  const tokenEntries = tokens.map((token) => {
    const sanitizedSymbol = sanitizeSymbol(token.symbol)
    return `  {
    address: '${token.address}',
    symbol: '${token.symbol}',
    name: '${token.name}',
    decimals: ${token.decimals},
    _sanitizedSymbol: '${sanitizedSymbol}',
  }`
  })

  return `// This file is auto-generated. Do not edit manually.
// Generated on ${new Date().toISOString()}

import type { BaseToken } from '../core/types'

export interface CachedToken extends BaseToken {
  _sanitizedSymbol: string
}

export const tokens${chainId}: readonly CachedToken[] = [
${tokenEntries.join(',\n')}
] as const
`
}

/**
 * Write the generated content to the appropriate file
 */
export function writeToFile(
  chainId: number,
  content: string,
  scriptDir: string
): string {
  // Create the cache directory if it doesn't exist
  const cacheDir = path.join(scriptDir, '..', '..', 'src', 'cache')
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true })
  }

  // Write the file
  const fileName = `tokens.${chainId}.ts`
  const filePath = path.join(cacheDir, fileName)
  fs.writeFileSync(filePath, content)

  return fileName
}
