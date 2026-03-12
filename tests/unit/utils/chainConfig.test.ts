import { celo } from 'viem/chains'
import { getDefaultRpcUrl, getChainConfig } from '../../../src/utils/chainConfig'
import { ChainId } from '../../../src/core/constants/chainId'

describe('getDefaultRpcUrl()', () => {
  it('returns Celo mainnet RPC URL for ChainId.CELO', () => {
    expect(getDefaultRpcUrl(ChainId.CELO)).toBe('https://forno.celo.org')
  })

  it('returns Celo Sepolia RPC URL for ChainId.CELO_SEPOLIA', () => {
    expect(getDefaultRpcUrl(ChainId.CELO_SEPOLIA)).toBe(
      'https://forno.celo-sepolia.celo-testnet.org'
    )
  })

  it('throws for an unknown chain ID', () => {
    expect(() => getDefaultRpcUrl(1)).toThrow('Unsupported chain ID: 1')
  })

  it('throws for chain ID 0', () => {
    expect(() => getDefaultRpcUrl(0)).toThrow('Unsupported chain ID: 0')
  })
})

describe('getChainConfig()', () => {
  it('returns the viem celo chain object for ChainId.CELO', () => {
    const chain = getChainConfig(ChainId.CELO)
    expect(chain).toBe(celo)
    expect(chain.id).toBe(42220)
  })

  it('returns Celo Sepolia chain config for ChainId.CELO_SEPOLIA', () => {
    const chain = getChainConfig(ChainId.CELO_SEPOLIA)
    expect(chain.id).toBe(11142220)
    expect(chain.name).toBe('Celo Sepolia')
    expect(chain.testnet).toBe(true)
  })

  it('returned Celo Sepolia config has expected RPC URL', () => {
    const chain = getChainConfig(ChainId.CELO_SEPOLIA)
    expect(chain.rpcUrls.default.http[0]).toBe(
      'https://forno.celo-sepolia.celo-testnet.org'
    )
  })

  it('throws for an unknown chain ID', () => {
    expect(() => getChainConfig(1)).toThrow('Unsupported chain ID: 1')
  })

  it('throws for a negative chain ID', () => {
    expect(() => getChainConfig(-1)).toThrow('Unsupported chain ID: -1')
  })
})
