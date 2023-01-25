import { BigNumber, Contract, Signer, constants, providers } from 'ethers'

/**
 * Returns the broker address from the Celo registry
 * @param provider an ethers provider
 * @returns the broker address
 */
export async function getBrokerAddressFromRegistry(
  provider: providers.Provider
): Promise<Address> {
  const celoRegistryAddress = '0x000000000000000000000000000000000000ce10'
  const brokerIdentifier = 'Broker'

  const registryAbi = [
    'function getAddressForString(string calldata identifier) external view returns (address)',
  ]
  const contract = new Contract(celoRegistryAddress, registryAbi, provider)

  const brokerAddress = await contract.getAddressForString(brokerIdentifier)
  if (brokerAddress === constants.AddressZero) {
    throw Error('Broker address not found in the registry')
  }

  return brokerAddress
}

/**
 * Returns the symbol of an erc20 token
 * @param provider an ethers provider
 * @param tokenAddr the address of the erc20 token
 * @returns the symbol of the erc20 token
 */
export async function getSymbolFromTokenAddress(
  provider: providers.Provider,
  tokenAddr: Address
): Promise<string> {
  const erc20Abi = ['function symbol() external view returns (string memory)']
  const contract = new Contract(tokenAddr, erc20Abi, provider)

  return await contract.symbol()
}
