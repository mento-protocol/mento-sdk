import { providers } from 'ethers'
import { Mento } from '../../src/mento'
import { parseCommandLineArgs } from './utils/parseCommandLineArgs'
import chalk from 'chalk'


async function main() {
  const ora = (await import('ora')).default;
  // Parse command line arguments
  const args = parseCommandLineArgs()

  // Use RPC URL from command line args or fallback to environment variable
  const rpcUrl =
    args.rpcUrl || process.env.RPC_URL || 'https://forno.celo.org'
  const provider = new providers.JsonRpcProvider(rpcUrl)

  console.log(chalk.gray('\n==============================='))
  console.log(chalk.bold.blue('Mento Tradable Pairs'))
  console.log(chalk.gray('===============================\n'))
  console.log(chalk.yellow(`Using RPC URL: ${rpcUrl}`))

  // Optional: verify that the provider's network matches the requested chain id.
  const network = await provider.getNetwork()
  if (!!args.chainId && network.chainId !== args.chainId) {
    console.warn(
      `Warning: provider network chain id (${network.chainId}) does not match requested chain id (${chainId})`
    )
  }
  if (args.chainId) {
    console.log(chalk.yellow(`Network: Chain ID ${args.chainId}\n`))
  } else {
    console.log()
  }
  if (args.token) {
    console.log(chalk.yellow(`Filtering by token: ${args.token}\n`))
  }

  if (args.exchange) {
    console.log(chalk.yellow(`Filtering by exchange ID: ${args.exchange}`))
  }

  const loader = ora({
    text: 'Loading tradable paris...',
    color: 'cyan',
  }).start()
  // Create a Mento instance using the provider
  const mento = await Mento.create(provider)
  // Fetch cached tradable pairs
  const pairs = await mento.getTradablePairsWithPath()

  loader.succeed("Pairs loaded")

  console.log(`Tradable pairs for chain ${network.chainId}:\n`)

  let filteredPairs = args.token
    ? pairs.filter((pair) =>
      pair.assets[0].symbol.toLowerCase() === args.token?.toLowerCase() ||
      pair.assets[1].symbol.toLowerCase() === args.token?.toLowerCase()
    ) : pairs
  filteredPairs = args.exchange
    ? filteredPairs.filter(pair =>
      pair.path.find(seg => seg.id == args.exchange)
    ) : filteredPairs

  for (const pair of filteredPairs) {
    const [asset1, asset2] = pair.assets
    console.log(`${pair.id}:`)
    console.log(`  Assets:`)
    console.log(`    ${asset1.symbol}: ${asset1.address}`)
    console.log(`    ${asset2.symbol}: ${asset2.address}`)
    console.log(`  Exchange Path:`)
    for (const hop of pair.path) {
      console.log(`    Provider: ${hop.providerAddr}`)
      console.log(`    Exchange ID: ${hop.id}`)
      console.log(`    Assets: ${hop.assets[0]} -> ${hop.assets[1]}`)
      console.log()
    }
    console.log('---')
  }
}

main().catch((error) => {
  console.error('Error:', error)
  process.exit(1)
})
