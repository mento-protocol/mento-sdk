import 'dotenv/config'
import { createPublicClient, http, type PublicClient } from 'viem'
import { ERC20_ABI } from '../../src/core/abis'
import type { Token } from '../../src/core/types'
import { PoolService, RouteService } from '../../src/services'
import { getChainConfig, retryOperation } from '../../src/utils'
import { cachedTokens as existingCachedTokens } from '../../src/cache/tokens'
import { assertCompleteChainGeneration } from '../shared/completeness'
import { rpcUrls, type SupportedChainId } from '../shared/network'
import { parseCommandLineArgs, printUsageTips } from './cli'
import { generateConsolidatedContent, writeConsolidatedFile } from './fileGenerator'

/**
 * Fetch token metadata (name, symbol, decimals) for an ERC20 token
 */
async function fetchTokenMetadata(publicClient: PublicClient, address: string): Promise<Token> {
  const [name, symbol, decimals] = await Promise.all([
    retryOperation(() =>
      publicClient.readContract({
        address: address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'name',
        args: [],
      })
    ),
    retryOperation(() =>
      publicClient.readContract({
        address: address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'symbol',
        args: [],
      })
    ),
    retryOperation(() =>
      publicClient.readContract({
        address: address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'decimals',
        args: [],
      })
    ),
  ])

  return {
    address,
    name: name as string,
    symbol: symbol as string,
    decimals: Number(decimals),
  }
}

/**
 * Fetch all unique tokens referenced by direct routes for a chain
 */
async function fetchTokensForChain(chainId: SupportedChainId): Promise<Token[]> {
  const chain = getChainConfig(chainId)
  const rpcUrl = rpcUrls[chainId]

  // Create viem PublicClient
  const publicClient = createPublicClient({
    chain,
    transport: http(rpcUrl),
  }) as PublicClient

  const poolService = new PoolService(publicClient, chainId)
  const routeService = new RouteService(publicClient, chainId, poolService)

  console.log(`📡 Fetching direct routes from blockchain...`)

  const directRoutes = await routeService.getDirectRoutes()

  // Pool discovery only throws when every factory query fails; a single factory
  // failing yields a reduced pool set that would silently shrink this chain's
  // token list.
  const discoveryWarnings = poolService.getDiscoveryWarnings()
  if (discoveryWarnings.length > 0) {
    throw new Error(`Partial pool discovery for chain ${chainId}: ${discoveryWarnings.join('; ')}`)
  }

  const uniqueAddresses = new Map<string, string>()
  directRoutes.forEach((route) => {
    route.tokens.forEach((token) => {
      const key = token.address.toLowerCase()
      if (!uniqueAddresses.has(key)) {
        uniqueAddresses.set(key, token.address)
      }
    })
  })

  console.log(`📡 Fetching token metadata for ${uniqueAddresses.size} unique tokens...`)

  const tokens = await Promise.all(
    Array.from(uniqueAddresses.values()).map((address) => fetchTokenMetadata(publicClient, address))
  )

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

  const chainIdsToProcess = args.targetChainIds || (Object.keys(rpcUrls).map(Number) as SupportedChainId[])

  console.log(`📡 Cache tokens for chain(s): ${chainIdsToProcess.join(', ')}`)

  // Seed from the existing cache so a successful single-chain run does not
  // remove tokens for chains that were not requested.
  const tokensByChain: { [chainId: number]: readonly Token[] } = { ...existingCachedTokens }
  const failedChains: number[] = []

  for (const chainId of chainIdsToProcess) {
    console.log(`\n🔄 \x1b[1mFetching tokens for chain ${chainId}...\x1b[0m`)

    try {
      const tokens = await fetchTokensForChain(chainId as SupportedChainId)
      tokensByChain[chainId] = tokens
    } catch (error) {
      console.error(`❌ Error fetching tokens for chain ${chainId}:`, error)
      console.error(`The cache write will be blocked because chain ${chainId} failed`)
      failedChains.push(chainId)
    }
  }

  // A failed chain must abort the write: keeping its stale entry is better than
  // publishing a cache with that chain's tokens (and their TokenSymbol members)
  // silently removed.
  assertCompleteChainGeneration('Token', chainIdsToProcess, failedChains)

  // Generate consolidated cache file
  console.log(`\n🔄 \x1b[1mGenerating consolidated tokens cache file...\x1b[0m`)
  const content = generateConsolidatedContent(tokensByChain)
  const fileName = writeConsolidatedFile(content, __dirname)

  const totalTokens = chainIdsToProcess.reduce((sum, chainId) => sum + tokensByChain[chainId].length, 0)
  console.log(
    `✅ Successfully cached ${totalTokens} tokens across ${chainIdsToProcess.length} chains to src/cache/${fileName}`
  )

  console.log(`\nAll done!`)
  printUsageTips()
}

// Execute if run directly
main().catch((error) => {
  console.error(error)
  process.exit(1)
})
