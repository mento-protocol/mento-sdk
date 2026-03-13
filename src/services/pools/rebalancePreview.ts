import { type Address, getAddress, type PublicClient } from 'viem'
import { LIQUIDITY_STRATEGY_ABI } from '../../core/abis'
import type {
  FPMMPoolDetails,
  LiquidityStrategyAction,
  LiquidityStrategyContext,
  LiquidityStrategyDirection,
  LiquidityStrategyPoolConfig,
  PoolDetails,
  PoolRebalancePreview,
} from '../../core/types'
import { multicall } from '../../utils/multicall'

// Liquidity strategy incentive rates are stored as 18-decimal percentages.
const FEE_DENOMINATOR = 10n ** 18n

type Numberish = bigint | number
type RawPoolConfig = readonly [
  boolean,
  Numberish,
  Numberish,
  Address,
  Numberish,
  Numberish,
  Numberish,
  Numberish,
]
type RawContext = readonly [
  Address,
  readonly [Numberish, Numberish],
  readonly [Numberish, Numberish, boolean, Numberish],
  Address,
  Address,
  Numberish,
  Numberish,
  boolean,
  readonly [Numberish, Numberish, Numberish, Numberish],
]
type RawAction = readonly [Numberish, Numberish, Numberish, Numberish]
type RawDetermineAction = readonly [RawContext, RawAction]

function toBigIntValue(value: Numberish): bigint {
  return typeof value === 'bigint' ? value : BigInt(value)
}

function toNumberValue(value: Numberish): number {
  return typeof value === 'number' ? value : Number(value)
}

function parseDirection(value: Numberish): LiquidityStrategyDirection {
  const normalized = toNumberValue(value)

  if (normalized === 0) return 'Expand'
  if (normalized === 1) return 'Contract'

  throw new Error(`Unsupported liquidity strategy direction: ${normalized}`)
}

function parsePoolConfig(raw: RawPoolConfig): LiquidityStrategyPoolConfig {
  return {
    isToken0Debt: raw[0],
    lastRebalance: toNumberValue(raw[1]),
    rebalanceCooldown: toNumberValue(raw[2]),
    protocolFeeRecipient: raw[3],
    liquiditySourceIncentiveExpansion: toBigIntValue(raw[4]),
    protocolIncentiveExpansion: toBigIntValue(raw[5]),
    liquiditySourceIncentiveContraction: toBigIntValue(raw[6]),
    protocolIncentiveContraction: toBigIntValue(raw[7]),
  }
}

function parseContext(raw: RawContext): LiquidityStrategyContext {
  return {
    pool: raw[0],
    reserves: {
      reserveNum: toBigIntValue(raw[1][0]),
      reserveDen: toBigIntValue(raw[1][1]),
    },
    prices: {
      oracleNum: toBigIntValue(raw[2][0]),
      oracleDen: toBigIntValue(raw[2][1]),
      poolPriceAbove: raw[2][2],
      rebalanceThreshold: toNumberValue(raw[2][3]),
    },
    token0: raw[3],
    token1: raw[4],
    token0Dec: toBigIntValue(raw[5]),
    token1Dec: toBigIntValue(raw[6]),
    isToken0Debt: raw[7],
    incentives: {
      liquiditySourceIncentiveExpansion: toBigIntValue(raw[8][0]),
      protocolIncentiveExpansion: toBigIntValue(raw[8][1]),
      liquiditySourceIncentiveContraction: toBigIntValue(raw[8][2]),
      protocolIncentiveContraction: toBigIntValue(raw[8][3]),
    },
  }
}

function parseAction(raw: RawAction): LiquidityStrategyAction {
  return {
    dir: parseDirection(raw[0]),
    amount0Out: toBigIntValue(raw[1]),
    amount1Out: toBigIntValue(raw[2]),
    amountOwedToPool: toBigIntValue(raw[3]),
  }
}

function isPreviewEligible(detail: PoolDetails): detail is FPMMPoolDetails {
  return (
    detail.poolType === 'FPMM' &&
    detail.pricing !== null &&
    detail.rebalancing.inBand === false &&
    !!detail.rebalancing.liquidityStrategy
  )
}

function buildPreview(
  detail: FPMMPoolDetails,
  strategyAddress: string,
  config: LiquidityStrategyPoolConfig,
  context: LiquidityStrategyContext,
  action: LiquidityStrategyAction
): PoolRebalancePreview {
  const debtToken = context.isToken0Debt ? context.token0 : context.token1
  const collateralToken = context.isToken0Debt ? context.token1 : context.token0
  const inputToken = action.dir === 'Expand' ? debtToken : collateralToken
  const outputToken = action.dir === 'Expand' ? collateralToken : debtToken
  const amountTransferredValue = action.amount0Out > 0n ? action.amount0Out : action.amount1Out
  const protocolRate =
    action.dir === 'Expand'
      ? config.protocolIncentiveExpansion
      : config.protocolIncentiveContraction
  const liquiditySourceRate =
    action.dir === 'Expand'
      ? config.liquiditySourceIncentiveExpansion
      : config.liquiditySourceIncentiveContraction
  const protocolIncentiveAmount = (amountTransferredValue * protocolRate) / FEE_DENOMINATOR
  const liquiditySourceBase =
    amountTransferredValue > protocolIncentiveAmount
      ? amountTransferredValue - protocolIncentiveAmount
      : 0n
  const liquiditySourceIncentiveAmount =
    (liquiditySourceBase * liquiditySourceRate) / FEE_DENOMINATOR

  return {
    poolAddress: detail.poolAddr,
    strategyAddress,
    direction: action.dir,
    config,
    context,
    action,
    inputToken,
    outputToken,
    amountRequired: {
      token: inputToken,
      amount: action.amountOwedToPool,
    },
    amountTransferred: {
      token: outputToken,
      amount: amountTransferredValue,
    },
    protocolIncentive: {
      token: outputToken,
      amount: protocolIncentiveAmount,
    },
    liquiditySourceIncentive: {
      token: outputToken,
      amount: liquiditySourceIncentiveAmount,
    },
    approvalToken: inputToken,
    approvalSpender: strategyAddress,
    approvalAmount: action.amountOwedToPool,
  }
}

export async function fetchPoolRebalancePreview(
  publicClient: PublicClient,
  detail: PoolDetails
): Promise<PoolRebalancePreview | null> {
  const [preview] = await fetchPoolRebalancePreviewBatch(publicClient, [detail])
  return preview
}

export async function fetchPoolRebalancePreviewBatch(
  publicClient: PublicClient,
  details: PoolDetails[]
): Promise<Array<PoolRebalancePreview | null>> {
  const previews = details.map(() => null) as Array<PoolRebalancePreview | null>
  const eligibleTargets = details.flatMap((detail, index) => {
    if (!isPreviewEligible(detail)) return []
    const strategyAddress = detail.rebalancing.liquidityStrategy
    if (!strategyAddress) return []

    try {
      return [
        {
          index,
          detail,
          strategyAddress: getAddress(strategyAddress),
        },
      ]
    } catch {
      return []
    }
  })

  if (eligibleTargets.length === 0) {
    return previews
  }

  const contracts = eligibleTargets.flatMap(({ detail, strategyAddress }) => [
    {
      address: strategyAddress,
      abi: LIQUIDITY_STRATEGY_ABI,
      functionName: 'poolConfigs' as const,
      args: [detail.poolAddr as Address] as const,
    },
    {
      address: strategyAddress,
      abi: LIQUIDITY_STRATEGY_ABI,
      functionName: 'determineAction' as const,
      args: [detail.poolAddr as Address] as const,
    },
  ])

  const results = await multicall(publicClient, contracts)

  eligibleTargets.forEach((target, targetIndex) => {
    const configResult = results[targetIndex * 2]
    const determineActionResult = results[targetIndex * 2 + 1]

    if (!configResult || !determineActionResult) return
    if (configResult.status === 'failure' || determineActionResult.status === 'failure') return

    try {
      const config = parsePoolConfig(configResult.result as RawPoolConfig)
      const [rawContext, rawAction] = determineActionResult.result as RawDetermineAction
      const context = parseContext(rawContext)
      const action = parseAction(rawAction)

      previews[target.index] = buildPreview(
        target.detail,
        target.strategyAddress,
        config,
        context,
        action
      )
    } catch {
      previews[target.index] = null
    }
  })

  return previews
}
