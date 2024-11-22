import { addresses, getContractAddress, ChainId } from '../../src/constants/'
import { isAddress } from 'ethers'

describe('Addresses Unit Tests', () => {
  it('should maintain consistent contract structure across all chains', () => {
    // Test that all chain IDs have address mappings
    expect(Object.keys(addresses).length).toEqual(
      Object.keys(ChainId).length / 2
    )

    // Test that all chains have the same contract keys
    const contractKeys = Object.keys(addresses[ChainId.CELO])
    for (const chainId of Object.values(ChainId)) {
      if (typeof chainId === 'number') {
        const chainKeys = Object.keys(addresses[chainId])
        expect(chainKeys.sort()).toEqual(contractKeys.sort())
      }
    }
  })

  it('should correctly retrieve and validate contract addresses', () => {
    // Test valid contract address retrieval
    const brokerAddress = getContractAddress(ChainId.CELO, 'Broker')
    expect(brokerAddress).toEqual('0x777A8255cA72412f0d706dc03C9D1987306B4CaD')

    // Test address format
    const governanceAddress = getContractAddress(
      ChainId.CELO,
      'GovernanceFactory'
    )
    expect(isAddress(governanceAddress)).toBe(true)
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
        for (const [contractName, address] of Object.entries(
          addresses[chainId]
        )) {
          if (address !== '0x0' && address !== '0xNotDeployed') {
            expect(isAddress(address)).toBe(true)
          }
        }
      }
    }
  })
})
