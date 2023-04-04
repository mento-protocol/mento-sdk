import {
  Contract,
  Wallet,
  constants,
  providers,
  utils,
  Signer,
  PopulatedTransaction,
} from 'ethers'
import {
  ETHERS_ERROR_CODE_ESTIMATEGAS,
  ETHERS_ERROR_METHOD_ESTIMATEGAS,
} from './constants'
import {
  getBrokerAddressFromRegistry,
  getSymbolFromTokenAddress,
  increaseAllowance,
  simulateTransaction,
} from './utils'

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

const getAddressForString = jest.fn()
const symbol = jest.fn()
const increaseAllowanceFn = jest.fn()

// @ts-ignore
Contract.mockImplementation(() => ({
  getAddressForString,
  populateTransaction: {
    increaseAllowance: increaseAllowanceFn,
  },
  symbol,
}))

let provider: providers.JsonRpcProvider
let signer: Wallet

describe('Utils', () => {
  beforeAll(() => {
    provider = new providers.JsonRpcProvider()
    signer = new Wallet(Wallet.createRandom().privateKey, provider)
  })

  describe('getBrokerAddressFromRegistry', () => {
    it('should return the broker address from the registry', async () => {
      const expectedBrokerAddr = '0xFakeBrokerAddress'
      getAddressForString.mockReturnValueOnce(expectedBrokerAddr)

      expect(await getBrokerAddressFromRegistry(provider)).toBe(
        expectedBrokerAddr
      )
      expect(getAddressForString).toHaveBeenCalledTimes(1)
      expect(getAddressForString).toHaveBeenCalledWith('Broker')
    })

    it('should throw when the registry returns the null address 0x...00', async () => {
      getAddressForString.mockReturnValueOnce(constants.AddressZero)

      expect(async () => {
        await getBrokerAddressFromRegistry(provider)
      }).rejects.toThrow()
    })
  })

  describe('getSymbolFromTokenAddress', () => {
    it('should return the symbol of the erc20 contract address', async () => {
      const fakecUsdAddress = '0xcUSDAddress'
      symbol.mockReturnValueOnce('fakeSymbol')

      expect(await getSymbolFromTokenAddress(fakecUsdAddress, provider)).toBe(
        'fakeSymbol'
      )
      expect(symbol).toHaveBeenCalledTimes(1)
    })
  })

  describe('increaseAllowance', () => {
    it('should return a populated increaseAllowance tx object', async () => {
      const fakePopulatedTxObj = {
        from: '0x123',
        data: '0x789',
      }
      increaseAllowanceFn.mockReturnValueOnce(fakePopulatedTxObj)

      const ten = utils.parseUnits('10', 18)
      const tx = await increaseAllowance(
        'fakeTokenAddr',
        'fakeSpender',
        ten,
        signer,
        false
      )
      expect(increaseAllowanceFn).toHaveBeenCalledTimes(1)
      expect(increaseAllowanceFn).toHaveBeenCalledWith('fakeSpender', ten)
      expect(tx).toEqual(fakePopulatedTxObj)
    })
  })

  describe('simulateTransaction', () => {
    const mockSigner: Signer = {
      estimateGas: jest.fn(),
      getAddress: jest.fn(),
      provider: null,
    } as unknown as Signer

    const mockProvider: providers.Provider = {
      estimateGas: jest.fn(),
    } as unknown as providers.Provider

    const mockPopulatedTxObj: PopulatedTransaction = {
      from: '0x123',
      data: '0x789',
    }

    it('should call signer estimate gas successfully when no underlying error is thrown', async () => {
      await simulateTransaction(mockSigner, mockPopulatedTxObj)

      expect(mockSigner.estimateGas).toHaveBeenCalledTimes(1)
      expect(mockSigner.estimateGas).toHaveBeenCalledWith(mockPopulatedTxObj)
    })

    it('should call provider estimate gas successfully when no underlying error is thrown', async () => {
      await simulateTransaction(mockProvider, mockPopulatedTxObj)

      expect(mockProvider.estimateGas).toHaveBeenCalledTimes(1)
      expect(mockProvider.estimateGas).toHaveBeenCalledWith(mockPopulatedTxObj)
    })

    it('should throw an error with extracted reason when provider throws an unknown error', async () => {
      const reason = 'execution reverted: Breakerbox did not break'
      mockProvider.estimateGas = jest.fn().mockImplementation(() => {
        throw new mockEthersError(
          ETHERS_ERROR_CODE_ESTIMATEGAS,
          ETHERS_ERROR_METHOD_ESTIMATEGAS,
          reason
        )
      })

      await expect(
        simulateTransaction(mockProvider, mockPopulatedTxObj)
      ).rejects.toThrowError('Breakerbox did not break')
    })

    it('should throw an error with friendly reason when provider throws a known error', async () => {
      const expectedErrorMessage =
        'The exchange provider specified does not exist'
      mockProvider.estimateGas = jest.fn().mockImplementation(() => {
        throw new mockEthersError(
          ETHERS_ERROR_CODE_ESTIMATEGAS,
          ETHERS_ERROR_METHOD_ESTIMATEGAS,
          'execution reverted: ExchangeProvider does not exist'
        )
      })

      await expect(
        simulateTransaction(mockProvider, mockPopulatedTxObj)
      ).rejects.toThrowError(expectedErrorMessage)
    })

    it('should rethrow error when error code is not estimate gas', async () => {
      const mockError = new mockEthersError('INSUFFICIENT_FUNDS', '', '')
      mockError.message = 'execution reverted: Some error message'

      mockProvider.estimateGas = jest.fn().mockImplementation(() => {
        throw mockError
      })

      await expect(
        simulateTransaction(mockProvider, mockPopulatedTxObj)
      ).rejects.toThrowError('execution reverted: Some error message')
    })

    it('should rethrow error when error method is not estimate gas', async () => {
      const mockError = new mockEthersError('', 'CALL_EXCEPTION', '')
      mockError.message = 'execution reverted: Some error message'

      mockProvider.estimateGas = jest.fn().mockImplementation(() => {
        throw mockError
      })

      await expect(
        simulateTransaction(mockProvider, mockPopulatedTxObj)
      ).rejects.toThrowError('execution reverted: Some error message')
    })
  })
})

class mockEthersError extends Error {
  code: string
  method: string
  reason: string

  constructor(code: string, method: string, reason: string) {
    super()
    this.code = code
    this.method = method
    this.reason = reason
  }
}
