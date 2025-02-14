const rpcUrls = {
  42220: 'https://forno.celo.org',
  62320: 'https://baklava-forno.celo-testnet.org',
  44787: 'https://alfajores-forno.celo-testnet.org',
}

import { providers } from 'ethers'
import { Mento } from '../src/mento'
import fs from 'fs'
import path from 'path'

async function getTradablePairsForNetwork(chainId: number, rpcUrl: string) {
  const provider = new providers.JsonRpcProvider(rpcUrl)
  const mento = await Mento.create(provider)
  return await mento.getTradablePairs(true)
}

async function main() {
  const results: Record<number, any> = {}

  // Get pairs for each network
  for (const [chainId, rpcUrl] of Object.entries(rpcUrls)) {
    console.log(`Fetching pairs for chain ${chainId}...`)
    try {
      results[Number(chainId)] = await getTradablePairsForNetwork(
        Number(chainId),
        rpcUrl
      )
    } catch (e) {
      console.error(`Error fetching pairs for chain ${chainId}:`, e)
    }
  }

  // Generate TypeScript file content
  const fileContent = `// THIS FILE IS AUTO-GENERATED. DO NOT EDIT DIRECTLY.
import { TradablePair } from '../mento'

export const TRADABLE_PAIRS: Record<number, TradablePair[]> = ${JSON.stringify(
    results,
    null,
    2
  )};

export function getCachedTradablePairs(chainId: number): TradablePair[] | undefined {
  return TRADABLE_PAIRS[chainId]
}
`

  // Ensure constants directory exists
  const constantsDir = path.join(__dirname, '../src/constants')
  if (!fs.existsSync(constantsDir)) {
    fs.mkdirSync(constantsDir, { recursive: true })
  }

  // Write the file
  const filePath = path.join(constantsDir, 'tradablePairs.ts')
  fs.writeFileSync(filePath, fileContent)
  console.log(`Generated ${filePath}`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
