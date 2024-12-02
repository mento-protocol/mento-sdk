import { ProviderAdapter, EnrichedExchange, IERC20Token } from '../types'
import { BIPOOLMANAGER, getContractAddress } from '../constants'
import { BIPOOL_MANAGER_ABI } from '../abis'
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
}
