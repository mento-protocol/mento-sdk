import {
  BiPoolManager__factory,
  IBreakerBox__factory,
  IBroker__factory,
  IExchangeProvider__factory,
} from '@mento-protocol/mento-core-ts'
import { Contract, Wallet, constants, ethers, providers, utils } from 'ethers'

import { Mento } from './mento'

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
  const fakecUSDTokenAddr = 'cUSDTokenAddr'
  const fakecEURTokenAddr = 'cEURTokenAddr'
  const fakecBRLTokenAddr = 'cBRLTokenAddr'
  const fakeCeloTokenAddr = 'celoTokenAddr'
  const fakeSymbolsByTokenAddr = {
    [fakecUSDTokenAddr]: 'cUSD',
    [fakecEURTokenAddr]: 'cEUR',
    [fakecBRLTokenAddr]: 'cBRL',
    [fakeCeloTokenAddr]: 'CELO',
  }

  // fake exchange providers and exchanges
  const fakeUsdAndEurExchangeProvider = 'ExchangeProvider0'
  const fakeBrlExchangeProvider = 'ExchangeProvider1'
  const fakeCeloUSDExchange = {
    exchangeId: 'ExchangeCeloCUSDAddr',
    assets: [fakecUSDTokenAddr, fakeCeloTokenAddr],
  }
  const fakeCeloEURExchange = {
    exchangeId: 'ExchangeCeloCEURAddr',
    assets: [fakecEURTokenAddr, fakeCeloTokenAddr],
  }
  const fakeCeloBRLExchange = {
    exchangeId: 'ExchangeCeloCBRLAddr',
    assets: [fakecBRLTokenAddr, fakeCeloTokenAddr],
  }
  const fakeExchangesByProviders = {
    [fakeUsdAndEurExchangeProvider]: [fakeCeloUSDExchange, fakeCeloEURExchange],
    [fakeBrlExchangeProvider]: [fakeCeloBRLExchange],
    ExchangeProvider2: [],
  }
  const nOfFakeExchanges = Object.values(fakeExchangesByProviders).reduce(
    (acc, curr) => acc + curr.length,
    0
  )

  // ========== Mock contract factories ==========
  const fakeBrokerAddr = 'fakeBrokerAddr'
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
    signer = new Wallet(pk, provider)
    signerWithoutProvider = new Wallet(pk)
  })

  afterEach(async () => {
    jest.clearAllMocks()
  })

  describe('create', () => {
    it('should return a Mento instance with the registry broker address', async () => {
      const testee = await Mento.create(provider)
      expect(testee).toBeDefined()
      expect(fakeRegistryContract.getAddressForString).toHaveBeenCalledTimes(1)
      expect(mockContractModule).toHaveBeenCalledTimes(1)
      expect(mockContractModule.mock.lastCall![0]).toBe(celoRegistryAddress)

      const testee2 = await Mento.create(signer)
      expect(testee2).toBeDefined()
      expect(fakeRegistryContract.getAddressForString).toHaveBeenCalledTimes(2)
      expect(mockContractModule).toHaveBeenCalledTimes(2)
      expect(mockContractModule.mock.lastCall![0]).toBe(celoRegistryAddress)
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
    it('should return a Mento instance without querying the registry', () => {
      const testee = Mento.createWithParams(provider, fakeBrokerAddr)
      expect(testee).toBeDefined()
      expect(mockContractModule).toHaveBeenCalledTimes(0)
      expect(fakeRegistryContract.getAddressForString).toHaveBeenCalledTimes(0)

      const testee2 = Mento.createWithParams(signer, fakeBrokerAddr)
      expect(testee2).toBeDefined()
      expect(mockContractModule).toHaveBeenCalledTimes(0)
      expect(fakeRegistryContract.getAddressForString).toHaveBeenCalledTimes(0)
    })

    it('should throw if the signer has no provider', () => {
      expect(() =>
        Mento.createWithParams(signerWithoutProvider, fakeBrokerAddr)
      ).toThrow('Signer must be connected to a provider')
    })

    it('should throw if no signer or provider is provided', () => {
      //@ts-ignore
      expect(() => Mento.createWithParams(fakeBrokerAddr)).toThrow(
        'A valid signer or provider must be provided'
      )
    })
  })

  describe('getTradeablePairs', () => {
    it('should return an array of tuples with all the tradeable pairs', async () => {
      const testee = await Mento.create(provider)

      const pairs = await testee.getTradeablePairs()
      expect(pairs.length).toBe(nOfFakeExchanges)

      for (const [, mockedExchanges] of Object.entries(
        fakeExchangesByProviders
      )) {
        for (const mockedExchange of mockedExchanges) {
          const asset0Addr = mockedExchange.assets[0]
          const asset1Addr = mockedExchange.assets[1]
          const pairOfMockedExchange = [
            {
              address: asset0Addr,
              symbol:
                fakeSymbolsByTokenAddr[
                  asset0Addr as keyof typeof fakeSymbolsByTokenAddr
                ],
            },
            {
              address: asset1Addr,
              symbol:
                fakeSymbolsByTokenAddr[
                  asset1Addr as keyof typeof fakeSymbolsByTokenAddr
                ],
            },
          ]
          expect(pairs).toContainEqual(pairOfMockedExchange)
        }
      }
    })
  })

  describe('getAmountIn', () => {
    it('should call broker.getAmountIn with the right parameters', async () => {
      const testee = await Mento.create(provider)

      for (const [mockedProvider, mockedExchanges] of Object.entries(
        fakeExchangesByProviders
      )) {
        for (const exchange of mockedExchanges) {
          const tokenIn = exchange.assets[0]
          const tokenOut = exchange.assets[1]
          await testee.getAmountIn(tokenIn, tokenOut, oneInWei)
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

    it('should throw if no exchange is found for the given tokens', async () => {
      const testee = await Mento.create(provider)
      await expect(
        testee.getAmountIn(
          fakeCeloEURExchange.assets[0],
          'nonExistentAssetAddr',
          oneInWei
        )
      ).rejects.toThrow()
    })
  })

  describe('getAmountOut', () => {
    it('should call broker.getAmountOut with the right parameters', async () => {
      const testee = await Mento.create(provider)

      for (const [mockedProvider, mockedExchanges] of Object.entries(
        fakeExchangesByProviders
      )) {
        for (const exchange of mockedExchanges) {
          const tokenIn = exchange.assets[1]
          const tokenOut = exchange.assets[0]
          await testee.getAmountOut(tokenIn, tokenOut, oneInWei)
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

    it('should throw if no exchange is found for the given tokens', async () => {
      const testee = await Mento.create(provider)
      await expect(
        testee.getAmountOut(
          fakeCeloUSDExchange.assets[1],
          'nonExistentAssetAddr',
          oneInWei
        )
      ).rejects.toThrow()
    })
  })

  describe('increaseTradingAllowance', () => {
    it('should return a populated increaseAllowance tx object', async () => {
      const testee = await Mento.create(signer)
      const token = fakeCeloBRLExchange.assets[0]
      const amount = twoInWei

      const fakeTxObj = { to: '0x1337', data: '0x345' }
      const fakePopulatedTxObj = {
        to: '0x1337',
        data: '0x345',
        from: '0xad3',
        gasLimit: 2200,
      }

      increaseAllowanceFn.mockReturnValueOnce(fakeTxObj)
      const spy = jest
        .spyOn(signer, 'populateTransaction')
        // @ts-ignore
        .mockReturnValueOnce(fakePopulatedTxObj)

      const tx = await testee.increaseTradingAllowance(token, amount)
      expect(tx).toBe(fakePopulatedTxObj)
      expect(increaseAllowanceFn).toHaveBeenCalledTimes(1)
      expect(increaseAllowanceFn).toHaveBeenCalledWith(fakeBrokerAddr, amount)
      expect(mockContractModule.mock.lastCall![0]).toEqual(token)
      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy).toHaveBeenCalledWith(fakeTxObj)
    })
  })

  describe('swapIn', () => {
    it('should return a populated swapIn tx object', async () => {
      const testee = await Mento.create(signer)

      const tokenIn = fakeCeloBRLExchange.assets[1]
      const tokenOut = fakeCeloBRLExchange.assets[0]
      const amountIn = oneInWei
      const amountOutMin = twoInWei

      const fakeTxObj = { to: '0x1337', data: '0x345' }
      const fakePopulatedTxObj = {
        to: '0x123',
        data: '0x00456',
        from: '0xad3',
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
        amountIn,
        amountOutMin
      )
      expect(result).toBe(fakePopulatedTxObj)

      expect(mockBroker.populateTransaction.swapIn).toHaveBeenCalledTimes(1)
      expect(mockBroker.populateTransaction.swapIn).toHaveBeenCalledWith(
        fakeBrlExchangeProvider,
        fakeCeloBRLExchange.exchangeId,
        tokenIn,
        tokenOut,
        amountIn,
        amountOutMin
      )

      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy).toHaveBeenCalledWith(fakeTxObj)
    })

    it('should throw if no exchange is found for the given tokens', async () => {
      const testee = await Mento.create(signer)
      const tokenIn = fakeCeloEURExchange.assets[1]
      const tokenOut = 'nonExistentAssetAddr'

      await expect(
        testee.swapIn(tokenIn, tokenOut, oneInWei, oneInWei)
      ).rejects.toThrow(`No exchange found for ${tokenIn} and ${tokenOut}`)
    })
  })

  describe('swapOut', () => {
    it('should return a populated swapOut tx object', async () => {
      const testee = await Mento.create(signer)

      const tokenIn = fakeCeloUSDExchange.assets[0]
      const tokenOut = fakeCeloUSDExchange.assets[1]
      const amountOut = oneInWei
      const amountInMax = twoInWei

      const fakeTxObj = { to: '0x123', data: '0x456' }
      const fakePopulatedTxObj = {
        to: '0x123',
        data: '0x456',
        from: '0x789',
        gasLimit: 100,
      }
      mockBroker.populateTransaction.swapOut.mockReturnValueOnce(fakeTxObj)
      const spy = jest
        .spyOn(signer, 'populateTransaction')
        // @ts-ignore
        .mockReturnValueOnce(fakePopulatedTxObj)

      const result = await testee.swapOut(
        tokenIn,
        tokenOut,
        amountOut,
        amountInMax
      )
      expect(result).toBe(fakePopulatedTxObj)

      expect(mockBroker.populateTransaction.swapOut).toHaveBeenCalledTimes(1)
      expect(mockBroker.populateTransaction.swapOut).toHaveBeenCalledWith(
        fakeUsdAndEurExchangeProvider,
        fakeCeloUSDExchange.exchangeId,
        tokenIn,
        tokenOut,
        amountOut,
        amountInMax
      )

      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy).toHaveBeenCalledWith(fakeTxObj)
    })

    it('should throw if no exchange is found for the given tokens', async () => {
      const testee = await Mento.create(signer)
      const tokenIn = fakeCeloUSDExchange.assets[0]
      const tokenOut = 'fakeAsset'

      await expect(
        testee.swapOut(tokenIn, tokenOut, oneInWei, oneInWei)
      ).rejects.toThrow(`No exchange found for ${tokenIn} and ${tokenOut}`)
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
})
