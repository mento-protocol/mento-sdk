import { Provider } from '@ethersproject/providers'
import {
  IBroker,
  IBroker__factory,
  IExchangeProvider,
  IExchangeProvider__factory,
} from '@mentolabs/core'
import { BigNumber } from 'ethers'
import { strict as assert } from 'assert'
import { getBrokerAddressFromRegistry } from './utils'

interface Asset {
  address: string
  symbol: string
}

interface Exchange {
  exchangeManagerAddress: string
  exchangeId: string
  assets: string[]
}

export class Broker {
  private readonly provider: Provider
  private readonly broker: IBroker
  private exchanges: Exchange[]

  constructor(provider: Provider, brokerAddress: string) {
    this.provider = provider
    this.broker = IBroker__factory.connect(brokerAddress, provider)
    this.exchanges = new Array<Exchange>()
  }

  /**
   * Create a new Broker instance
   * @param provider
   * @returns
   */
  static async create(provider: Provider) {
    return new Broker(provider, await getBrokerAddressFromRegistry(provider))
  }

  async getExchanges(): Promise<Exchange[]> {
    if (this.exchanges.length > 0) {
      return this.exchanges
    }

    let exchanges: Exchange[] = []
    let exchangeManagersAddresses = await this.broker.getExchangeProviders()
    for (let exchangeManagerAddr of exchangeManagersAddresses) {
      let exchangeManager: IExchangeProvider =
        IExchangeProvider__factory.connect(exchangeManagerAddr, this.provider)
      let exchangesInManager = await exchangeManager.getExchanges()
      for (let exchange of exchangesInManager) {
        exchanges.push({
          exchangeManagerAddress: exchangeManagerAddr,
          exchangeId: exchange.exchangeId,
          assets: exchange.assets,
        })
      }
    }

    this.exchanges = exchanges
    return exchanges
  }

  async getAssets(): Promise<Asset[]> {
    let assets: Set<Asset> = new Set<Asset>()

    const exchanges = await this.getExchanges()
    for (let exchange of exchanges) {
      exchange.assets.forEach((a) => assets.add({ address: a, symbol: 'sds' }))
    }
    return Array.from(assets)
  }

  async getTradeablePairs(): Promise<[string, string][]> {
    let assetPairs: [string, string][] = []

    const exchanges = await this.getExchanges()
    for (let exchange of exchanges) {
      assert(exchange.assets.length == 2)
      assetPairs.push([exchange.assets[0], exchange.assets[1]])
    }
    return assetPairs
  }

  /**
   * Returns the amount of tokenIn to be sold to buy amountOut of tokenOut
   * @param tokenIn
   * @param tokenOut
   * @param amountOut
   * @returns
   */
  async getAmountIn(
    tokenIn: string,
    tokenOut: string,
    amountOut: BigNumber
  ): Promise<BigNumber> {
    const exchange = await this.getExchangeForTokens(tokenIn, tokenOut)
    // TODO: remove callStatic once vibisility of the function is updated
    return await this.broker.callStatic.getAmountIn(
      exchange.exchangeManagerAddress,
      exchange.exchangeId,
      tokenIn,
      tokenOut,
      amountOut
    )
  }

  /**
   * Returns the amount of tokenOut to be bought by selling amountIn of tokenIn
   * @param tokenIn
   * @param tokenOut
   * @param amountIn
   * @returns
   */
  async getAmountOut(
    tokenIn: string,
    tokenOut: string,
    amountIn: BigNumber
  ): Promise<BigNumber> {
    const exchange = await this.getExchangeForTokens(tokenIn, tokenOut)
    return await this.broker.callStatic.getAmountOut(
      exchange.exchangeManagerAddress,
      exchange.exchangeId,
      tokenIn,
      tokenOut,
      amountIn
    )
  }

  /**
   * Returns the exchange for the provided pairs
   * @param tokenIn
   * @param tokenOut
   * @returns
   */
  private async getExchangeForTokens(
    tokenIn: string,
    tokenOut: string
  ): Promise<Exchange> {
    const exchanges = (await this.getExchanges()).filter(
      (e) => e.assets.includes(tokenIn) && e.assets.includes(tokenOut)
    )

    if (exchanges.length == 0) {
      throw Error(`No exchange found for ${tokenIn} and ${tokenOut}`)
    }

    assert(
      exchanges.length === 1,
      `More than one exchange found for ${tokenIn} and ${tokenOut}`
    )
    return exchanges[0]
  }
}
