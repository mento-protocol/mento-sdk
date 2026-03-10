import { addresses, ChainId } from '../../core/constants'
import { Pool, FPMMPoolDetails, FPMMPricing, VirtualPoolDetails } from '../../core/types'
import { FPMM_ABI, VIRTUAL_POOL_ABI } from '../../core/abis'
import { PublicClient, Address, getAddress } from 'viem'
import { multicall } from '../../utils/multicall'

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

    // Build all contract reads for a single multicall
    const coreContracts = [
      { address, abi: FPMM_ABI, functionName: 'getReserves' as const },
      { address, abi: FPMM_ABI, functionName: 'decimals0' as const },
      { address, abi: FPMM_ABI, functionName: 'decimals1' as const },
      { address, abi: FPMM_ABI, functionName: 'lpFee' as const },
      { address, abi: FPMM_ABI, functionName: 'protocolFee' as const },
      { address, abi: FPMM_ABI, functionName: 'rebalanceIncentive' as const },
      { address, abi: FPMM_ABI, functionName: 'rebalanceThresholdAbove' as const },
      { address, abi: FPMM_ABI, functionName: 'rebalanceThresholdBelow' as const },
      ...knownStrategies.map((strategyAddr) => ({
        address,
        abi: FPMM_ABI,
        functionName: 'liquidityStrategy' as const,
        args: [strategyAddr] as const,
      })),
      // Include getRebalancingState in the same multicall (allowFailure handles FXMarketClosed)
      { address, abi: FPMM_ABI, functionName: 'getRebalancingState' as const },
    ]

    const results = await multicall(publicClient, coreContracts)

    // Parse core results (first 8 are fixed)
    const reservesRes = results[0]
    const decimals0Res = results[1]
    const decimals1Res = results[2]
    const lpFeeRes = results[3]
    const protocolFeeRes = results[4]
    const rebalanceIncentiveRes = results[5]
    const thresholdAboveRes = results[6]
    const thresholdBelowRes = results[7]

    // Check core results
    if (
      reservesRes.status === 'failure' ||
      decimals0Res.status === 'failure' ||
      decimals1Res.status === 'failure' ||
      lpFeeRes.status === 'failure' ||
      protocolFeeRes.status === 'failure' ||
      rebalanceIncentiveRes.status === 'failure' ||
      thresholdAboveRes.status === 'failure' ||
      thresholdBelowRes.status === 'failure'
    ) {
      throw new Error('One or more core pool reads failed')
    }

    const [reserve0, reserve1, blockTimestampLast] = reservesRes.result as [bigint, bigint, bigint]

    const lpFeeBps = lpFeeRes.result as bigint
    const protocolFeeBps = protocolFeeRes.result as bigint
    const rebalanceIncentiveBps = rebalanceIncentiveRes.result as bigint
    const thresholdAboveBps = thresholdAboveRes.result as bigint
    const thresholdBelowBps = thresholdBelowRes.result as bigint

    // Parse strategy results (indices 8 .. 8+N-1)
    const strategyResults = results.slice(8, 8 + knownStrategies.length)
    const activeIndex = strategyResults.findIndex((r) => r.status === 'success' && r.result === true)
    const liquidityStrategy = activeIndex >= 0 ? knownStrategies[activeIndex] : null

    // Parse getRebalancingState (last result) — graceful degradation when FX market is closed
    const rebalancingRes = results[8 + knownStrategies.length]
    let pricing: FPMMPricing | null = null
    let inBand: boolean | null = null

    if (rebalancingRes.status === 'success') {
      const [
        oraclePriceNum,
        oraclePriceDen,
        reservePriceNum,
        reservePriceDen,
        reservePriceAboveOraclePrice,
        rebalanceThreshold,
        priceDifference,
      ] = rebalancingRes.result as [bigint, bigint, bigint, bigint, boolean, number, bigint]

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

      inBand = priceDifference < BigInt(rebalanceThreshold)
    }
    // If rebalancingRes.status === 'failure' (likely FXMarketClosed) — pricing stays null

    return {
      ...pool,
      poolType: 'FPMM',
      scalingFactor0: decimals0Res.result as bigint,
      scalingFactor1: decimals1Res.result as bigint,
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
    const results = await multicall(publicClient, [
      { address, abi: VIRTUAL_POOL_ABI, functionName: 'getReserves' as const },
      { address, abi: VIRTUAL_POOL_ABI, functionName: 'protocolFee' as const },
      { address, abi: VIRTUAL_POOL_ABI, functionName: 'metadata' as const },
    ])

    if (results[0].status === 'failure' || results[1].status === 'failure' || results[2].status === 'failure') {
      throw new Error('One or more virtual pool reads failed')
    }

    const [reserve0, reserve1, blockTimestampLast] = results[0].result as [bigint, bigint, bigint]
    const [dec0, dec1] = results[2].result as [bigint, bigint, bigint, bigint, string, string]
    const spreadBps = results[1].result as bigint

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
function getKnownLiquidityStrategies(chainId: number): Address[] {
  const chainAddresses = addresses[chainId as ChainId]
  if (!chainAddresses) return []

  const strategyCandidates = [
    chainAddresses.ReserveLiquidityStrategy,
    chainAddresses.CDPLiquidityStrategy,
  ].filter((address): address is string => Boolean(address))

  // Normalize to checksummed addresses and ignore malformed config values.
  return strategyCandidates.flatMap((address) => {
    try {
      return [getAddress(address)]
    } catch {
      return []
    }
  })
}
