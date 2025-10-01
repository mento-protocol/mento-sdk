#!/usr/bin/env ts-node

import chalk from 'chalk'
import Table from 'cli-table3'
import { ethers } from 'ethers'
import ora from 'ora'
import { Mento, Token } from '../../src/mento'
import { NETWORK_MAP, rpcUrls } from '../shared/network'
import { parseCommandLineArgs } from './utils/parseCommandLineArgs'

interface TokenWithNetwork extends Token {
  network: string
  chainId: number
}

/**
 * Fetch tokens for a specific network
 */
async function fetchTokensForNetwork(
  networkName: string,
  chainId: number,
  rpcUrl: string
): Promise<TokenWithNetwork[]> {
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
  const mento = await Mento.create(provider)
  const tokens = await mento.getTokens()

  return tokens.map((token) => ({
    ...token,
    network: networkName,
    chainId,
  }))
}

/**
 * CLI tool to display all tokens available on Mento
 */
async function main(): Promise<void> {
  const startTime = Date.now()

  try {
    // Parse command line arguments
    const args = parseCommandLineArgs()

    console.log(chalk.gray('\n==============================='))
    console.log(chalk.bold.blue('Mento Tokens'))
    console.log(chalk.gray('===============================\n'))

    let allTokens: TokenWithNetwork[] = []
    const isMultiNetwork = !args.chainId && !args.rpcUrl

    if (isMultiNetwork) {
      // Fetch tokens from all networks
      console.log(
        chalk.yellow('Fetching tokens from all supported networks...\n')
      )

      const spinner = ora({
        text: 'Fetching tokens...',
        color: 'cyan',
      }).start()

      const networkEntries = Object.entries(NETWORK_MAP)
      const tokensByNetwork = await Promise.all(
        networkEntries.map(async ([networkName, chainId]) => {
          try {
            const rpcUrl = rpcUrls[chainId as keyof typeof rpcUrls]
            if (!rpcUrl) {
              spinner.warn(
                `No RPC URL configured for ${networkName} (${chainId})`
              )
              return []
            }
            return await fetchTokensForNetwork(networkName, chainId, rpcUrl)
          } catch (error) {
            spinner.warn(`Failed to fetch tokens for ${networkName}`)
            return []
          }
        })
      )

      allTokens = tokensByNetwork.flat()
      spinner.succeed(`Fetched tokens from ${networkEntries.length} networks`)
    } else {
      // Fetch tokens from a specific network
      const rpcUrl = args.rpcUrl || process.env.RPC_URL || ''
      const provider = new ethers.providers.JsonRpcProvider(rpcUrl)

      console.log(chalk.yellow(`Using RPC URL: ${rpcUrl}`))

      const network = await provider.getNetwork()
      console.log(chalk.yellow(`Network: Chain ID ${network.chainId}\n`))

      const connectSpinner = ora({
        text: 'Connecting to Mento protocol...',
        color: 'cyan',
      }).start()
      const mento = await Mento.create(provider)
      connectSpinner.succeed('Connected to Mento protocol')

      const tokensSpinner = ora({
        text: 'Fetching tokens...',
        color: 'cyan',
      }).start()
      const tokens = await mento.getTokens()
      tokensSpinner.succeed(`Fetched ${tokens.length} unique tokens`)

      // Find network name from chainId
      const networkName =
        Object.entries(NETWORK_MAP).find(
          ([, id]) => id === network.chainId
        )?.[0] || 'unknown'

      allTokens = tokens.map((token) => ({
        ...token,
        network: networkName,
        chainId: network.chainId,
      }))
    }

    // Create table
    const table = new Table({
      head: [
        chalk.bold.cyan('#'),
        chalk.bold.cyan('Symbol'),
        chalk.bold.cyan('Network'),
        chalk.bold.cyan('Name'),
        chalk.bold.cyan('Decimals'),
        chalk.bold.cyan('Address'),
      ],
      colWidths: [5, 15, 18, 30, 10, 50],
      style: {
        head: [],
        border: ['gray'],
      },
    })

    // Sort tokens: by symbol first, then by network name
    const sortedTokens = allTokens.sort((a, b) => {
      const symbolCompare = a.symbol.localeCompare(b.symbol)
      if (symbolCompare !== 0) return symbolCompare
      return a.network.localeCompare(b.network)
    })

    // Add rows to table
    sortedTokens.forEach((token, index) => {
      table.push([
        chalk.gray((index + 1).toString()),
        chalk.green(token.symbol),
        chalk.blue(token.network),
        chalk.white(token.name),
        chalk.yellow(token.decimals.toString()),
        chalk.gray(token.address),
      ])
    })

    // Display table
    console.log('\n' + table.toString())

    // Display summary
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2)
    console.log(chalk.gray(`\nCompleted in ${totalTime}s`))

    if (isMultiNetwork) {
      const uniqueSymbols = new Set(sortedTokens.map((t) => t.symbol))
      const networksCount = new Set(sortedTokens.map((t) => t.network)).size
      console.log(
        chalk.bold(
          `\nTotal: ${chalk.green(sortedTokens.length)} token entries across ${chalk.blue(networksCount)} networks (${chalk.cyan(uniqueSymbols.size)} unique symbols)`
        )
      )
    } else {
      console.log(
        chalk.bold(
          `\nTotal: ${chalk.green(sortedTokens.length)} unique token${sortedTokens.length !== 1 ? 's' : ''}`
        )
      )
    }

    // Display usage information
    console.log('\n' + chalk.bold('Usage:'))
    console.log(
      '  yarn tokens [--network|-n <network>] [--chainId|-c <chainId>] [--rpcUrl|-r <url>]'
    )
    console.log('\n' + chalk.bold('Network options:'))
    // Dynamically generate network options from NETWORK_MAP
    Object.entries(NETWORK_MAP).forEach(([name, chainId]) => {
      console.log(`  --network ${name.padEnd(15)} # Chain ID ${chainId}`)
    })
    console.log('\n' + chalk.bold('Examples:'))
    console.log('  yarn tokens                        # All networks')
    console.log('  yarn tokens --network celo         # Celo mainnet only')
    console.log('  yarn tokens --network alfajores    # Alfajores testnet only')
    console.log(
      '  yarn tokens --network celo-sepolia # Celo Sepolia testnet only'
    )
    console.log('  yarn tokens --chainId 42220        # Specific chain ID')
    console.log('  yarn tokens --rpcUrl <url>         # Custom RPC URL')
  } catch (error) {
    console.error(chalk.red('ERROR: An unexpected error occurred:'))
    console.error(error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}

// Run the script
main().catch((error) => {
  console.error('Error:', error)
  process.exit(1)
})
