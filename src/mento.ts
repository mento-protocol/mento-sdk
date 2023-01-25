import { BigNumber, ContractTransaction, Signer, providers } from 'ethers'
import {
  IBroker,
  IBroker__factory,
  IExchangeProvider,
  IExchangeProvider__factory,
} from '@mento-protocol/mento-core-ts'
import {
  getBrokerAddressFromRegistry,
  getSymbolFromTokenAddress,
} from './utils'

import { strict as assert } from 'assert'

interface Exchange {
  providerAddr: Address
  id: Address
  assets: string[]
}

interface Asset {
  address: Address
  symbol: string
}

export class Mento {
  private readonly provider: providers.Provider
  private readonly signer?: Signer
  private readonly broker: IBroker
  private exchanges: Exchange[]

  /**
   * This constructor is private, use the static create method to create a new Mento instance
   * @param brokerAddress the address of the broker contract
   * @param provider an ethers provider
   * @param signer an optional ethers signer to execute swaps (must be connected to a provider)
   */
  private constructor(
    brokerAddress: Address,
    provider: providers.Provider,
    signer?: Signer
  ) {
    this.broker = IBroker__factory.connect(brokerAddress, provider)
    this.provider = provider
    this.signer = signer

    this.exchanges = new Array<Exchange>()
  }

  /**
   * Create a new Mento object instance
   * @param ethersProvider an ethers provider
   * @param ethersSigner an optional ethers signer to execute swaps (must be connected to a provider)
   * @returns a new Mento object instance
   */
  static async create(
    ethersProvider: providers.Provider,
    ethersSigner?: Signer
  ) {
    return new Mento(
      await getBrokerAddressFromRegistry(ethersProvider),
      ethersProvider,
      ethersSigner
    )
  }

  /**
   * Returns a list of all the pairs that can be traded on Mento
   * @returns The list of tradeable pairs in the form of [{address, symbol}]
   */
  async getTradeablePairs(): Promise<[Asset, Asset][]> {
    const exchanges = await this.getExchanges()
    let pairs: [Asset, Asset][] = []

    for (let exchange of exchanges) {
      const asset0 = exchange.assets[0]
      const asset1 = exchange.assets[1]
      let symbols = await Promise.all([
        getSymbolFromTokenAddress(this.provider, asset0),
        getSymbolFromTokenAddress(this.provider, asset1),
      ])
      pairs.push([
        { address: asset0, symbol: symbols[0] },
        { address: asset1, symbol: symbols[1] },
      ])
    }

    return pairs
  }

  /**
   * Returns the amount of tokenIn to be sold to buy amountOut of tokenOut
   * @param tokenIn the token to be sold
   * @param tokenOut the token to be bought
   * @param amountOut the amount of tokenOut to be bought
   * @returns the amount of tokenIn to be sold
   */
  async getAmountIn(
    tokenIn: Address,
    tokenOut: Address,
    amountOut: BigNumber
  ): Promise<BigNumber> {
    const exchange = await this.getExchangeForTokens(tokenIn, tokenOut)
    return await this.broker.getAmountIn(
      exchange.providerAddr,
      exchange.id,
      tokenIn,
      tokenOut,
      amountOut
    )
  }

  /**
   * Returns the amount of tokenOut to be bought by selling amountIn of tokenIn
   * @param tokenIn the token to be sold
   * @param tokenOut the token to be bought
   * @param amountIn the amount of tokenIn to be sold
   * @returns the amount of tokenOut to be bought
   */
  async getAmountOut(
    tokenIn: Address,
    tokenOut: Address,
    amountIn: BigNumber
  ): Promise<BigNumber> {
    const exchange = await this.getExchangeForTokens(tokenIn, tokenOut)
    return await this.broker.getAmountOut(
      exchange.providerAddr,
      exchange.id,
      tokenIn,
      tokenOut,
      amountIn
    )
  }

  /**
   * Executes a swap with a fixed amount of tokenIn and a minimum amount of tokenOut
   * @param tokenIn the token to be sold
   * @param tokenOut the token to be bought
   * @param amountIn the amount of tokenIn to be sold
   * @param amountOutMin the minimum amount of tokenOut to be bought
   * @returns an ethers TransactionResponse object
   */
  async swapIn(
    tokenIn: Address,
    tokenOut: Address,
    amountIn: BigNumber,
    amountOutMin: BigNumber
  ): Promise<providers.TransactionResponse> {
    if (!this.signer) {
      throw new Error('A signer is required to execute a swap')
    }

    if (!this.signer.provider) {
      throw new Error(
        'The signer must be connected to a provider to execute a swap'
      )
    }

    const exchange = await this.getExchangeForTokens(tokenIn, tokenOut)
    const tx = await this.broker.populateTransaction.swapIn(
      exchange.providerAddr,
      exchange.id,
      tokenIn,
      tokenOut,
      amountIn,
      amountOutMin
    )
    return await this.signer.sendTransaction(tx)
  }

  /**
   * Executes a token swap with a maximum amount of tokenIn and a fixed amount of tokenOut
   * @param tokenIn the token to be sold
   * @param tokenOut the token to be bought
   * @param amountOut the amount of tokenOut to be bought
   * @param amountInMax the maximum amount of tokenIn to be sold
   * @returns
   */
  async swapOut(
    tokenIn: Address,
    tokenOut: Address,
    amountOut: BigNumber,
    amountInMax: BigNumber
  ): Promise<ContractTransaction> {
    if (!this.signer) {
      throw new Error('A signer is required to execute a swap')
    }

    if (!this.signer.provider) {
      throw new Error(
        'The signer must be connected to a provider to execute a swap'
      )
    }

    const exchange = await this.getExchangeForTokens(tokenIn, tokenOut)
    const tx = await this.broker.populateTransaction.swapOut(
      exchange.providerAddr,
      exchange.id,
      tokenIn,
      tokenOut,
      amountOut,
      amountInMax
    )
    return await this.signer.sendTransaction(tx)
  }

  /**
   * Returns the list of exchanges available in Mento (cached)
   * @returns the list of exchanges
   */
  private async getExchanges(): Promise<Exchange[]> {
    if (this.exchanges.length > 0) {
      return this.exchanges
    }

    let exchanges: Exchange[] = []

    let exchangeProvidersAddresses = await this.broker.getExchangeProviders()
    for (let exchangeProviderAddr of exchangeProvidersAddresses) {
      let exchangeManager: IExchangeProvider =
        IExchangeProvider__factory.connect(exchangeProviderAddr, this.provider)
      let exchangesInManager = await exchangeManager.getExchanges()
      for (let exchange of exchangesInManager) {
        assert(exchange.assets.length === 2, 'Exchange must have 2 assets')

        exchanges.push({
          providerAddr: exchangeProviderAddr,
          id: exchange.exchangeId,
          assets: exchange.assets,
        })
      }
    }

    this.exchanges = exchanges
    return exchanges
  }

  /**
   * Returns the Mento exchange (if any) for a given pair of tokens
   * @param token0 the first token
   * @param token1 the second token
   * @returns
   */
  private async getExchangeForTokens(
    token0: Address,
    token1: Address
  ): Promise<Exchange> {
    const exchanges = (await this.getExchanges()).filter(
      (e) => e.assets.includes(token0) && e.assets.includes(token1)
    )

    if (exchanges.length === 0) {
      throw Error(`No exchange found for ${token0} and ${token1}`)
    }

    assert(
      exchanges.length === 1,
      `More than one exchange found for ${token0} and ${token1}`
    )
    return exchanges[0]
  }
}
