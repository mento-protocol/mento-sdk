import * as fs from 'fs'
import * as path from 'path'
import { Token } from '../../src/mento'
import { SupportedChainId } from '../shared/network'

/**
 * Generate TypeScript file content with token data
 */
export function generateFileContent(
  chainId: SupportedChainId,
  tokens: Token[]
): string {
  const now = new Date().toISOString()

  // Generate token entries with TokenSymbol enum references
  const tokenEntries = tokens
    .map((token) => {
      // Create a safe enum key (replace special characters)
      const safeKey = token.symbol.replace(/[^a-zA-Z0-9_]/g, '_')

      return `  {
    address: '${token.address}',
    symbol: TokenSymbol.${safeKey},
    name: '${token.name}',
    decimals: ${token.decimals},
  }`
    })
    .join(',\n')

  const content = `// This file is auto-generated. Do not edit manually.
// Generated on ${now}

import { Token, TokenSymbol } from '../mento'

export const tokens${chainId}: readonly Token[] = [
${tokenEntries},
] as const
`

  return content
}

/**
 * Write the generated content to a TypeScript file
 */
export function writeToFile(
  chainId: SupportedChainId,
  content: string,
  scriptDir: string
): string {
  // Determine the output directory (src/constants/)
  const outputDir = path.resolve(scriptDir, '../../src/constants')

  // Ensure the output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  // Write to file
  const fileName = `tokens.${chainId}.ts`
  const filePath = path.join(outputDir, fileName)
  fs.writeFileSync(filePath, content)

  return fileName
}
