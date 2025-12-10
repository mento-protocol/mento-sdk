#!/usr/bin/env ts-node

import { exec } from 'child_process'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { getCachedTradablePairs } from '../src/constants/tradablePairs'

// Clean token symbols for Mermaid compatibility
function cleanSymbol(symbol: string): string {
  return symbol.replace(/[₮]/g, 'T').replace(/[^\w]/g, '_')
}

async function generateMermaidGraph(chainId: number): Promise<{
  mermaid: string
  tokenCount: number
  connectionCount: number
}> {
  const pairs = await getCachedTradablePairs(chainId)
  if (!pairs) {
    throw new Error(`No cached pairs found for chain ${chainId}`)
  }

  // Extract direct connections (single hop paths)
  const directConnections = new Set<string>()
  const tokens = new Set<string>()
  const symbolMap = new Map<string, string>() // cleaned -> original

  pairs.forEach((pair) => {
    if (pair.path.length === 1) {
      // This is a direct connection
      const [tokenA, tokenB] = pair.assets
      const cleanA = cleanSymbol(tokenA.symbol)
      const cleanB = cleanSymbol(tokenB.symbol)

      tokens.add(cleanA)
      tokens.add(cleanB)
      symbolMap.set(cleanA, tokenA.symbol)
      symbolMap.set(cleanB, tokenB.symbol)

      // Create a sorted connection string to avoid duplicates
      const connection = [cleanA, cleanB].sort().join('---')
      directConnections.add(connection)
    }
  })

  // Generate Mermaid graph
  let mermaid = 'graph TD\n'

  // Add node labels with original symbols
  tokens.forEach((cleanSymbol) => {
    const originalSymbol = symbolMap.get(cleanSymbol)
    if (originalSymbol !== cleanSymbol) {
      mermaid += `    ${cleanSymbol}["${originalSymbol}"]\n`
    }
  })

  // Add all connections
  directConnections.forEach((connection) => {
    const [tokenA, tokenB] = connection.split('---')
    mermaid += `    ${tokenA} --- ${tokenB}\n`
  })

  return {
    mermaid,
    tokenCount: tokens.size,
    connectionCount: directConnections.size,
  }
}

function getChainName(chainId: number): string {
  switch (chainId) {
    case 42220:
      return 'Celo Mainnet'
    case 11142220:
      return 'Celo Sepolia Testnet'
    default:
      return `Chain ${chainId}`
  }
}

function generateReadmeSection(
  chainId: number,
  mermaidGraph: string,
  tokenCount: number,
  connectionCount: number
): string {
  const chainName = getChainName(chainId)

  return `
## Token Graph Visualization

Current token connectivity on ${chainName} (last updated: ${
    new Date().toISOString().split('T')[0]
  }):

\`\`\`mermaid
${mermaidGraph}
\`\`\`

**Network Stats:** ${tokenCount} tokens, ${connectionCount} direct trading pairs

> 💡 This graph shows direct trading pairs only. The SDK automatically finds optimal routes including multi-hop paths.
> 
> To regenerate: \`yarn getTokenGraph\`

`
}

function updateReadme(newSection: string) {
  const readmePath = join(process.cwd(), 'README.md')

  if (!existsSync(readmePath)) {
    console.log('⚠️  README.md not found, creating new file...')
    writeFileSync(readmePath, newSection)
    return
  }

  let readme = readFileSync(readmePath, 'utf8')

  // Remove existing token graph section if it exists
  const startMarker = '## Token Graph Visualization'
  const endMarker = '> To regenerate: `yarn getTokenGraph`'

  const startIndex = readme.indexOf(startMarker)
  if (startIndex !== -1) {
    const endIndex = readme.indexOf(endMarker, startIndex)
    if (endIndex !== -1) {
      const beforeSection = readme.substring(0, startIndex)
      const afterSection = readme.substring(endIndex + endMarker.length)
      readme = beforeSection + newSection + afterSection
    } else {
      readme += newSection
    }
  } else {
    readme += newSection
  }

  writeFileSync(readmePath, readme)
}

function openFile(filePath: string) {
  const platform = process.platform
  let command: string

  switch (platform) {
    case 'darwin': // macOS
      command = `open "${filePath}"`
      break
    case 'win32': // Windows
      command = `start "${filePath}"`
      break
    default: // Linux and others
      command = `xdg-open "${filePath}"`
      break
  }

  exec(command, (error) => {
    if (error) {
      console.log(`\n📄 Manual: Open ${filePath} in your markdown viewer`)
    } else {
      console.log(`\n🚀 Opened ${filePath} in your default markdown viewer`)
    }
  })
}

async function main() {
  const args = process.argv.slice(2)
  const chainId = args.find((arg) => /^\d+$/.test(arg))
    ? parseInt(args.find((arg) => /^\d+$/.test(arg))!)
    : 42220

  try {
    console.log(`🔄 Generating token graph for ${getChainName(chainId)}...`)

    const {
      mermaid: mermaidGraph,
      tokenCount,
      connectionCount,
    } = await generateMermaidGraph(chainId)

    const readmeSection = generateReadmeSection(
      chainId,
      mermaidGraph,
      tokenCount,
      connectionCount
    )
    updateReadme(readmeSection)
    console.log(`\n✅ Updated README.md with token graph`)
    console.log(
      `📊 Stats: ${tokenCount} tokens, ${connectionCount} direct pairs`
    )
    openFile(join(process.cwd(), 'README.md'))
  } catch (error) {
    console.error('❌ Error generating graph:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}
