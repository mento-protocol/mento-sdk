import { createPublicClient, http } from 'viem'
import { PoolService } from '../../../src/services/pools/PoolService'
import { Pool, PoolType, FPMMPoolDetails, VirtualPoolDetails } from '../../../src/core/types'

/**
 * Integration tests for PoolService.getPoolDetails()
 *
 * Verifies enriched pool data retrieval from on-chain contracts:
 * - FPMM pools: pricing, fees, rebalancing state
 * - Virtual pools: reserves, spread
 *
 * Requirements:
 * - RPC endpoint accessible (default: Celo mainnet via Forno)
 *
 * @group integration
 */
describe('PoolService.getPoolDetails() Integration', () => {
  const RPC_URL = process.env.CELO_RPC_URL || process.env.CELO_MAINNET_RPC_URL || 'https://forno.celo.org'
  const CHAIN_ID = 42220 // Celo mainnet

  const publicClient = createPublicClient({
    transport: http(RPC_URL),
  })

  const poolService = new PoolService(publicClient, CHAIN_ID)

  let pools: Pool[]
  let fpmmPool: Pool | undefined
  let virtualPool: Pool | undefined

  beforeAll(async () => {
    pools = await poolService.getPools()
    fpmmPool = pools.find((p) => p.poolType === PoolType.FPMM)
    virtualPool = pools.find((p) => p.poolType === PoolType.Virtual)
  })

  describe('FPMM pool details', () => {
    it('should discover at least one FPMM pool', () => {
      expect(fpmmPool).toBeDefined()
    })

    it('should return enriched FPMM pool details', async () => {
      if (!fpmmPool) return

      const details = await poolService.getPoolDetails(fpmmPool.poolAddr)

      expect(details.poolType).toBe('FPMM')
      expect(details.poolAddr).toBe(fpmmPool.poolAddr)
      expect(details.token0).toBe(fpmmPool.token0)
      expect(details.token1).toBe(fpmmPool.token1)
    })

    it('should return valid reserves', async () => {
      if (!fpmmPool) return

      const details = (await poolService.getPoolDetails(fpmmPool.poolAddr)) as FPMMPoolDetails

      expect(details.reserve0).toBeGreaterThan(0n)
      expect(details.reserve1).toBeGreaterThan(0n)
      expect(details.blockTimestampLast).toBeGreaterThan(0n)
    })

    it('should return valid token decimals (scaling factors)', async () => {
      if (!fpmmPool) return

      const details = (await poolService.getPoolDetails(fpmmPool.poolAddr)) as FPMMPoolDetails

      // Decimals are scaling factors (10^n where n is 6-18 typically)
      expect(details.scalingFactor0).toBeGreaterThanOrEqual(1000000n) // at least 10^6
      expect(details.scalingFactor1).toBeGreaterThanOrEqual(1000000n)
    })

    it('should return valid pricing data (or null when FX market closed)', async () => {
      if (!fpmmPool) return

      const details = (await poolService.getPoolDetails(fpmmPool.poolAddr)) as FPMMPoolDetails

      if (details.pricing === null) {
        // FX market is closed — pricing unavailable, other fields still populated
        expect(details.reserve0).toBeGreaterThan(0n)
        return
      }

      // Oracle price should be a positive number
      expect(details.pricing.oraclePriceNum).toBeGreaterThan(0n)
      expect(details.pricing.oraclePriceDen).toBeGreaterThan(0n)
      expect(details.pricing.oraclePrice).toBeGreaterThan(0)
      expect(Number.isFinite(details.pricing.oraclePrice)).toBe(true)

      // Reserve price should be a positive number
      expect(details.pricing.reservePriceNum).toBeGreaterThan(0n)
      expect(details.pricing.reservePriceDen).toBeGreaterThan(0n)
      expect(details.pricing.reservePrice).toBeGreaterThan(0)
      expect(Number.isFinite(details.pricing.reservePrice)).toBe(true)

      // Price difference should be non-negative (in bps)
      expect(details.pricing.priceDifferenceBps).toBeGreaterThanOrEqual(0n)
      expect(details.pricing.priceDifferencePercent).toBeGreaterThanOrEqual(0)

      // reservePriceAboveOraclePrice should be a boolean
      expect(typeof details.pricing.reservePriceAboveOraclePrice).toBe('boolean')
    })

    it('should return valid fee configuration', async () => {
      if (!fpmmPool) return

      const details = (await poolService.getPoolDetails(fpmmPool.poolAddr)) as FPMMPoolDetails

      // Fees should be non-negative and reasonable (< 2% each, < 2% combined)
      expect(details.fees.lpFeeBps).toBeGreaterThanOrEqual(0n)
      expect(details.fees.lpFeeBps).toBeLessThanOrEqual(200n)
      expect(details.fees.lpFeePercent).toBeGreaterThanOrEqual(0)
      expect(details.fees.lpFeePercent).toBeLessThanOrEqual(2)

      expect(details.fees.protocolFeeBps).toBeGreaterThanOrEqual(0n)
      expect(details.fees.protocolFeeBps).toBeLessThanOrEqual(200n)
      expect(details.fees.protocolFeePercent).toBeGreaterThanOrEqual(0)

      // Total fee should equal sum of LP + protocol
      expect(details.fees.totalFeePercent).toBeCloseTo(details.fees.lpFeePercent + details.fees.protocolFeePercent, 10)
    })

    it('should return valid rebalancing state', async () => {
      if (!fpmmPool) return

      const details = (await poolService.getPoolDetails(fpmmPool.poolAddr)) as FPMMPoolDetails

      // Rebalance incentive should be <= 1% (100 bps)
      expect(details.rebalancing.rebalanceIncentiveBps).toBeGreaterThanOrEqual(0n)
      expect(details.rebalancing.rebalanceIncentiveBps).toBeLessThanOrEqual(100n)
      expect(details.rebalancing.rebalanceIncentivePercent).toBeGreaterThanOrEqual(0)
      expect(details.rebalancing.rebalanceIncentivePercent).toBeLessThanOrEqual(1)

      // Thresholds should be <= 10% (1000 bps)
      expect(details.rebalancing.rebalanceThresholdAboveBps).toBeGreaterThanOrEqual(0n)
      expect(details.rebalancing.rebalanceThresholdAboveBps).toBeLessThanOrEqual(1000n)
      expect(details.rebalancing.rebalanceThresholdBelowBps).toBeGreaterThanOrEqual(0n)
      expect(details.rebalancing.rebalanceThresholdBelowBps).toBeLessThanOrEqual(1000n)

      // inBand should be consistent with price difference vs threshold
      if (details.pricing) {
        const applicableThreshold = details.pricing.reservePriceAboveOraclePrice
          ? details.rebalancing.rebalanceThresholdAboveBps
          : details.rebalancing.rebalanceThresholdBelowBps
        const expectedInBand = details.pricing.priceDifferenceBps < applicableThreshold
        expect(details.rebalancing.inBand).toBe(expectedInBand)
      } else {
        expect(details.rebalancing.inBand).toBeNull()
      }
    })

    it('should return liquidity strategy (string or null)', async () => {
      if (!fpmmPool) return

      const details = (await poolService.getPoolDetails(fpmmPool.poolAddr)) as FPMMPoolDetails

      if (details.rebalancing.liquidityStrategy !== null) {
        expect(details.rebalancing.liquidityStrategy).toMatch(/^0x[0-9a-fA-F]{40}$/)
      } else {
        expect(details.rebalancing.liquidityStrategy).toBeNull()
      }
    })

    it('should handle case-insensitive pool address', async () => {
      if (!fpmmPool) return

      const details = await poolService.getPoolDetails(fpmmPool.poolAddr.toLowerCase())
      expect(details.poolAddr).toBe(fpmmPool.poolAddr)
    })
  })

  describe('Virtual pool details', () => {
    it('should return enriched Virtual pool details if any exist', async () => {
      if (!virtualPool) {
        console.log('No Virtual pools found on chain - skipping Virtual pool detail tests')
        return
      }

      const details = (await poolService.getPoolDetails(virtualPool.poolAddr)) as VirtualPoolDetails

      expect(details.poolType).toBe('Virtual')
      expect(details.poolAddr).toBe(virtualPool.poolAddr)
      expect(details.token0).toBe(virtualPool.token0)
      expect(details.token1).toBe(virtualPool.token1)
    })

    it('should return valid reserves for Virtual pool', async () => {
      if (!virtualPool) return

      const details = (await poolService.getPoolDetails(virtualPool.poolAddr)) as VirtualPoolDetails

      expect(details.reserve0).toBeGreaterThan(0n)
      expect(details.reserve1).toBeGreaterThan(0n)
      expect(details.blockTimestampLast).toBeGreaterThan(0n)
    })

    it('should return valid spread for Virtual pool', async () => {
      if (!virtualPool) return

      const details = (await poolService.getPoolDetails(virtualPool.poolAddr)) as VirtualPoolDetails

      // Spread should be reasonable (< 10%)
      expect(details.spreadBps).toBeGreaterThanOrEqual(0n)
      expect(details.spreadBps).toBeLessThanOrEqual(1000n)
      expect(details.spreadPercent).toBeGreaterThanOrEqual(0)
      expect(details.spreadPercent).toBeLessThanOrEqual(10)
    })

    it('should return valid decimals for Virtual pool', async () => {
      if (!virtualPool) return

      const details = (await poolService.getPoolDetails(virtualPool.poolAddr)) as VirtualPoolDetails

      expect(details.scalingFactor0).toBeGreaterThanOrEqual(1000000n)
      expect(details.scalingFactor1).toBeGreaterThanOrEqual(1000000n)
    })
  })

  describe('error handling', () => {
    it('should throw for unknown pool address', async () => {
      await expect(poolService.getPoolDetails('0x0000000000000000000000000000000000000000')).rejects.toThrow(
        'Pool not found'
      )
    })
  })
})
