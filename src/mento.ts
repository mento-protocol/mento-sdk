import {
  BiPoolManager__factory,
  Broker__factory,
  IBreakerBox__factory,
  IBroker,
  IBroker__factory,
  IExchangeProvider,
  IExchangeProvider__factory,
} from '@mento-protocol/mento-core-ts'
import { BigNumber, BigNumberish, providers, Signer } from 'ethers'
import {
  Address,
  TradingLimit,
  TradingLimitsConfig,
  TradingLimitsState,
} from './interfaces'
import { getLimits, getLimitsConfig, getLimitsState } from './limits'
import {
  getChainId,
  getDecimalsFromTokenAddress,
  getNameFromTokenAddress,
  getSymbolFromTokenAddress,
  increaseAllowance,
  validateSigner,
  validateSignerOrProvider,
} from './utils'

import { strict as assert } from 'assert'
import { IMentoRouter, IMentoRouter__factory } from 'mento-router-ts'
import { getAddress, Identifier } from './constants/addresses'
import {
  getCachedTradablePairs,
  TradablePairWithSpread,
} from './constants/tradablePairs'
import {
  buildConnectivityStructures,
  generateAllRoutes,
  selectOptimalRoutes,
} from './routeUtils'

export interface Exchange {
  providerAddr: Address
  id: string
  assets: Address[]
}

export interface Asset {
  address: Address
  symbol: string
}

export interface Token {
  address: Address
  symbol: string
  name: string
  decimals: number
}

export type TradablePairID = `${Address}-${Address}`
export interface TradablePair {
  id: TradablePairID
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
  private cachedChainId: number | null = null

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
    const chainId = await getChainId(signerOrProvider)
    const instance = new Mento(
      signerOrProvider,
      getAddress('Broker', chainId),
      getAddress('MentoRouter', chainId)
    )
    instance.cachedChainId = chainId
    return instance
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
  async getTradablePairs({
    cached = true,
  }: {
    cached?: boolean
  } = {}): Promise<[Asset, Asset][]> {
    return (await this.getTradablePairsWithPath({ cached })).map(
      (pair) => pair.assets
    )
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
      let pairId: TradablePairID
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
   * @param options - Optional parameters
   * @param options.cached - Whether to use cached data (default: true)
   * @param options.returnAllRoutes - Whether to return all possible routes or just the best one per pair (default: false)
   * @returns An array of TradablePair objects representing available trade routes.
   */
  async getTradablePairsWithPath({
    cached = true,
    returnAllRoutes = false,
  }: {
    cached?: boolean
    returnAllRoutes?: boolean
  } = {}): Promise<readonly (TradablePair | TradablePairWithSpread)[]> {
    // Try to get cached data first
    if (cached) {
      const cachedPairs = await this.getCachedTradablePairs()
      if (cachedPairs) return cachedPairs
    }

    // Generate routes from scratch
    const directPairs = await this.getDirectPairs()
    const connectivity = buildConnectivityStructures(directPairs)
    const allRoutes = generateAllRoutes(connectivity)

    return selectOptimalRoutes(
      allRoutes,
      returnAllRoutes,
      connectivity.addrToSymbol
    )
  }

  /**
   * Attempts to get cached tradable pairs for the current chain
   */
  private async getCachedTradablePairs(): Promise<
    readonly (TradablePair | TradablePairWithSpread)[] | undefined
  > {
    const chainId = await getChainId(this.signerOrProvider)
    return await getCachedTradablePairs(chainId)
  }

  /**
   * Returns a list of all unique tokens available on the current chain.
   * This method is synchronous and uses pre-cached token data.
   * For runtime fetching from the blockchain, use getTokensAsync().
   *
   * @returns An array of unique Token objects from the static cache.
   * @throws Error if no cached tokens are available for the current chain or if chainId is not yet initialized
   */
  getTokens(): Token[] {
    if (this.cachedChainId === null) {
      throw new Error(
        'Chain ID not yet initialized. Use Mento.create() to initialize the SDK, or use getTokensAsync() instead.'
      )
    }
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getCachedTokensSync } = require('./constants/tokens')
    return Array.from(getCachedTokensSync(this.cachedChainId))
  }

  /**
   * Fetches token metadata from the blockchain at runtime.
   * This method is async and makes blockchain calls to get fresh token data.
   * For synchronous access using cached data, use getTokens().
   *
   * @param options - Optional parameters
   * @param options.cached - Whether to use cached data (default: true).
   *                         If true, attempts to load from static cache first.
   * @returns A Promise resolving to an array of unique Token objects.
   */
  async getTokensAsync({
    cached = true,
  }: {
    cached?: boolean
  } = {}): Promise<Token[]> {
    // If cached is true, try to use the static cache first
    if (cached) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { getCachedTokens } = require('./constants/tokens')
      const chainId = await this.chainId()
      const cachedTokens = await getCachedTokens(chainId)
      if (cachedTokens) {
        return Array.from(cachedTokens)
      }
    }

    // Fall back to fetching from blockchain
    const tradablePairs = await this.getTradablePairsWithPath({ cached: false })
    // Collect unique token addresses
    const uniqueAddresses = new Set<Address>(
      tradablePairs.flatMap((pair) => pair.assets.map((asset) => asset.address))
    )

    // Fetch token metadata for each unique address
    const tokens = await Promise.all(
      Array.from(uniqueAddresses).map(async (address) => {
        const [symbol, name, decimals] = await Promise.all([
          getSymbolFromTokenAddress(address, this.signerOrProvider),
          getNameFromTokenAddress(address, this.signerOrProvider),
          getDecimalsFromTokenAddress(address, this.signerOrProvider),
        ])

        return {
          address,
          symbol,
          name,
          decimals,
        }
      })
    )

    // Sort by symbol
    return tokens.sort((a, b) => a.symbol.localeCompare(b.symbol))
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
    const allPairs = await this.getTradablePairsWithPath()

    // Find the pair for these tokens
    const pair = allPairs.find((p) => {
      // Check if the pair connects tokenIn to tokenOut
      if (p.assets[0].address === tokenIn && p.assets[1].address === tokenOut) {
        return true
      }
      // Check reverse direction
      if (p.assets[0].address === tokenOut && p.assets[1].address === tokenIn) {
        return true
      }
      return false
    })

    if (!pair) {
      throw new Error(
        `No pair found for tokens ${tokenIn} and ${tokenOut}. They may not have a tradable path.`
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

  async getAddress(identifier: Identifier): Promise<Address> {
    return getAddress(identifier, await this.chainId())
  }

  async chainId(): Promise<number> {
    if (this.cachedChainId == null) {
      this.cachedChainId = await getChainId(this.signerOrProvider)
    }
    return this.cachedChainId
  }
}
