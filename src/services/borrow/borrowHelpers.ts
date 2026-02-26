import { Address, PublicClient, encodeFunctionData, zeroAddress } from 'viem'
import {
  ADDRESSES_REGISTRY_ABI,
  BORROWER_OPERATIONS_ABI,
  ERC20_ABI,
  SYSTEM_PARAMS_ABI,
} from '../../core/abis'
import {
  BorrowContractAddresses,
  BorrowPosition,
  CallParams,
  SystemParams,
  TroveStatus,
} from '../../core/types'
import { validateAddress } from '../../utils/validation'

const MAX_SAFE_INTEGER_BIGINT = BigInt(Number.MAX_SAFE_INTEGER)

type LatestTroveData = {
  entireDebt: bigint
  entireColl: bigint
  redistBoldDebtGain: bigint
  redistCollGain: bigint
  accruedInterest: bigint
  recordedDebt: bigint
  annualInterestRate: bigint
  accruedBatchManagementFee: bigint
  lastInterestRateAdjTime: bigint | number
}

type TrovesData = {
  status: bigint | number
  lastDebtUpdateTime: bigint | number
  interestBatchManager: string
}

function requireAddress(value: unknown, fieldName: string): Address {
  if (typeof value !== 'string') {
    throw new Error(`${fieldName} must be a string address`)
  }
  validateAddress(value, fieldName)
  return value as Address
}

function requireBigInt(value: unknown, fieldName: string): bigint {
  if (typeof value !== 'bigint') {
    throw new Error(`${fieldName} must be a bigint`)
  }
  if (value < 0n) {
    throw new Error(`${fieldName} cannot be negative`)
  }
  return value
}

function requireNonNegativeInteger(value: unknown, fieldName: string): number {
  if (typeof value === 'bigint') {
    if (value < 0n) {
      throw new Error(`${fieldName} cannot be negative`)
    }
    if (value > MAX_SAFE_INTEGER_BIGINT) {
      throw new Error(`${fieldName} exceeds Number.MAX_SAFE_INTEGER`)
    }
    return Number(value)
  }

  if (typeof value === 'number') {
    if (!Number.isSafeInteger(value)) {
      throw new Error(`${fieldName} must be a safe integer`)
    }
    if (value < 0) {
      throw new Error(`${fieldName} cannot be negative`)
    }
    return value
  }

  throw new Error(`${fieldName} must be a number or bigint`)
}

function readNoArgsContract(
  publicClient: PublicClient,
  address: Address,
  abi: unknown,
  functionName: string
): Promise<unknown> {
  const readContract = publicClient.readContract as unknown as (params: {
    address: Address
    abi: unknown
    functionName: string
    args: readonly []
  }) => Promise<unknown>

  return readContract({
    address,
    abi,
    functionName,
    args: [],
  })
}

export async function resolveAddressesFromRegistry(
  publicClient: PublicClient,
  registryAddress: string
): Promise<BorrowContractAddresses> {
  validateAddress(registryAddress, 'registryAddress')

  const registry = registryAddress as Address

  const [
    borrowerOperationsRaw,
    troveManagerRaw,
    sortedTrovesRaw,
    activePoolRaw,
    defaultPoolRaw,
    hintHelpersRaw,
    multiTroveGetterRaw,
    collTokenRaw,
    debtTokenRaw,
    troveNFTRaw,
    metadataNFTRaw,
    stabilityPoolRaw,
    priceFeedRaw,
    collSurplusPoolRaw,
    interestRouterRaw,
    collateralRegistryRaw,
    gasTokenRaw,
    gasPoolAddressRaw,
    liquidityStrategyRaw,
  ] = await Promise.all([
    readNoArgsContract(publicClient, registry, ADDRESSES_REGISTRY_ABI, 'borrowerOperations'),
    readNoArgsContract(publicClient, registry, ADDRESSES_REGISTRY_ABI, 'troveManager'),
    readNoArgsContract(publicClient, registry, ADDRESSES_REGISTRY_ABI, 'sortedTroves'),
    readNoArgsContract(publicClient, registry, ADDRESSES_REGISTRY_ABI, 'activePool'),
    readNoArgsContract(publicClient, registry, ADDRESSES_REGISTRY_ABI, 'defaultPool'),
    readNoArgsContract(publicClient, registry, ADDRESSES_REGISTRY_ABI, 'hintHelpers'),
    readNoArgsContract(publicClient, registry, ADDRESSES_REGISTRY_ABI, 'multiTroveGetter'),
    readNoArgsContract(publicClient, registry, ADDRESSES_REGISTRY_ABI, 'collToken'),
    readNoArgsContract(publicClient, registry, ADDRESSES_REGISTRY_ABI, 'boldToken'),
    readNoArgsContract(publicClient, registry, ADDRESSES_REGISTRY_ABI, 'troveNFT'),
    readNoArgsContract(publicClient, registry, ADDRESSES_REGISTRY_ABI, 'metadataNFT'),
    readNoArgsContract(publicClient, registry, ADDRESSES_REGISTRY_ABI, 'stabilityPool'),
    readNoArgsContract(publicClient, registry, ADDRESSES_REGISTRY_ABI, 'priceFeed'),
    readNoArgsContract(publicClient, registry, ADDRESSES_REGISTRY_ABI, 'collSurplusPool'),
    readNoArgsContract(publicClient, registry, ADDRESSES_REGISTRY_ABI, 'interestRouter'),
    readNoArgsContract(publicClient, registry, ADDRESSES_REGISTRY_ABI, 'collateralRegistry'),
    readNoArgsContract(publicClient, registry, ADDRESSES_REGISTRY_ABI, 'gasToken'),
    readNoArgsContract(publicClient, registry, ADDRESSES_REGISTRY_ABI, 'gasPoolAddress'),
    readNoArgsContract(publicClient, registry, ADDRESSES_REGISTRY_ABI, 'liquidityStrategy'),
  ])

  return {
    borrowerOperations: requireAddress(borrowerOperationsRaw, 'borrowerOperations'),
    troveManager: requireAddress(troveManagerRaw, 'troveManager'),
    sortedTroves: requireAddress(sortedTrovesRaw, 'sortedTroves'),
    activePool: requireAddress(activePoolRaw, 'activePool'),
    defaultPool: requireAddress(defaultPoolRaw, 'defaultPool'),
    hintHelpers: requireAddress(hintHelpersRaw, 'hintHelpers'),
    multiTroveGetter: requireAddress(multiTroveGetterRaw, 'multiTroveGetter'),
    collToken: requireAddress(collTokenRaw, 'collToken'),
    debtToken: requireAddress(debtTokenRaw, 'debtToken'),
    troveNFT: requireAddress(troveNFTRaw, 'troveNFT'),
    metadataNFT: requireAddress(metadataNFTRaw, 'metadataNFT'),
    stabilityPool: requireAddress(stabilityPoolRaw, 'stabilityPool'),
    priceFeed: requireAddress(priceFeedRaw, 'priceFeed'),
    collSurplusPool: requireAddress(collSurplusPoolRaw, 'collSurplusPool'),
    interestRouter: requireAddress(interestRouterRaw, 'interestRouter'),
    collateralRegistry: requireAddress(collateralRegistryRaw, 'collateralRegistry'),
    gasToken: requireAddress(gasTokenRaw, 'gasToken'),
    gasPoolAddress: requireAddress(gasPoolAddressRaw, 'gasPoolAddress'),
    liquidityStrategy: requireAddress(liquidityStrategyRaw, 'liquidityStrategy'),
  }
}

export async function readSystemParams(
  publicClient: PublicClient,
  borrowerOperations: Address
): Promise<SystemParams> {
  validateAddress(borrowerOperations, 'borrowerOperations')

  const systemParamsAddressRaw = await readNoArgsContract(
    publicClient,
    borrowerOperations,
    BORROWER_OPERATIONS_ABI,
    'systemParams'
  )

  const systemParamsAddress = requireAddress(systemParamsAddressRaw, 'systemParamsAddress')

  const [
    ccrRaw,
    mcrRaw,
    scrRaw,
    bcrRaw,
    minDebtRaw,
    ethGasCompensationRaw,
    minAnnualInterestRateRaw,
  ] = await Promise.all([
    readNoArgsContract(publicClient, systemParamsAddress, SYSTEM_PARAMS_ABI, 'CCR'),
    readNoArgsContract(publicClient, systemParamsAddress, SYSTEM_PARAMS_ABI, 'MCR'),
    readNoArgsContract(publicClient, systemParamsAddress, SYSTEM_PARAMS_ABI, 'SCR'),
    readNoArgsContract(publicClient, systemParamsAddress, SYSTEM_PARAMS_ABI, 'BCR'),
    readNoArgsContract(publicClient, systemParamsAddress, SYSTEM_PARAMS_ABI, 'MIN_DEBT'),
    readNoArgsContract(
      publicClient,
      systemParamsAddress,
      SYSTEM_PARAMS_ABI,
      'ETH_GAS_COMPENSATION'
    ),
    readNoArgsContract(
      publicClient,
      systemParamsAddress,
      SYSTEM_PARAMS_ABI,
      'MIN_ANNUAL_INTEREST_RATE'
    ),
  ])

  return {
    mcr: requireBigInt(mcrRaw, 'MCR'),
    ccr: requireBigInt(ccrRaw, 'CCR'),
    scr: requireBigInt(scrRaw, 'SCR'),
    bcr: requireBigInt(bcrRaw, 'BCR'),
    minDebt: requireBigInt(minDebtRaw, 'MIN_DEBT'),
    ethGasCompensation: requireBigInt(ethGasCompensationRaw, 'ETH_GAS_COMPENSATION'),
    minAnnualInterestRate: requireBigInt(minAnnualInterestRateRaw, 'MIN_ANNUAL_INTEREST_RATE'),
  }
}

export function buildCollateralApprovalParams(
  collToken: Address,
  spender: Address,
  amount: bigint
): CallParams {
  validateAddress(collToken, 'collToken')
  validateAddress(spender, 'spender')

  if (amount < 0n) {
    throw new Error('Approval amount cannot be negative')
  }

  const data = encodeFunctionData({
    abi: ERC20_ABI,
    functionName: 'approve',
    args: [spender, amount],
  })

  return { to: collToken, data, value: '0' }
}

export async function getCollateralAllowance(
  publicClient: PublicClient,
  collToken: Address,
  owner: Address,
  spender: Address
): Promise<bigint> {
  validateAddress(collToken, 'collToken')
  validateAddress(owner, 'owner')
  validateAddress(spender, 'spender')

  const allowanceRaw = await publicClient.readContract({
    address: collToken,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [owner, spender],
  })

  return requireBigInt(allowanceRaw, 'allowance')
}

export function mapTroveStatus(statusNum: number): TroveStatus {
  if (!Number.isSafeInteger(statusNum) || statusNum < 0) {
    throw new Error(`Invalid trove status: ${statusNum}`)
  }

  switch (statusNum) {
    case 0:
      return 'nonExistent'
    case 1:
      return 'active'
    case 2:
      return 'closedByOwner'
    case 3:
      return 'closedByLiquidation'
    case 4:
      return 'zombie'
    default:
      throw new Error(`Unknown trove status: ${statusNum}`)
  }
}

export function parseBorrowPosition(
  troveId: string,
  latestData: unknown,
  trovesData: unknown
): BorrowPosition {
  if (typeof troveId !== 'string' || troveId.length === 0) {
    throw new Error('troveId must be a non-empty string')
  }

  const latest = latestData as Partial<LatestTroveData>
  const trove = trovesData as Partial<TrovesData>

  const interestBatchManager = requireAddress(
    trove.interestBatchManager,
    'trovesData.interestBatchManager'
  )

  return {
    troveId,
    collateral: requireBigInt(latest.entireColl, 'latestData.entireColl'),
    debt: requireBigInt(latest.entireDebt, 'latestData.entireDebt'),
    annualInterestRate: requireBigInt(latest.annualInterestRate, 'latestData.annualInterestRate'),
    status: mapTroveStatus(requireNonNegativeInteger(trove.status, 'trovesData.status')),
    interestBatchManager:
      interestBatchManager.toLowerCase() === zeroAddress ? null : interestBatchManager,
    lastDebtUpdateTime: requireNonNegativeInteger(
      trove.lastDebtUpdateTime,
      'trovesData.lastDebtUpdateTime'
    ),
    lastInterestRateAdjTime: requireNonNegativeInteger(
      latest.lastInterestRateAdjTime,
      'latestData.lastInterestRateAdjTime'
    ),
    redistBoldDebtGain: requireBigInt(latest.redistBoldDebtGain, 'latestData.redistBoldDebtGain'),
    redistCollGain: requireBigInt(latest.redistCollGain, 'latestData.redistCollGain'),
    accruedInterest: requireBigInt(latest.accruedInterest, 'latestData.accruedInterest'),
    recordedDebt: requireBigInt(latest.recordedDebt, 'latestData.recordedDebt'),
    accruedBatchManagementFee: requireBigInt(
      latest.accruedBatchManagementFee,
      'latestData.accruedBatchManagementFee'
    ),
  }
}
