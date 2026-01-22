import { Contract, Wallet, providers, utils } from 'ethers'
import {
  getChainId,
  getSymbolFromTokenAddress,
  increaseAllowance,
  toRateFeedId,
} from './utils'

jest.mock('ethers', () => {
  const actualEthers = jest.requireActual('ethers')
  return {
    ...actualEthers,
    ethers: actualEthers,
    constants: actualEthers.constants,
    providers: actualEthers.providers,
    Signer: actualEthers.Signer,
    utils: actualEthers.utils,
    Wallet: actualEthers.Wallet,
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

  describe('getSymbolFromTokenAddress', () => {
    it('should return the symbol of the erc20 contract address', async () => {
      const fakecUsdAddress = '0xUSDmAddress'
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
        from: '0x1234567890123456789012345678901234567890',
        data: '0x789',
      }
      increaseAllowanceFn.mockReturnValueOnce(fakePopulatedTxObj)

      const ten = utils.parseUnits('10', 18)
      const tx = await increaseAllowance(
        'fakeTokenAddr',
        'fakeSpender',
        ten,
        signer
      )
      expect(increaseAllowanceFn).toHaveBeenCalledTimes(1)
      expect(increaseAllowanceFn).toHaveBeenCalledWith('fakeSpender', ten)
      expect(tx).toEqual(fakePopulatedTxObj)
    })
  })

  describe('getChainId', () => {
    it('should return the chain ID from a signer or provider', async () => {
      provider.getNetwork = jest
        .fn()
        .mockResolvedValue({ chainId: 42220, name: 'celo' })
      const chainId = await getChainId(provider)
      expect(chainId).toBe(42220)
    })
  })

  describe('toRateFeedId', () => {
    it('should compute correct rate feed ID for EURUSD', () => {
      const rateFeedId = toRateFeedId('EURUSD')
      // This is the actual on-chain rate feed ID for EURUSD
      expect(rateFeedId).toBe('0x5d5a22116233bdb2a9c2977279cc348b8b8ce917')
    })

    it('should compute correct rate feed ID for CELOGBP', () => {
      const rateFeedId = toRateFeedId('CELOGBP')
      // Computed rate feed ID for CELOGBP
      expect(rateFeedId).toBe('0x57d8b6da3057ce2a40f9501f9891bb7388048d98')
    })

    it('should compute correct rate feed ID for relayed rate feeds', () => {
      const rateFeedId = toRateFeedId('relayed:COPUSD')
      // This is the actual on-chain rate feed ID for relayed:COPUSD
      expect(rateFeedId).toBe('0x0196d1f4fda21fa442e53eaf18bf31282f6139f1')
    })

    it('should be case sensitive', () => {
      const id1 = toRateFeedId('EURUSD')
      const id2 = toRateFeedId('eurusd')

      expect(id1).not.toBe(id2)
    })
  })
})
