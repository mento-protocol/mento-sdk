import {
  BiPoolManager__factory,
  Broker__factory,
  IBreakerBox__factory,
  IBroker,
  IBroker__factory,
  IExchangeProvider,
  IExchangeProvider__factory,
} from '@mento-protocol/mento-core-ts'
import { BigNumber, BigNumberish, Signer, providers } from 'ethers'
import {
  Address,
  TradingLimit,
  TradingLimitsConfig,
  TradingLimitsState,
} from './interfaces'
import { getLimits, getLimitsConfig, getLimitsState } from './limits'
import {
  getBrokerAddressFromRegistry,
  getChainId,
  getSymbolFromTokenAddress,
  increaseAllowance,
  validateSigner,
  validateSignerOrProvider,
} from './utils'

import { strict as assert } from 'assert'
import { IMentoRouter, IMentoRouter__factory } from 'mento-router-ts'
import { getAddress } from './constants/addresses'
import { getCachedTradablePairs } from './constants/tradablePairs'

export interface Exchange {
  providerAddr: Address
  id: string
  assets: Address[]
}

export interface Asset {
  address: Address
  symbol: string
}

export interface TradablePair {
  id: string
  assets: [Asset, Asset]
  path: Array<{
    providerAddr: Address
    id: string
    assets: [Address, Address]
  }>
}

export class Mento {
  private readonly signerOrProvider: Signer | providers.Provider
  private readonly broker: IBroker
  private readonly router: IMentoRouter
  private exchanges: Exchange[]

  /**
   * This constructor is private, use the static create or createWithParams methods
   * to create a new Mento instance
   * @param signerOrProvider an ethers provider or connected signer
   * @param brokerAddress the address of the broker contract
   * @param exchanges exchange data for the broker
   */
  private constructor(
    signerOrProvider: Signer | providers.Provider,
    brokerAddress: Address,
    routerAddress: Address,
    exchanges?: Exchange[]
  ) {
    this.signerOrProvider = signerOrProvider
    this.broker = IBroker__factory.connect(brokerAddress, signerOrProvider)
    this.router = IMentoRouter__factory.connect(routerAddress, signerOrProvider)
    this.exchanges = exchanges || []
  }

  /**
   * Creates a new Mento object instance.
   * When constructed with only a Provider only read-only operations are supported
   * @param signerOrProvider an ethers signer or provider. A signer is required to execute swaps
   * @returns a new Mento object instance
   */
  static async create(signerOrProvider: Signer | providers.Provider) {
    validateSignerOrProvider(signerOrProvider)
    return new Mento(
      signerOrProvider,
      await getBrokerAddressFromRegistry(signerOrProvider),
      await getAddress('MentoRouter', await getChainId(signerOrProvider))
    )
  }

  /**
   * Create a new Mento object instance given a broker address and optional exchanges data
   * When constructed with a Provider, only read-only operations are supported
   * @param signerOrProvider an ethers signer or provider. A signer is required to execute swaps
   * @param brokerAddr the address of the broker contract
   * @param exchanges the exchanges data for the broker
   * @returns a new Mento object instance
   */
  static createWithParams(
    signerOrProvider: Signer | providers.Provider,
    brokerAddr: Address,
    routerAddr: Address,
    exchanges?: Exchange[]
  ) {
    validateSignerOrProvider(signerOrProvider)
    return new Mento(signerOrProvider, brokerAddr, routerAddr, exchanges)
  }

  /**
   * Returns a new Mento instance connected to the given signer
   * @param signer an ethers signer
   * @returns new Mento object instance
   */
  connectSigner(signer: Signer) {
    validateSigner(signer)
    return new Mento(
      signer,
      this.broker.address,
      this.router.address,
      this.exchanges
    )
  }

  /**
   * Get tradable pairs for backwards compatibility
   * @returns an array of Asset pairs
   */
  async getTradablePairs(options?: {
    cached?: boolean
  }): Promise<[Asset, Asset][]> {
    return (
      await this.getTradablePairsWithPath({ cached: options?.cached ?? true })
    ).map((pair) => pair.assets)
  }

  /**
   * Returns a list of all tradable pairs on Mento via direct exchanges.
   * Each pair is represented using the TradablePair interface, with its id
   * (a concatenation of the two asset symbols in alphabetical order),
   * the two Asset objects, and a path (an array with a single direct exchange hop).
   * @returns An array of direct TradablePair objects.
   */
  async getDirectPairs(): Promise<TradablePair[]> {
    const exchanges = await this.getExchanges()
    // Map from pair id (symbol-symbol) to its TradablePair
    const directPairsMap = new Map<string, TradablePair>()

    for (const exchange of exchanges) {
      const [token0, token1] = exchange.assets
      const [symbol0, symbol1] = await Promise.all([
        getSymbolFromTokenAddress(token0, this.signerOrProvider),
        getSymbolFromTokenAddress(token1, this.signerOrProvider),
      ])
      // Determine canonical order by symbol
      let assets: [Asset, Asset]
      let pairId: string
      if (symbol0 <= symbol1) {
        assets = [
          { address: token0, symbol: symbol0 },
          { address: token1, symbol: symbol1 },
        ]
        pairId = `${symbol0}-${symbol1}`
      } else {
        assets = [
          { address: token1, symbol: symbol1 },
          { address: token0, symbol: symbol0 },
        ]
        pairId = `${symbol1}-${symbol0}`
      }

      const pathEntry = {
        providerAddr: exchange.providerAddr,
        id: exchange.id,
        assets: exchange.assets as [Address, Address],
      }

      if (directPairsMap.has(pairId)) {
        directPairsMap.get(pairId)!.path.push(pathEntry)
      } else {
        directPairsMap.set(pairId, { id: pairId, assets, path: [pathEntry] })
      }
    }

    return Array.from(directPairsMap.values())
  }

  /**
   * Returns a list of all tradable pairs on Mento, including those achievable
   * via two-hop routes. For two-hop pairs, the path will contain two exchange hops.
   * Each TradablePair contains an id (the concatenation of the two asset symbols in alphabetical order),
   * the two Asset objects, and an array of exchange details for each hop.
   * @returns An array of TradablePair objects representing available trade routes.
   */
  async getTradablePairsWithPath(options?: {
    cached?: boolean
  }): Promise<readonly TradablePair[]> {
    // Get tradable pairs from cache if available.
    if (options?.cached) {
      const value = getCachedTradablePairs(
        await getChainId(this.signerOrProvider)
      )
      if (value) {
        return value
      }
    }

    // Retrieve direct pairs first.
    const directPairs = await this.getDirectPairs()

    // Build helper maps:
    // assetMap: maps token address to its Asset details.
    const assetMap = new Map<string, Asset>()
    // directPathMap: maps a sorted pair of token addresses (by address) to a direct exchange hop.
    const directPathMap = new Map<
      string,
      { providerAddr: Address; id: string; assets: [Address, Address] }
    >()
    // graph: maps a token address to the set of addresses it connects to directly.
    const graph = new Map<string, Set<string>>()

    for (const pair of directPairs) {
      const [assetA, assetB] = pair.assets
      assetMap.set(assetA.address, assetA)
      assetMap.set(assetB.address, assetB)
      const sortedAddresses = [assetA.address, assetB.address].sort().join('-')
      if (!directPathMap.has(sortedAddresses)) {
        // Use the first available direct hop for the connectivity graph.
        directPathMap.set(sortedAddresses, pair.path[0])
      }
      if (!graph.has(assetA.address)) graph.set(assetA.address, new Set())
      if (!graph.has(assetB.address)) graph.set(assetB.address, new Set())
      graph.get(assetA.address)!.add(assetB.address)
      graph.get(assetB.address)!.add(assetA.address)
    }

    // Initialize tradablePairsMap with direct pairs keyed by their id (symbol-symbol).
    const tradablePairsMap = new Map<string, TradablePair>()
    for (const pair of directPairs) {
      tradablePairsMap.set(pair.id, pair)
    }

    // Generate two-hop pairs using the connectivity graph.
    // For each potential route: start -> intermediate -> end, add a two-hop pair
    // only if no direct route (i.e. same symbol pair) exists.
    for (const [start, neighbors] of graph.entries()) {
      for (const intermediate of neighbors) {
        const secondHopNeighbors = graph.get(intermediate)
        if (!secondHopNeighbors) continue
        for (const end of secondHopNeighbors) {
          if (end === start) continue // Avoid self-loop.
          const assetStart = assetMap.get(start)
          const assetEnd = assetMap.get(end)
          if (!assetStart || !assetEnd) continue
          // Determine canonical pair id based on asset symbols.
          const sortedSymbols = [assetStart.symbol, assetEnd.symbol].sort()
          const pairId = `${sortedSymbols[0]}-${sortedSymbols[1]}`
          if (tradablePairsMap.has(pairId)) continue // Skip if a direct pair exists.

          // Retrieve the direct hops for the two segments.
          const hop1Key = [start, intermediate].sort().join('-')
          const hop2Key = [intermediate, end].sort().join('-')
          const hop1 = directPathMap.get(hop1Key)
          const hop2 = directPathMap.get(hop2Key)
          if (!hop1 || !hop2) continue

          let assets: [Asset, Asset]
          if (assetStart.symbol <= assetEnd.symbol) {
            assets = [assetStart, assetEnd]
          } else {
            assets = [assetEnd, assetStart]
          }

          tradablePairsMap.set(pairId, {
            id: pairId,
            assets,
            path: [hop1, hop2],
          })
        }
      }
    }

    return Array.from(tradablePairsMap.values())
  }

  /**
   * Returns the amount of tokenIn to be sold to buy amountOut of tokenOut.
   * If the provided tradablePair has a single (direct) pricing path, then direct pricing is used.
   * Otherwise, routed pricing via the MentoRouter is applied.
   * @param tokenIn the token to be sold
   * @param tokenOut the token to be bought
   * @param amountOut the desired amount of tokenOut to be obtained
   * @param tradablePair the TradablePair object containing the pricing path information
   * @returns the amount of tokenIn to be sold
   */
  async getAmountIn(
    tokenIn: Address,
    tokenOut: Address,
    amountOut: BigNumberish,
    tradablePair?: TradablePair
  ): Promise<BigNumber> {
    if (!tradablePair) {
      tradablePair = await this.findPairForTokens(tokenIn, tokenOut)
    }
    if (tradablePair.path.length === 1) {
      return this.getAmountInDirect(tokenIn, tokenOut, amountOut, tradablePair)
    } else {
      return this.getAmountInRouted(tokenIn, tokenOut, amountOut, tradablePair)
    }
  }

  /**
   * Returns the amount of tokenOut to be bought by selling amountIn of tokenIn.
   * If the provided tradablePair has a single (direct) pricing path, then direct pricing is used.
   * Otherwise, routed pricing via the MentoRouter is applied.
   * @param tokenIn the token to be sold
   * @param tokenOut the token to be bought
   * @param amountIn the amount of tokenIn to be sold
   * @param tradablePair the TradablePair object containing the pricing path information
   * @returns the amount of tokenOut to be bought
   */
  async getAmountOut(
    tokenIn: Address,
    tokenOut: Address,
    amountIn: BigNumberish,
    tradablePair?: TradablePair
  ): Promise<BigNumber> {
    if (!tradablePair) {
      tradablePair = await this.findPairForTokens(tokenIn, tokenOut)
    }
    if (tradablePair.path.length === 1) {
      return this.getAmountOutDirect(tokenIn, tokenOut, amountIn, tradablePair)
    } else {
      return this.getAmountOutRouted(tokenIn, tokenOut, amountIn, tradablePair)
    }
  }

  /**
   * Internal method for direct pricing: retrieves the exchange for the given tokens
   * and returns the amountIn using the broker.
   */
  private async getAmountInDirect(
    tokenIn: Address,
    tokenOut: Address,
    amountOut: BigNumberish,
    tradablePair: TradablePair
  ): Promise<BigNumber> {
    return this.broker.getAmountIn(
      tradablePair.path[0].providerAddr,
      tradablePair.path[0].id,
      tokenIn,
      tokenOut,
      amountOut
    )
  }

  /**
   * Internal method for direct pricing: retrieves the exchange for the given tokens
   * and returns the amountOut using the broker.
   */
  private async getAmountOutDirect(
    tokenIn: Address,
    tokenOut: Address,
    amountIn: BigNumberish,
    tradablePair: TradablePair
  ): Promise<BigNumber> {
    return this.broker.getAmountOut(
      tradablePair.path[0].providerAddr,
      tradablePair.path[0].id,
      tokenIn,
      tokenOut,
      amountIn
    )
  }

  /**
   * Internal method for routed pricing: uses the MentoRouter to determine the required tokenIn
   * for obtaining amountOut through a multi-hop route specified in tradablePair.path.
   */
  private async getAmountInRouted(
    tokenIn: Address,
    tokenOut: Address,
    amountOut: BigNumberish,
    tradablePair: TradablePair
  ): Promise<BigNumber> {
    const steps = this.buildSteps(tokenIn, tokenOut, tradablePair)
    return this.router.getAmountIn(amountOut, steps)
  }

  /**
   * Internal method for routed pricing: uses the MentoRouter to determine the amountOut
   * obtainable by selling amountIn through a multi-hop route specified in tradablePair.path.
   */
  private async getAmountOutRouted(
    tokenIn: Address,
    tokenOut: Address,
    amountIn: BigNumberish,
    tradablePair: TradablePair
  ): Promise<BigNumber> {
    const steps = this.buildSteps(tokenIn, tokenOut, tradablePair)
    return this.router.getAmountOut(amountIn, steps)
  }

  /**
   * Increases the broker's trading allowance for the given token
   * @param token the token to increase the allowance for
   * @param amount the amount to increase the allowance by
   * @returns the populated TransactionRequest object
   */
  async increaseTradingAllowance(
    tokenIn: Address,
    amount: BigNumberish,
    tradablePair?: TradablePair
  ): Promise<providers.TransactionRequest> {
    const spender =
      !tradablePair || tradablePair?.path.length == 1
        ? this.broker.address
        : this.router.address
    const tx = await increaseAllowance(
      tokenIn,
      spender,
      amount,
      this.signerOrProvider
    )

    if (Signer.isSigner(this.signerOrProvider)) {
      // The contract call doesn't populate all of the signer fields, so we need an extra call for the signer
      return this.signerOrProvider.populateTransaction(tx)
    } else {
      return tx
    }
  }

  /**
   * Returns a token swap populated tx object with a fixed amount of tokenIn and a minimum amount of tokenOut.
   * If the tradablePair contains a single-hop route, a direct swap is executed using swapExactTokensForTokens on the broker.
   * Otherwise, a routed swap is executed via the router.
   * @param tokenIn the token to be sold
   * @param tokenOut the token to be bought
   * @param amountIn the amount of tokenIn to be sold
   * @param amountOutMin the minimum amount of tokenOut to be bought
   * @param tradablePair the tradable pair details to determine routing
   * @returns the populated TransactionRequest object
   */
  async swapIn(
    tokenIn: Address,
    tokenOut: Address,
    amountIn: BigNumberish,
    amountOutMin: BigNumberish,
    tradablePair?: TradablePair
  ): Promise<providers.TransactionRequest> {
    if (!tradablePair) {
      tradablePair = await this.findPairForTokens(tokenIn, tokenOut)
    }
    if (tradablePair.path.length === 1) {
      return this.swapInDirect(tokenIn, tokenOut, amountIn, amountOutMin)
    } else {
      return this.swapInRouted(
        tokenIn,
        tokenOut,
        amountIn,
        amountOutMin,
        tradablePair
      )
    }
  }

  private async swapInDirect(
    tokenIn: Address,
    tokenOut: Address,
    amountIn: BigNumberish,
    amountOutMin: BigNumberish
  ): Promise<providers.TransactionRequest> {
    const exchange = await this.getExchangeForTokens(tokenIn, tokenOut)
    const tx = await this.broker.populateTransaction.swapIn(
      exchange.providerAddr,
      exchange.id,
      tokenIn,
      tokenOut,
      amountIn,
      amountOutMin
    )
    return Signer.isSigner(this.signerOrProvider)
      ? this.signerOrProvider.populateTransaction(tx)
      : tx
  }

  private async swapInRouted(
    tokenIn: Address,
    tokenOut: Address,
    amountIn: BigNumberish,
    amountOutMin: BigNumberish,
    tradablePair: TradablePair
  ): Promise<providers.TransactionRequest> {
    const steps = this.buildSteps(tokenIn, tokenOut, tradablePair)
    const tx = await this.router.populateTransaction.swapExactTokensForTokens(
      amountIn,
      amountOutMin,
      steps
    )
    return Signer.isSigner(this.signerOrProvider)
      ? this.signerOrProvider.populateTransaction(tx)
      : tx
  }

  /**
   * Returns a token swap populated tx object with a maximum amount of tokenIn and a fixed amount of tokenOut.
   * If the tradablePair contains a single-hop route, a direct swap is executed using swapTokensForExactTokens on the broker.
   * Otherwise, a routed swap is executed via the router.
   * @param tokenIn the token to be sold
   * @param tokenOut the token to be bought
   * @param amountOut the amount of tokenOut to be bought
   * @param amountInMax the maximum amount of tokenIn to be sold
   * @returns the populated TransactionRequest object
   */
  async swapOut(
    tokenIn: Address,
    tokenOut: Address,
    amountOut: BigNumberish,
    amountInMax: BigNumberish,
    tradablePair?: TradablePair
  ): Promise<providers.TransactionRequest> {
    if (!tradablePair) {
      tradablePair = await this.findPairForTokens(tokenIn, tokenOut)
    }
    if (tradablePair.path.length === 1) {
      return this.swapOutDirect(tokenIn, tokenOut, amountOut, amountInMax)
    } else {
      return this.swapOutRouted(
        tokenIn,
        tokenOut,
        amountOut,
        amountInMax,
        tradablePair
      )
    }
  }

  private async swapOutDirect(
    tokenIn: Address,
    tokenOut: Address,
    amountOut: BigNumberish,
    amountInMax: BigNumberish
  ): Promise<providers.TransactionRequest> {
    const exchange = await this.getExchangeForTokens(tokenIn, tokenOut)
    const tx = await this.broker.populateTransaction.swapOut(
      exchange.providerAddr,
      exchange.id,
      tokenIn,
      tokenOut,
      amountOut,
      amountInMax
    )
    return Signer.isSigner(this.signerOrProvider)
      ? this.signerOrProvider.populateTransaction(tx)
      : tx
  }

  private async swapOutRouted(
    tokenIn: Address,
    tokenOut: Address,
    amountOut: BigNumberish,
    amountInMax: BigNumberish,
    tradablePair: TradablePair
  ): Promise<providers.TransactionRequest> {
    const steps = this.buildSteps(tokenIn, tokenOut, tradablePair)
    const tx = await this.router.populateTransaction.swapTokensForExactTokens(
      amountOut,
      amountInMax,
      steps
    )
    return Signer.isSigner(this.signerOrProvider)
      ? this.signerOrProvider.populateTransaction(tx)
      : tx
  }

  /**
   * Helper method to build the steps for a routed swap, ensuring proper token ordering
   * through the path segments
   */
  private buildSteps(
    tokenIn: Address,
    tokenOut: Address,
    tradablePair: TradablePair
  ) {
    let path = [...tradablePair.path]
    if (path[0].assets.includes(tokenOut)) {
      path = path.reverse()
    }
    return path.map((step, idx) => {
      const isFirstStep = idx === 0
      const isLastStep = idx === tradablePair.path.length - 1
      const prevStep = idx > 0 ? tradablePair.path[idx - 1] : null

      // For first step, ensure assetIn is tokenIn
      // For middle steps, ensure assetIn matches previous step's assetOut
      // For last step, ensure assetOut is tokenOut
      let [assetIn, assetOut] = step.assets

      if (isFirstStep && assetIn !== tokenIn) {
        ;[assetIn, assetOut] = [assetOut, assetIn]
      } else if (
        !isFirstStep &&
        !isLastStep &&
        assetIn !== prevStep!.assets[1]
      ) {
        ;[assetIn, assetOut] = [assetOut, assetIn]
      } else if (isLastStep && assetOut !== tokenOut) {
        ;[assetIn, assetOut] = [assetOut, assetIn]
      }

      return {
        exchangeProvider: step.providerAddr,
        exchangeId: step.id,
        assetIn,
        assetOut,
      }
    })
  }

  /**
   * Returns the mento instance's broker contract
   * @returns broker contract
   */
  getBroker(): IBroker {
    return this.broker
  }

  /**
   * Finds a tradable pair for the given input and output tokens
   * @param tokenIn the input token address
   * @param tokenOut the output token address
   * @returns the tradable pair containing the path between the tokens
   * @throws if no path is found between the tokens
   */
  async findPairForTokens(
    tokenIn: Address,
    tokenOut: Address
  ): Promise<TradablePair> {
    const pair = (await this.getTradablePairsWithPath()).find(
      (p) =>
        // Direct path
        (p.path.length === 1 &&
          p.path[0].assets.includes(tokenIn) &&
          p.path[0].assets.includes(tokenOut)) ||
        // Routed path
        (p.path.length === 2 &&
          ((p.path[0].assets.includes(tokenIn) &&
            p.path[1].assets.includes(tokenOut)) ||
            (p.path[0].assets.includes(tokenOut) &&
              p.path[1].assets.includes(tokenIn))))
    )

    if (!pair) {
      throw new Error(
        `No tradable pair found for tokens ${tokenIn} and ${tokenOut}`
      )
    }

    return pair
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
   * Returns the list of exchanges for a given exchange provider address
   * @returns list of exchanges
   */
  async getExchangesForProvider(
    exchangeProviderAddr: Address
  ): Promise<Exchange[]> {
    const exchangeProvider: IExchangeProvider =
      IExchangeProvider__factory.connect(
        exchangeProviderAddr,
        this.signerOrProvider
      )
    const exchangesInProvider = await exchangeProvider.getExchanges()
    return exchangesInProvider.map((e) => {
      assert(e.assets.length === 2, 'Exchange must have 2 assets')
      return {
        providerAddr: exchangeProviderAddr,
        id: e.exchangeId,
        assets: e.assets,
      }
    })
  }

  /**
   * Returns the Mento exchange (if any) for a given pair of tokens
   * @param token0 the address of the first token
   * @param token1 the address of the second token
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
   * Returns the Mento exchange for a given exchange id
   * @param exchangeId the id of the exchange
   * @returns the exchange with the given id
   */
  async getExchangeById(exchangeId: string): Promise<Exchange> {
    const exchanges = (await this.getExchanges()).filter(
      (e) => e.id === exchangeId
    )

    if (exchanges.length === 0) {
      throw Error(`No exchange found for id ${exchangeId}`)
    }

    assert(
      exchanges.length === 1,
      `More than one exchange found with id ${exchangeId}`
    )
    return exchanges[0]
  }

  /**
   * Returns whether trading is enabled in the given mode for a given exchange id
   * @param exchangeId the id of the exchange
   * @param mode the trading mode
   * @returns true if trading is enabled in the given mode, false otherwise
   */
  async isTradingEnabled(exchangeId: string): Promise<boolean> {
    const exchange = await this.getExchangeById(exchangeId)
    const biPoolManager = BiPoolManager__factory.connect(
      exchange.providerAddr,
      this.signerOrProvider
    )

    const [breakerBoxAddr, exchangeConfig] = await Promise.all([
      biPoolManager.breakerBox(),
      biPoolManager.getPoolExchange(exchangeId),
    ])

    const breakerBox = IBreakerBox__factory.connect(
      breakerBoxAddr,
      this.signerOrProvider
    )
    const currentMode = await breakerBox.getRateFeedTradingMode(
      exchangeConfig.config.referenceRateFeedID
    )

    const BI_DIRECTIONAL_TRADING_MODE = 0
    return currentMode == BI_DIRECTIONAL_TRADING_MODE
  }

  /**
   * Return the trading limits for a given exchange id. Each limit is an object with the following fields:
   * asset: the address of the asset with the limit
   * maxIn: the maximum amount of the asset that can be sold
   * maxOut: the maximum amount of the asset that can be bought
   * until: the timestamp until which the limit is valid
   * @param exchangeId the id of the exchange
   * @returns the list of trading limits
   */
  async getTradingLimits(exchangeId: string): Promise<TradingLimit[]> {
    const exchange = await this.getExchangeById(exchangeId)
    const broker = Broker__factory.connect(
      this.broker.address,
      this.signerOrProvider
    )

    const asset0Limits = await getLimits(broker, exchangeId, exchange.assets[0])
    const asset1Limits = await getLimits(broker, exchangeId, exchange.assets[1])

    return asset0Limits.concat(asset1Limits)
  }

  /**
   * Returns the trading limits configurations for a given exchange id
   * @param exchangeId the id of the exchange
   * @returns the trading limits configuration
   */
  async getTradingLimitConfig(
    exchangeId: string
  ): Promise<TradingLimitsConfig[]> {
    const exchange = await this.getExchangeById(exchangeId)
    const broker = Broker__factory.connect(
      this.broker.address,
      this.signerOrProvider
    )

    const cfgs = []
    for (const asset of exchange.assets) {
      const limitCfg = await getLimitsConfig(broker, exchangeId, asset)
      const isLimitConfigured = limitCfg.flags > 0
      if (isLimitConfigured) {
        cfgs.push(limitCfg)
      }
    }

    return cfgs
  }

  /**
   * Returns the trading limits state for a given exchange id
   * @param exchangeId the id of the exchange
   * @returns the trading limits state
   */
  async getTradingLimitState(
    exchangeId: string
  ): Promise<TradingLimitsState[]> {
    const broker = Broker__factory.connect(
      this.broker.address,
      this.signerOrProvider
    )

    const configuredLimitCfgs = await this.getTradingLimitConfig(exchangeId)

    return await Promise.all(
      configuredLimitCfgs.map(
        async (cfg) => await getLimitsState(broker, exchangeId, cfg.asset)
      )
    )
  }
}
