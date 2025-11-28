import * as fs from 'fs'
import * as path from 'path'
import type { RouteWithSpread } from '../../src/core/types'

/**
 * Generate TypeScript file content for cached tradable pairs
 */
export function generateFileContent(
  chainId: number,
  pairs: RouteWithSpread[]
): string {
  return `// This file is auto-generated. Do not edit manually.
// Generated on ${new Date().toISOString()}

import type { RouteWithSpread } from './routes'

export const routes${chainId}: RouteWithSpread[] = ${JSON.stringify(
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
  // Create the constants directory if it doesn't exist - navigate to project root first
  const constantsDir = path.join(scriptDir, '..', '..', 'src', 'constants')
  if (!fs.existsSync(constantsDir)) {
    fs.mkdirSync(constantsDir, { recursive: true })
  }

  // Write the file
  const fileName = `routes.${chainId}.ts`
  const filePath = path.join(constantsDir, fileName)
  fs.writeFileSync(filePath, content)

  return fileName
}
