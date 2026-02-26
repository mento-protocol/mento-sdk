import type { Address, PublicClient } from 'viem'
import { encodeFunctionData, zeroAddress } from 'viem'
import { BORROWER_OPERATIONS_ABI, ERC20_ABI } from '../../../../src/core/abis'
import { ChainId, borrowRegistries } from '../../../../src/core/constants'
import { BorrowService } from '../../../../src/services/borrow/BorrowService'

const OWNER = '0x00000000000000000000000000000000000000AA' as Address
const REGISTRY_ADDRESS = borrowRegistries[ChainId.CELO]?.GBPm as Address

function setupMockClient() {
  const addresses = {
    borrowerOperations: '0x0000000000000000000000000000000000000011' as Address,
    troveManager: '0x0000000000000000000000000000000000000012' as Address,
    sortedTroves: '0x0000000000000000000000000000000000000013' as Address,
    activePool: '0x0000000000000000000000000000000000000014' as Address,
    defaultPool: '0x0000000000000000000000000000000000000015' as Address,
    hintHelpers: '0x0000000000000000000000000000000000000016' as Address,
    multiTroveGetter: '0x0000000000000000000000000000000000000017' as Address,
    collToken: '0x0000000000000000000000000000000000000018' as Address,
    boldToken: '0x0000000000000000000000000000000000000019' as Address,
    troveNFT: '0x000000000000000000000000000000000000001A' as Address,
    metadataNFT: '0x000000000000000000000000000000000000001B' as Address,
    stabilityPool: '0x000000000000000000000000000000000000001C' as Address,
    priceFeed: '0x000000000000000000000000000000000000001D' as Address,
    collSurplusPool: '0x000000000000000000000000000000000000001E' as Address,
    interestRouter: '0x000000000000000000000000000000000000001F' as Address,
    collateralRegistry: '0x0000000000000000000000000000000000000020' as Address,
    gasToken: '0x0000000000000000000000000000000000000021' as Address,
    gasPoolAddress: '0x0000000000000000000000000000000000000022' as Address,
    liquidityStrategy: '0x0000000000000000000000000000000000000023' as Address,
  }

  const registryReads: Record<string, Address> = {
    borrowerOperations: addresses.borrowerOperations,
    troveManager: addresses.troveManager,
    sortedTroves: addresses.sortedTroves,
    activePool: addresses.activePool,
    defaultPool: addresses.defaultPool,
    hintHelpers: addresses.hintHelpers,
    multiTroveGetter: addresses.multiTroveGetter,
    collToken: addresses.collToken,
    boldToken: addresses.boldToken,
    troveNFT: addresses.troveNFT,
    metadataNFT: addresses.metadataNFT,
    stabilityPool: addresses.stabilityPool,
    priceFeed: addresses.priceFeed,
    collSurplusPool: addresses.collSurplusPool,
    interestRouter: addresses.interestRouter,
    collateralRegistry: addresses.collateralRegistry,
    gasToken: addresses.gasToken,
    gasPoolAddress: addresses.gasPoolAddress,
    liquidityStrategy: addresses.liquidityStrategy,
  }

  const systemParamsAddress = '0x00000000000000000000000000000000000000C0' as Address
  let gasTokenAllowance = 5_000_000_000_000_000_000n

  const mockPublicClient = {
    readContract: jest.fn(),
  } as unknown as jest.Mocked<PublicClient>

  mockPublicClient.readContract.mockImplementation(async ({ address, functionName, args }: any) => {
    if (address === REGISTRY_ADDRESS) {
      const value = registryReads[functionName]
      if (!value) throw new Error(`Unexpected registry read: ${functionName}`)
      return value
    }

    if (address === addresses.borrowerOperations) {
      if (functionName === 'systemParams') return systemParamsAddress
      if (functionName === 'hasBeenShutDown') return false
      if (functionName === 'getEntireBranchColl') return 123n
      if (functionName === 'getEntireBranchDebt') return 456n
      if (functionName === 'checkBatchManagerExists') return false
      throw new Error(`Unexpected borrowerOperations read: ${functionName}`)
    }

    if (address === systemParamsAddress) {
      switch (functionName) {
        case 'CCR':
          return 1_500_000_000_000_000_000n
        case 'MCR':
          return 1_100_000_000_000_000_000n
        case 'SCR':
          return 1_250_000_000_000_000_000n
        case 'BCR':
          return 200_000_000_000_000_000n
        case 'MIN_DEBT':
          return 1_800_000_000_000_000_000_000n
        case 'ETH_GAS_COMPENSATION':
          return 37_500_000_000_000_000n
        case 'MIN_ANNUAL_INTEREST_RATE':
          return 10_000_000_000_000_000n
        default:
          throw new Error(`Unexpected system params read: ${functionName}`)
      }
    }

    if (address === addresses.sortedTroves) {
      if (functionName === 'getSize') return 16n
      if (functionName === 'findInsertPosition') return [777n, 888n]
      throw new Error(`Unexpected sortedTroves read: ${functionName}`)
    }

    if (address === addresses.hintHelpers) {
      if (functionName === 'getApproxHint') return [555n, 0n, 0n]
      if (functionName === 'predictOpenTroveUpfrontFee') return 1n
      if (functionName === 'predictAdjustTroveUpfrontFee') return 1n
      if (functionName === 'predictAdjustInterestRateUpfrontFee') return 1n
      if (functionName === 'predictJoinBatchInterestRateUpfrontFee') return 1n
      throw new Error(`Unexpected hintHelpers read: ${functionName}`)
    }

    if (address === addresses.troveManager) {
      if (functionName === 'getTroveAnnualInterestRate') return 100_000_000_000_000_000n
      if (functionName === 'getTroveIdsCount') return 0n
      if (functionName === 'getTroveFromTroveIdsArray') return 0n
      if (functionName === 'getLatestTroveData') {
        return {
          entireDebt: 1n,
          entireColl: 2n,
          redistBoldDebtGain: 0n,
          redistCollGain: 0n,
          accruedInterest: 0n,
          recordedDebt: 1n,
          annualInterestRate: 100_000_000_000_000_000n,
          weightedRecordedDebt: 0n,
          accruedBatchManagementFee: 0n,
          lastInterestRateAdjTime: 1n,
        }
      }
      if (functionName === 'Troves') {
        return {
          debt: 1n,
          coll: 2n,
          stake: 0n,
          status: 1,
          arrayIndex: 0,
          lastDebtUpdateTime: 1n,
          lastInterestRateAdjTime: 1n,
          annualInterestRate: 100_000_000_000_000_000n,
          interestBatchManager: zeroAddress,
          batchDebtShares: 0n,
        }
      }
      throw new Error(`Unexpected troveManager read: ${functionName}`)
    }

    if (address === addresses.troveNFT) {
      if (functionName === 'ownerOf') return OWNER
      if (functionName === 'balanceOf') return 2n
      throw new Error(`Unexpected troveNFT read: ${functionName}`)
    }

    if (address === addresses.gasToken) {
      if (functionName === 'allowance') {
        const [ownerArg, spenderArg] = args as [Address, Address]
        if (ownerArg !== OWNER || spenderArg !== addresses.borrowerOperations) {
          throw new Error('Unexpected gas token allowance args')
        }
        return gasTokenAllowance
      }
      throw new Error(`Unexpected gasToken read: ${functionName}`)
    }

    if (address === addresses.priceFeed) {
      if (functionName === 'fetchPrice') return 1_000_000_000_000_000_000n
      throw new Error(`Unexpected priceFeed read: ${functionName}`)
    }

    if (address === addresses.multiTroveGetter) {
      if (functionName === 'getDebtPerInterestRateAscending') return [[], 0n]
      throw new Error(`Unexpected multiTroveGetter read: ${functionName}`)
    }

    if (address === addresses.boldToken) {
      if (functionName === 'allowance') return 0n
      throw new Error(`Unexpected boldToken read: ${functionName}`)
    }

    throw new Error(`Unhandled readContract call: ${address}.${functionName}`)
  })

  return {
    mockPublicClient,
    addresses,
    setGasTokenAllowance: (allowance: bigint) => {
      gasTokenAllowance = allowance
    },
  }
}

describe('BorrowService', () => {
  it('ensureInitialized caches deployment context by debt token symbol', async () => {
    const { mockPublicClient } = setupMockClient()
    const service = new BorrowService(mockPublicClient, ChainId.CELO)

    const first = await service.getSystemParams('GBPm')
    const callsAfterFirst = mockPublicClient.readContract.mock.calls.length

    const second = await service.getSystemParams('GBPm')
    const callsAfterSecond = mockPublicClient.readContract.mock.calls.length

    expect(first).toEqual(second)
    expect(callsAfterSecond).toBe(callsAfterFirst)
    expect(
      mockPublicClient.readContract.mock.calls.filter(
        ([call]) => call.address === REGISTRY_ADDRESS && call.functionName === 'borrowerOperations'
      )
    ).toHaveLength(1)
  })

  it('buildOpenTroveTransaction encodes with computed hints and zero native value', async () => {
    const { mockPublicClient, addresses } = setupMockClient()
    const service = new BorrowService(mockPublicClient, ChainId.CELO)

    const annualInterestRate = 100_000_000_000_000_000n
    const tx = await service.buildOpenTroveTransaction('GBPm', {
      owner: OWNER,
      ownerIndex: 0,
      collAmount: 10n,
      boldAmount: 5n,
      annualInterestRate,
      maxUpfrontFee: 2n,
    })

    expect(tx.to).toBe(addresses.borrowerOperations)
    expect(tx.value).toBe('0x0')

    const expectedData = encodeFunctionData({
      abi: BORROWER_OPERATIONS_ABI,
      functionName: 'openTrove',
      args: [OWNER, 0n, 10n, 5n, 777n, 888n, annualInterestRate, 2n, zeroAddress, zeroAddress, zeroAddress],
    })
    expect(tx.data).toBe(expectedData)

    expect(mockPublicClient.readContract).toHaveBeenCalledWith(
      expect.objectContaining({
        address: addresses.hintHelpers,
        functionName: 'getApproxHint',
        args: [0n, annualInterestRate, 40n, 42n],
      })
    )
  })

  it('buildGasCompensationApprovalParams defaults to ETH_GAS_COMPENSATION and approves BorrowerOperations spender', async () => {
    const { mockPublicClient, addresses } = setupMockClient()
    const service = new BorrowService(mockPublicClient, ChainId.CELO)

    const tx = await service.buildGasCompensationApprovalParams('GBPm')
    const expectedData = encodeFunctionData({
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [addresses.borrowerOperations, 37_500_000_000_000_000n],
    })

    expect(tx).toEqual({
      to: addresses.gasToken,
      data: expectedData,
      value: '0',
    })
  })

  it('getGasTokenAllowance reads gas token allowance for BorrowerOperations spender', async () => {
    const { mockPublicClient, setGasTokenAllowance } = setupMockClient()
    setGasTokenAllowance(123n)

    const service = new BorrowService(mockPublicClient, ChainId.CELO)
    const allowance = await service.getGasTokenAllowance('GBPm', OWNER)

    expect(allowance).toBe(123n)
    expect(mockPublicClient.readContract).toHaveBeenCalledWith(
      expect.objectContaining({
        functionName: 'allowance',
        args: [OWNER, expect.any(String)],
      })
    )
  })
})
