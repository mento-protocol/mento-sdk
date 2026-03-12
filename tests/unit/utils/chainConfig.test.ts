import { getDefaultRpcUrl, getChainConfig } from '../../../src/utils/chainConfig'
import { ChainId } from '../../../src/core/constants/chainId'

describe('getDefaultRpcUrl()', () => {
  it('returns forno mainnet URL for Celo mainnet', () => {
    const url = getDefaultRpcUrl(ChainId.CELO)
    expect(url).toBe('https://forno.celo.org')
  })

  it('returns testnet forno URL for Celo Sepolia', () => {
    const url = getDefaultRpcUrl(ChainId.CELO_SEPOLIA)
    expect(url).toBe('https://forno.celo-sepolia.celo-testnet.org')
  })

  it('throws for an unknown chain ID', () => {
    expect(() => getDefaultRpcUrl(1)).toThrow('Unsupported chain ID: 1')
  })

  it('throws for chain ID 0', () => {
    expect(() => getDefaultRpcUrl(0)).toThrow('Unsupported chain ID: 0')
  })

  it('returns a string for each supported chain', () => {
    for (const chainId of [ChainId.CELO, ChainId.CELO_SEPOLIA]) {
      expect(typeof getDefaultRpcUrl(chainId)).toBe('string')
    }
  })
})

describe('getChainConfig()', () => {
  it('returns celo viem chain config for Celo mainnet', () => {
    const chain = getChainConfig(ChainId.CELO)
    expect(chain.id).toBe(ChainId.CELO)
    expect(chain.name).toMatch(/celo/i)
  })

  it('returns celoSepolia chain config for Celo Sepolia', () => {
    const chain = getChainConfig(ChainId.CELO_SEPOLIA)
    expect(chain.id).toBe(ChainId.CELO_SEPOLIA)
    expect(chain.name).toMatch(/sepolia/i)
    expect(chain.testnet).toBe(true)
  })

  it('throws for an unknown chain ID', () => {
    expect(() => getChainConfig(999)).toThrow('Unsupported chain ID: 999')
  })

  it('throws for chain ID 0', () => {
    expect(() => getChainConfig(0)).toThrow('Unsupported chain ID: 0')
  })

  it('returned chain config has required viem fields', () => {
    const chain = getChainConfig(ChainId.CELO)
    expect(chain).toHaveProperty('id')
    expect(chain).toHaveProperty('name')
    expect(chain).toHaveProperty('nativeCurrency')
    expect(chain).toHaveProperty('rpcUrls')
  })

  it('Celo mainnet is not a testnet', () => {
    const chain = getChainConfig(ChainId.CELO)
    expect(chain.testnet).toBeFalsy()
  })

  it('Celo Sepolia default RPC matches chainConfig default RPC', () => {
    const rpcFromChainConfig = getDefaultRpcUrl(ChainId.CELO_SEPOLIA)
    const chain = getChainConfig(ChainId.CELO_SEPOLIA)
    expect(chain.rpcUrls.default.http[0]).toBe(rpcFromChainConfig)
  })
})
