import {
  BiPoolManager__factory,
  IBreakerBox__factory,
  IBroker__factory,
  IExchangeProvider__factory,
} from '@mento-protocol/mento-core-ts'
import { Contract, Wallet, constants, ethers, providers, utils } from 'ethers'

import { IMentoRouter__factory } from 'mento-router-ts'
import { TradingMode } from './enums'
import { Mento, TradablePair } from './mento'

jest.mock('@mento-protocol/mento-core-ts', () => {
  return {
    IBroker__factory: {
      connect: jest.fn(),
    },
    Broker__factory: {
      connect: jest.fn(),
    },
    IExchangeProvider__factory: jest.fn(),
    BiPoolManager__factory: {
      connect: jest.fn(),
    },
    IBreakerBox__factory: {
      connect: jest.fn(),
    },
  }
})
jest.mock('mento-router-ts', () => {
  return {
    IMentoRouter__factory: {
      connect: jest.fn(),
    },
  }
})
jest.mock('ethers', () => {
  return {
    constants: jest.requireActual('ethers').constants,
    providers: jest.requireActual('ethers').providers,
    Signer: jest.requireActual('ethers').Signer,
    utils: jest.requireActual('ethers').utils,
    Wallet: jest.requireActual('ethers').Wallet,
    Contract: jest.fn(),
  }
})

describe('Mento', () => {
  const oneInWei = utils.parseUnits('1', 18)
  const twoInWei = utils.parseUnits('2', 18)

  // fake tokens and symbols
  const fakeUSDmTokenAddr = 'USDmTokenAddr'
  const fakeEURmTokenAddr = 'EURmTokenAddr'
  const fakeBRLmTokenAddr = 'BRLmTokenAddr'
  const fakeCeloTokenAddr = 'celoTokenAddr'
  const fakeSymbolsByTokenAddr: Record<string, string> = {
    [fakeUSDmTokenAddr]: 'USDm',
    [fakeEURmTokenAddr]: 'EURm',
    [fakeBRLmTokenAddr]: 'BRLm',
    [fakeCeloTokenAddr]: 'CELO',
  }
  const fakeNamesByTokenAddr: Record<string, string> = {
    [fakeUSDmTokenAddr]: 'Celo Dollar',
    [fakeEURmTokenAddr]: 'Celo Euro',
    [fakeBRLmTokenAddr]: 'Celo Brazilian Real',
    [fakeCeloTokenAddr]: 'Celo',
  }
  const fakeDecimalsByTokenAddr: Record<string, number> = {
    [fakeUSDmTokenAddr]: 18,
    [fakeEURmTokenAddr]: 18,
    [fakeBRLmTokenAddr]: 18,
    [fakeCeloTokenAddr]: 18,
  }

  // fake exchange providers and exchanges
  const fakeUsdAndEurExchangeProvider = 'ExchangeProvider0'
  const fakeBrlExchangeProvider = 'ExchangeProvider1'
  const fakeCeloUSDExchange = {
    exchangeId: 'ExchangeCeloCUSDAddr',
    assets: [fakeUSDmTokenAddr, fakeCeloTokenAddr],
  }
  const fakeCeloEURExchange = {
    exchangeId: 'ExchangeCeloCEURAddr',
    assets: [fakeEURmTokenAddr, fakeCeloTokenAddr],
  }
  const fakeCeloBRLExchange = {
    exchangeId: 'ExchangeCeloCBRLAddr',
    assets: [fakeBRLmTokenAddr, fakeCeloTokenAddr],
  }
  const fakeExchangesByProviders = {
    [fakeUsdAndEurExchangeProvider]: [fakeCeloUSDExchange, fakeCeloEURExchange],
    [fakeBrlExchangeProvider]: [fakeCeloBRLExchange],
    ExchangeProvider2: [],
  }
  const nOfFakeDirectExchanges = Object.values(fakeExchangesByProviders).reduce(
    (acc, curr) => acc + curr.length,
    0
  )

  // ========== Mock contract factories ==========
  const fakeBrokerAddr = 'fakeBrokerAddr'
  const fakeRouterAddr = 'fakeRouterAddr'
  const mockBroker = {
    address: fakeBrokerAddr,
    getExchangeProviders: jest.fn(() => Object.keys(fakeExchangesByProviders)),
    getAmountIn: jest.fn(),
    getAmountOut: jest.fn(),
    populateTransaction: {
      swapOut: jest.fn(),
      swapIn: jest.fn(),
    },
    signer: {
      populateTransaction: jest.fn(),
    },
  }
  const mockRouter = {
    address: fakeRouterAddr,
    getAmountIn: jest.fn(),
    getAmountOut: jest.fn(),
    populateTransaction: {
      swapTokensForExactTokens: jest.fn(),
      swapExactTokensForTokens: jest.fn(),
    },
    signer: {
      populateTransaction: jest.fn(),
    },
  }
  const mockBiPoolManager = {
    breakerBox: jest.fn(() => 'fakeBreakerBoxAddr'),
    getPoolExchange: jest.fn(() => {
      return {
        config: {
          referenceRateFeedID: 'fakeReferenceRateId',
        },
      }
    }),
  }
  const mockBreakerBox = {
    getRateFeedTradingMode: jest.fn(),
  }

  // @ts-ignore
  IBroker__factory.connect.mockReturnValue(mockBroker)
  // @ts-ignore
  IMentoRouter__factory.connect.mockReturnValue(mockRouter)
  // @ts-ignore
  IExchangeProvider__factory.connect = jest.fn((exchangeProvider: string) => {
    return {
      getExchanges: () =>
        fakeExchangesByProviders[
          exchangeProvider as keyof typeof fakeExchangesByProviders
        ],
    }
  })
  // @ts-ignore
  BiPoolManager__factory.connect.mockReturnValue(mockBiPoolManager)
  // @ts-ignore
  IBreakerBox__factory.connect.mockReturnValue(mockBreakerBox)

  // ========== Mock ethers contracts ==========
  const celoRegistryAddress = '0x000000000000000000000000000000000000ce10'
  const fakeRegistryContract = {
    getAddressForString: jest.fn(() => fakeBrokerAddr),
  }
  const increaseAllowanceFn = jest.fn()
  const mockContractModule = jest.fn((contractAddr: string) => {
    const isRegistryContract = contractAddr === celoRegistryAddress
    const isErc20Contract = Object.keys(fakeSymbolsByTokenAddr).includes(
      contractAddr
    )

    if (isRegistryContract) {
      return fakeRegistryContract
    } else if (isErc20Contract) {
      return {
        symbol: jest.fn(
          () =>
            fakeSymbolsByTokenAddr[
              contractAddr as keyof typeof fakeSymbolsByTokenAddr
            ]
        ),
        name: jest.fn(
          () =>
            fakeNamesByTokenAddr[
              contractAddr as keyof typeof fakeNamesByTokenAddr
            ]
        ),
        decimals: jest.fn(
          () =>
            fakeDecimalsByTokenAddr[
              contractAddr as keyof typeof fakeDecimalsByTokenAddr
            ]
        ),
        populateTransaction: {
          increaseAllowance: increaseAllowanceFn,
        },
      }
    } else {
      throw new Error('Unknown contract address with no mock implementation')
    }
  })
  // @ts-ignore
  Contract.mockImplementation(mockContractModule)

  let provider: providers.JsonRpcProvider
  let signer: ethers.Wallet
  let signerWithoutProvider: ethers.Wallet
  const pk = Wallet.createRandom().privateKey

  beforeAll(async () => {
    provider = new providers.JsonRpcProvider()
    provider.getNetwork = jest
      .fn()
      .mockResolvedValue({ chainId: 42220, name: 'celo' })

    // Mock other provider methods that make HTTP requests
    provider.getBlockNumber = jest.fn().mockResolvedValue(12345)
    provider.getGasPrice = jest
      .fn()
      .mockResolvedValue(utils.parseUnits('20', 'gwei'))
    provider.estimateGas = jest.fn().mockResolvedValue(21000)
    provider.getTransactionCount = jest.fn().mockResolvedValue(1)
    provider.call = jest.fn().mockResolvedValue('0x')
    provider.getBlock = jest.fn().mockResolvedValue({
      number: 12345,
      timestamp: Math.floor(Date.now() / 1000),
      gasLimit: utils.parseUnits('8000000', 'wei'),
      gasUsed: utils.parseUnits('6000000', 'wei'),
    })

    signer = new Wallet(pk, provider)
    signerWithoutProvider = new Wallet(pk)
  })

  afterEach(async () => {
    jest.clearAllMocks()
  })

  describe('create', () => {
    it('should return a Mento instance with the registry broker address and a router object', async () => {
      const testee = await Mento.create(provider)
      expect(testee).toBeDefined()

      const testee2 = await Mento.create(signer)
      expect(testee2).toBeDefined()
    })

    it('should throw if the signer has no provider', async () => {
      await expect(Mento.create(signerWithoutProvider)).rejects.toThrow(
        'Signer must be connected to a provider'
      )
    })

    it('should throw if no signer or provider is provided', async () => {
      // @ts-ignore
      await expect(Mento.create()).rejects.toThrow(
        'A valid signer or provider must be provided'
      )
    })
  })

  describe('createWithParams', () => {
    it('should return a Mento instance without querying the registry and include a router object', () => {
      const testee = Mento.createWithParams(
        provider,
        fakeBrokerAddr,
        fakeRouterAddr
      )
      expect(testee).toBeDefined()
      expect(mockContractModule).toHaveBeenCalledTimes(0)
      expect(fakeRegistryContract.getAddressForString).toHaveBeenCalledTimes(0)

      const testee2 = Mento.createWithParams(
        signer,
        fakeBrokerAddr,
        fakeRouterAddr
      )
      expect(testee2).toBeDefined()
      expect(mockContractModule).toHaveBeenCalledTimes(0)
      expect(fakeRegistryContract.getAddressForString).toHaveBeenCalledTimes(0)
    })

    it('should throw if the signer has no provider', () => {
      expect(() =>
        Mento.createWithParams(
          signerWithoutProvider,
          fakeBrokerAddr,
          fakeRouterAddr
        )
      ).toThrow('Signer must be connected to a provider')
    })

    it('should throw if no signer or provider is provided', () => {
      //@ts-ignore
      expect(() => Mento.createWithParams(fakeBrokerAddr)).toThrow(
        'A valid signer or provider must be provided'
      )
    })
  })

  describe('getTradeablePairsWithPath', () => {
    it('should return an array of pairs including direct and routed (one-hop) pairs', async () => {
      const testee = await Mento.create(provider)

      const pairs = await testee.getTradablePairsWithPath({ cached: false })
      // Check direct pairs (length 2)
      const directPairs = pairs.filter((p: TradablePair) => p.path.length === 1)
      expect(directPairs.length).toBe(nOfFakeDirectExchanges)

      // Verify each direct exchange pair is included
      for (const [provider, exchanges] of Object.entries(
        fakeExchangesByProviders
      )) {
        for (const exchange of exchanges) {
          const symbol0 = fakeSymbolsByTokenAddr[exchange.assets[0]]
          const symbol1 = fakeSymbolsByTokenAddr[exchange.assets[1]]
          const [firstSymbol, secondSymbol] = [symbol0, symbol1].sort()
          const directPair: TradablePair = {
            id: `${firstSymbol}-${secondSymbol}`,
            assets: [
              {
                address:
                  firstSymbol === symbol0
                    ? exchange.assets[0]
                    : exchange.assets[1],
                symbol: firstSymbol,
              },
              {
                address:
                  secondSymbol === symbol1
                    ? exchange.assets[1]
                    : exchange.assets[0],
                symbol: secondSymbol,
              },
            ],
            path: [
              {
                providerAddr: provider,
                id: exchange.exchangeId,
                assets: [exchange.assets[0], exchange.assets[1]],
              },
            ],
          }
          expect(pairs).toContainEqual(directPair)
        }
      }

      // Check that at least one routed (one-hop) pair is included (length > 2)
      const routedPairs = pairs.filter((p: TradablePair) => p.path.length == 2)
      expect(routedPairs.length).toBeGreaterThan(0)
      // For example, expect USDm -> EURm via CELO to be present
      expect(pairs).toContainEqual({
        id: 'EURm-USDm',
        assets: [
          {
            address: fakeEURmTokenAddr,
            symbol: 'EURm',
          },
          {
            address: fakeUSDmTokenAddr,
            symbol: 'USDm',
          },
        ],
        path: [
          {
            providerAddr: fakeUsdAndEurExchangeProvider,
            id: fakeCeloUSDExchange.exchangeId,
            assets: [fakeUSDmTokenAddr, fakeCeloTokenAddr],
          },
          {
            providerAddr: fakeUsdAndEurExchangeProvider,
            id: fakeCeloEURExchange.exchangeId,
            assets: [fakeEURmTokenAddr, fakeCeloTokenAddr],
          },
        ],
      })
    })
  })

  describe('getAmountIn', () => {
    it('should call broker.getAmountIn with the right parameters for a direct swap', async () => {
      const testee = await Mento.create(provider)

      for (const [mockedProvider, mockedExchanges] of Object.entries(
        fakeExchangesByProviders
      )) {
        for (const exchange of mockedExchanges) {
          const tokenIn = exchange.assets[0]
          const tokenOut = exchange.assets[1]
          const symbol0 = fakeSymbolsByTokenAddr[tokenIn]
          const symbol1 = fakeSymbolsByTokenAddr[tokenOut]
          const [firstSymbol, secondSymbol] = [symbol0, symbol1].sort()
          const directPair: TradablePair = {
            id: `${firstSymbol}-${secondSymbol}`,
            assets: [
              {
                address: firstSymbol === symbol0 ? tokenIn : tokenOut,
                symbol: firstSymbol,
              },
              {
                address: secondSymbol === symbol1 ? tokenOut : tokenIn,
                symbol: secondSymbol,
              },
            ],
            path: [
              {
                providerAddr: mockedProvider,
                id: exchange.exchangeId,
                assets: [tokenIn, tokenOut],
              },
            ],
          }
          await testee.getAmountIn(tokenIn, tokenOut, oneInWei, directPair)
          expect(mockBroker.getAmountIn).toHaveBeenCalledWith(
            mockedProvider,
            exchange.exchangeId,
            tokenIn,
            tokenOut,
            oneInWei
          )
        }
      }
    })

    it('should call router.getAmountIn with the right parameters for a routed swap', async () => {
      const testee = await Mento.create(provider)
      const routedPair: TradablePair = {
        id: 'EURm-USDm',
        assets: [
          {
            address: fakeEURmTokenAddr,
            symbol: 'EURm',
          },
          {
            address: fakeUSDmTokenAddr,
            symbol: 'USDm',
          },
        ],
        path: [
          {
            providerAddr: fakeUsdAndEurExchangeProvider,
            id: fakeCeloUSDExchange.exchangeId,
            assets: [fakeUSDmTokenAddr, fakeCeloTokenAddr],
          },
          {
            providerAddr: fakeUsdAndEurExchangeProvider,
            id: fakeCeloEURExchange.exchangeId,
            assets: [fakeEURmTokenAddr, fakeCeloTokenAddr],
          },
        ],
      }

      mockRouter.getAmountIn.mockResolvedValue('routedAmountIn')

      const result = await testee.getAmountIn(
        fakeUSDmTokenAddr,
        fakeEURmTokenAddr,
        oneInWei,
        routedPair
      )

      expect(mockRouter.getAmountIn).toHaveBeenCalledWith(oneInWei, [
        {
          exchangeProvider: fakeUsdAndEurExchangeProvider,
          exchangeId: fakeCeloUSDExchange.exchangeId,
          assetIn: fakeUSDmTokenAddr,
          assetOut: fakeCeloTokenAddr,
        },
        {
          exchangeProvider: fakeUsdAndEurExchangeProvider,
          exchangeId: fakeCeloEURExchange.exchangeId,
          assetIn: fakeCeloTokenAddr,
          assetOut: fakeEURmTokenAddr,
        },
      ])
      expect(result).toBe('routedAmountIn')
    })
  })

  describe('getAmountOut', () => {
    it('should call broker.getAmountOut with the right parameters for a direct swap', async () => {
      const testee = await Mento.create(provider)

      for (const [mockedProvider, mockedExchanges] of Object.entries(
        fakeExchangesByProviders
      )) {
        for (const exchange of mockedExchanges) {
          const tokenIn = exchange.assets[1]
          const tokenOut = exchange.assets[0]
          const symbol0 = fakeSymbolsByTokenAddr[tokenIn]
          const symbol1 = fakeSymbolsByTokenAddr[tokenOut]
          const [firstSymbol, secondSymbol] = [symbol0, symbol1].sort()
          const directPair: TradablePair = {
            id: `${firstSymbol}-${secondSymbol}`,
            assets: [
              {
                address: firstSymbol === symbol0 ? tokenIn : tokenOut,
                symbol: firstSymbol,
              },
              {
                address: secondSymbol === symbol1 ? tokenOut : tokenIn,
                symbol: secondSymbol,
              },
            ],
            path: [
              {
                providerAddr: mockedProvider,
                id: exchange.exchangeId,
                assets: [tokenIn, tokenOut],
              },
            ],
          }

          await testee.getAmountOut(tokenIn, tokenOut, oneInWei, directPair)
          expect(mockBroker.getAmountOut).toHaveBeenCalledWith(
            mockedProvider,
            exchange.exchangeId,
            tokenIn,
            tokenOut,
            oneInWei
          )
        }
      }
    })

    it('should call router.getAmountOut with the right parameters for a routed swap', async () => {
      const testee = await Mento.create(provider)
      const routedPair: TradablePair = {
        id: 'EURm-USDm',
        assets: [
          {
            address: fakeEURmTokenAddr,
            symbol: 'EURm',
          },
          {
            address: fakeUSDmTokenAddr,
            symbol: 'USDm',
          },
        ],
        path: [
          {
            providerAddr: fakeUsdAndEurExchangeProvider,
            id: fakeCeloEURExchange.exchangeId,
            assets: [fakeEURmTokenAddr, fakeCeloTokenAddr],
          },
          {
            providerAddr: fakeUsdAndEurExchangeProvider,
            id: fakeCeloUSDExchange.exchangeId,
            assets: [fakeUSDmTokenAddr, fakeCeloTokenAddr],
          },
        ],
      }

      mockRouter.getAmountOut.mockResolvedValue('routedAmountOut')

      const result = await testee.getAmountOut(
        fakeEURmTokenAddr,
        fakeUSDmTokenAddr,
        oneInWei,
        routedPair
      )

      expect(mockRouter.getAmountOut).toHaveBeenCalledWith(oneInWei, [
        {
          exchangeProvider: fakeUsdAndEurExchangeProvider,
          exchangeId: fakeCeloEURExchange.exchangeId,
          assetIn: fakeEURmTokenAddr,
          assetOut: fakeCeloTokenAddr,
        },
        {
          exchangeProvider: fakeUsdAndEurExchangeProvider,
          exchangeId: fakeCeloUSDExchange.exchangeId,
          assetIn: fakeCeloTokenAddr,
          assetOut: fakeUSDmTokenAddr,
        },
      ])
      expect(result).toBe('routedAmountOut')
    })
  })

  describe('increaseTradingAllowance', () => {
    it('should return a populated increaseAllowance tx object for a direct pair', async () => {
      const testee = await Mento.create(signer)
      const token = fakeCeloBRLExchange.assets[0]
      const amount = twoInWei
      const directPair: TradablePair = {
        id: 'CELO-BRLm',
        assets: [
          {
            address: fakeCeloTokenAddr,
            symbol: 'CELO',
          },
          {
            address: fakeBRLmTokenAddr,
            symbol: 'BRLm',
          },
        ],
        path: [
          {
            providerAddr: fakeBrlExchangeProvider,
            id: fakeCeloBRLExchange.exchangeId,
            assets: [fakeCeloTokenAddr, fakeBRLmTokenAddr],
          },
        ],
      }

      const fakeTxObj = {
        to: '0x1234567890123456789012345678901234567890',
        data: '0x345',
      }
      const fakePopulatedTxObj = {
        to: '0x1234567890123456789012345678901234567890',
        data: '0x345',
        from: '0xABCDEF1234567890123456789012345678901234',
        gasLimit: 2200,
      }

      increaseAllowanceFn.mockReturnValueOnce(fakeTxObj)
      const spy = jest
        .spyOn(signer, 'populateTransaction')
        // @ts-ignore
        .mockReturnValueOnce(fakePopulatedTxObj)

      const tx = await testee.increaseTradingAllowance(
        token,
        amount,
        directPair
      )
      expect(tx).toBe(fakePopulatedTxObj)
      expect(increaseAllowanceFn).toHaveBeenCalledTimes(1)
      expect(increaseAllowanceFn).toHaveBeenCalledWith(fakeBrokerAddr, amount)
      expect(mockContractModule.mock.lastCall![0]).toEqual(token)
      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy).toHaveBeenCalledWith(fakeTxObj)
    })

    it('should return a populated increaseAllowance tx object for a routed pair', async () => {
      const testee = await Mento.create(signer)
      const token = fakeUSDmTokenAddr
      const amount = twoInWei
      const routedPair: TradablePair = {
        id: 'EURm-USDm',
        assets: [
          {
            address: fakeEURmTokenAddr,
            symbol: 'EURm',
          },
          {
            address: fakeUSDmTokenAddr,
            symbol: 'USDm',
          },
        ],
        path: [
          {
            providerAddr: fakeUsdAndEurExchangeProvider,
            id: fakeCeloUSDExchange.exchangeId,
            assets: [fakeUSDmTokenAddr, fakeCeloTokenAddr],
          },
          {
            providerAddr: fakeUsdAndEurExchangeProvider,
            id: fakeCeloEURExchange.exchangeId,
            assets: [fakeEURmTokenAddr, fakeCeloTokenAddr],
          },
        ],
      }

      const fakeTxObj = {
        to: '0x1234567890123456789012345678901234567890',
        data: '0x345',
      }
      const fakePopulatedTxObj = {
        to: '0x1234567890123456789012345678901234567890',
        data: '0x345',
        from: '0xABCDEF1234567890123456789012345678901234',
        gasLimit: 2200,
      }

      increaseAllowanceFn.mockReturnValueOnce(fakeTxObj)
      const spy = jest
        .spyOn(signer, 'populateTransaction')
        // @ts-ignore
        .mockReturnValueOnce(fakePopulatedTxObj)

      const tx = await testee.increaseTradingAllowance(
        token,
        amount,
        routedPair
      )
      expect(tx).toBe(fakePopulatedTxObj)
      expect(increaseAllowanceFn).toHaveBeenCalledTimes(1)
      expect(increaseAllowanceFn).toHaveBeenCalledWith(fakeRouterAddr, amount)
      expect(mockContractModule.mock.lastCall![0]).toEqual(token)
      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy).toHaveBeenCalledWith(fakeTxObj)
    })
  })

  describe('swapIn', () => {
    it('should call broker.swapIn with the right parameters for a direct swap', async () => {
      const testee = await Mento.create(signer)

      for (const [mockedProvider, mockedExchanges] of Object.entries(
        fakeExchangesByProviders
      )) {
        for (const exchange of mockedExchanges) {
          const tokenIn = exchange.assets[0]
          const tokenOut = exchange.assets[1]
          const symbol0 = fakeSymbolsByTokenAddr[tokenIn]
          const symbol1 = fakeSymbolsByTokenAddr[tokenOut]
          const [firstSymbol, secondSymbol] = [symbol0, symbol1].sort()
          const directPair: TradablePair = {
            id: `${firstSymbol}-${secondSymbol}`,
            assets: [
              {
                address: firstSymbol === symbol0 ? tokenIn : tokenOut,
                symbol: firstSymbol,
              },
              {
                address: secondSymbol === symbol1 ? tokenOut : tokenIn,
                symbol: secondSymbol,
              },
            ],
            path: [
              {
                providerAddr: mockedProvider,
                id: exchange.exchangeId,
                assets: [tokenIn, tokenOut],
              },
            ],
          }

          const fakeTxObj = {
            to: '0x1234567890123456789012345678901234567890',
            data: '0x345',
          }
          const fakePopulatedTxObj = {
            to: '0x1234567890123456789012345678901234567890',
            data: '0x00456',
            from: '0xABCDEF1234567890123456789012345678901234',
            gasLimit: 2200,
          }

          mockBroker.populateTransaction.swapIn.mockReturnValueOnce(fakeTxObj)
          const spy = jest
            .spyOn(signer, 'populateTransaction')
            // @ts-ignore
            .mockReturnValueOnce(fakePopulatedTxObj)

          const result = await testee.swapIn(
            tokenIn,
            tokenOut,
            oneInWei,
            twoInWei,
            directPair
          )
          expect(result).toBe(fakePopulatedTxObj)

          expect(mockBroker.populateTransaction.swapIn).toHaveBeenCalledWith(
            mockedProvider,
            exchange.exchangeId,
            tokenIn,
            tokenOut,
            oneInWei,
            twoInWei
          )

          expect(spy).toHaveBeenCalledWith(fakeTxObj)
        }
      }
    })

    it('should call router.swapIn with the right parameters for a routed swap', async () => {
      const testee = await Mento.create(signer)
      const routedPair: TradablePair = {
        id: 'EURm-USDm',
        assets: [
          {
            address: fakeEURmTokenAddr,
            symbol: 'EURm',
          },
          {
            address: fakeUSDmTokenAddr,
            symbol: 'USDm',
          },
        ],
        path: [
          {
            providerAddr: fakeUsdAndEurExchangeProvider,
            id: fakeCeloUSDExchange.exchangeId,
            assets: [fakeUSDmTokenAddr, fakeCeloTokenAddr],
          },
          {
            providerAddr: fakeUsdAndEurExchangeProvider,
            id: fakeCeloEURExchange.exchangeId,
            assets: [fakeEURmTokenAddr, fakeCeloTokenAddr],
          },
        ],
      }

      const fakeTxObj = {
        to: '0x1234567890123456789012345678901234567890',
        data: '0x345',
      }
      const fakePopulatedTxObj = {
        to: '0x1234567890123456789012345678901234567890',
        data: '0x00456',
        from: '0xABCDEF1234567890123456789012345678901234',
        gasLimit: 2200,
      }

      mockRouter.populateTransaction.swapExactTokensForTokens.mockReturnValueOnce(
        fakeTxObj
      )
      const spy = jest
        .spyOn(signer, 'populateTransaction')
        // @ts-ignore
        .mockReturnValueOnce(fakePopulatedTxObj)

      const result = await testee.swapIn(
        fakeUSDmTokenAddr,
        fakeEURmTokenAddr,
        oneInWei,
        twoInWei,
        routedPair
      )

      expect(
        mockRouter.populateTransaction.swapExactTokensForTokens
      ).toHaveBeenCalledWith(oneInWei, twoInWei, [
        {
          exchangeProvider: fakeUsdAndEurExchangeProvider,
          exchangeId: fakeCeloUSDExchange.exchangeId,
          assetIn: fakeUSDmTokenAddr,
          assetOut: fakeCeloTokenAddr,
        },
        {
          exchangeProvider: fakeUsdAndEurExchangeProvider,
          exchangeId: fakeCeloEURExchange.exchangeId,
          assetIn: fakeCeloTokenAddr,
          assetOut: fakeEURmTokenAddr,
        },
      ])
      expect(result).toBe(fakePopulatedTxObj)
      expect(spy).toHaveBeenCalledWith(fakeTxObj)
    })
  })

  describe('swapOut', () => {
    it('should call broker.swapOut with the right parameters for a direct swap', async () => {
      const testee = await Mento.create(signer)

      for (const [mockedProvider, mockedExchanges] of Object.entries(
        fakeExchangesByProviders
      )) {
        for (const exchange of mockedExchanges) {
          const tokenIn = exchange.assets[0]
          const tokenOut = exchange.assets[1]
          const directPair: TradablePair = {
            id: `${fakeSymbolsByTokenAddr[tokenIn]}-${fakeSymbolsByTokenAddr[tokenOut]}`,
            assets: [
              {
                address: tokenIn,
                symbol: fakeSymbolsByTokenAddr[tokenIn],
              },
              {
                address: tokenOut,
                symbol: fakeSymbolsByTokenAddr[tokenOut],
              },
            ],
            path: [
              {
                providerAddr: mockedProvider,
                id: exchange.exchangeId,
                assets: [tokenIn, tokenOut],
              },
            ],
          }

          const fakeTxObj = {
            to: '0x1234567890123456789012345678901234567890',
            data: '0x345',
          }
          const fakePopulatedTxObj = {
            to: '0x1234567890123456789012345678901234567890',
            data: '0x00456',
            from: '0xABCDEF1234567890123456789012345678901234',
            gasLimit: 2200,
          }

          mockBroker.populateTransaction.swapOut.mockReturnValueOnce(fakeTxObj)
          const spy = jest
            .spyOn(signer, 'populateTransaction')
            // @ts-ignore
            .mockReturnValueOnce(fakePopulatedTxObj)

          const result = await testee.swapOut(
            tokenIn,
            tokenOut,
            oneInWei,
            twoInWei,
            directPair
          )
          expect(result).toBe(fakePopulatedTxObj)

          expect(mockBroker.populateTransaction.swapOut).toHaveBeenCalledWith(
            mockedProvider,
            exchange.exchangeId,
            tokenIn,
            tokenOut,
            oneInWei,
            twoInWei
          )

          expect(spy).toHaveBeenCalledWith(fakeTxObj)
        }
      }
    })

    it('should call router.swapOut with the right parameters for a routed swap', async () => {
      const testee = await Mento.create(signer)
      const routedPair: TradablePair = {
        id: 'USDm-EURm',
        assets: [
          {
            address: fakeUSDmTokenAddr,
            symbol: fakeSymbolsByTokenAddr[fakeUSDmTokenAddr],
          },
          {
            address: fakeEURmTokenAddr,
            symbol: fakeSymbolsByTokenAddr[fakeEURmTokenAddr],
          },
        ],
        path: [
          {
            providerAddr: fakeUsdAndEurExchangeProvider,
            id: fakeCeloUSDExchange.exchangeId,
            assets: [fakeUSDmTokenAddr, fakeCeloTokenAddr],
          },
          {
            providerAddr: fakeUsdAndEurExchangeProvider,
            id: fakeCeloEURExchange.exchangeId,
            assets: [fakeEURmTokenAddr, fakeCeloTokenAddr],
          },
        ],
      }

      const fakeTxObj = {
        to: '0x1234567890123456789012345678901234567890',
        data: '0x345',
      }
      const fakePopulatedTxObj = {
        to: '0x1234567890123456789012345678901234567890',
        data: '0x00456',
        from: '0xABCDEF1234567890123456789012345678901234',
        gasLimit: 2200,
      }

      mockRouter.populateTransaction.swapTokensForExactTokens.mockReturnValueOnce(
        fakeTxObj
      )
      jest
        .spyOn(signer, 'populateTransaction')
        // @ts-ignore
        .mockReturnValueOnce(fakePopulatedTxObj)

      const result = await testee.swapOut(
        fakeUSDmTokenAddr,
        fakeEURmTokenAddr,
        oneInWei,
        twoInWei,
        routedPair
      )

      expect(
        mockRouter.populateTransaction.swapTokensForExactTokens
      ).toHaveBeenCalledWith(oneInWei, twoInWei, [
        {
          exchangeProvider: fakeUsdAndEurExchangeProvider,
          exchangeId: fakeCeloUSDExchange.exchangeId,
          assetIn: fakeUSDmTokenAddr,
          assetOut: fakeCeloTokenAddr,
        },
        {
          exchangeProvider: fakeUsdAndEurExchangeProvider,
          exchangeId: fakeCeloEURExchange.exchangeId,
          assetIn: fakeCeloTokenAddr,
          assetOut: fakeEURmTokenAddr,
        },
      ])
      expect(result).toBe(fakePopulatedTxObj)
    })
  })

  describe('getExchangeById', () => {
    it('should return the exchange with the given id', async () => {
      const testee = await Mento.create(provider)
      const celoUSDExchange = await testee.getExchangeById(
        fakeCeloUSDExchange.exchangeId
      )
      const celoEURExchange = await testee.getExchangeById(
        fakeCeloEURExchange.exchangeId
      )

      expect(celoUSDExchange.id).toEqual(fakeCeloUSDExchange.exchangeId)
      expect(celoEURExchange.id).toEqual(fakeCeloEURExchange.exchangeId)
    })

    it('should throw if no exchange is found for the given id', async () => {
      const testee = await Mento.create(provider)
      await expect(
        testee.getExchangeById('nonExistentExchangeId')
      ).rejects.toThrow()
    })
  })

  describe('isTradingEnabled', () => {
    it('should return true if the trading mode is 0', async () => {
      const testee = await Mento.create(provider)

      mockBreakerBox.getRateFeedTradingMode.mockReturnValueOnce(constants.Zero)
      expect(
        await testee.isTradingEnabled(fakeCeloUSDExchange.exchangeId)
      ).toBe(true)
    })
    it('should return false if the trading mode is not 0', async () => {
      const testee = await Mento.create(provider)

      mockBreakerBox.getRateFeedTradingMode.mockReturnValueOnce(constants.One)
      expect(
        await testee.isTradingEnabled(fakeCeloUSDExchange.exchangeId)
      ).toBe(false)
    })
  })

  describe('getTokens', () => {
    it('should return cached tokens synchronously after SDK is initialized', async () => {
      const testee = await Mento.create(provider)

      const tokens = testee.getTokens()

      // Verify we get tokens from the cache
      expect(tokens.length).toBeGreaterThan(0)

      // Verify each token has the expected structure
      tokens.forEach((token) => {
        expect(token).toHaveProperty('address')
        expect(token).toHaveProperty('symbol')
        expect(token).toHaveProperty('name')
        expect(token).toHaveProperty('decimals')
        expect(typeof token.address).toBe('string')
        expect(typeof token.symbol).toBe('string')
        expect(typeof token.name).toBe('string')
        expect(typeof token.decimals).toBe('number')
      })
    })

    it('should throw when chainId is not initialized', () => {
      // Create instance using createWithParams which doesn't initialize cachedChainId
      const testee = Mento.createWithParams(
        provider,
        constants.AddressZero,
        []
      )

      expect(() => testee.getTokens()).toThrow(
        'Chain ID not yet initialized'
      )
    })
  })

  describe('getTokensAsync', () => {
    it('should return a list of unique tokens sorted by symbol', async () => {
      const testee = await Mento.create(provider)

      const tokens = await testee.getTokensAsync({ cached: false })

      // We should have exactly 4 unique tokens from our test data
      expect(tokens.length).toBe(4)

      // Check that tokens are sorted by symbol
      const symbols = tokens.map((t) => t.symbol)
      expect(symbols).toEqual(['BRLm', 'CELO', 'EURm', 'USDm'])

      // Verify each token has the expected structure
      tokens.forEach((token) => {
        expect(token).toHaveProperty('address')
        expect(token).toHaveProperty('symbol')
        expect(token).toHaveProperty('name')
        expect(token).toHaveProperty('decimals')
        expect(typeof token.address).toBe('string')
        expect(typeof token.symbol).toBe('string')
        expect(typeof token.name).toBe('string')
        expect(typeof token.decimals).toBe('number')
      })
    })

    it('should not have duplicate tokens', async () => {
      const testee = await Mento.create(provider)

      const tokens = await testee.getTokensAsync({ cached: false })

      // Check that all addresses are unique
      const addresses = tokens.map((t) => t.address)
      const uniqueAddresses = new Set(addresses)
      expect(addresses.length).toBe(uniqueAddresses.size)

      // Check that all symbols are unique
      const symbols = tokens.map((t) => t.symbol)
      const uniqueSymbols = new Set(symbols)
      expect(symbols.length).toBe(uniqueSymbols.size)
    })

    it('should return cached tokens when cached is true', async () => {
      const testee = await Mento.create(provider)

      const tokens = await testee.getTokensAsync({ cached: true })

      // Should return cached tokens
      expect(tokens.length).toBeGreaterThan(0)
      tokens.forEach((token) => {
        expect(token).toHaveProperty('address')
        expect(token).toHaveProperty('symbol')
        expect(token).toHaveProperty('name')
        expect(token).toHaveProperty('decimals')
      })
    })
  })

  describe('getRateFeedTradingMode', () => {
    let mockBreakerBox: {
      getRateFeedTradingMode: jest.Mock
    }
    let testee: Mento

    beforeEach(async () => {
      mockBreakerBox = {
        getRateFeedTradingMode: jest.fn(),
      }

      // @ts-ignore
      IBreakerBox__factory.connect.mockReturnValue(mockBreakerBox)

      testee = await Mento.create(provider)
    })

    it('should return BIDIRECTIONAL mode when trading is enabled', async () => {
      const rateFeedId = '0xA1A8003936862E7a15092A91898D69fa8bCE290c'
      mockBreakerBox.getRateFeedTradingMode.mockResolvedValue(0)

      const mode = await testee.getRateFeedTradingMode(rateFeedId)

      expect(mode).toBe(TradingMode.BIDIRECTIONAL)
      expect(mockBreakerBox.getRateFeedTradingMode).toHaveBeenCalledWith(rateFeedId)
      expect(mockBreakerBox.getRateFeedTradingMode).toHaveBeenCalledTimes(1)
    })

    it('should return HALTED mode when circuit breaker is tripped', async () => {
      const rateFeedId = '0xA1A8003936862E7a15092A91898D69fa8bCE290c'
      mockBreakerBox.getRateFeedTradingMode.mockResolvedValue(1)

      const mode = await testee.getRateFeedTradingMode(rateFeedId)

      expect(mode).toBe(TradingMode.HALTED)
    })

    it('should return DISABLED mode when trading is disabled', async () => {
      const rateFeedId = '0xA1A8003936862E7a15092A91898D69fa8bCE290c'
      mockBreakerBox.getRateFeedTradingMode.mockResolvedValue(2)

      const mode = await testee.getRateFeedTradingMode(rateFeedId)

      expect(mode).toBe(TradingMode.DISABLED)
    })

    it('should handle different rate feed IDs', async () => {
      const rateFeedId1 = '0xA1A8003936862E7a15092A91898D69fa8bCE290c'
      const rateFeedId2 = '0xF4f9bBdA9CD6841fCB9b1510f9269E2dB42a6e3a'

      mockBreakerBox.getRateFeedTradingMode
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(1)

      const mode1 = await testee.getRateFeedTradingMode(rateFeedId1)
      const mode2 = await testee.getRateFeedTradingMode(rateFeedId2)

      expect(mode1).toBe(TradingMode.BIDIRECTIONAL)
      expect(mode2).toBe(TradingMode.HALTED)
    })
  })

  describe('isPairTradable', () => {
    let mockBreakerBox: {
      getRateFeedTradingMode: jest.Mock
    }
    let mockBiPoolManager: {
      getPoolExchange: jest.Mock
    }
    let testee: Mento

    beforeEach(async () => {
      mockBreakerBox = {
        getRateFeedTradingMode: jest.fn(),
      }

      mockBiPoolManager = {
        getPoolExchange: jest.fn(),
      }

      // @ts-ignore
      IBreakerBox__factory.connect.mockReturnValue(mockBreakerBox)
      // @ts-ignore
      BiPoolManager__factory.connect.mockReturnValue(mockBiPoolManager)

      testee = await Mento.create(provider)

      // Mock getTradablePairsWithPath to return pairs for testing
      jest.spyOn(testee, 'getTradablePairsWithPath').mockResolvedValue([
        // Direct pair: USDm <-> CELO
        {
          id: `${fakeUSDmTokenAddr}-${fakeCeloTokenAddr}` as TradablePair['id'],
          assets: [
            { address: fakeUSDmTokenAddr, symbol: 'USDm' },
            { address: fakeCeloTokenAddr, symbol: 'CELO' },
          ],
          path: [
            {
              providerAddr: fakeUsdAndEurExchangeProvider,
              id: fakeCeloUSDExchange.exchangeId,
              assets: [fakeUSDmTokenAddr, fakeCeloTokenAddr],
            },
          ],
        },
        // Multi-hop pair: EURm <-> BRLm (via CELO)
        {
          id: `${fakeEURmTokenAddr}-${fakeBRLmTokenAddr}` as TradablePair['id'],
          assets: [
            { address: fakeEURmTokenAddr, symbol: 'EURm' },
            { address: fakeBRLmTokenAddr, symbol: 'BRLm' },
          ],
          path: [
            {
              providerAddr: fakeUsdAndEurExchangeProvider,
              id: fakeCeloEURExchange.exchangeId,
              assets: [fakeEURmTokenAddr, fakeCeloTokenAddr],
            },
            {
              providerAddr: fakeBrlExchangeProvider,
              id: fakeCeloBRLExchange.exchangeId,
              assets: [fakeCeloTokenAddr, fakeBRLmTokenAddr],
            },
          ],
        },
      ])
    })

    it('should return true when trading mode is BIDIRECTIONAL for direct pair', async () => {
      const rateFeedId = '0xA1A8003936862E7a15092A91898D69fa8bCE290c'
      
      mockBiPoolManager.getPoolExchange.mockResolvedValue({
        config: {
          referenceRateFeedID: rateFeedId,
        },
      })

      mockBreakerBox.getRateFeedTradingMode.mockResolvedValue(0)

      const isTradable = await testee.isPairTradable(fakeUSDmTokenAddr, fakeCeloTokenAddr)

      expect(isTradable).toBe(true)
      expect(mockBreakerBox.getRateFeedTradingMode).toHaveBeenCalledWith(rateFeedId)
    })

    it('should return false when trading mode is HALTED for direct pair', async () => {
      const rateFeedId = '0xA1A8003936862E7a15092A91898D69fa8bCE290c'
      
      mockBiPoolManager.getPoolExchange.mockResolvedValue({
        config: {
          referenceRateFeedID: rateFeedId,
        },
      })

      mockBreakerBox.getRateFeedTradingMode.mockResolvedValue(1)

      const isTradable = await testee.isPairTradable(fakeUSDmTokenAddr, fakeCeloTokenAddr)

      expect(isTradable).toBe(false)
    })

    it('should return false when trading mode is DISABLED for direct pair', async () => {
      const rateFeedId = '0xA1A8003936862E7a15092A91898D69fa8bCE290c'
      
      mockBiPoolManager.getPoolExchange.mockResolvedValue({
        config: {
          referenceRateFeedID: rateFeedId,
        },
      })

      mockBreakerBox.getRateFeedTradingMode.mockResolvedValue(2)

      const isTradable = await testee.isPairTradable(fakeUSDmTokenAddr, fakeCeloTokenAddr)

      expect(isTradable).toBe(false)
    })

    it('should return true when all hops are BIDIRECTIONAL for multi-hop pair', async () => {
      const rateFeedId1 = '0xA1A8003936862E7a15092A91898D69fa8bCE290c'
      const rateFeedId2 = '0xB2B8003936862E7a15092A91898D69fa8bCE290c'
      
      // Mock a two-hop route
      mockBiPoolManager.getPoolExchange
        .mockResolvedValueOnce({
          config: { referenceRateFeedID: rateFeedId1 },
        })
        .mockResolvedValueOnce({
          config: { referenceRateFeedID: rateFeedId2 },
        })

      // Both hops are tradable
      mockBreakerBox.getRateFeedTradingMode
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)

      const isTradable = await testee.isPairTradable(fakeEURmTokenAddr, fakeBRLmTokenAddr)

      expect(isTradable).toBe(true)
      expect(mockBreakerBox.getRateFeedTradingMode).toHaveBeenCalledTimes(2)
    })

    it('should return false when first hop is not tradable in multi-hop pair', async () => {
      const rateFeedId1 = '0xA1A8003936862E7a15092A91898D69fa8bCE290c'
      const rateFeedId2 = '0xB2B8003936862E7a15092A91898D69fa8bCE290c'
      
      mockBiPoolManager.getPoolExchange
        .mockResolvedValueOnce({
          config: { referenceRateFeedID: rateFeedId1 },
        })
        .mockResolvedValueOnce({
          config: { referenceRateFeedID: rateFeedId2 },
        })

      // First hop is HALTED, second is BIDIRECTIONAL
      mockBreakerBox.getRateFeedTradingMode
        .mockResolvedValueOnce(1)
        .mockResolvedValueOnce(0)

      const isTradable = await testee.isPairTradable(fakeEURmTokenAddr, fakeBRLmTokenAddr)

      expect(isTradable).toBe(false)
    })

    it('should return false when second hop is not tradable in multi-hop pair', async () => {
      const rateFeedId1 = '0xA1A8003936862E7a15092A91898D69fa8bCE290c'
      const rateFeedId2 = '0xB2B8003936862E7a15092A91898D69fa8bCE290c'
      
      mockBiPoolManager.getPoolExchange
        .mockResolvedValueOnce({
          config: { referenceRateFeedID: rateFeedId1 },
        })
        .mockResolvedValueOnce({
          config: { referenceRateFeedID: rateFeedId2 },
        })

      // First hop is BIDIRECTIONAL, second is DISABLED
      mockBreakerBox.getRateFeedTradingMode
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(2)

      const isTradable = await testee.isPairTradable(fakeEURmTokenAddr, fakeBRLmTokenAddr)

      expect(isTradable).toBe(false)
    })

    it('should check all exchanges in the path for multi-hop pair', async () => {
      const rateFeedId1 = '0xA1A8003936862E7a15092A91898D69fa8bCE290c'
      const rateFeedId2 = '0xB2B8003936862E7a15092A91898D69fa8bCE290c'
      
      mockBiPoolManager.getPoolExchange
        .mockResolvedValueOnce({
          config: { referenceRateFeedID: rateFeedId1 },
        })
        .mockResolvedValueOnce({
          config: { referenceRateFeedID: rateFeedId2 },
        })

      mockBreakerBox.getRateFeedTradingMode
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)

      await testee.isPairTradable(fakeEURmTokenAddr, fakeBRLmTokenAddr)

      // Should have fetched config for both hops
      expect(mockBiPoolManager.getPoolExchange).toHaveBeenCalledTimes(2)
      expect(mockBreakerBox.getRateFeedTradingMode).toHaveBeenCalledTimes(2)
    })

    it('should throw error when pair does not exist', async () => {
      const nonExistentToken1 = '0x1111111111111111111111111111111111111111'
      const nonExistentToken2 = '0x2222222222222222222222222222222222222222'

      await expect(
        testee.isPairTradable(nonExistentToken1, nonExistentToken2)
      ).rejects.toThrow()
    })
  })
})
