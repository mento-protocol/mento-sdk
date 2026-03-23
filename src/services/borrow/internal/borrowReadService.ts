import { Address, PublicClient } from 'viem'
import {
  BORROWER_OPERATIONS_ABI,
  HINT_HELPERS_ABI,
  MULTI_TROVE_GETTER_ABI,
  PRICE_FEED_ABI,
  TROVE_MANAGER_ABI,
  TROVE_NFT_ABI,
} from '../../../core/abis'
import { COLL_INDEX } from '../../../core/constants'
import { BorrowPosition, InterestRateBracket } from '../../../core/types'
import { multicall } from '../../../utils/multicall'
import { parseBorrowPosition } from './borrowPositionParser'
import { DebtPerInterestRateItem, DeploymentContext, InterestBatchManagerData } from './borrowTypes'
import {
  deriveTroveId,
  formatTroveId,
  MAX_SAFE_INTEGER_BIGINT,
  parseTroveId,
  requireAddress,
  requireNonNegativeBigInt,
} from './borrowValidation'

const TROVE_ID_BATCH_SIZE = 64
const TROVE_OWNER_BATCH_SIZE = 64
const TROVE_DETAIL_BATCH_SIZE = 64
const OWNER_INDEX_PROBE_BATCH_SIZE = 64

type BorrowReadContract = {
  address: Address
  abi: readonly unknown[]
  functionName: string
  args?: readonly unknown[]
}

export class BorrowReadService {
  constructor(private publicClient: PublicClient) {}

  async getTroveData(ctx: DeploymentContext, troveId: string): Promise<BorrowPosition> {
    const parsedTroveId = parseTroveId(troveId)

    const [latestData, trovesData] = await this.readContractsInChunks(
      [
        {
          address: ctx.addresses.troveManager as Address,
          abi: TROVE_MANAGER_ABI,
          functionName: 'getLatestTroveData',
          args: [parsedTroveId],
        },
        {
          address: ctx.addresses.troveManager as Address,
          abi: TROVE_MANAGER_ABI,
          functionName: 'Troves',
          args: [parsedTroveId],
        },
      ],
      2
    )

    return parseBorrowPosition(formatTroveId(parsedTroveId), latestData, trovesData)
  }

  async getUserTroves(ctx: DeploymentContext, owner: string): Promise<BorrowPosition[]> {
    const ownerAddress = requireAddress(owner, 'owner')
    const ownedTroveCount = await this.getOwnedTroveCount(ctx, ownerAddress)

    if (ownedTroveCount === 0) {
      return []
    }

    const troveCount = (await this.publicClient.readContract({
      address: ctx.addresses.troveManager as Address,
      abi: TROVE_MANAGER_ABI,
      functionName: 'getTroveIdsCount',
      args: [],
    })) as bigint

    if (troveCount === 0n) {
      return []
    }

    const troveIdContracts: BorrowReadContract[] = []
    for (let i = 0n; i < troveCount; i++) {
      troveIdContracts.push({
        address: ctx.addresses.troveManager as Address,
        abi: TROVE_MANAGER_ABI,
        functionName: 'getTroveFromTroveIdsArray',
        args: [i],
      })
    }

    const troveIds = (await this.readContractsInChunks<bigint>(troveIdContracts, TROVE_ID_BATCH_SIZE)).map(
      (troveId) => troveId as bigint
    )

    const ownerContracts = troveIds.map((troveId) => ({
      address: ctx.addresses.troveNFT as Address,
      abi: TROVE_NFT_ABI,
      functionName: 'ownerOf',
      args: [troveId],
    }))

    const troveOwners = await this.readContractsInChunks<Address>(ownerContracts, TROVE_OWNER_BATCH_SIZE)
    const matchedTroveIds = troveIds.filter(
      (troveId, index) => troveOwners[index].toLowerCase() === ownerAddress.toLowerCase()
    )

    if (matchedTroveIds.length === 0) {
      return []
    }

    const troveDetailContracts = matchedTroveIds.flatMap((troveId) => ([
      {
        address: ctx.addresses.troveManager as Address,
        abi: TROVE_MANAGER_ABI,
        functionName: 'getLatestTroveData',
        args: [troveId],
      },
      {
        address: ctx.addresses.troveManager as Address,
        abi: TROVE_MANAGER_ABI,
        functionName: 'Troves',
        args: [troveId],
      },
    ]))

    const detailResults = await this.readContractsInChunks(
      troveDetailContracts,
      TROVE_DETAIL_BATCH_SIZE * 2
    )

    return matchedTroveIds.map((troveId, index) => {
      const offset = index * 2
      return parseBorrowPosition(formatTroveId(troveId), detailResults[offset], detailResults[offset + 1])
    })
  }

  async getCollateralPrice(ctx: DeploymentContext): Promise<bigint> {
    return (await this.publicClient.readContract({
      address: ctx.addresses.priceFeed as Address,
      abi: PRICE_FEED_ABI,
      functionName: 'fetchPrice',
      args: [],
    })) as bigint
  }

  async isSystemShutDown(ctx: DeploymentContext): Promise<boolean> {
    return (await this.publicClient.readContract({
      address: ctx.addresses.borrowerOperations as Address,
      abi: BORROWER_OPERATIONS_ABI,
      functionName: 'hasBeenShutDown',
      args: [],
    })) as boolean
  }

  async getBranchStats(ctx: DeploymentContext): Promise<{ totalColl: bigint; totalDebt: bigint }> {
    const [totalColl, totalDebt] = await Promise.all([
      this.publicClient.readContract({
        address: ctx.addresses.borrowerOperations as Address,
        abi: BORROWER_OPERATIONS_ABI,
        functionName: 'getEntireBranchColl',
        args: [],
      }),
      this.publicClient.readContract({
        address: ctx.addresses.borrowerOperations as Address,
        abi: BORROWER_OPERATIONS_ABI,
        functionName: 'getEntireBranchDebt',
        args: [],
      }),
    ])

    return { totalColl: totalColl as bigint, totalDebt: totalDebt as bigint }
  }

  async getInterestRateBrackets(ctx: DeploymentContext): Promise<InterestRateBracket[]> {
    const result = (await this.publicClient.readContract({
      address: ctx.addresses.multiTroveGetter as Address,
      abi: MULTI_TROVE_GETTER_ABI,
      functionName: 'getDebtPerInterestRateAscending',
      args: [COLL_INDEX, 0n, 500n],
    })) as readonly [readonly DebtPerInterestRateItem[], bigint]

    const entries = result[0] ?? []
    const grouped = new Map<string, bigint>()

    for (const item of entries) {
      const rate = requireNonNegativeBigInt(item.interestRate, 'interestRate')
      const debt = requireNonNegativeBigInt(item.debt, 'debt')
      const key = rate.toString()
      grouped.set(key, (grouped.get(key) ?? 0n) + debt)
    }

    return Array.from(grouped.entries())
      .map(([rate, totalDebt]) => ({
        rate: BigInt(rate),
        totalDebt,
      }))
      .sort((a, b) => (a.rate < b.rate ? -1 : a.rate > b.rate ? 1 : 0))
  }

  async getAverageInterestRate(ctx: DeploymentContext): Promise<bigint> {
    const brackets = await this.getInterestRateBrackets(ctx)
    if (brackets.length === 0) return 0n

    let weightedRateSum = 0n
    let totalDebt = 0n

    for (const bracket of brackets) {
      weightedRateSum += bracket.rate * bracket.totalDebt
      totalDebt += bracket.totalDebt
    }

    return totalDebt === 0n ? 0n : weightedRateSum / totalDebt
  }

  async getBatchManagerInfo(
    ctx: DeploymentContext,
    address: string
  ): Promise<{ minRate: bigint; maxRate: bigint; minChangePeriod: bigint } | null> {
    const batchManagerAddress = requireAddress(address, 'address')

    const exists = (await this.publicClient.readContract({
      address: ctx.addresses.borrowerOperations as Address,
      abi: BORROWER_OPERATIONS_ABI,
      functionName: 'checkBatchManagerExists',
      args: [batchManagerAddress],
    })) as boolean

    if (!exists) return null

    const manager = (await this.publicClient.readContract({
      address: ctx.addresses.borrowerOperations as Address,
      abi: BORROWER_OPERATIONS_ABI,
      functionName: 'getInterestBatchManager',
      args: [batchManagerAddress],
    })) as InterestBatchManagerData

    return {
      minRate: requireNonNegativeBigInt(manager.minInterestRate, 'minInterestRate'),
      maxRate: requireNonNegativeBigInt(manager.maxInterestRate, 'maxInterestRate'),
      minChangePeriod: requireNonNegativeBigInt(
        manager.minInterestRateChangePeriod,
        'minInterestRateChangePeriod'
      ),
    }
  }

  async predictOpenTroveUpfrontFee(ctx: DeploymentContext, amount: bigint, rate: bigint): Promise<bigint> {
    const borrowedAmount = requireNonNegativeBigInt(amount, 'amount')
    const annualInterestRate = requireNonNegativeBigInt(rate, 'rate')

    return (await this.publicClient.readContract({
      address: ctx.addresses.hintHelpers as Address,
      abi: HINT_HELPERS_ABI,
      functionName: 'predictOpenTroveUpfrontFee',
      args: [COLL_INDEX, borrowedAmount, annualInterestRate],
    })) as bigint
  }

  async predictAdjustUpfrontFee(
    ctx: DeploymentContext,
    troveId: string,
    debtIncrease: bigint
  ): Promise<bigint> {
    const parsedTroveId = parseTroveId(troveId)
    const debtIncreaseAmount = requireNonNegativeBigInt(debtIncrease, 'debtIncrease')

    return (await this.publicClient.readContract({
      address: ctx.addresses.hintHelpers as Address,
      abi: HINT_HELPERS_ABI,
      functionName: 'predictAdjustTroveUpfrontFee',
      args: [COLL_INDEX, parsedTroveId, debtIncreaseAmount],
    })) as bigint
  }

  async predictAdjustInterestRateUpfrontFee(
    ctx: DeploymentContext,
    troveId: string,
    newRate: bigint
  ): Promise<bigint> {
    const parsedTroveId = parseTroveId(troveId)
    const newAnnualInterestRate = requireNonNegativeBigInt(newRate, 'newRate')

    return (await this.publicClient.readContract({
      address: ctx.addresses.hintHelpers as Address,
      abi: HINT_HELPERS_ABI,
      functionName: 'predictAdjustInterestRateUpfrontFee',
      args: [COLL_INDEX, parsedTroveId, newAnnualInterestRate],
    })) as bigint
  }

  async predictJoinBatchUpfrontFee(
    ctx: DeploymentContext,
    troveId: string,
    batchAddress: string
  ): Promise<bigint> {
    const parsedTroveId = parseTroveId(troveId)
    const managerAddress = requireAddress(batchAddress, 'batchAddress')

    return (await this.publicClient.readContract({
      address: ctx.addresses.hintHelpers as Address,
      abi: HINT_HELPERS_ABI,
      functionName: 'predictJoinBatchInterestRateUpfrontFee',
      args: [COLL_INDEX, parsedTroveId, managerAddress],
    })) as bigint
  }

  async getOwnedTroveCount(ctx: DeploymentContext, owner: string): Promise<number> {
    const ownerAddress = requireAddress(owner, 'owner')

    const ownerTroveCount = (await this.publicClient.readContract({
      address: ctx.addresses.troveNFT as Address,
      abi: TROVE_NFT_ABI,
      functionName: 'balanceOf',
      args: [ownerAddress],
    })) as bigint

    if (ownerTroveCount > MAX_SAFE_INTEGER_BIGINT) {
      throw new Error('Owner trove count exceeds Number.MAX_SAFE_INTEGER')
    }

    return Number(ownerTroveCount)
  }

  async findNextAvailableOwnerIndex(
    ctx: DeploymentContext,
    owner: string,
    opener: string
  ): Promise<number> {
    const ownerAddress = requireAddress(owner, 'owner')
    const openerAddress = requireAddress(opener, 'opener')

    let candidateIndex = await this.getOwnedTroveCount(ctx, ownerAddress)

    while (candidateIndex <= Number.MAX_SAFE_INTEGER) {
      const batchIndices = Array.from(
        { length: Math.min(OWNER_INDEX_PROBE_BATCH_SIZE, Number.MAX_SAFE_INTEGER - candidateIndex + 1) },
        (_, offset) => candidateIndex + offset
      )

      const statusContracts = batchIndices.map((ownerIndex) => ({
        address: ctx.addresses.troveManager as Address,
        abi: TROVE_MANAGER_ABI,
        functionName: 'getTroveStatus',
        args: [deriveTroveId(openerAddress, ownerAddress, ownerIndex)],
      }))

      const statuses = await this.readContractsInChunks<number | bigint>(
        statusContracts,
        OWNER_INDEX_PROBE_BATCH_SIZE
      )

      const availableOffset = statuses.findIndex((status) => status === 0 || status === 0n)
      if (availableOffset !== -1) {
        return batchIndices[availableOffset]
      }

      candidateIndex += batchIndices.length
    }

    throw new Error('Next available owner index exceeds Number.MAX_SAFE_INTEGER')
  }

  async getNextOwnerIndex(ctx: DeploymentContext, owner: string): Promise<number> {
    return this.getOwnedTroveCount(ctx, owner)
  }

  private async readContractsInChunks<T = unknown>(
    contracts: BorrowReadContract[],
    chunkSize: number
  ): Promise<T[]> {
    if (contracts.length === 0) {
      return []
    }

    const results: T[] = []

    for (let index = 0; index < contracts.length; index += chunkSize) {
      const chunk = contracts.slice(index, index + chunkSize)
      const chunkResults = await multicall(this.publicClient, chunk, { allowFailure: false })

      for (const result of chunkResults) {
        if (result.status === 'failure') {
          throw result.error
        }

        results.push(result.result as T)
      }
    }

    return results
  }
}
