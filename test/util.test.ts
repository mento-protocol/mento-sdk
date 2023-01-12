import { JsonRpcProvider } from '@ethersproject/providers'
import { Contract } from 'ethers'
import {
  getBrokerAddressFromRegistry,
  getSymbolFromTokenAddress,
} from '../src/utils'

jest.mock('ethers')

const getAddressForString = jest.fn()
const symbol = jest.fn()
// @ts-ignore
Contract.mockImplementation(() => ({
  getAddressForString,
  symbol,
}))

describe('Utils', () => {
  describe('getBrokerAddressFromRegistry()', () => {
    it('should return the broker address from the registry', async () => {
      const expectedBrokerAddr = '0xFakeBrokerAddress'

      getAddressForString.mockReturnValue(expectedBrokerAddr)
      let result = await getBrokerAddressFromRegistry(
        new JsonRpcProvider('FakeProviderUrl')
      )

      expect(result).toBe(expectedBrokerAddr)
    })

    it('should throw when the registry returns the null address 0x...00', async () => {
      getAddressForString.mockReturnValue(
        '0x0000000000000000000000000000000000000000'
      )

      expect(async () => {
        await getBrokerAddressFromRegistry(
          new JsonRpcProvider('FakeProviderUrl')
        )
      }).rejects.toThrow()
    })
  })

  describe('getSymbolFromTokenAddress()', () => {
    it('should return the symbol of the erc20 contract address', async () => {
      const fakecUsdAddress = '0xcUSDAddress'

      symbol.mockReturnValue('cUSD')
      let result = await getSymbolFromTokenAddress(
        new JsonRpcProvider('https://baklava-forno.celo-testnet.org'),
        fakecUsdAddress
      )

      expect(result).toBe('cUSD')
    })
  })
})
