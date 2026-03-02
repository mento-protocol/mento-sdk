import { Address, PublicClient } from 'viem'
import {
  ADDRESSES_REGISTRY_ABI,
  BORROWER_OPERATIONS_ABI,
  SYSTEM_PARAMS_ABI,
} from '../../../core/abis'
import { BorrowContractAddresses, SystemParams } from '../../../core/types'
import { validateAddress } from '../../../utils/validation'

type ReadNoArgsParams = {
  address: Address
  abi: unknown
  functionName: string
}

type ReadNoArgsFn = (params: ReadNoArgsParams & { args: readonly [] }) => Promise<unknown>

function readNoArgsContract(
  publicClient: PublicClient,
  address: Address,
  abi: unknown,
  functionName: string
): Promise<unknown> {
  const readContract = publicClient.readContract as unknown as ReadNoArgsFn
  return readContract({ address, abi, functionName, args: [] })
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
