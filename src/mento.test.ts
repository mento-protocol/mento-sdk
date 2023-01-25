import { Contract, providers, utils } from 'ethers'
import {
  IBroker__factory,
  IExchangeProvider__factory,
} from '@mento-protocol/mento-core-ts'

import { Mento } from './mento'

jest.mock('@mento-protocol/mento-core-ts')
jest.mock('ethers')
jest.setTimeout(60 * 1000)

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

  // fake ethers objects for initializing Mento
  const fakeProvider = new providers.JsonRpcProvider('fakeProviderUrl')
  const mockSignerWithoutProvider = {
    sendTransaction: jest.fn(),
  }
  const mockSignerWithProvider = {
    ...mockSignerWithoutProvider,
    provider: fakeProvider,
  }

  const mockBrokerFactory = {
    getExchangeProviders: jest.fn(() => Object.keys(fakeExchangesByProviders)),
    getAmountIn: jest.fn(),
    getAmountOut: jest.fn(),
    populateTransaction: {
      swapOut: jest.fn(),
      swapIn: jest.fn(),
    },
  }

  // @ts-ignore
  IBroker__factory.connect.mockReturnValue(mockBrokerFactory)

  // @ts-ignore
  IExchangeProvider__factory.connect = jest.fn(
    (exchangeProvider: string, _) => {
      return {
        getExchanges: () =>
          fakeExchangesByProviders[
            exchangeProvider as keyof typeof fakeExchangesByProviders
          ],
      }
    }
  )

  // @ts-ignore
  Contract.mockImplementation((contractAddr: string) => {
    const celoRegistryAddress = '0x000000000000000000000000000000000000ce10'
    if (contractAddr === celoRegistryAddress) {
      return {
        getAddressForString: jest.fn(),
      }
    } else if (Object.keys(fakeSymbolsByTokenAddr).includes(contractAddr)) {
      return {
        symbol: jest.fn(
          () =>
            fakeSymbolsByTokenAddr[
              contractAddr as keyof typeof fakeSymbolsByTokenAddr
            ]
        ),
      }
    } else {
      throw new Error('Unknown contract address with no mock implementation')
    }
  })

  let mento: Mento
  let mentoWithSigner: Mento

  beforeEach(async () => {
    mento = await Mento.create(fakeProvider)
    // @ts-ignore
    mentoWithSigner = await Mento.create(fakeProvider, mockSignerWithProvider)
  })

  afterEach(async () => {
    jest.clearAllMocks()
  })

  describe('getTradeablePairs', () => {
    it('should return an array of tuples with all the tradeable pairs', async () => {
      let pairs = await mento.getTradeablePairs()
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
      for (const [mockedProvider, mockedExchanges] of Object.entries(
        fakeExchangesByProviders
      )) {
        for (let exchange of mockedExchanges) {
          const tokenIn = exchange.assets[0]
          const tokenOut = exchange.assets[1]
          await mento.getAmountIn(tokenIn, tokenOut, oneInWei)
          expect(mockBrokerFactory.getAmountIn).toHaveBeenCalledWith(
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
      await expect(
        mento.getAmountIn(
          fakeCeloEURExchange.assets[0],
          'nonExistentAssetAddr',
          oneInWei
        )
      ).rejects.toThrow()
    })
  })

  describe('getAmountOut', () => {
    it('should call broker.getAmountOut with the right parameters', async () => {
      for (const [mockedProvider, mockedExchanges] of Object.entries(
        fakeExchangesByProviders
      )) {
        for (let exchange of mockedExchanges) {
          const tokenIn = exchange.assets[1]
          const tokenOut = exchange.assets[0]
          await mento.getAmountOut(tokenIn, tokenOut, oneInWei)
          expect(mockBrokerFactory.getAmountOut).toHaveBeenCalledWith(
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
      await expect(
        mento.getAmountOut(
          fakeCeloUSDExchange.assets[1],
          'nonExistentAssetAddr',
          oneInWei
        )
      ).rejects.toThrow()
    })
  })

  describe('swapIn', () => {
    it('should submit a swapIn tx', async () => {
      const tokenIn = fakeCeloBRLExchange.assets[1]
      const tokenOut = fakeCeloBRLExchange.assets[0]
      const amountIn = oneInWei
      const amountOutMin = twoInWei

      const fakeTxObj = { to: '0x1337', data: '0x345' }
      mockBrokerFactory.populateTransaction.swapIn.mockReturnValueOnce(
        fakeTxObj
      )
      await mentoWithSigner.swapIn(tokenIn, tokenOut, amountIn, amountOutMin)

      expect(
        mockBrokerFactory.populateTransaction.swapIn
      ).toHaveBeenCalledTimes(1)

      expect(mockBrokerFactory.populateTransaction.swapIn).toHaveBeenCalledWith(
        fakeBrlExchangeProvider,
        fakeCeloBRLExchange.exchangeId,
        tokenIn,
        tokenOut,
        amountIn,
        amountOutMin
      )
      expect(mockSignerWithProvider.sendTransaction).toHaveBeenCalledTimes(1)
      expect(mockSignerWithProvider.sendTransaction).toHaveBeenCalledWith(
        fakeTxObj
      )
    })

    it('should throw if no exchange is found for the given tokens', async () => {
      await expect(
        mentoWithSigner.swapIn(
          fakeCeloEURExchange.assets[1],
          'nonExistentAssetAddr',
          oneInWei,
          oneInWei
        )
      ).rejects.toThrow()
    })

    it('should throw if a signer is not provided', async () => {
      await expect(
        mento.swapIn(
          fakeCeloUSDExchange.assets[0],
          fakeCeloUSDExchange.assets[1],
          oneInWei,
          oneInWei
        )
      ).rejects.toThrow('A signer is required to execute a swap')
    })

    it('should throw if the signer is not connected to a provider', async () => {
      // @ts-ignore
      const testee = await Mento.create(fakeProvider, mockSignerWithoutProvider)
      await expect(
        testee.swapIn(
          fakeCeloUSDExchange.assets[0],
          fakeCeloUSDExchange.assets[1],
          oneInWei,
          oneInWei
        )
      ).rejects.toThrow(
        'The signer must be connected to a provider to execute a swap'
      )
    })
  })

  describe('swapOut', () => {
    it('should submit a swapOut tx', async () => {
      const tokenIn = fakeCeloUSDExchange.assets[0]
      const tokenOut = fakeCeloUSDExchange.assets[1]
      const amountOut = oneInWei
      const amountInMax = twoInWei

      const fakeTxObj = { to: '0x123', data: '0x456' }
      mockBrokerFactory.populateTransaction.swapOut.mockReturnValueOnce(
        fakeTxObj
      )
      await mentoWithSigner.swapOut(tokenIn, tokenOut, amountOut, amountInMax)

      expect(
        mockBrokerFactory.populateTransaction.swapOut
      ).toHaveBeenCalledTimes(1)

      expect(
        mockBrokerFactory.populateTransaction.swapOut
      ).toHaveBeenCalledWith(
        fakeUsdAndEurExchangeProvider,
        fakeCeloUSDExchange.exchangeId,
        tokenIn,
        tokenOut,
        amountOut,
        amountInMax
      )
      expect(mockSignerWithProvider.sendTransaction).toHaveBeenCalledTimes(1)
      expect(mockSignerWithProvider.sendTransaction).toHaveBeenCalledWith(
        fakeTxObj
      )
    })

    it('should throw if no exchange is found for the given tokens', async () => {
      await expect(
        mentoWithSigner.swapOut(
          fakeCeloUSDExchange.assets[0],
          'fakeAsset',
          oneInWei,
          oneInWei
        )
      ).rejects.toThrow()
    })

    it('should throw if a signer is not provided', async () => {
      await expect(
        mento.swapOut(
          fakeCeloUSDExchange.assets[0],
          fakeCeloUSDExchange.assets[1],
          oneInWei,
          oneInWei
        )
      ).rejects.toThrow('A signer is required to execute a swap')
    })

    it('should throw if the signer is not connected to a provider', async () => {
      // @ts-ignore
      const testee = await Mento.create(fakeProvider, mockSignerWithoutProvider)
      await expect(
        testee.swapOut(
          fakeCeloUSDExchange.assets[0],
          fakeCeloUSDExchange.assets[1],
          oneInWei,
          oneInWei
        )
      ).rejects.toThrow(
        'The signer must be connected to a provider to execute a swap'
      )
    })
  })
})
