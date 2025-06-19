import fs from 'fs'
import path from 'path'
import { TradablePairWithSpread } from './config'

/**
 * Generate TypeScript file content for cached tradable pairs
 */
export function generateFileContent(
  chainId: number,
  pairs: TradablePairWithSpread[]
): string {
  return `// This file is auto-generated. Do not edit manually.
// Generated on ${new Date().toISOString()}

import { TradablePairWithSpread } from './tradablePairs'

export const tradablePairs${chainId}: TradablePairWithSpread[] = ${JSON.stringify(
    pairs,
    null,
    2
  )}
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
  // Create the constants directory if it doesn't exist
  const constantsDir = path.join(scriptDir, '..', 'src', 'constants')
  if (!fs.existsSync(constantsDir)) {
    fs.mkdirSync(constantsDir, { recursive: true })
  }

  // Write the file
  const fileName = `tradablePairs.${chainId}.ts`
  const filePath = path.join(constantsDir, fileName)
  fs.writeFileSync(filePath, content)

  return fileName
}
