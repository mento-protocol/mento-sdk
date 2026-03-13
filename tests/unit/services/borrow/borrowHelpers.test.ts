import type { Address, PublicClient } from 'viem'
import { zeroAddress } from 'viem'
import {
  buildCollateralApprovalParams,
  getCollateralAllowance,
  mapTroveStatus,
  parseBorrowPosition,
  readSystemParams,
  resolveAddressesFromRegistry,
} from '../../../../src/services/borrow/borrowHelpers'

describe('borrowHelpers', () => {
  describe('resolveAddressesFromRegistry', () => {
    it('resolves and maps all required addresses from registry', async () => {
      const registryAddress = '0x1111111111111111111111111111111111111111'
      const mockPublicClient = {
        readContract: jest.fn(),
        multicall: jest.fn(),
      } as unknown as jest.Mocked<PublicClient>

      const registryReads: Record<string, Address> = {
        borrowerOperations: '0x0000000000000000000000000000000000000011',
        troveManager: '0x0000000000000000000000000000000000000012',
        sortedTroves: '0x0000000000000000000000000000000000000013',
        activePool: '0x0000000000000000000000000000000000000014',
        defaultPool: '0x0000000000000000000000000000000000000015',
        hintHelpers: '0x0000000000000000000000000000000000000016',
        multiTroveGetter: '0x0000000000000000000000000000000000000017',
        collToken: '0x0000000000000000000000000000000000000018',
        boldToken: '0x0000000000000000000000000000000000000019',
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
      }

      mockPublicClient.multicall.mockResolvedValue(
        Object.values(registryReads)
      )

      const result = await resolveAddressesFromRegistry(mockPublicClient, registryAddress)

      expect(result).toEqual({
        borrowerOperations: registryReads.borrowerOperations,
        troveManager: registryReads.troveManager,
        sortedTroves: registryReads.sortedTroves,
        activePool: registryReads.activePool,
        defaultPool: registryReads.defaultPool,
        hintHelpers: registryReads.hintHelpers,
        multiTroveGetter: registryReads.multiTroveGetter,
        collToken: registryReads.collToken,
        debtToken: registryReads.boldToken,
        troveNFT: registryReads.troveNFT,
        metadataNFT: registryReads.metadataNFT,
        stabilityPool: registryReads.stabilityPool,
        priceFeed: registryReads.priceFeed,
        collSurplusPool: registryReads.collSurplusPool,
        interestRouter: registryReads.interestRouter,
        collateralRegistry: registryReads.collateralRegistry,
        gasToken: registryReads.gasToken,
        gasPoolAddress: registryReads.gasPoolAddress,
        liquidityStrategy: registryReads.liquidityStrategy,
      })

      expect(mockPublicClient.multicall).toHaveBeenCalledTimes(1)
      expect(mockPublicClient.readContract).not.toHaveBeenCalled()
    })
  })

  describe('readSystemParams', () => {
    it('reads borrowerOperations.systemParams then loads all params from SystemParams', async () => {
      const mockPublicClient = {
        readContract: jest.fn(),
        multicall: jest.fn(),
      } as unknown as jest.Mocked<PublicClient>

      const borrowerOperations = '0x00000000000000000000000000000000000000B0' as Address
      const systemParamsAddress = '0x00000000000000000000000000000000000000C0' as Address

      mockPublicClient.readContract.mockImplementation(async ({ address, functionName }: any) => {
        if (address === borrowerOperations && functionName === 'systemParams') {
          return systemParamsAddress
        }

        throw new Error(`Unexpected address: ${address}`)
      })
      mockPublicClient.multicall.mockResolvedValue([
        1_500_000_000_000_000_000n,
        1_100_000_000_000_000_000n,
        1_250_000_000_000_000_000n,
        200_000_000_000_000_000n,
        1_800_000_000_000_000_000_000n,
        37_500_000_000_000_000n,
        10_000_000_000_000_000n,
      ])

      const result = await readSystemParams(mockPublicClient, borrowerOperations)

      expect(result).toEqual({
        mcr: 1_100_000_000_000_000_000n,
        ccr: 1_500_000_000_000_000_000n,
        scr: 1_250_000_000_000_000_000n,
        bcr: 200_000_000_000_000_000n,
        minDebt: 1_800_000_000_000_000_000_000n,
        ethGasCompensation: 37_500_000_000_000_000n,
        minAnnualInterestRate: 10_000_000_000_000_000n,
      })

      const readCalls = mockPublicClient.readContract.mock.calls.map(([args]) => args)
      expect(readCalls).toHaveLength(1)
      expect(readCalls[0]).toEqual(
        expect.objectContaining({
          address: borrowerOperations,
          functionName: 'systemParams',
        })
      )
      expect(mockPublicClient.multicall).toHaveBeenCalledTimes(1)
    })
  })

  describe('buildCollateralApprovalParams', () => {
    it('builds ERC20 approve params with zero value', () => {
      const collToken = '0x00000000000000000000000000000000000000A1' as Address
      const spender = '0x00000000000000000000000000000000000000A2' as Address
      const amount = 123n

      const params = buildCollateralApprovalParams(collToken, spender, amount)

      expect(params).toEqual(
        expect.objectContaining({
          to: collToken,
          value: '0',
        })
      )
      expect(params.data.startsWith('0x095ea7b3')).toBe(true)
    })

    it('throws for negative approval amount', () => {
      const collToken = '0x00000000000000000000000000000000000000A1' as Address
      const spender = '0x00000000000000000000000000000000000000A2' as Address
      expect(() => buildCollateralApprovalParams(collToken, spender, -1n)).toThrow(
        'Approval amount cannot be negative'
      )
    })
  })

  describe('getCollateralAllowance', () => {
    it('reads allowance from token contract', async () => {
      const mockPublicClient = {
        readContract: jest.fn(),
      } as unknown as jest.Mocked<PublicClient>

      const collToken = '0x00000000000000000000000000000000000000D1' as Address
      const owner = '0x00000000000000000000000000000000000000D2' as Address
      const spender = '0x00000000000000000000000000000000000000D3' as Address

      mockPublicClient.readContract.mockResolvedValue(999n)

      const allowance = await getCollateralAllowance(mockPublicClient, collToken, owner, spender)
      expect(allowance).toBe(999n)
      expect(mockPublicClient.readContract).toHaveBeenCalledWith(
        expect.objectContaining({
          address: collToken,
          functionName: 'allowance',
          args: [owner, spender],
        })
      )
    })
  })

  describe('mapTroveStatus', () => {
    it('maps numeric status values to TroveStatus', () => {
      expect(mapTroveStatus(0)).toBe('nonExistent')
      expect(mapTroveStatus(1)).toBe('active')
      expect(mapTroveStatus(2)).toBe('closedByOwner')
      expect(mapTroveStatus(3)).toBe('closedByLiquidation')
      expect(mapTroveStatus(4)).toBe('zombie')
    })

    it('throws on unknown status value', () => {
      expect(() => mapTroveStatus(5)).toThrow('Unknown trove status: 5')
    })
  })

  describe('parseBorrowPosition', () => {
    const latestData = {
      entireDebt: 1_000n,
      entireColl: 2_000n,
      redistBoldDebtGain: 30n,
      redistCollGain: 40n,
      accruedInterest: 50n,
      recordedDebt: 60n,
      annualInterestRate: 70n,
      accruedBatchManagementFee: 80n,
      lastInterestRateAdjTime: 1_700_000_001n,
    }

    it('parses latest + troves data into BorrowPosition and normalizes zero batch manager', () => {
      const trovesData = {
        status: 1,
        lastDebtUpdateTime: 1_700_000_000n,
        interestBatchManager: zeroAddress,
      }

      const parsed = parseBorrowPosition('0x1234', latestData, trovesData)

      expect(parsed).toEqual({
        troveId: '0x1234',
        collateral: 2_000n,
        debt: 1_000n,
        annualInterestRate: 70n,
        status: 'active',
        interestBatchManager: null,
        lastDebtUpdateTime: 1_700_000_000,
        lastInterestRateAdjTime: 1_700_000_001,
        redistBoldDebtGain: 30n,
        redistCollGain: 40n,
        accruedInterest: 50n,
        recordedDebt: 60n,
        accruedBatchManagementFee: 80n,
      })
    })

    it('keeps non-zero interestBatchManager and supports bigint status', () => {
      const trovesData = {
        status: 4n,
        lastDebtUpdateTime: 1_700_000_002n,
        interestBatchManager: '0x00000000000000000000000000000000000000E1',
      }

      const parsed = parseBorrowPosition('0x9999', latestData, trovesData)
      expect(parsed.status).toBe('zombie')
      expect(parsed.interestBatchManager).toBe('0x00000000000000000000000000000000000000E1')
    })

    it('throws on unknown trove status', () => {
      const trovesData = {
        status: 99,
        lastDebtUpdateTime: 1n,
        interestBatchManager: zeroAddress,
      }
      expect(() => parseBorrowPosition('0x1', latestData, trovesData)).toThrow(
        'Unknown trove status: 99'
      )
    })

    it('throws when a timestamp exceeds Number.MAX_SAFE_INTEGER', () => {
      const trovesData = {
        status: 1,
        lastDebtUpdateTime: BigInt(Number.MAX_SAFE_INTEGER) + 1n,
        interestBatchManager: zeroAddress,
      }
      expect(() => parseBorrowPosition('0x1', latestData, trovesData)).toThrow(
        'trovesData.lastDebtUpdateTime exceeds Number.MAX_SAFE_INTEGER'
      )
    })
  })
})
