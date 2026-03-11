import type { Address, PublicClient } from 'viem'
import { zeroAddress } from 'viem'
import { BorrowReadService } from '../../../../src/services/borrow/internal/borrowReadService'
import type { DeploymentContext } from '../../../../src/services/borrow/internal/borrowTypes'

describe('BorrowReadService', () => {
  let service: BorrowReadService
  let mockPublicClient: jest.Mocked<PublicClient>

  const owner = '0x00000000000000000000000000000000000000AA' as Address
  const otherOwner = '0x00000000000000000000000000000000000000BB' as Address
  const ctx: DeploymentContext = {
    addresses: {
      borrowerOperations: '0x0000000000000000000000000000000000000011',
      troveManager: '0x0000000000000000000000000000000000000012',
      sortedTroves: '0x0000000000000000000000000000000000000013',
      activePool: '0x0000000000000000000000000000000000000014',
      defaultPool: '0x0000000000000000000000000000000000000015',
      hintHelpers: '0x0000000000000000000000000000000000000016',
      multiTroveGetter: '0x0000000000000000000000000000000000000017',
      collToken: '0x0000000000000000000000000000000000000018',
      debtToken: '0x0000000000000000000000000000000000000019',
      troveNFT: '0x000000000000000000000000000000000000001A',
      metadataNFT: '0x000000000000000000000000000000000000001B',
      stabilityPool: '0x000000000000000000000000000000000000001C',
      priceFeed: '0x000000000000000000000000000000000000001D',
      collSurplusPool: '0x000000000000000000000000000000000000001E',
      interestRouter: '0x000000000000000000000000000000000000001F',
      collateralRegistry: '0x0000000000000000000000000000000000000020',
      gasToken: '0x0000000000000000000000000000000000000021',
      gasPoolAddress: '0x0000000000000000000000000000000000000022',
      liquidityStrategy: '0x0000000000000000000000000000000000000023',
    },
    systemParams: {
      ccr: 1n,
      mcr: 1n,
      scr: 1n,
      bcr: 1n,
      minDebt: 1n,
      ethGasCompensation: 1n,
      minAnnualInterestRate: 1n,
    },
  }

  beforeEach(() => {
    mockPublicClient = {
      readContract: jest.fn().mockImplementation(async ({ functionName }: any) => {
        if (functionName === 'getTroveIdsCount') {
          return 2n
        }

        throw new Error(`Unexpected readContract call: ${functionName}`)
      }),
      multicall: jest.fn().mockImplementation(async ({ contracts }: any) => {
        if (contracts[0]?.functionName === 'getTroveFromTroveIdsArray') {
          return [
            { status: 'success', result: 11n },
            { status: 'success', result: 12n },
          ]
        }

        if (contracts[0]?.functionName === 'ownerOf') {
          return [
            { status: 'success', result: owner },
            { status: 'success', result: otherOwner },
          ]
        }

        if (contracts[0]?.functionName === 'getLatestTroveData') {
          return [
            {
              status: 'success',
              result: {
                entireDebt: 100n,
                entireColl: 200n,
                redistBoldDebtGain: 0n,
                redistCollGain: 0n,
                accruedInterest: 0n,
                recordedDebt: 100n,
                annualInterestRate: 5n,
                weightedRecordedDebt: 0n,
                accruedBatchManagementFee: 0n,
                lastInterestRateAdjTime: 456n,
              },
            },
            {
              status: 'success',
              result: {
                debt: 100n,
                coll: 200n,
                stake: 0n,
                status: 1,
                arrayIndex: 0,
                lastDebtUpdateTime: 123n,
                lastInterestRateAdjTime: 456n,
                annualInterestRate: 5n,
                interestBatchManager: zeroAddress,
                batchDebtShares: 0n,
              },
            },
          ]
        }

        throw new Error(`Unexpected multicall batch: ${contracts[0]?.functionName}`)
      }),
    } as unknown as jest.Mocked<PublicClient>

    service = new BorrowReadService(mockPublicClient)
  })

  it('hydrates user troves with chunked multicalls instead of a serial per-trove loop', async () => {
    const positions = await service.getUserTroves(ctx, owner)

    expect(positions).toHaveLength(1)
    expect(positions[0]).toEqual(
      expect.objectContaining({
        troveId: '0xb',
        collateral: 200n,
        debt: 100n,
        status: 'active',
      })
    )
    expect(mockPublicClient.readContract).toHaveBeenCalledTimes(1)
    expect(mockPublicClient.multicall).toHaveBeenCalledTimes(3)
  })
})
