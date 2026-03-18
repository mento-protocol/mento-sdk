import { createPublicClient, http } from 'viem'
import { PoolService } from '../../../src/services/pools/PoolService'
import { Pool, PoolType, FPMMPoolDetails, PoolRebalancePreview } from '../../../src/core/types'
import { ChainId } from '../../../src/core/constants/chainId'
import { getDefaultRpcUrl } from '../../../src/utils/chainConfig'

/**
 * Integration tests for PoolService.getPoolRebalancePreview()
 *
 * Verifies rebalance preview retrieval from on-chain OpenLiquidityStrategy contracts:
 * - Eligibility filtering (FPMM, out-of-band, strategy registered)
 * - Preview structure and internal consistency
 * - Batch operations
 *
 * Note: Results depend on live market state — pools may or may not be out-of-band.
 *
 * Tests are parameterised across all deployed chains to ensure
 * coverage is not lost when new chains are added.
 *
 * @group integration
 */

interface ChainTestConfig {
  name: string
  chainId: number
  rpcEnvVar: string
}

const CHAIN_CONFIGS: ChainTestConfig[] = [
  {
    name: 'Celo Mainnet',
    chainId: ChainId.CELO,
    rpcEnvVar: 'CELO_RPC_URL',
  },
  {
    name: 'Celo Sepolia',
    chainId: ChainId.CELO_SEPOLIA,
    rpcEnvVar: 'CELO_SEPOLIA_RPC_URL',
  },
  {
    name: 'Monad Testnet',
    chainId: ChainId.MONAD_TESTNET,
    rpcEnvVar: 'MONAD_TESTNET_RPC_URL',
  },
  {
    name: 'Monad',
    chainId: ChainId.MONAD,
    rpcEnvVar: 'MONAD_RPC_URL',
  },
]

describe.each(CHAIN_CONFIGS)('PoolService.getPoolRebalancePreview() Integration - $name', ({ chainId, rpcEnvVar }) => {
  const RPC_URL = process.env[rpcEnvVar] || getDefaultRpcUrl(chainId)

  const publicClient = createPublicClient({
    transport: http(RPC_URL),
  })

  const poolService = new PoolService(publicClient, chainId)

  let pools: Pool[]
  let fpmmPool: Pool | undefined
  let fpmmPoolWithStrategy: Pool | undefined
  let virtualPool: Pool | undefined

  beforeAll(async () => {
    pools = await poolService.getPools()
    fpmmPool = pools.find((p) => p.poolType === PoolType.FPMM)
    virtualPool = pools.find((p) => p.poolType === PoolType.Virtual)

    // Find an FPMM pool with a registered liquidity strategy
    for (const pool of pools.filter((p) => p.poolType === PoolType.FPMM)) {
      const details = (await poolService.getPoolDetails(pool.poolAddr)) as FPMMPoolDetails
      if (details.rebalancing.liquidityStrategy) {
        fpmmPoolWithStrategy = pool
        break
      }
    }
  })

  describe('single pool preview', () => {
    it('should discover at least one FPMM pool', () => {
      expect(fpmmPool).toBeDefined()
    })

    it('should return a preview or null for an FPMM pool with a strategy', async () => {
      if (!fpmmPoolWithStrategy) {
        console.log('No FPMM pool with a registered liquidity strategy found — skipping')
        return
      }

      const preview = await poolService.getPoolRebalancePreview(fpmmPoolWithStrategy.poolAddr)

      if (preview === null) {
        // Pool is in-band or FX market is closed — valid result
        console.log('Pool is currently in-band or market closed — preview is null')
        return
      }

      // Validate structure
      expect(preview.poolAddress).toBe(fpmmPoolWithStrategy.poolAddr)
      expect(preview.strategyAddress).toMatch(/^0x[a-fA-F0-9]{40}$/)
      expect(['Expand', 'Contract']).toContain(preview.direction)

      // Token assignments
      const poolTokens = [fpmmPoolWithStrategy.token0.toLowerCase(), fpmmPoolWithStrategy.token1.toLowerCase()]
      expect(poolTokens).toContain(preview.inputToken.toLowerCase())
      expect(poolTokens).toContain(preview.outputToken.toLowerCase())
      expect(preview.inputToken.toLowerCase()).not.toBe(preview.outputToken.toLowerCase())

      // Amount fields reference correct tokens
      expect(preview.amountRequired.token.toLowerCase()).toBe(preview.inputToken.toLowerCase())
      expect(preview.amountTransferred.token.toLowerCase()).toBe(preview.outputToken.toLowerCase())
      expect(preview.protocolIncentive.token.toLowerCase()).toBe(preview.outputToken.toLowerCase())
      expect(preview.liquiditySourceIncentive.token.toLowerCase()).toBe(preview.outputToken.toLowerCase())

      // Approval fields
      expect(preview.approvalToken.toLowerCase()).toBe(preview.inputToken.toLowerCase())
      expect(preview.approvalSpender).toBe(preview.strategyAddress)
      expect(preview.approvalAmount).toBe(preview.amountRequired.amount)

      // Amount sanity
      expect(preview.amountTransferred.amount).toBeGreaterThan(0n)
      expect(preview.protocolIncentive.amount).toBeLessThanOrEqual(preview.amountTransferred.amount)
      expect(preview.liquiditySourceIncentive.amount).toBeLessThanOrEqual(preview.amountTransferred.amount)
    })

    it('should return valid config and context when preview is available', async () => {
      if (!fpmmPoolWithStrategy) return

      const preview = await poolService.getPoolRebalancePreview(fpmmPoolWithStrategy.poolAddr)
      if (!preview) return

      // Config validation
      expect(preview.config.protocolFeeRecipient).toMatch(/^0x[a-fA-F0-9]{40}$/)
      expect(preview.config.rebalanceCooldown).toBeGreaterThanOrEqual(0)
      expect(preview.config.lastRebalance).toBeGreaterThanOrEqual(0)

      // Context token addresses match pool
      expect(preview.context.token0.toLowerCase()).toBe(fpmmPoolWithStrategy.token0.toLowerCase())
      expect(preview.context.token1.toLowerCase()).toBe(fpmmPoolWithStrategy.token1.toLowerCase())
      expect(preview.context.pool.toLowerCase()).toBe(fpmmPoolWithStrategy.poolAddr.toLowerCase())

      // Action direction matches preview direction
      expect(preview.action.dir).toBe(preview.direction)
    })

    it('should return null for a Virtual pool', async () => {
      if (!virtualPool) {
        console.log('No Virtual pools found on this chain — skipping')
        return
      }

      const preview = await poolService.getPoolRebalancePreview(virtualPool.poolAddr)
      expect(preview).toBeNull()
    })
  })

  describe('batch preview', () => {
    it('should return array matching total pool count', async () => {
      const previews = await poolService.getPoolRebalancePreviewBatch()

      expect(previews).toHaveLength(pools.length)
      for (const preview of previews) {
        expect(preview === null || typeof preview === 'object').toBe(true)
      }
    })

    it('should return valid previews for non-null entries in batch', async () => {
      const previews = await poolService.getPoolRebalancePreviewBatch()
      const nonNullPreviews = previews.filter((p): p is PoolRebalancePreview => p !== null)

      for (const preview of nonNullPreviews) {
        expect(preview.poolAddress).toMatch(/^0x[a-fA-F0-9]{40}$/)
        expect(preview.strategyAddress).toMatch(/^0x[a-fA-F0-9]{40}$/)
        expect(['Expand', 'Contract']).toContain(preview.direction)
        expect(preview.amountTransferred.amount).toBeGreaterThan(0n)
      }
    })
  })

  describe('consistency', () => {
    it('single and batch results should agree for the same pool', async () => {
      if (!fpmmPoolWithStrategy) return

      const single = await poolService.getPoolRebalancePreview(fpmmPoolWithStrategy.poolAddr)
      const [batch] = await poolService.getPoolRebalancePreviewBatch([fpmmPoolWithStrategy.poolAddr])

      if (single === null) {
        expect(batch).toBeNull()
      } else {
        expect(batch).not.toBeNull()
        expect(batch!.poolAddress).toBe(single.poolAddress)
        expect(batch!.direction).toBe(single.direction)
        expect(batch!.inputToken).toBe(single.inputToken)
        expect(batch!.outputToken).toBe(single.outputToken)
        expect(batch!.strategyAddress).toBe(single.strategyAddress)
      }
    })
  })
})
