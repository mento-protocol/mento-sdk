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

  const content = `// This file is auto-generated. Do not edit manually.
// Generated on ${now}

import { Token } from '../mento'

export const tokens${chainId}: readonly Token[] = ${JSON.stringify(tokens, null, 2)} as const
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
