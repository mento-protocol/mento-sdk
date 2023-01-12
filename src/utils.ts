import { Provider } from '@ethersproject/providers'
import { Contract, constants } from 'ethers'

export async function getBrokerAddressFromRegistry(
  provider: Provider
): Promise<string> {
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

export async function getSymbolFromTokenAddress(
  provider: Provider,
  tokenAddr: string
): Promise<string> {
  const erc20Abi = ['function symbol() external view returns (string memory)']
  const contract = new Contract(tokenAddr, erc20Abi, provider)

  return await contract.symbol()
}
