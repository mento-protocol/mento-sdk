import { Address, PublicClient } from 'viem'
import { getBorrowRegistry } from '../../../core/constants'
import { readSystemParams, resolveAddressesFromRegistry } from './borrowRegistryReader'
import { DeploymentContext } from './borrowTypes'
import { requireDebtTokenSymbol } from './borrowValidation'

export class BorrowContextStore {
  private deployments: Map<string, DeploymentContext> = new Map()
  private initializing: Map<string, Promise<DeploymentContext>> = new Map()

  constructor(
    private publicClient: PublicClient,
    private chainId: number
  ) {}

  async ensureInitialized(debtTokenSymbol: string): Promise<DeploymentContext> {
    const symbol = requireDebtTokenSymbol(debtTokenSymbol)

    const cached = this.deployments.get(symbol)
    if (cached) return cached

    const inFlight = this.initializing.get(symbol)
    if (inFlight) return inFlight

    const initPromise = (async () => {
      const registryAddress = getBorrowRegistry(this.chainId, symbol)
      const addresses = await resolveAddressesFromRegistry(this.publicClient, registryAddress)
      const systemParams = await readSystemParams(
        this.publicClient,
        addresses.borrowerOperations as Address
      )
      const ctx: DeploymentContext = { addresses, systemParams }
      this.deployments.set(symbol, ctx)
      return ctx
    })()

    this.initializing.set(symbol, initPromise)

    try {
      return await initPromise
    } finally {
      this.initializing.delete(symbol)
    }
  }
}
