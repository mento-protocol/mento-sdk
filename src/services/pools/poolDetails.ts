import { addresses, ChainId } from '../../core/constants'
import { Pool, FPMMPoolDetails, FPMMPricing, VirtualPoolDetails } from '../../core/types'
import { FPMM_ABI, VIRTUAL_POOL_ABI } from '../../core/abis'
import { PublicClient, Address } from 'viem'

/**
 * Fetches enriched details for an FPMM pool
 */
export async function fetchFPMMPoolDetails(
  publicClient: PublicClient,
  chainId: number,
  pool: Pool
): Promise<FPMMPoolDetails> {
  const address = pool.poolAddr as Address

  try {
    // Known liquidity strategy addresses for this chain
    const knownStrategies = getKnownLiquidityStrategies(chainId)

    // Fetch core data
    const [
      reservesResult,
      decimals0,
      decimals1,
      lpFee,
      protocolFee,
      rebalanceIncentive,
      rebalanceThresholdAbove,
      rebalanceThresholdBelow,
      ...strategyResults
    ] = await Promise.all([
      publicClient.readContract({ address, abi: FPMM_ABI, functionName: 'getReserves' }),
      publicClient.readContract({ address, abi: FPMM_ABI, functionName: 'decimals0' }),
      publicClient.readContract({ address, abi: FPMM_ABI, functionName: 'decimals1' }),
      publicClient.readContract({ address, abi: FPMM_ABI, functionName: 'lpFee' }),
      publicClient.readContract({ address, abi: FPMM_ABI, functionName: 'protocolFee' }),
      publicClient.readContract({ address, abi: FPMM_ABI, functionName: 'rebalanceIncentive' }),
      publicClient.readContract({ address, abi: FPMM_ABI, functionName: 'rebalanceThresholdAbove' }),
      publicClient.readContract({ address, abi: FPMM_ABI, functionName: 'rebalanceThresholdBelow' }),
      ...knownStrategies.map((strategyAddr: string) =>
        publicClient.readContract({
          address,
          abi: FPMM_ABI,
          functionName: 'liquidityStrategy',
          args: [strategyAddr as Address],
        })
      ),
    ])

    const [reserve0, reserve1, blockTimestampLast] = reservesResult as [bigint, bigint, bigint]

    const lpFeeBps = lpFee as bigint
    const protocolFeeBps = protocolFee as bigint
    const rebalanceIncentiveBps = rebalanceIncentive as bigint
    const thresholdAboveBps = rebalanceThresholdAbove as bigint
    const thresholdBelowBps = rebalanceThresholdBelow as bigint

    // Find the active liquidity strategy (first match wins)
    const activeIndex = strategyResults.findIndex((result) => result === true)
    const liquidityStrategy = activeIndex >= 0 ? knownStrategies[activeIndex] : null

    // Fetch pricing separately — graceful degradation when FX market is closed
    let pricing: FPMMPricing | null = null
    let inBand: boolean | null = null
    try {
      const pricesResult = await publicClient.readContract({
        address,
        abi: FPMM_ABI,
        functionName: 'getPrices',
      })
      const [
        oraclePriceNum,
        oraclePriceDen,
        reservePriceNum,
        reservePriceDen,
        priceDifference,
        reservePriceAboveOraclePrice,
      ] = pricesResult as [bigint, bigint, bigint, bigint, bigint, boolean]

      pricing = {
        oraclePriceNum,
        oraclePriceDen,
        oraclePrice: Number(oraclePriceNum) / Number(oraclePriceDen),
        reservePriceNum,
        reservePriceDen,
        reservePrice: Number(reservePriceNum) / Number(reservePriceDen),
        priceDifferenceBps: priceDifference,
        priceDifferencePercent: Number(priceDifference) / 100,
        reservePriceAboveOraclePrice,
      }

      const applicableThreshold = reservePriceAboveOraclePrice ? thresholdAboveBps : thresholdBelowBps
      inBand = priceDifference < applicableThreshold
    } catch {
      // getPrices() failed (likely FXMarketClosed) — pricing stays null
    }

    return {
      ...pool,
      poolType: 'FPMM',
      scalingFactor0: decimals0 as bigint,
      scalingFactor1: decimals1 as bigint,
      reserve0,
      reserve1,
      blockTimestampLast,
      pricing,
      fees: {
        lpFeeBps,
        lpFeePercent: Number(lpFeeBps) / 100,
        protocolFeeBps,
        protocolFeePercent: Number(protocolFeeBps) / 100,
        totalFeePercent: (Number(lpFeeBps) + Number(protocolFeeBps)) / 100,
      },
      rebalancing: {
        rebalanceIncentiveBps,
        rebalanceIncentivePercent: Number(rebalanceIncentiveBps) / 100,
        rebalanceThresholdAboveBps: thresholdAboveBps,
        rebalanceThresholdAbovePercent: Number(thresholdAboveBps) / 100,
        rebalanceThresholdBelowBps: thresholdBelowBps,
        rebalanceThresholdBelowPercent: Number(thresholdBelowBps) / 100,
        inBand,
        liquidityStrategy,
      },
    }
  } catch (error) {
    throw new Error(`Failed to fetch FPMM pool details for ${pool.poolAddr}: ${(error as Error).message}`)
  }
}

/**
 * Fetches enriched details for a Virtual pool
 */
export async function fetchVirtualPoolDetails(publicClient: PublicClient, pool: Pool): Promise<VirtualPoolDetails> {
  const address = pool.poolAddr as Address

  try {
    const [reservesResult, protocolFee, metadataResult] = await Promise.all([
      publicClient.readContract({ address, abi: VIRTUAL_POOL_ABI, functionName: 'getReserves' }),
      publicClient.readContract({ address, abi: VIRTUAL_POOL_ABI, functionName: 'protocolFee' }),
      publicClient.readContract({ address, abi: VIRTUAL_POOL_ABI, functionName: 'metadata' }),
    ])

    const [reserve0, reserve1, blockTimestampLast] = reservesResult as [bigint, bigint, bigint]
    const [dec0, dec1] = metadataResult as [bigint, bigint, bigint, bigint, string, string]
    const spreadBps = protocolFee as bigint

    return {
      ...pool,
      poolType: 'Virtual',
      scalingFactor0: dec0,
      scalingFactor1: dec1,
      reserve0,
      reserve1,
      blockTimestampLast,
      spreadBps,
      spreadPercent: Number(spreadBps) / 100,
    }
  } catch (error) {
    throw new Error(`Failed to fetch Virtual pool details for ${pool.poolAddr}: ${(error as Error).message}`)
  }
}

/**
 * Returns the known liquidity strategy addresses for the given chain.
 */
function getKnownLiquidityStrategies(chainId: number): string[] {
  const strategies: string[] = []
  const chainAddresses = addresses[chainId as ChainId]
  if (!chainAddresses) return strategies

  if (chainAddresses.ReserveLiquidityStrategy) {
    strategies.push(chainAddresses.ReserveLiquidityStrategy)
  }
  if (chainAddresses.CDPLiquidityStrategy) {
    strategies.push(chainAddresses.CDPLiquidityStrategy)
  }
  return strategies
}
