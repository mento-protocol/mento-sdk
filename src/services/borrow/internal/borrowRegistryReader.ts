import { Address, PublicClient } from 'viem'
import {
  ADDRESSES_REGISTRY_ABI,
  BORROWER_OPERATIONS_ABI,
  SYSTEM_PARAMS_ABI,
} from '../../../core/abis'
import { BorrowContractAddresses, SystemParams } from '../../../core/types'
import { multicall } from '../../../utils/multicall'
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

async function readNoArgsContracts(
  publicClient: PublicClient,
  contracts: ReadNoArgsParams[]
): Promise<unknown[]> {
  if (contracts.length === 0) {
    return []
  }

  const results = await multicall(
    publicClient,
    contracts.map((contract) => ({
      ...contract,
      abi: contract.abi as readonly unknown[],
      args: [] as const,
    })),
    { allowFailure: false }
  )

  return results.map((result) => {
    if (result.status === 'failure') {
      throw result.error
    }

    return result.result
  })
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
  ] = await readNoArgsContracts(publicClient, [
    { address: registry, abi: ADDRESSES_REGISTRY_ABI, functionName: 'borrowerOperations' },
    { address: registry, abi: ADDRESSES_REGISTRY_ABI, functionName: 'troveManager' },
    { address: registry, abi: ADDRESSES_REGISTRY_ABI, functionName: 'sortedTroves' },
    { address: registry, abi: ADDRESSES_REGISTRY_ABI, functionName: 'activePool' },
    { address: registry, abi: ADDRESSES_REGISTRY_ABI, functionName: 'defaultPool' },
    { address: registry, abi: ADDRESSES_REGISTRY_ABI, functionName: 'hintHelpers' },
    { address: registry, abi: ADDRESSES_REGISTRY_ABI, functionName: 'multiTroveGetter' },
    { address: registry, abi: ADDRESSES_REGISTRY_ABI, functionName: 'collToken' },
    { address: registry, abi: ADDRESSES_REGISTRY_ABI, functionName: 'boldToken' },
    { address: registry, abi: ADDRESSES_REGISTRY_ABI, functionName: 'troveNFT' },
    { address: registry, abi: ADDRESSES_REGISTRY_ABI, functionName: 'metadataNFT' },
    { address: registry, abi: ADDRESSES_REGISTRY_ABI, functionName: 'stabilityPool' },
    { address: registry, abi: ADDRESSES_REGISTRY_ABI, functionName: 'priceFeed' },
    { address: registry, abi: ADDRESSES_REGISTRY_ABI, functionName: 'collSurplusPool' },
    { address: registry, abi: ADDRESSES_REGISTRY_ABI, functionName: 'interestRouter' },
    { address: registry, abi: ADDRESSES_REGISTRY_ABI, functionName: 'collateralRegistry' },
    { address: registry, abi: ADDRESSES_REGISTRY_ABI, functionName: 'gasToken' },
    { address: registry, abi: ADDRESSES_REGISTRY_ABI, functionName: 'gasPoolAddress' },
    { address: registry, abi: ADDRESSES_REGISTRY_ABI, functionName: 'liquidityStrategy' },
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
  ] = await readNoArgsContracts(publicClient, [
    { address: systemParamsAddress, abi: SYSTEM_PARAMS_ABI, functionName: 'CCR' },
    { address: systemParamsAddress, abi: SYSTEM_PARAMS_ABI, functionName: 'MCR' },
    { address: systemParamsAddress, abi: SYSTEM_PARAMS_ABI, functionName: 'SCR' },
    { address: systemParamsAddress, abi: SYSTEM_PARAMS_ABI, functionName: 'BCR' },
    { address: systemParamsAddress, abi: SYSTEM_PARAMS_ABI, functionName: 'MIN_DEBT' },
    { address: systemParamsAddress, abi: SYSTEM_PARAMS_ABI, functionName: 'ETH_GAS_COMPENSATION' },
    { address: systemParamsAddress, abi: SYSTEM_PARAMS_ABI, functionName: 'MIN_ANNUAL_INTEREST_RATE' },
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
