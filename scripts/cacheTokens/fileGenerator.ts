import * as fs from 'fs'
import * as path from 'path'
import type { Token } from '../../src/core/types'
import type { SupportedChainId } from '../shared/network'

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
  chainId: SupportedChainId,
  tokens: Token[]
): string {
  const tokenEntries = tokens.map((token) => {
    const safeKey = sanitizeSymbol(token.symbol)
    return `  {
    address: '${token.address}',
    symbol: TokenSymbol.${safeKey},
    name: '${token.name}',
    decimals: ${token.decimals},
  }`
  })

  return `// This file is auto-generated. Do not edit manually.
// Generated on ${new Date().toISOString()}

import { TokenSymbol } from '../utils/tokens'
import type { Token } from '../core/types'

export const tokens${chainId}: readonly Token[] = [
${tokenEntries.join(',\n')}
] as const
`
}

/**
 * Write the generated content to the appropriate file
 */
export function writeToFile(
  chainId: SupportedChainId,
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
