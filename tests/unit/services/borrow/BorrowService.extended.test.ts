/**
 * Extended coverage tests for BorrowService.
 * Complements BorrowService.test.ts with tests for all previously uncovered methods.
 */
import type { Address, PublicClient } from 'viem'
import { encodeFunctionData, zeroAddress } from 'viem'
import {
  BORROWER_OPERATIONS_ABI,
  ERC20_ABI,
  HINT_HELPERS_ABI,
  MULTI_TROVE_GETTER_ABI,
  PRICE_FEED_ABI,
  TROVE_MANAGER_ABI,
  TROVE_NFT_ABI,
} from '../../../../src/core/abis'
import { ChainId, borrowRegistries } from '../../../../src/core/constants'
import { BorrowService } from '../../../../src/services/borrow/BorrowService'

// ─── Constants ────────────────────────────────────────────────────────────────

// All-numeric hex avoids EIP-55 checksum issues in viem's encodeFunctionData
const OWNER = '0x00000000000000000000000000000000000000AA' as Address
const SPENDER = '0x0000000000000000000000000000000000000077' as Address
const BATCH_MANAGER = '0x0000000000000000000000000000000000000099' as Address
const DELEGATE = '0x0000000000000000000000000000000000000088' as Address
const TROVE_ID = '12345'
const REGISTRY_ADDRESS = borrowRegistries[ChainId.CELO]?.GBPm as Address

// ─── Mock Setup ──────────────────────────────────────────────────────────────

const ADDRESSES = {
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

const SYSTEM_PARAMS_ADDRESS = '0x00000000000000000000000000000000000000C0' as Address

const REGISTRY_READS: Record<string, Address> = {
  borrowerOperations: ADDRESSES.borrowerOperations,
  troveManager: ADDRESSES.troveManager,
  sortedTroves: ADDRESSES.sortedTroves,
  activePool: ADDRESSES.activePool,
  defaultPool: ADDRESSES.defaultPool,
  hintHelpers: ADDRESSES.hintHelpers,
  multiTroveGetter: ADDRESSES.multiTroveGetter,
  collToken: ADDRESSES.collToken,
  boldToken: ADDRESSES.boldToken,
  troveNFT: ADDRESSES.troveNFT,
  metadataNFT: ADDRESSES.metadataNFT,
  stabilityPool: ADDRESSES.stabilityPool,
  priceFeed: ADDRESSES.priceFeed,
  collSurplusPool: ADDRESSES.collSurplusPool,
  interestRouter: ADDRESSES.interestRouter,
  collateralRegistry: ADDRESSES.collateralRegistry,
  gasToken: ADDRESSES.gasToken,
  gasPoolAddress: ADDRESSES.gasPoolAddress,
  liquidityStrategy: ADDRESSES.liquidityStrategy,
}

const LATEST_TROVE_DATA = {
  entireDebt: 1_000n,
  entireColl: 2_000n,
  redistBoldDebtGain: 0n,
  redistCollGain: 0n,
  accruedInterest: 10n,
  recordedDebt: 990n,
  annualInterestRate: 100_000_000_000_000_000n,
  weightedRecordedDebt: 0n,
  accruedBatchManagementFee: 0n,
  lastInterestRateAdjTime: 1_700_000_000n,
}

const TROVES_DATA = {
  debt: 1_000n,
  coll: 2_000n,
  stake: 0n,
  status: 1,
  arrayIndex: 0,
  lastDebtUpdateTime: 1_700_000_000n,
  lastInterestRateAdjTime: 1_700_000_000n,
  annualInterestRate: 100_000_000_000_000_000n,
  interestBatchManager: zeroAddress,
  batchDebtShares: 0n,
}

/**
 * Builds a full mock PublicClient with configurable overrides for specific reads.
 * @param overrides Map of "address.functionName" → return value
 */
function buildMockClient(
  overrides: Record<string, unknown> = {}
): jest.Mocked<PublicClient> {
  const mockPublicClient = {
    readContract: jest.fn(),
  } as unknown as jest.Mocked<PublicClient>

  mockPublicClient.readContract.mockImplementation(async ({ address, functionName, args }: any) => {
    const overrideKey = `${address}.${functionName}`
    if (overrideKey in overrides) {
      const val = overrides[overrideKey]
      return typeof val === 'function' ? val(args) : val
    }

    if (address === REGISTRY_ADDRESS) {
      const value = REGISTRY_READS[functionName]
      if (!value) throw new Error(`Unexpected registry read: ${functionName}`)
      return value
    }

    if (address === ADDRESSES.borrowerOperations) {
      if (functionName === 'systemParams') return SYSTEM_PARAMS_ADDRESS
      if (functionName === 'hasBeenShutDown') return false
      if (functionName === 'getEntireBranchColl') return 123n
      if (functionName === 'getEntireBranchDebt') return 456n
      if (functionName === 'checkBatchManagerExists') return false
      throw new Error(`Unexpected borrowerOperations read: ${functionName}`)
    }

    if (address === SYSTEM_PARAMS_ADDRESS) {
      switch (functionName) {
        case 'CCR': return 1_500_000_000_000_000_000n
        case 'MCR': return 1_100_000_000_000_000_000n
        case 'SCR': return 1_250_000_000_000_000_000n
        case 'BCR': return 200_000_000_000_000_000n
        case 'MIN_DEBT': return 1_800_000_000_000_000_000_000n
        case 'ETH_GAS_COMPENSATION': return 37_500_000_000_000_000n
        case 'MIN_ANNUAL_INTEREST_RATE': return 10_000_000_000_000_000n
        default: throw new Error(`Unexpected system params read: ${functionName}`)
      }
    }

    if (address === ADDRESSES.sortedTroves) {
      if (functionName === 'getSize') return 16n
      if (functionName === 'findInsertPosition') return [777n, 888n]
      throw new Error(`Unexpected sortedTroves read: ${functionName}`)
    }

    if (address === ADDRESSES.hintHelpers) {
      if (functionName === 'getApproxHint') return [555n, 0n, 0n]
      if (functionName === 'predictOpenTroveUpfrontFee') return 500n
      if (functionName === 'predictAdjustTroveUpfrontFee') return 200n
      if (functionName === 'predictAdjustInterestRateUpfrontFee') return 100n
      if (functionName === 'predictJoinBatchInterestRateUpfrontFee') return 300n
      throw new Error(`Unexpected hintHelpers read: ${functionName}`)
    }

    if (address === ADDRESSES.troveManager) {
      if (functionName === 'getTroveAnnualInterestRate') return 100_000_000_000_000_000n
      if (functionName === 'getTroveIdsCount') return 0n
      if (functionName === 'getTroveFromTroveIdsArray') return BigInt(TROVE_ID)
      if (functionName === 'getLatestTroveData') return LATEST_TROVE_DATA
      if (functionName === 'Troves') return TROVES_DATA
      throw new Error(`Unexpected troveManager read: ${functionName}`)
    }

    if (address === ADDRESSES.troveNFT) {
      if (functionName === 'ownerOf') return OWNER
      if (functionName === 'balanceOf') return 3n
      throw new Error(`Unexpected troveNFT read: ${functionName}`)
    }

    if (address === ADDRESSES.collToken) {
      if (functionName === 'allowance') return 500n
      throw new Error(`Unexpected collToken read: ${functionName}`)
    }

    if (address === ADDRESSES.gasToken) {
      if (functionName === 'allowance') return 5_000_000_000_000_000_000n
      throw new Error(`Unexpected gasToken read: ${functionName}`)
    }

    if (address === ADDRESSES.priceFeed) {
      if (functionName === 'fetchPrice') return 1_000_000_000_000_000_000n
      throw new Error(`Unexpected priceFeed read: ${functionName}`)
    }

    if (address === ADDRESSES.multiTroveGetter) {
      if (functionName === 'getDebtPerInterestRateAscending') return [[], 0n]
      throw new Error(`Unexpected multiTroveGetter read: ${functionName}`)
    }

    if (address === ADDRESSES.boldToken) {
      if (functionName === 'allowance') return 250n
      throw new Error(`Unexpected boldToken read: ${functionName}`)
    }

    throw new Error(`Unhandled readContract call: ${address}.${functionName}`)
  })

  return mockPublicClient
}

function makeService(overrides: Record<string, unknown> = {}): BorrowService {
  return new BorrowService(buildMockClient(overrides), ChainId.CELO)
}

// ─── Transaction Building Tests ───────────────────────────────────────────────

describe('BorrowService – transaction building', () => {
  describe('buildOpenTroveTransaction with interestBatchManager', () => {
    it('encodes openTroveAndJoinInterestBatchManager when interestBatchManager is provided', async () => {
      const service = makeService()

      const tx = await service.buildOpenTroveTransaction('GBPm', {
        owner: OWNER,
        ownerIndex: 0,
        collAmount: 10n,
        boldAmount: 5n,
        annualInterestRate: 100_000_000_000_000_000n,
        maxUpfrontFee: 2n,
        interestBatchManager: BATCH_MANAGER,
      })

      expect(tx.to).toBe(ADDRESSES.borrowerOperations)
      expect(tx.value).toBe('0x0')

      const expectedData = encodeFunctionData({
        abi: BORROWER_OPERATIONS_ABI,
        functionName: 'openTroveAndJoinInterestBatchManager',
        args: [
          {
            owner: OWNER,
            ownerIndex: 0n,
            collAmount: 10n,
            boldAmount: 5n,
            upperHint: 777n,
            lowerHint: 888n,
            interestBatchManager: BATCH_MANAGER,
            maxUpfrontFee: 2n,
            addManager: zeroAddress,
            removeManager: zeroAddress,
            receiver: zeroAddress,
          },
        ],
      })
      expect(tx.data).toBe(expectedData)
    })
  })

  describe('buildAdjustTroveTransaction', () => {
    it('encodes adjustTrove with correct args', async () => {
      const service = makeService()

      const tx = await service.buildAdjustTroveTransaction('GBPm', {
        troveId: TROVE_ID,
        collChange: 5n,
        isCollIncrease: true,
        debtChange: 3n,
        isDebtIncrease: false,
        maxUpfrontFee: 1n,
      })

      expect(tx.to).toBe(ADDRESSES.borrowerOperations)
      expect(tx.value).toBe('0x0')

      const expectedData = encodeFunctionData({
        abi: BORROWER_OPERATIONS_ABI,
        functionName: 'adjustTrove',
        args: [BigInt(TROVE_ID), 5n, true, 3n, false, 1n],
      })
      expect(tx.data).toBe(expectedData)
    })
  })

  describe('buildAdjustZombieTroveTransaction', () => {
    it('reads current rate and encodes adjustZombieTrove with hints', async () => {
      const service = makeService()

      const tx = await service.buildAdjustZombieTroveTransaction('GBPm', {
        troveId: TROVE_ID,
        collChange: 2n,
        isCollIncrease: false,
        debtChange: 1n,
        isDebtIncrease: true,
        maxUpfrontFee: 0n,
      })

      expect(tx.to).toBe(ADDRESSES.borrowerOperations)
      expect(tx.value).toBe('0x0')

      const expectedData = encodeFunctionData({
        abi: BORROWER_OPERATIONS_ABI,
        functionName: 'adjustZombieTrove',
        args: [BigInt(TROVE_ID), 2n, false, 1n, true, 777n, 888n, 0n],
      })
      expect(tx.data).toBe(expectedData)
    })
  })

  describe('buildCloseTroveTransaction', () => {
    it('encodes closeTrove with the parsed trove ID', async () => {
      const service = makeService()
      const tx = await service.buildCloseTroveTransaction('GBPm', TROVE_ID)

      expect(tx.to).toBe(ADDRESSES.borrowerOperations)
      expect(tx.value).toBe('0x0')

      const expectedData = encodeFunctionData({
        abi: BORROWER_OPERATIONS_ABI,
        functionName: 'closeTrove',
        args: [BigInt(TROVE_ID)],
      })
      expect(tx.data).toBe(expectedData)
    })
  })

  describe('buildAddCollTransaction', () => {
    it('encodes addColl with the correct amount', async () => {
      const service = makeService()
      const tx = await service.buildAddCollTransaction('GBPm', TROVE_ID, 100n)

      expect(tx.to).toBe(ADDRESSES.borrowerOperations)
      expect(tx.value).toBe('0x0')

      const expectedData = encodeFunctionData({
        abi: BORROWER_OPERATIONS_ABI,
        functionName: 'addColl',
        args: [BigInt(TROVE_ID), 100n],
      })
      expect(tx.data).toBe(expectedData)
    })

    it('throws for zero collateral amount', async () => {
      const service = makeService()
      await expect(service.buildAddCollTransaction('GBPm', TROVE_ID, 0n)).rejects.toThrow(
        'amount must be a positive bigint'
      )
    })
  })

  describe('buildWithdrawCollTransaction', () => {
    it('encodes withdrawColl with the correct amount', async () => {
      const service = makeService()
      const tx = await service.buildWithdrawCollTransaction('GBPm', TROVE_ID, 50n)

      expect(tx.to).toBe(ADDRESSES.borrowerOperations)
      expect(tx.value).toBe('0x0')

      const expectedData = encodeFunctionData({
        abi: BORROWER_OPERATIONS_ABI,
        functionName: 'withdrawColl',
        args: [BigInt(TROVE_ID), 50n],
      })
      expect(tx.data).toBe(expectedData)
    })

    it('throws for zero collateral amount', async () => {
      const service = makeService()
      await expect(service.buildWithdrawCollTransaction('GBPm', TROVE_ID, 0n)).rejects.toThrow(
        'amount must be a positive bigint'
      )
    })
  })

  describe('buildBorrowMoreTransaction', () => {
    it('encodes withdrawBold with correct args', async () => {
      const service = makeService()
      const tx = await service.buildBorrowMoreTransaction('GBPm', TROVE_ID, 200n, 10n)

      expect(tx.to).toBe(ADDRESSES.borrowerOperations)
      expect(tx.value).toBe('0x0')

      const expectedData = encodeFunctionData({
        abi: BORROWER_OPERATIONS_ABI,
        functionName: 'withdrawBold',
        args: [BigInt(TROVE_ID), 200n, 10n],
      })
      expect(tx.data).toBe(expectedData)
    })

    it('throws for zero borrow amount', async () => {
      const service = makeService()
      await expect(service.buildBorrowMoreTransaction('GBPm', TROVE_ID, 0n, 0n)).rejects.toThrow(
        'amount must be a positive bigint'
      )
    })
  })

  describe('buildRepayDebtTransaction', () => {
    it('encodes repayBold with correct args', async () => {
      const service = makeService()
      const tx = await service.buildRepayDebtTransaction('GBPm', TROVE_ID, 300n)

      expect(tx.to).toBe(ADDRESSES.borrowerOperations)
      expect(tx.value).toBe('0x0')

      const expectedData = encodeFunctionData({
        abi: BORROWER_OPERATIONS_ABI,
        functionName: 'repayBold',
        args: [BigInt(TROVE_ID), 300n],
      })
      expect(tx.data).toBe(expectedData)
    })

    it('throws for zero repay amount', async () => {
      const service = makeService()
      await expect(service.buildRepayDebtTransaction('GBPm', TROVE_ID, 0n)).rejects.toThrow(
        'amount must be a positive bigint'
      )
    })
  })

  describe('buildAdjustInterestRateTransaction', () => {
    it('encodes adjustTroveInterestRate with hints', async () => {
      const service = makeService()
      const newRate = 50_000_000_000_000_000n
      const tx = await service.buildAdjustInterestRateTransaction('GBPm', TROVE_ID, newRate, 5n)

      expect(tx.to).toBe(ADDRESSES.borrowerOperations)
      expect(tx.value).toBe('0x0')

      const expectedData = encodeFunctionData({
        abi: BORROWER_OPERATIONS_ABI,
        functionName: 'adjustTroveInterestRate',
        args: [BigInt(TROVE_ID), newRate, 777n, 888n, 5n],
      })
      expect(tx.data).toBe(expectedData)
    })
  })

  describe('buildClaimCollateralTransaction', () => {
    it('encodes claimCollateral with no args', async () => {
      const service = makeService()
      const tx = await service.buildClaimCollateralTransaction('GBPm')

      expect(tx.to).toBe(ADDRESSES.borrowerOperations)
      expect(tx.value).toBe('0x0')

      const expectedData = encodeFunctionData({
        abi: BORROWER_OPERATIONS_ABI,
        functionName: 'claimCollateral',
        args: [],
      })
      expect(tx.data).toBe(expectedData)
    })
  })

  describe('buildSetBatchManagerTransaction', () => {
    it('reads trove rate and encodes setInterestBatchManager with hints', async () => {
      const service = makeService()
      const tx = await service.buildSetBatchManagerTransaction('GBPm', TROVE_ID, BATCH_MANAGER, 1n)

      expect(tx.to).toBe(ADDRESSES.borrowerOperations)
      expect(tx.value).toBe('0x0')

      const expectedData = encodeFunctionData({
        abi: BORROWER_OPERATIONS_ABI,
        functionName: 'setInterestBatchManager',
        args: [BigInt(TROVE_ID), BATCH_MANAGER, 777n, 888n, 1n],
      })
      expect(tx.data).toBe(expectedData)
    })
  })

  describe('buildRemoveFromBatchTransaction', () => {
    it('encodes removeFromBatch with new rate and hints', async () => {
      const service = makeService()
      const newRate = 80_000_000_000_000_000n
      const tx = await service.buildRemoveFromBatchTransaction('GBPm', TROVE_ID, newRate, 2n)

      expect(tx.to).toBe(ADDRESSES.borrowerOperations)
      expect(tx.value).toBe('0x0')

      const expectedData = encodeFunctionData({
        abi: BORROWER_OPERATIONS_ABI,
        functionName: 'removeFromBatch',
        args: [BigInt(TROVE_ID), newRate, 777n, 888n, 2n],
      })
      expect(tx.data).toBe(expectedData)
    })
  })

  describe('buildSwitchBatchManagerTransaction', () => {
    it('reads trove rate and encodes switchBatchManager with two hint pairs', async () => {
      const service = makeService()
      const tx = await service.buildSwitchBatchManagerTransaction(
        'GBPm',
        TROVE_ID,
        BATCH_MANAGER,
        3n
      )

      expect(tx.to).toBe(ADDRESSES.borrowerOperations)
      expect(tx.value).toBe('0x0')

      const expectedData = encodeFunctionData({
        abi: BORROWER_OPERATIONS_ABI,
        functionName: 'switchBatchManager',
        args: [BigInt(TROVE_ID), 777n, 888n, BATCH_MANAGER, 777n, 888n, 3n],
      })
      expect(tx.data).toBe(expectedData)
    })
  })

  describe('buildSetInterestDelegateTransaction', () => {
    it('encodes setInterestIndividualDelegate with correct args', async () => {
      const service = makeService()
      const minRate = 10_000_000_000_000_000n
      const maxRate = 200_000_000_000_000_000n
      const newRate = 50_000_000_000_000_000n
      const tx = await service.buildSetInterestDelegateTransaction(
        'GBPm',
        TROVE_ID,
        DELEGATE,
        minRate,
        maxRate,
        newRate,
        5n,
        3600n
      )

      expect(tx.to).toBe(ADDRESSES.borrowerOperations)
      expect(tx.value).toBe('0x0')

      const expectedData = encodeFunctionData({
        abi: BORROWER_OPERATIONS_ABI,
        functionName: 'setInterestIndividualDelegate',
        args: [BigInt(TROVE_ID), DELEGATE, minRate, maxRate, newRate, 777n, 888n, 5n, 3600n],
      })
      expect(tx.data).toBe(expectedData)
    })

    it('throws when minRate exceeds maxRate', async () => {
      const service = makeService()
      await expect(
        service.buildSetInterestDelegateTransaction(
          'GBPm',
          TROVE_ID,
          DELEGATE,
          200_000_000_000_000_000n, // minRate > maxRate
          100_000_000_000_000_000n,
          50_000_000_000_000_000n,
          0n,
          0n
        )
      ).rejects.toThrow('minRate cannot be greater than maxRate')
    })
  })

  describe('buildRemoveInterestDelegateTransaction', () => {
    it('encodes removeInterestIndividualDelegate with the trove ID', async () => {
      const service = makeService()
      const tx = await service.buildRemoveInterestDelegateTransaction('GBPm', TROVE_ID)

      expect(tx.to).toBe(ADDRESSES.borrowerOperations)
      expect(tx.value).toBe('0x0')

      const expectedData = encodeFunctionData({
        abi: BORROWER_OPERATIONS_ABI,
        functionName: 'removeInterestIndividualDelegate',
        args: [BigInt(TROVE_ID)],
      })
      expect(tx.data).toBe(expectedData)
    })
  })
})

// ─── Approval Tests ───────────────────────────────────────────────────────────

describe('BorrowService – approvals', () => {
  describe('buildCollateralApprovalParams', () => {
    it('builds ERC20 approve on the collToken for BorrowerOperations', async () => {
      const service = makeService()
      const tx = await service.buildCollateralApprovalParams('GBPm', 1000n)

      expect(tx.to).toBe(ADDRESSES.collToken)
      expect(tx.value).toBe('0')

      const expectedData = encodeFunctionData({
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [ADDRESSES.borrowerOperations, 1000n],
      })
      expect(tx.data).toBe(expectedData)
    })

    it('throws for negative collateral approval amount', async () => {
      const service = makeService()
      await expect(service.buildCollateralApprovalParams('GBPm', -1n)).rejects.toThrow()
    })
  })

  describe('buildDebtApprovalParams', () => {
    it('builds ERC20 approve on the debtToken for the given spender', async () => {
      const service = makeService()
      const tx = await service.buildDebtApprovalParams('GBPm', SPENDER, 500n)

      // debtToken = boldToken
      expect(tx.to).toBe(ADDRESSES.boldToken)
      expect(tx.value).toBe('0')

      const expectedData = encodeFunctionData({
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [SPENDER, 500n],
      })
      expect(tx.data).toBe(expectedData)
    })

    it('throws for invalid spender address', async () => {
      const service = makeService()
      await expect(service.buildDebtApprovalParams('GBPm', 'not-an-address', 100n)).rejects.toThrow()
    })
  })

  describe('buildGasCompensationApprovalParams with explicit amount', () => {
    it('uses the provided amount instead of ETH_GAS_COMPENSATION', async () => {
      const service = makeService()
      const customAmount = 999n
      const tx = await service.buildGasCompensationApprovalParams('GBPm', customAmount)

      expect(tx.to).toBe(ADDRESSES.gasToken)
      expect(tx.value).toBe('0')

      const expectedData = encodeFunctionData({
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [ADDRESSES.borrowerOperations, customAmount],
      })
      expect(tx.data).toBe(expectedData)
    })
  })

  describe('getCollateralAllowance', () => {
    it('reads allowance from collToken for BorrowerOperations', async () => {
      const service = makeService()
      const allowance = await service.getCollateralAllowance('GBPm', OWNER)

      expect(allowance).toBe(500n)
    })

    it('throws for invalid owner address', async () => {
      const service = makeService()
      await expect(service.getCollateralAllowance('GBPm', 'bad')).rejects.toThrow()
    })
  })

  describe('getDebtAllowance', () => {
    it('reads allowance from debtToken for the specified spender', async () => {
      const service = makeService()
      const allowance = await service.getDebtAllowance('GBPm', OWNER, SPENDER)

      expect(allowance).toBe(250n)
    })
  })
})

// ─── Read Service Tests ───────────────────────────────────────────────────────

describe('BorrowService – read methods', () => {
  describe('getTroveData', () => {
    it('returns a parsed BorrowPosition for the given troveId', async () => {
      const service = makeService()
      const position = await service.getTroveData('GBPm', TROVE_ID)

      expect(position.troveId).toBe(`0x${BigInt(TROVE_ID).toString(16)}`)
      expect(position.collateral).toBe(2_000n)
      expect(position.debt).toBe(1_000n)
      expect(position.status).toBe('active')
      expect(position.interestBatchManager).toBeNull()
    })
  })

  describe('getUserTroves', () => {
    it('returns empty array when there are no troves', async () => {
      const service = makeService()
      const troves = await service.getUserTroves('GBPm', OWNER)

      expect(troves).toEqual([])
    })

    it('returns matching troves when troveCount > 0 and owner matches', async () => {
      const service = makeService({
        [`${ADDRESSES.troveManager}.getTroveIdsCount`]: 1n,
        [`${ADDRESSES.troveManager}.getTroveFromTroveIdsArray`]: BigInt(TROVE_ID),
        [`${ADDRESSES.troveNFT}.ownerOf`]: OWNER,
      })
      const troves = await service.getUserTroves('GBPm', OWNER)

      expect(troves).toHaveLength(1)
      expect(troves[0].status).toBe('active')
    })

    it('skips troves owned by a different address', async () => {
      const OTHER_OWNER = '0x000000000000000000000000000000000000BEEF' as Address
      const service = makeService({
        [`${ADDRESSES.troveManager}.getTroveIdsCount`]: 1n,
        [`${ADDRESSES.troveNFT}.ownerOf`]: OTHER_OWNER,
      })
      const troves = await service.getUserTroves('GBPm', OWNER)

      expect(troves).toHaveLength(0)
    })

    it('throws for invalid owner address', async () => {
      const service = makeService()
      await expect(service.getUserTroves('GBPm', 'not-an-address')).rejects.toThrow()
    })
  })

  describe('getCollateralPrice', () => {
    it('returns the price from priceFeed.fetchPrice', async () => {
      const service = makeService()
      const price = await service.getCollateralPrice('GBPm')

      expect(price).toBe(1_000_000_000_000_000_000n)
    })
  })

  describe('isSystemShutDown', () => {
    it('returns false when the system is running', async () => {
      const service = makeService()
      expect(await service.isSystemShutDown('GBPm')).toBe(false)
    })

    it('returns true when the system has been shut down', async () => {
      const service = makeService({
        [`${ADDRESSES.borrowerOperations}.hasBeenShutDown`]: true,
      })
      expect(await service.isSystemShutDown('GBPm')).toBe(true)
    })
  })

  describe('getBranchStats', () => {
    it('returns totalColl and totalDebt from BorrowerOperations', async () => {
      const service = makeService()
      const stats = await service.getBranchStats('GBPm')

      expect(stats).toEqual({ totalColl: 123n, totalDebt: 456n })
    })
  })

  describe('getInterestRateBrackets', () => {
    it('returns empty array when multiTroveGetter returns no entries', async () => {
      const service = makeService()
      const brackets = await service.getInterestRateBrackets('GBPm')

      expect(brackets).toEqual([])
    })

    it('groups and sorts brackets by rate', async () => {
      const entries = [
        { interestRate: 50_000_000_000_000_000n, debt: 200n },
        { interestRate: 10_000_000_000_000_000n, debt: 300n },
        { interestRate: 50_000_000_000_000_000n, debt: 100n }, // duplicate rate → grouping
      ]
      const service = makeService({
        [`${ADDRESSES.multiTroveGetter}.getDebtPerInterestRateAscending`]: [entries, 0n],
      })
      const brackets = await service.getInterestRateBrackets('GBPm')

      expect(brackets).toEqual([
        { rate: 10_000_000_000_000_000n, totalDebt: 300n },
        { rate: 50_000_000_000_000_000n, totalDebt: 300n }, // 200 + 100
      ])
    })
  })

  describe('getAverageInterestRate', () => {
    it('returns 0n when there are no brackets', async () => {
      const service = makeService()
      expect(await service.getAverageInterestRate('GBPm')).toBe(0n)
    })

    it('returns the weighted average interest rate', async () => {
      const entries = [
        { interestRate: 100_000_000_000_000_000n, debt: 1000n }, // 10% × 1000
        { interestRate: 200_000_000_000_000_000n, debt: 1000n }, // 20% × 1000
      ]
      const service = makeService({
        [`${ADDRESSES.multiTroveGetter}.getDebtPerInterestRateAscending`]: [entries, 0n],
      })
      // weighted avg = (100e15 * 1000 + 200e15 * 1000) / 2000 = 150e15
      const avg = await service.getAverageInterestRate('GBPm')
      expect(avg).toBe(150_000_000_000_000_000n)
    })
  })

  describe('getBatchManagerInfo', () => {
    it('returns null when the batch manager does not exist', async () => {
      const service = makeService()
      const info = await service.getBatchManagerInfo('GBPm', BATCH_MANAGER)

      expect(info).toBeNull()
    })

    it('returns manager config when the batch manager exists', async () => {
      const managerData = {
        minInterestRate: 10_000_000_000_000_000n,
        maxInterestRate: 200_000_000_000_000_000n,
        minInterestRateChangePeriod: 3600n,
      }
      const service = makeService({
        [`${ADDRESSES.borrowerOperations}.checkBatchManagerExists`]: true,
        [`${ADDRESSES.borrowerOperations}.getInterestBatchManager`]: managerData,
      })
      const info = await service.getBatchManagerInfo('GBPm', BATCH_MANAGER)

      expect(info).toEqual({
        minRate: 10_000_000_000_000_000n,
        maxRate: 200_000_000_000_000_000n,
        minChangePeriod: 3600n,
      })
    })

    it('throws for invalid batch manager address', async () => {
      const service = makeService()
      await expect(service.getBatchManagerInfo('GBPm', 'not-an-address')).rejects.toThrow()
    })
  })

  describe('predictOpenTroveUpfrontFee', () => {
    it('returns the fee estimate from hintHelpers', async () => {
      const service = makeService()
      const fee = await service.predictOpenTroveUpfrontFee(
        'GBPm',
        1000n,
        100_000_000_000_000_000n
      )

      expect(fee).toBe(500n)
    })
  })

  describe('predictAdjustUpfrontFee', () => {
    it('returns the fee estimate from hintHelpers', async () => {
      const service = makeService()
      const fee = await service.predictAdjustUpfrontFee('GBPm', TROVE_ID, 200n)

      expect(fee).toBe(200n)
    })
  })

  describe('predictAdjustInterestRateUpfrontFee', () => {
    it('returns the fee estimate from hintHelpers', async () => {
      const service = makeService()
      const fee = await service.predictAdjustInterestRateUpfrontFee(
        'GBPm',
        TROVE_ID,
        50_000_000_000_000_000n
      )

      expect(fee).toBe(100n)
    })
  })

  describe('predictJoinBatchUpfrontFee', () => {
    it('returns the fee estimate from hintHelpers', async () => {
      const service = makeService()
      const fee = await service.predictJoinBatchUpfrontFee('GBPm', TROVE_ID, BATCH_MANAGER)

      expect(fee).toBe(300n)
    })

    it('throws for invalid batch address', async () => {
      const service = makeService()
      await expect(
        service.predictJoinBatchUpfrontFee('GBPm', TROVE_ID, 'bad-address')
      ).rejects.toThrow()
    })
  })

  describe('getNextOwnerIndex', () => {
    it('returns the current trove balance as the next available index', async () => {
      const service = makeService()
      const index = await service.getNextOwnerIndex('GBPm', OWNER)

      // troveNFT.balanceOf returns 3n in our mock
      expect(index).toBe(3)
    })

    it('throws for invalid owner address', async () => {
      const service = makeService()
      await expect(service.getNextOwnerIndex('GBPm', 'not-an-address')).rejects.toThrow()
    })

    it('throws when owner trove count exceeds Number.MAX_SAFE_INTEGER', async () => {
      const service = makeService({
        [`${ADDRESSES.troveNFT}.balanceOf`]: BigInt(Number.MAX_SAFE_INTEGER) + 1n,
      })
      await expect(service.getNextOwnerIndex('GBPm', OWNER)).rejects.toThrow(
        'Owner trove count exceeds Number.MAX_SAFE_INTEGER'
      )
    })
  })

  describe('getSystemParams', () => {
    it('returns all system parameters', async () => {
      const service = makeService()
      const params = await service.getSystemParams('GBPm')

      expect(params.mcr).toBe(1_100_000_000_000_000_000n)
      expect(params.ccr).toBe(1_500_000_000_000_000_000n)
      expect(params.minDebt).toBe(1_800_000_000_000_000_000_000n)
    })
  })
})

// ─── Input Validation Error Tests ─────────────────────────────────────────────

describe('BorrowService – input validation errors', () => {
  it('throws for unknown debtTokenSymbol', async () => {
    const service = makeService()
    await expect(service.getSystemParams('UNKNOWN_TOKEN')).rejects.toThrow()
  })

  it('throws for empty debtTokenSymbol', async () => {
    const service = makeService()
    await expect(service.getSystemParams('')).rejects.toThrow(
      'debtTokenSymbol must be a non-empty string'
    )
  })

  it('throws for negative troveId in buildCloseTroveTransaction', async () => {
    const service = makeService()
    await expect(service.buildCloseTroveTransaction('GBPm', '-1')).rejects.toThrow(
      'troveId cannot be negative'
    )
  })

  it('throws for non-numeric troveId', async () => {
    const service = makeService()
    await expect(service.buildCloseTroveTransaction('GBPm', 'abc')).rejects.toThrow()
  })

  it('throws for non-positive collAmount in buildOpenTroveTransaction', async () => {
    const service = makeService()
    await expect(
      service.buildOpenTroveTransaction('GBPm', {
        owner: OWNER,
        ownerIndex: 0,
        collAmount: 0n,
        boldAmount: 5n,
        annualInterestRate: 100_000_000_000_000_000n,
        maxUpfrontFee: 0n,
      })
    ).rejects.toThrow('collAmount must be a positive bigint')
  })

  it('throws for negative maxUpfrontFee in buildAdjustInterestRateTransaction', async () => {
    const service = makeService()
    await expect(
      service.buildAdjustInterestRateTransaction('GBPm', TROVE_ID, 100_000_000_000_000_000n, -1n)
    ).rejects.toThrow('maxFee must be a non-negative bigint')
  })

  it('throws for invalid delegate address in buildSetInterestDelegateTransaction', async () => {
    const service = makeService()
    await expect(
      service.buildSetInterestDelegateTransaction(
        'GBPm',
        TROVE_ID,
        'not-an-address',
        1n,
        10n,
        5n,
        0n,
        0n
      )
    ).rejects.toThrow()
  })
})
