import { JsonRpcProvider, Provider } from '@ethersproject/providers'
import {
  getBrokerAddressFromRegistry,
  getSymbolFromTokenAddress,
} from '../src/utils'

import { Contract } from 'ethers'

jest.mock('ethers')

const getAddressForString = jest.fn()
const symbol = jest.fn()

// @ts-ignore
Contract.mockImplementation(() => ({
  getAddressForString,
  symbol,
}))

describe('Utils', () => {
  const fakeProvider = new JsonRpcProvider('fakeProviderUrl')

  describe('getBrokerAddressFromRegistry', () => {
    it('should return the broker address from the registry', async () => {
      const expectedBrokerAddr = '0xFakeBrokerAddress'

      getAddressForString.mockReturnValue(expectedBrokerAddr)
      let result = await getBrokerAddressFromRegistry(fakeProvider)

      expect(result).toBe(expectedBrokerAddr)
    })

    it('should throw when the registry returns the null address 0x...00', async () => {
      getAddressForString.mockReturnValue(
        '0x0000000000000000000000000000000000000000'
      )

      expect(async () => {
        await getBrokerAddressFromRegistry(fakeProvider)
      }).rejects.toThrow()
    })
  })

  describe('getSymbolFromTokenAddress', () => {
    it('should return the symbol of the erc20 contract address', async () => {
      const fakecUsdAddress = '0xcUSDAddress'

      symbol.mockReturnValue('fakeSymbol')
      let result = await getSymbolFromTokenAddress(
        fakeProvider,
        fakecUsdAddress
      )

      expect(result).toBe('fakeSymbol')
    })
  })
})
