import { ChainId, tryGetContractAddress } from '../../core/constants'
import { Pool, FPMMPoolDetails, FPMMPricing, VirtualPoolDetails } from '../../core/types'
import { FPMM_ABI, VIRTUAL_POOL_ABI } from '../../core/abis'
import { PublicClient, Address, getAddress } from 'viem'
import { multicall } from '../../utils/multicall'

type MulticallResults = Awaited<ReturnType<typeof multicall>>

const FPMM_FIXED_RESULT_COUNT = 8
const VIRTUAL_RESULT_COUNT = 3

/**
 * Fetches enriched details for an FPMM pool
 */
export async function fetchFPMMPoolDetails(
  publicClient: PublicClient,
  chainId: number,
  pool: Pool
): Promise<FPMMPoolDetails> {
  const [details] = await fetchFPMMPoolDetailsBatch(publicClient, chainId, [pool])
  return details
}

export async function fetchFPMMPoolDetailsBatch(
  publicClient: PublicClient,
  chainId: number,
  pools: Pool[]
): Promise<FPMMPoolDetails[]> {
  if (pools.length === 0) {
    return []
  }

  const openLiquidityStrategy = getOpenLiquidityStrategy(chainId)
  const contracts = pools.flatMap((pool) => buildFPMMContracts(pool, openLiquidityStrategy))
  const results = await multicall(publicClient, contracts)

  const strategyCheckCount = openLiquidityStrategy ? 1 : 0
  const perPoolResultCount = FPMM_FIXED_RESULT_COUNT + strategyCheckCount + 1
  return pools.map((pool, index) => {
    const offset = index * perPoolResultCount
    const poolResults = results.slice(offset, offset + perPoolResultCount)
    return parseFPMMPoolDetails(pool, openLiquidityStrategy, poolResults)
  })
}

function buildFPMMContracts(pool: Pool, openLiquidityStrategy: Address | null) {
  const address = pool.poolAddr as Address

  return [
    { address, abi: FPMM_ABI, functionName: 'getReserves' as const },
    { address, abi: FPMM_ABI, functionName: 'decimals0' as const },
    { address, abi: FPMM_ABI, functionName: 'decimals1' as const },
    { address, abi: FPMM_ABI, functionName: 'lpFee' as const },
    { address, abi: FPMM_ABI, functionName: 'protocolFee' as const },
    { address, abi: FPMM_ABI, functionName: 'rebalanceIncentive' as const },
    { address, abi: FPMM_ABI, functionName: 'rebalanceThresholdAbove' as const },
    { address, abi: FPMM_ABI, functionName: 'rebalanceThresholdBelow' as const },
    ...(openLiquidityStrategy
      ? [{
          address,
          abi: FPMM_ABI,
          functionName: 'liquidityStrategy' as const,
          args: [openLiquidityStrategy] as const,
        }]
      : []),
    { address, abi: FPMM_ABI, functionName: 'getRebalancingState' as const },
  ]
}

function parseFPMMPoolDetails(
  pool: Pool,
  openLiquidityStrategy: Address | null,
  results: MulticallResults
): FPMMPoolDetails {
  try {
    const reservesRes = results[0]
    const decimals0Res = results[1]
    const decimals1Res = results[2]
    const lpFeeRes = results[3]
    const protocolFeeRes = results[4]
    const rebalanceIncentiveRes = results[5]
    const thresholdAboveRes = results[6]
    const thresholdBelowRes = results[7]

    if (
      !reservesRes ||
      !decimals0Res ||
      !decimals1Res ||
      !lpFeeRes ||
      !protocolFeeRes ||
      !rebalanceIncentiveRes ||
      !thresholdAboveRes ||
      !thresholdBelowRes ||
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

    const strategyCheckCount = openLiquidityStrategy ? 1 : 0
    const openStrategyResult = strategyCheckCount > 0 ? results[FPMM_FIXED_RESULT_COUNT] : null
    const liquidityStrategy =
      openLiquidityStrategy &&
      openStrategyResult?.status === 'success' &&
      openStrategyResult.result === true
        ? openLiquidityStrategy
        : null

    const rebalancingRes = results[FPMM_FIXED_RESULT_COUNT + strategyCheckCount]
    let pricing: FPMMPricing | null = null
    let inBand: boolean | null = null

    if (rebalancingRes?.status === 'success') {
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
  const [details] = await fetchVirtualPoolDetailsBatch(publicClient, [pool])
  return details
}

export async function fetchVirtualPoolDetailsBatch(
  publicClient: PublicClient,
  pools: Pool[]
): Promise<VirtualPoolDetails[]> {
  if (pools.length === 0) {
    return []
  }

  const contracts = pools.flatMap((pool) => buildVirtualContracts(pool))
  const results = await multicall(publicClient, contracts)

  return pools.map((pool, index) => {
    const offset = index * VIRTUAL_RESULT_COUNT
    const poolResults = results.slice(offset, offset + VIRTUAL_RESULT_COUNT)
    return parseVirtualPoolDetails(pool, poolResults)
  })
}

function buildVirtualContracts(pool: Pool) {
  const address = pool.poolAddr as Address

  return [
    { address, abi: VIRTUAL_POOL_ABI, functionName: 'getReserves' as const },
    { address, abi: VIRTUAL_POOL_ABI, functionName: 'protocolFee' as const },
    { address, abi: VIRTUAL_POOL_ABI, functionName: 'metadata' as const },
  ]
}

function parseVirtualPoolDetails(pool: Pool, results: MulticallResults): VirtualPoolDetails {
  try {
    if (
      results.length !== VIRTUAL_RESULT_COUNT ||
      results[0].status === 'failure' ||
      results[1].status === 'failure' ||
      results[2].status === 'failure'
    ) {
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
 * Returns the configured Open Liquidity Strategy for the given chain.
 */
function getOpenLiquidityStrategy(chainId: number): Address | null {
  const strategyAddress = tryGetContractAddress(chainId as ChainId, 'OpenLiquidityStrategy')
  if (!strategyAddress) return null

  try {
    return getAddress(strategyAddress)
  } catch {
    return null
  }
}
