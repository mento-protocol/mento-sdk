import * as fs from 'fs'
import * as path from 'path'
import type { RouteWithCost } from '../../src/core/types'

/**
 * Get the cache directory path
 */
function getCacheDir(scriptDir: string): string {
  return path.join(scriptDir, '..', '..', 'src', 'cache')
}

/**
 * Generate consolidated routes.ts cache file content
 */
export function generateConsolidatedContent(
  routesByChain: { [chainId: number]: RouteWithCost[] }
): string {
  const chainIds = Object.keys(routesByChain)
    .map(Number)
    .sort((a, b) => a - b)

  // Generate cachedRoutes entries per chain
  const cachedRoutesEntries = chainIds.map((chainId) => {
    const routes = routesByChain[chainId]
    const routesJson = JSON.stringify(routes, null, 2)
      .split('\n')
      .map((line, index) => (index === 0 ? line : '  ' + line))
      .join('\n')
    return `  // Chain ${chainId}
  ${chainId}: ${routesJson},`
  })

  return `// This file is auto-generated. Do not edit manually.
// Generated on ${new Date().toISOString()}

import type { RouteWithCost } from '../core/types'

/**
 * Cached routes indexed by chain ID
 * Routes that don't exist for a chain will return an empty array
 */
export const cachedRoutes: Record<number, RouteWithCost[]> = {
${cachedRoutesEntries.join('\n')}
}

/**
 * Get cached routes for a specific chain
 * @param chainId - The chain ID
 * @returns The cached routes array, or empty array if not available
 */
export function getCachedRoutes(chainId: number): RouteWithCost[] {
  return cachedRoutes[chainId] ?? []
}
`
}

/**
 * Write the consolidated routes cache file
 */
export function writeConsolidatedFile(
  content: string,
  scriptDir: string
): string {
  const cacheDir = getCacheDir(scriptDir)
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true })
  }

  const fileName = 'routes.ts'
  const filePath = path.join(cacheDir, fileName)
  fs.writeFileSync(filePath, content)

  return fileName
}

// Legacy exports for per-chain file generation (kept for backwards compatibility)
export function generateFileContent(
  chainId: number,
  pairs: RouteWithCost[]
): string {
  return generateConsolidatedContent({ [chainId]: pairs })
}

export function writeToFile(
  chainId: number,
  content: string,
  scriptDir: string
): string {
  return writeConsolidatedFile(content, scriptDir)
}
