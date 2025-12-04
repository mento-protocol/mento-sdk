import { getContractAddress } from '../core/constants/addresses'
import { ChainId } from '../core/constants/chainId'
import type { PublicClient } from 'viem'

interface Exchange {
  providerAddr: string
  id: string
  assets: string[]
}

/**
 * Error thrown when an exchange is not found
 */
export class ExchangeNotFoundError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ExchangeNotFoundError'
  }
}

/**
 * Error thrown when a tradable pair is not found
 */
export class PairNotFoundError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PairNotFoundError'
  }
}

/**
 * Service for discovering exchanges and tradable pairs in the Mento protocol
 * All methods are read-only and do not require a signer
 *
 * @example
 * ```typescript
 * import { ExchangeService } from '@mento-labs/mento-sdk/services'
 * import { createPublicClient, http } from 'viem'
 * import { celo } from 'viem/chains'
 *
 * const publicClient = createPublicClient({
 *   chain: celo,
 *   transport: http('https://forno.celo.org')
 * })
 * const exchangeService = new ExchangeService(publicClient, ChainId.CELO)
 *
 * // Get all exchanges
 * const exchanges = await exchangeService.getExchanges()
 * ```
 */
export class ExchangeService {
  private publicClient: PublicClient
  private chainId: number
  private exchangesCache: Exchange[] | null = null


  /**
   * Creates a new ExchangeService instance
   *
   * @param publicClient - Viem PublicClient for blockchain interactions
   * @param chainId - The chain ID
   */
  constructor(publicClient: PublicClient, chainId: number) {
    this.publicClient = publicClient
    this.chainId = chainId
  }

 


  

  /**
   * Helper: Get BiPoolManager contract address for current chain
   * @private
   */
  private getBiPoolManagerAddress(): string {
    return getContractAddress(this.chainId as ChainId, 'BiPoolManager')
  }
}
