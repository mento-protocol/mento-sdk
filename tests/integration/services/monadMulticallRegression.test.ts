import { type Address, createPublicClient, http } from 'viem'
import { FPMM_ABI } from '../../../src/core/abis'
import { ChainId } from '../../../src/core/constants/chainId'
import { Mento } from '../../../src/index'
import { getChainConfig, getDefaultRpcUrl } from '../../../src/utils/chainConfig'

const MONAD_TESTNET_FPMM_POOL = '0x52716E8F44E417bE8F573F8A85cA8eD3DAe1eAE1' as Address
const MULTICALL3_ADDRESS = '0xcA11bde05977b3631167028862bE2a173976CA11'

describe('Monad Testnet multicall regression', () => {
  const rpcUrl = process.env.MONAD_TESTNET_RPC_URL || getDefaultRpcUrl(ChainId.MONAD_TESTNET)

  it('should expose multicall3 in the Monad Testnet chain config', () => {
    const chain = getChainConfig(ChainId.MONAD_TESTNET)

    expect(chain.contracts?.multicall3?.address).toBe(MULTICALL3_ADDRESS)
    expect(chain.contracts?.multicall3?.blockCreated).toBe(251449)
  })

  it('should support direct viem multicall on a chain-configured Monad client', async () => {
    const publicClient = createPublicClient({
      chain: getChainConfig(ChainId.MONAD_TESTNET),
      transport: http(rpcUrl),
    })

    const [result] = await publicClient.multicall({
      contracts: [
        {
          address: MONAD_TESTNET_FPMM_POOL,
          abi: FPMM_ABI,
          functionName: 'getReserves',
        },
      ],
    })

    expect(result.status).toBe('success')

    if (result.status === 'success') {
      const [reserve0, reserve1] = result.result as [bigint, bigint, bigint]
      expect(reserve0).toBeGreaterThanOrEqual(0n)
      expect(reserve1).toBeGreaterThanOrEqual(0n)
    }
  })

  it('should fetch pools and known pool details through Mento.create()', async () => {
    const mento = await Mento.create(ChainId.MONAD_TESTNET, rpcUrl)
    const pools = await mento.pools.getPools()

    expect(pools.length).toBeGreaterThan(0)

    const knownPool = pools.find((pool) => pool.poolAddr.toLowerCase() === MONAD_TESTNET_FPMM_POOL.toLowerCase())
    expect(knownPool).toBeDefined()

    const details = await mento.pools.getPoolDetails(MONAD_TESTNET_FPMM_POOL)

    expect(details.poolAddr.toLowerCase()).toBe(MONAD_TESTNET_FPMM_POOL.toLowerCase())
    expect(details.poolType).toBe('FPMM')
  })

  it('should batch pool details and prepare swap/zap flows through the new APIs', async () => {
    const mento = await Mento.create(ChainId.MONAD_TESTNET, rpcUrl)
    const pools = await mento.pools.getPools()
    const knownPool = pools.find((pool) => pool.poolAddr.toLowerCase() === MONAD_TESTNET_FPMM_POOL.toLowerCase())

    expect(knownPool).toBeDefined()
    if (!knownPool || knownPool.poolType !== 'FPMM') {
      return
    }

    const [batchDetails] = await mento.pools.getPoolDetailsBatch([knownPool.poolAddr])
    expect(batchDetails.poolAddr.toLowerCase()).toBe(MONAD_TESTNET_FPMM_POOL.toLowerCase())

    const recipient = '0x0000000000000000000000000000000000000001' as Address
    const amountIn = 1_000_000_000_000_000_000n
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20)
    const directRoutes = await mento.routes.getDirectRoutes()

    let quoteableRoute: (typeof directRoutes)[number] | undefined
    for (const route of directRoutes) {
      if (route.path.length !== 1 || route.path[0]?.poolType !== 'FPMM') {
        continue
      }

      try {
        const amountOut = await mento.quotes.getAmountOut(
          route.tokens[0].address,
          route.tokens[1].address,
          amountIn,
          route
        )

        if (amountOut > 0n) {
          quoteableRoute = route
          break
        }
      } catch {
        // Some discovered Monad pools/routes are temporarily not quoteable.
      }
    }

    if (!quoteableRoute) {
      console.log('No quoteable direct FPMM route available on Monad Testnet - skipping swap/zap flow checks')
      return
    }

    const quoteablePool = quoteableRoute.path[0]

    const preparedSwap = await mento.swap.prepareSwap({
      tokenIn: quoteableRoute.tokens[0].address,
      tokenOut: quoteableRoute.tokens[1].address,
      amountIn,
      recipient,
      slippageTolerance: 0.5,
      deadline,
    })

    expect(preparedSwap.params).toBeDefined()
    expect(preparedSwap.expectedAmountOut).toBeGreaterThan(0n)

    const preparedZapIn = await mento.liquidity.prepareZapIn({
      poolAddress: quoteablePool.poolAddr,
      tokenIn: quoteablePool.token0,
      amountIn,
      amountInSplit: 0.5,
      recipient,
      options: { slippageTolerance: 0.5, deadline },
    })

    expect(preparedZapIn.details.poolAddress.toLowerCase()).toBe(quoteablePool.poolAddr.toLowerCase())
    expect(preparedZapIn.quote.estimatedMinLiquidity).toBeGreaterThanOrEqual(0n)

    const preparedZapOut = await mento.liquidity.prepareZapOut({
      poolAddress: quoteablePool.poolAddr,
      tokenOut: quoteablePool.token0,
      liquidity: 1_000_000_000_000_000n,
      recipient,
      options: { slippageTolerance: 0.5, deadline },
    })

    expect(preparedZapOut.details.poolAddress.toLowerCase()).toBe(quoteablePool.poolAddr.toLowerCase())
    expect(preparedZapOut.quote.estimatedMinTokenOut).toBeGreaterThanOrEqual(0n)
  })
})
