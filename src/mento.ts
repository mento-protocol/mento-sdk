import {
  IBroker,
  IBroker__factory,
  IExchangeProvider,
  IExchangeProvider__factory,
} from '@mento-protocol/mento-core-ts'
import { BigNumber, providers, Signer } from 'ethers'
import { Address } from './types'
import {
  getBrokerAddressFromRegistry,
  getSymbolFromTokenAddress,
  increaseAllowance,
} from './utils'

import { strict as assert } from 'assert'

export interface Exchange {
  providerAddr: Address
  id: string
  assets: Address[]
}

export interface Asset {
  address: Address
  symbol: string
}

export class Mento {
  private readonly signerOrProvider: Signer | providers.Provider
  private readonly broker: IBroker
  private exchanges: Exchange[]

  /**
   * This constructor is private, use the static create or createWithBrokerAddress methods
   * to create a new Mento instance
   * @param brokerAddress the address of the broker contract
   * @param provider an ethers provider
   * @param signer an optional ethers signer to execute swaps (must be connected to a provider)
   */
  private constructor(
    brokerAddress: Address,
    signerOrProvider: Signer | providers.Provider,
    exchanges?: Exchange[]
  ) {
    this.broker = IBroker__factory.connect(brokerAddress, signerOrProvider)
    this.signerOrProvider = signerOrProvider
    this.exchanges = exchanges || []
  }

  /**
   * Creates a new Mento object instance.
   * When constructed with only a Provider only read-only operations are supported
   * @param signerOrProvider an ethers signer or provider. A signer is required to execute swaps
   * @returns a new Mento object instance
   */
  static async create(signerOrProvider: Signer | providers.Provider) {
    const isSigner = Signer.isSigner(signerOrProvider)
    const isProvider = providers.Provider.isProvider(signerOrProvider)

    if (!isSigner && !isProvider) {
      throw new Error('A valid signer or provider must be provided')
    }

    if (isSigner) {
      if (!providers.Provider.isProvider(signerOrProvider.provider)) {
        throw new Error('Signer must be connected to a provider')
      }
    }

    return new Mento(
      await getBrokerAddressFromRegistry(signerOrProvider),
      signerOrProvider
    )
  }

  /**
   * Create a new Mento object instance given a specific broker address
   * When constructed with only a Provider only read-only operations are supported
   * @param brokerAddr the address of the broker contract
   * @param signerOrProvider an ethers signer or provider. A signer is required to execute swaps
   * @returns a new Mento object instance
   */
  static createWithBrokerAddress(
    brokerAddr: Address,
    signerOrProvider: Signer | providers.Provider,
    exchanges?: Exchange[]
  ) {
    const isSigner = Signer.isSigner(signerOrProvider)
    const isProvider = providers.Provider.isProvider(signerOrProvider)

    if (!isSigner && !isProvider) {
      throw new Error('A valid signer or provider must be provided')
    }

    if (isSigner) {
      if (!providers.Provider.isProvider(signerOrProvider.provider)) {
        throw new Error('Signer must be connected to a provider')
      }
    }

    return new Mento(brokerAddr, signerOrProvider, exchanges)
  }

  /**
   * Returns a list of all the pairs that can be traded on Mento
   * @returns The list of tradeable pairs in the form of [{address, symbol}]
   */
  async getTradeablePairs(): Promise<[Asset, Asset][]> {
    const exchanges = await this.getExchanges()
    const pairs: [Asset, Asset][] = []

    for (const exchange of exchanges) {
      const asset0 = exchange.assets[0]
      const asset1 = exchange.assets[1]
      const symbols = await Promise.all([
        getSymbolFromTokenAddress(asset0, this.signerOrProvider),
        getSymbolFromTokenAddress(asset1, this.signerOrProvider),
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
    return this.broker.getAmountIn(
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
    return this.broker.getAmountOut(
      exchange.providerAddr,
      exchange.id,
      tokenIn,
      tokenOut,
      amountIn
    )
  }

  /**
   * Increases the broker's trading allowance for the given token
   * @param token the token to increase the allowance for
   * @param amount the amount to increase the allowance by
   * @returns the populated TransactionRequest object
   */
  async increaseTradingAllowance(
    token: Address,
    amount: BigNumber
  ): Promise<providers.TransactionRequest> {
    if (!Signer.isSigner(this.signerOrProvider)) {
      throw new Error(
        'A signer is required to populate the increaseAllowance tx object'
      )
    }

    const spender = this.broker.address
    const tx = await increaseAllowance(
      token,
      spender,
      amount,
      this.signerOrProvider
    )

    // The contract call doesn't populate all of the signer fields, so we need an extra call for the signer
    return this.signerOrProvider.populateTransaction(tx)
  }

  /**
   * Returns a token swap populated tx object with a fixed amount of tokenIn and a minimum amount of tokenOut
   * Submitting the transaction to execute the swap is left to the consumer
   * @param tokenIn the token to be sold
   * @param tokenOut the token to be bought
   * @param amountIn the amount of tokenIn to be sold
   * @param amountOutMin the minimum amount of tokenOut to be bought
   * @returns the populated TransactionRequest object
   */
  async swapIn(
    tokenIn: Address,
    tokenOut: Address,
    amountIn: BigNumber,
    amountOutMin: BigNumber
  ): Promise<providers.TransactionRequest> {
    if (!Signer.isSigner(this.signerOrProvider)) {
      throw new Error('A signer is required to populate the swapIn tx object')
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

    // The broker's call doesn't populate all of the signer fields, so we need an extra call for the signer
    return this.signerOrProvider.populateTransaction(tx)
  }

  /**
   * Returns a token swap populated tx object with a maximum amount of tokenIn and a fixed amount of tokenOut
   * Submitting the transaction to execute the swap is left to the consumer
   * @param tokenIn the token to be sold
   * @param tokenOut the token to be bought
   * @param amountOut the amount of tokenOut to be bought
   * @param amountInMax the maximum amount of tokenIn to be sold
   * @returns the populated TransactionRequest object
   */
  async swapOut(
    tokenIn: Address,
    tokenOut: Address,
    amountOut: BigNumber,
    amountInMax: BigNumber
  ): Promise<providers.TransactionRequest> {
    if (!Signer.isSigner(this.signerOrProvider)) {
      throw new Error('A signer is required to populate the swapOut tx object')
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

    // The broker's call doesn't populate all of the signer fields, so we need an extra call for the signer
    return this.signerOrProvider.populateTransaction(tx)
  }

  /** Returns the Broker contract */
  getBroker(): IBroker {
    return this.broker
  }

  /**
   * Returns the list of exchanges available in Mento (cached)
   * @returns the list of exchanges
   */
  async getExchanges(): Promise<Exchange[]> {
    if (this.exchanges.length > 0) {
      return this.exchanges
    }

    const exchangeProvidersAddresses = await this.broker.getExchangeProviders()

    const exchanges: Exchange[] = (
      await Promise.all(
        exchangeProvidersAddresses.map((a) => this.getExchangesForProvider(a))
      )
    ).flat()

    this.exchanges = exchanges
    return exchanges
  }

  /**
   * Returns the list of exchanges for a given provider address
   * @returns list of exchanges
   */
  async getExchangesForProvider(providerAddr: Address): Promise<Exchange[]> {
    const exchangeProvider: IExchangeProvider =
      IExchangeProvider__factory.connect(providerAddr, this.signerOrProvider)
    const exchangesInProvider = await exchangeProvider.getExchanges()
    return exchangesInProvider.map((e) => {
      assert(e.assets.length === 2, 'Exchange must have 2 assets')
      return {
        providerAddr: providerAddr,
        id: e.exchangeId,
        assets: e.assets,
      }
    })
  }

  /**
   * Returns the Mento exchange (if any) for a given pair of tokens
   * @param token0 the first token
   * @param token1 the second token
   * @returns exchange
   */
  async getExchangeForTokens(
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

  /**
   * Returns a new Mento instance connected to the given signer or provider
   * Similar to contract.connect() in Ethers.js
   * @returns new Mento instance
   */
  connect(signerOrProvider: Signer | providers.Provider) {
    return new Mento(this.broker.address, signerOrProvider, this.exchanges)
  }
}
