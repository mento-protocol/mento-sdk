import { Contract, providers, utils, Wallet } from 'ethers'
import { Mento } from '../src/mento'

// Start Generation Here
const rpcUrls: Record<number, string> = {
  42220: 'https://forno.celo.org',
}

async function main() {
  // Read command-line arguments
  const args = process.argv.slice(2)
  if (args.length < 4) {
    console.error(
      'Usage: ts-node swap.ts <chainId> <pairId> <direction> <amount>'
    )
    process.exit(1)
  }

  const [chainIdStr, pairId, direction, amountStr] = args
  const chainId = Number(chainIdStr)

  if (!rpcUrls[chainId]) {
    console.error(
      `Chain id ${chainId} not supported. Supported chain ids: ${Object.keys(
        rpcUrls
      ).join(', ')}`
    )
    process.exit(1)
  }

  // Read private key from environment
  const privateKey = process.env.PRIVATE_KEY
  if (!privateKey) {
    console.error('Error: PRIVATE_KEY environment variable not set.')
    process.exit(1)
  }

  // Create provider and signer
  const provider = new providers.JsonRpcProvider(rpcUrls[chainId])
  const wallet = new Wallet(privateKey, provider)

  // Create Mento instance
  const mento = await Mento.create(wallet)

  // Fetch tradable pairs from cache
  const pairs = await mento.getTradablePairsWithPath()

  // Find the specified tradable pair
  const tradablePair = pairs.find((p) => p.id === pairId)
  if (!tradablePair) {
    console.error(`Tradable pair ${pairId} not found.`)
    process.exit(1)
  }

  // Determine tokenIn and tokenOut based on direction
  let tokenIn = tradablePair.assets[0].address
  let tokenOut = tradablePair.assets[1].address
  if (direction.toLowerCase() === 'reverse') {
    ;[tokenIn, tokenOut] = [tokenOut, tokenIn]
  }
  // Get token decimals
  const tokenInContract = new Contract(
    tokenIn,
    [
      {
        name: 'decimals',
        type: 'function',
        inputs: [],
        outputs: [{ type: 'uint8' }],
        stateMutability: 'view',
      },
    ],
    provider
  )
  const decimals = await tokenInContract.decimals()

  // Parse amount and scale by decimals
  const amountIn = utils.parseUnits(amountStr, decimals)

  // Get amountOut from Mento
  const amountOut = await mento.getAmountOut(tokenIn, tokenOut, amountIn)

  // Calculate minAmountOut with 5% slippage
  const minAmountOut = amountOut.mul(95).div(100)

  // Increase trading allowance
  console.log('Increasing trading allowance...')
  const allowanceTxReq = await mento.increaseTradingAllowance(
    tokenIn,
    amountIn,
    tradablePair
  )
  const allowanceTx = await wallet.sendTransaction(allowanceTxReq)
  console.log(`Allowance transaction sent: ${allowanceTx.hash}`)
  await allowanceTx.wait()
  console.log('Allowance transaction confirmed.')

  // Perform swap
  console.log('Performing swap...')
  const swapTxReq = await mento.swapIn(
    tokenIn,
    tokenOut,
    amountIn,
    minAmountOut
  )
  const swapTx = await wallet.sendTransaction(swapTxReq)
  console.log(`Swap transaction sent: ${swapTx.hash}`)
  await swapTx.wait()
  console.log('Swap transaction confirmed.')
}

main().catch((error) => {
  console.error('Error:', error)
  process.exit(1)
})
