import 'dotenv/config'
import { createPublicClient, http, type PublicClient } from 'viem'
import { celo } from 'viem/chains'
import { defineChain } from 'viem'
import { ERC20_ABI } from '../../src/core/abis'
import type { Token } from '../../src/core/types'
import { PoolService, RouteService } from '../../src/services'
import { retryOperation } from '../../src/utils'
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

const monadTestnet = defineChain({
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: {
    name: 'MON',
    symbol: 'MON',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://testnet-rpc.monad.xyz'] },
  },
  blockExplorers: {
    default: {
      name: 'Monad Testnet Explorer',
      url: 'https://testnet.monadexplorer.com',
    },
  },
  testnet: true,
})

const monad = defineChain({
  id: 143,
  name: 'Monad',
  nativeCurrency: {
    name: 'MON',
    symbol: 'MON',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://rpc.monad.xyz'] },
  },
  blockExplorers: {
    default: {
      name: 'Monad Explorer',
      url: 'https://monadexplorer.com',
    },
  },
})

const chainConfigs = {
  42220: celo,
  11142220: celoSepolia,
  10143: monadTestnet,
  143: monad,
} as const

/**
 * Fetch token metadata (name, symbol, decimals) for an ERC20 token
 */
async function fetchTokenMetadata(
  publicClient: PublicClient,
  address: string
): Promise<Token> {
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
  const chain = chainConfigs[chainId]
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

  const uniqueAddresses = new Map<string, string>()
  directRoutes.forEach((route) => {
    route.tokens.forEach((token) => {
      const key = token.address.toLowerCase()
      if (!uniqueAddresses.has(key)) {
        uniqueAddresses.set(key, token.address)
      }
    })
  })

  console.log(
    `📡 Fetching token metadata for ${uniqueAddresses.size} unique tokens...`
  )

  const tokens = await Promise.all(
    Array.from(uniqueAddresses.values()).map((address) =>
      fetchTokenMetadata(publicClient, address)
    )
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

  const totalTokens = Object.values(tokensByChain).reduce(
    (sum, tokens) => sum + tokens.length,
    0
  )
  console.log(
    `✅ Successfully cached ${totalTokens} tokens across ${chainIdsToProcess.length} chains to src/cache/${fileName}`
  )

  console.log(`\nAll done!`)
  printUsageTips()
}

// Execute if run directly
main().catch(console.error)
