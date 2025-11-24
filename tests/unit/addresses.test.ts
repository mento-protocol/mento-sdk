import { addresses, getContractAddress, ChainId } from '../../src/constants/'
import { isAddress } from 'ethers'

describe('Addresses Unit Tests', () => {
  it('should have address mappings for all supported chains', () => {
    // Test that all chain IDs have address mappings
    expect(Object.keys(addresses).length).toEqual(
      Object.keys(ChainId).length / 2
    )

    // Each chain should have at least the DEX contracts needed for exchange
    for (const chainId of Object.values(ChainId)) {
      if (typeof chainId === 'number') {
        const chainAddresses = addresses[chainId]
        expect(chainAddresses).toBeDefined()
        // BiPoolManager and Broker are required for the SDK to function
        expect(chainAddresses.BiPoolManager).toBeDefined()
        expect(chainAddresses.Broker).toBeDefined()
      }
    }
  })

  it('should correctly retrieve and validate contract addresses', () => {
    // Test valid contract address retrieval
    const brokerAddress = getContractAddress(ChainId.CELO, 'Broker')
    expect(brokerAddress).toEqual('0x777A8255cA72412f0d706dc03C9D1987306B4CaD')

    // Test address format
    const biPoolManagerAddress = getContractAddress(ChainId.CELO, 'BiPoolManager')
    expect(isAddress(biPoolManagerAddress)).toBe(true)

    // Test that missing addresses throw
    expect(() =>
      getContractAddress(ChainId.CELO_SEPOLIA, 'GovernanceFactory')
    ).toThrow('Address not found')
  })

  it('should return different addresses for different chains', () => {
    // Test different chains return different addresses
    const celoAddress = getContractAddress(ChainId.CELO, 'Broker')
    const alfajoresAddress = getContractAddress(ChainId.ALFAJORES, 'Broker')
    expect(celoAddress).not.toEqual(alfajoresAddress)
  })

  it('should validate all contract addresses follow correct format', () => {
    // Test all deployed contract addresses have valid format
    for (const chainId of Object.values(ChainId)) {
      if (typeof chainId === 'number') {
        for (const [, address] of Object.entries(addresses[chainId])) {
          if (address && address !== '0x0' && address !== '0xNotDeployed') {
            expect(isAddress(address)).toBe(true)
          }
        }
      }
    }
  })
})
