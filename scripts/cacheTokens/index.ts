import { createPublicClient, http } from 'viem'
import { celo } from 'viem/chains'
import { defineChain } from 'viem'
import { TokenService } from '../../src/services/tokens/tokenService'
import type { Token } from '../../src/core/types'
import { rpcUrls, type SupportedChainId } from '../shared/network'
import { parseCommandLineArgs, printUsageTips } from './cli'
import { generateConsolidatedContent, writeConsolidatedFile } from './fileGenerator'

const celoSepolia = defineChain({
  id: 11142220,
  name: 'Celo Sepolia',
  nativeCurrency: {
    name: 'CELO',
    symbol: 'CELO',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://forno.celo-sepolia.celo-testnet.org'] },
  },
  blockExplorers: {
    default: {
      name: 'Celo Sepolia Explorer',
      url: 'https://celo-sepolia.blockscout.com',
    },
  },
  testnet: true,
})

const chainConfigs = {
  42220: celo,
  11142220: celoSepolia,
} as const

/**
 * Fetch all tokens (stable tokens + collateral assets) for a chain
 */
async function fetchTokensForChain(
  chainId: SupportedChainId
): Promise<Token[]> {
  const chain = chainConfigs[chainId]
  const rpcUrl = rpcUrls[chainId]

  // Create viem PublicClient
  const publicClient = createPublicClient({
    chain,
    transport: http(rpcUrl),
  }) as any

  const tokenService = new TokenService(publicClient, chainId)

  console.log(`📡 Fetching tokens from blockchain...`)

  // Fetch both stable tokens and collateral assets (skip supply data for caching)
  const [stableTokens, collateralAssets] = await Promise.all([
    tokenService.getStableTokens(/* includeSupply */ false),
    tokenService.getCollateralAssets(),
  ])

  // Combine and deduplicate by address
  const tokenMap = new Map<string, Token>()

  // Add stable tokens
  stableTokens.forEach((token) => {
    const baseToken: Token = {
      address: token.address,
      name: token.name,
      symbol: token.symbol,
      decimals: token.decimals,
    }
    tokenMap.set(token.address.toLowerCase(), baseToken)
  })

  // Add collateral assets
  collateralAssets.forEach((token) => {
    if (!tokenMap.has(token.address.toLowerCase())) {
      tokenMap.set(token.address.toLowerCase(), token)
    }
  })

  const tokens = Array.from(tokenMap.values())
  console.log(`✅ Fetched ${tokens.length} unique tokens`)

  return tokens
}

/**
 * Main function
 *
 * Generates a single consolidated tokens.ts file with all chain data
 */
export async function main(): Promise<void> {
  const args = parseCommandLineArgs()

  const chainIdsToProcess =
    args.targetChainIds ||
    (Object.keys(rpcUrls).map(Number) as SupportedChainId[])

  console.log(`📡 Cache tokens for chain(s): ${chainIdsToProcess.join(', ')}`)

  // Fetch tokens for all chains
  const tokensByChain: { [chainId: number]: Token[] } = {}

  for (const chainId of chainIdsToProcess) {
    console.log(`\n🔄 \x1b[1mFetching tokens for chain ${chainId}...\x1b[0m`)

    try {
      const tokens = await fetchTokensForChain(chainId as SupportedChainId)
      tokensByChain[chainId] = tokens
    } catch (error) {
      console.error(`❌ Error fetching tokens for chain ${chainId}:`, error)
      // Use empty array for failed chains
      tokensByChain[chainId] = []
    }
  }

  // Generate consolidated cache file
  console.log(`\n🔄 \x1b[1mGenerating consolidated tokens cache file...\x1b[0m`)
  const content = generateConsolidatedContent(tokensByChain)
  const fileName = writeConsolidatedFile(content, __dirname)

  const totalTokens = Object.values(tokensByChain).reduce((sum, tokens) => sum + tokens.length, 0)
  console.log(`✅ Successfully cached ${totalTokens} tokens across ${chainIdsToProcess.length} chains to src/cache/${fileName}`)

  console.log(`\nAll done!`)
  printUsageTips()
}

// Execute if run directly
main().catch(console.error)
