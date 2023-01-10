import { Provider } from '@ethersproject/providers'
import { Contract, constants } from 'ethers'

export async function getBrokerAddressFromRegistry(
  provider: Provider
): Promise<string> {
  const celoRegistryAddress = '0x000000000000000000000000000000000000ce10'
  const brokerIdentifier = 'Broker'

  const registryFnSignature = [
    'function getAddressForString(string calldata identifier) external view returns (address)',
  ]
  const contract = new Contract(
    celoRegistryAddress,
    registryFnSignature,
    provider
  )

  const brokerAddress = await contract.getAddressForString(brokerIdentifier)
  if (brokerAddress === constants.AddressZero) {
    throw Error('Broker address not found in the registry')
  }

  return brokerAddress
}
