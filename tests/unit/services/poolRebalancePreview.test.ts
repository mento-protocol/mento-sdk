import type { Address, PublicClient } from 'viem'
import type {
  FPMMPoolDetails,
  PoolDetails,
  VirtualPoolDetails,
} from '../../../src/core/types'
import { PoolType } from '../../../src/core/types'
import {
  fetchPoolRebalancePreview,
  fetchPoolRebalancePreviewBatch,
} from '../../../src/services/pools/rebalancePreview'

describe('pool rebalance preview', () => {
  let mockPublicClient: jest.Mocked<PublicClient>

  const POOL_ADDRESS = '0x1000000000000000000000000000000000000001' as Address
  const FACTORY_ADDRESS = '0xfacf000000000000000000000000000000000000' as Address
  const TOKEN_0 = '0xaaaa000000000000000000000000000000000000' as Address
  const TOKEN_1 = '0xbbbb000000000000000000000000000000000000' as Address
  const STRATEGY = '0x3333333333333333333333333333333333333333' as Address
  const PROTOCOL_FEE_RECIPIENT = '0x4444444444444444444444444444444444444444' as Address
  const FEE_DENOMINATOR = 10n ** 18n

  beforeEach(() => {
    mockPublicClient = {
      multicall: jest.fn(),
    } as unknown as jest.Mocked<PublicClient>
  })

  function createFPMMDetail(
    overrides: Partial<FPMMPoolDetails> = {}
  ): FPMMPoolDetails {
    return {
      poolAddr: POOL_ADDRESS,
      token0: TOKEN_0,
      token1: TOKEN_1,
      factoryAddr: FACTORY_ADDRESS,
      poolType: PoolType.FPMM,
      scalingFactor0: 10n ** 18n,
      scalingFactor1: 10n ** 18n,
      reserve0: 1_000n,
      reserve1: 2_000n,
      blockTimestampLast: 1n,
      pricing: {
        oraclePriceNum: 1n,
        oraclePriceDen: 1n,
        oraclePrice: 1,
        reservePriceNum: 2n,
        reservePriceDen: 1n,
        reservePrice: 2,
        priceDifferenceBps: 100n,
        priceDifferencePercent: 1,
        reservePriceAboveOraclePrice: true,
      },
      fees: {
        lpFeeBps: 25n,
        lpFeePercent: 0.25,
        protocolFeeBps: 5n,
        protocolFeePercent: 0.05,
        totalFeePercent: 0.3,
      },
      rebalancing: {
        rebalanceIncentiveBps: 10n,
        rebalanceIncentivePercent: 0.1,
        rebalanceThresholdAboveBps: 60n,
        rebalanceThresholdAbovePercent: 0.6,
        rebalanceThresholdBelowBps: 60n,
        rebalanceThresholdBelowPercent: 0.6,
        inBand: false,
        liquidityStrategy: STRATEGY,
      },
      ...overrides,
    }
  }

  function createVirtualDetail(): VirtualPoolDetails {
    return {
      poolAddr: POOL_ADDRESS,
      token0: TOKEN_0,
      token1: TOKEN_1,
      factoryAddr: FACTORY_ADDRESS,
      poolType: PoolType.Virtual,
      scalingFactor0: 10n ** 18n,
      scalingFactor1: 10n ** 18n,
      reserve0: 1_000n,
      reserve1: 2_000n,
      blockTimestampLast: 1n,
      spreadBps: 10n,
      spreadPercent: 0.1,
    }
  }

  it('derives expand previews with token0 debt correctly', async () => {
    const detail = createFPMMDetail()
    mockPublicClient.multicall.mockResolvedValue([
      {
        status: 'success',
        result: [
          true,
          100n,
          600n,
          PROTOCOL_FEE_RECIPIENT,
          FEE_DENOMINATOR / 10n,
          FEE_DENOMINATOR / 50n,
          FEE_DENOMINATOR / 5n,
          FEE_DENOMINATOR / 25n,
        ],
      },
      {
        status: 'success',
        result: [
          [
            POOL_ADDRESS,
            [1_000n, 2_000n],
            [1n, 1n, true, 60],
            TOKEN_0,
            TOKEN_1,
            18n,
            18n,
            true,
            [
              FEE_DENOMINATOR / 10n,
              FEE_DENOMINATOR / 50n,
              FEE_DENOMINATOR / 5n,
              FEE_DENOMINATOR / 25n,
            ],
          ],
          [0, 0n, 500n, 200n],
        ],
      },
    ] as any)

    const preview = await fetchPoolRebalancePreview(mockPublicClient, detail)

    expect(preview).not.toBeNull()
    expect(preview?.direction).toBe('Expand')
    expect(preview?.inputToken).toBe(TOKEN_0)
    expect(preview?.outputToken).toBe(TOKEN_1)
    expect(preview?.amountRequired).toEqual({ token: TOKEN_0, amount: 200n })
    expect(preview?.amountTransferred).toEqual({ token: TOKEN_1, amount: 500n })
    expect(preview?.protocolIncentive).toEqual({ token: TOKEN_1, amount: 10n })
    expect(preview?.liquiditySourceIncentive).toEqual({ token: TOKEN_1, amount: 49n })
    expect(preview?.approvalToken).toBe(TOKEN_0)
    expect(preview?.approvalSpender).toBe(STRATEGY)
    expect(preview?.approvalAmount).toBe(200n)
  })

  it('derives contract previews with collateral input correctly', async () => {
    const detail = createFPMMDetail()
    mockPublicClient.multicall.mockResolvedValue([
      {
        status: 'success',
        result: [
          true,
          100n,
          600n,
          PROTOCOL_FEE_RECIPIENT,
          FEE_DENOMINATOR / 10n,
          FEE_DENOMINATOR / 50n,
          FEE_DENOMINATOR / 5n,
          FEE_DENOMINATOR / 30n,
        ],
      },
      {
        status: 'success',
        result: [
          [
            POOL_ADDRESS,
            [1_000n, 2_000n],
            [1n, 1n, false, 60],
            TOKEN_0,
            TOKEN_1,
            18n,
            18n,
            true,
            [
              FEE_DENOMINATOR / 10n,
              FEE_DENOMINATOR / 50n,
              FEE_DENOMINATOR / 5n,
              FEE_DENOMINATOR / 30n,
            ],
          ],
          [1, 700n, 0n, 300n],
        ],
      },
    ] as any)

    const preview = await fetchPoolRebalancePreview(mockPublicClient, detail)

    expect(preview).not.toBeNull()
    expect(preview?.direction).toBe('Contract')
    expect(preview?.inputToken).toBe(TOKEN_1)
    expect(preview?.outputToken).toBe(TOKEN_0)
    expect(preview?.amountRequired).toEqual({ token: TOKEN_1, amount: 300n })
    expect(preview?.amountTransferred).toEqual({ token: TOKEN_0, amount: 700n })
    expect(preview?.protocolIncentive).toEqual({ token: TOKEN_0, amount: 23n })
    expect(preview?.liquiditySourceIncentive).toEqual({ token: TOKEN_0, amount: 135n })
  })

  it('returns null for unsupported or ineligible pools', async () => {
    const inBand = createFPMMDetail({
      rebalancing: {
        ...createFPMMDetail().rebalancing,
        inBand: true,
      },
    })
    const marketClosed = createFPMMDetail({ pricing: null })
    const noStrategy = createFPMMDetail({
      rebalancing: {
        ...createFPMMDetail().rebalancing,
        liquidityStrategy: null,
      },
    })
    const virtual = createVirtualDetail()

    const previews = await Promise.all([
      fetchPoolRebalancePreview(mockPublicClient, inBand),
      fetchPoolRebalancePreview(mockPublicClient, marketClosed),
      fetchPoolRebalancePreview(mockPublicClient, noStrategy),
      fetchPoolRebalancePreview(mockPublicClient, virtual as PoolDetails),
    ])

    expect(previews).toEqual([null, null, null, null])
    expect(mockPublicClient.multicall).not.toHaveBeenCalled()
  })

  it('preserves batch ordering and null placeholders', async () => {
    const eligible = createFPMMDetail()
    const inBand = createFPMMDetail({
      poolAddr: '0x1000000000000000000000000000000000000002',
      rebalancing: {
        ...createFPMMDetail().rebalancing,
        inBand: true,
      },
    })

    mockPublicClient.multicall.mockResolvedValue([
      {
        status: 'success',
        result: [
          false,
          100n,
          600n,
          PROTOCOL_FEE_RECIPIENT,
          FEE_DENOMINATOR / 10n,
          FEE_DENOMINATOR / 50n,
          FEE_DENOMINATOR / 5n,
          FEE_DENOMINATOR / 30n,
        ],
      },
      {
        status: 'success',
        result: [
          [
            POOL_ADDRESS,
            [1_000n, 2_000n],
            [1n, 1n, true, 60],
            TOKEN_0,
            TOKEN_1,
            18n,
            18n,
            false,
            [
              FEE_DENOMINATOR / 10n,
              FEE_DENOMINATOR / 50n,
              FEE_DENOMINATOR / 5n,
              FEE_DENOMINATOR / 30n,
            ],
          ],
          [0, 400n, 0n, 250n],
        ],
      },
    ] as any)

    const previews = await fetchPoolRebalancePreviewBatch(mockPublicClient, [
      eligible,
      inBand,
    ])

    expect(previews).toHaveLength(2)
    expect(previews[0]?.poolAddress).toBe(POOL_ADDRESS)
    expect(previews[1]).toBeNull()
  })
})
