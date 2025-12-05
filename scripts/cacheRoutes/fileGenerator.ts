import * as fs from 'fs'
import * as path from 'path'
import type { RouteWithCost } from '../../src/core/types'

/**
 * Generate TypeScript file content for cached tradable pairs
 */
export function generateFileContent(
  chainId: number,
  pairs: RouteWithCost[]
): string {
  return `// This file is auto-generated. Do not edit manually.
// Generated on ${new Date().toISOString()}

import type { RouteWithCost } from '../core/types'

export const routes${chainId}: RouteWithCost[] = ${JSON.stringify(
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
  // Create the cache directory if it doesn't exist - navigate to project root first
  const cacheDir = path.join(scriptDir, '..', '..', 'src', 'cache')
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true })
  }

  // Write the file
  const fileName = `routes.${chainId}.ts`
  const filePath = path.join(cacheDir, fileName)
  fs.writeFileSync(filePath, content)

  return fileName
}
