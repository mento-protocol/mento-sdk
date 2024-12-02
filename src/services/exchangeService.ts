import { ProviderAdapter, EnrichedExchange, IERC20Token } from '../types'
import { BIPOOLMANAGER, BROKER, getContractAddress } from '../constants'
import { BIPOOL_MANAGER_ABI, BROKER_ABI } from '../abis'
import { retryOperation } from '../utils'
import { TokenMetadataService } from './tokenMetadataService'

type RawExchange = {
  exchangeId: string
  assets: [string, string]
}
export class ExchangeService {
  private tokenMetadataService: TokenMetadataService

  constructor(private provider: ProviderAdapter) {
    this.tokenMetadataService = new TokenMetadataService(provider)
  }

  /**
   * Returns all exchanges in the Mento protocol
   * @returns Array of exchanges
   */
  async getExchanges(): Promise<EnrichedExchange[]> {
    const exchanges: EnrichedExchange[] = []
    const chainId = await this.provider.getChainId()
    const biPoolManagerAddress = getContractAddress(chainId, BIPOOLMANAGER)

    const rawExchanges = (await retryOperation(() =>
      this.provider.readContract({
        address: biPoolManagerAddress,
        abi: BIPOOL_MANAGER_ABI,
        functionName: 'getExchanges',
      })
    )) as RawExchange[]

    const tokensMetadata = await this.tokenMetadataService.getTokensMetadata(
      rawExchanges.flatMap((exchange) => exchange.assets)
    )

    // Add the token metadata to each exchange
    rawExchanges.forEach((exchange) => {
      const enrichedExchange: EnrichedExchange = {
        exchangeId: exchange.exchangeId,
        providerAddress: biPoolManagerAddress,
        assets: exchange.assets.map((address) => tokensMetadata.get(address)!),
      }
      exchanges.push(enrichedExchange)
    })

    console.log(exchanges[0])

    return exchanges
  }

  /**
   * Returns all tradeable pairs in the Mento protocol
   * @returns Array of exchange pairs with asset details
   */
  async getTradeablePairs(): Promise<[IERC20Token, IERC20Token][]> {
    const pairs: [IERC20Token, IERC20Token][] = []
    const exchanges = await this.getExchanges()

    exchanges.forEach((exchange) => {
      pairs.push([exchange.assets[0], exchange.assets[1]])
    })

    return pairs
  }

  /**
   * Returns the amount of tokenOut to be received for a given amount of tokenIn
   * @param tokenIn Address of the token to be sold
   * @param tokenOut Address of the token to be bought
   * @param amountIn Amount of tokenIn to be sold (in smallest unit)
   * @returns The amount of tokenOut to be received
   */
  async getAmountOut(
    tokenIn: string,
    tokenOut: string,
    amountIn: string
  ): Promise<string> {
    const chainId = await this.provider.getChainId()
    const biPoolManagerAddress = getContractAddress(chainId, BIPOOLMANAGER)
    const brokerAddress = getContractAddress(chainId, BROKER)

    const exchange = await this.findExchangeForTokens(tokenIn, tokenOut)
    if (!exchange) {
      throw new Error(`No exchange found for token pair ${tokenIn}/${tokenOut}`)
    }

    try {
      const amountOut = (await retryOperation(() =>
        this.provider.readContract({
          address: brokerAddress,
          abi: BROKER_ABI,
          functionName: 'getAmountOut',
          args: [
            biPoolManagerAddress,
            exchange.exchangeId,
            tokenIn,
            tokenOut,
            amountIn,
          ],
        })
      )) as string

      return amountOut
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Insufficient balance in reserve')) {
          throw new Error('Insufficient liquidity in reserve')
        }
        if (error.message.includes('Trading is suspended')) {
          throw new Error('Trading is currently suspended for this pair')
        }
      }
      throw error
    }
  }

  /**
   * Helper function to find an exchange for a given token pair
   * @param tokenIn Address of the input token
   * @param tokenOut Address of the output token
   * @returns Exchange if found, null otherwise
   */
  private async findExchangeForTokens(
    tokenIn: string,
    tokenOut: string
  ): Promise<EnrichedExchange | null> {
    const exchanges = await this.getExchanges()

    return (
      exchanges.find(
        (e) =>
          (e.assets[0].address.toLowerCase() === tokenIn.toLowerCase() &&
            e.assets[1].address.toLowerCase() === tokenOut.toLowerCase()) ||
          (e.assets[1].address.toLowerCase() === tokenIn.toLowerCase() &&
            e.assets[0].address.toLowerCase() === tokenOut.toLowerCase())
      ) || null
    )
  }
}
