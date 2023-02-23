import { BigNumber, Contract, Signer, constants, providers } from 'ethers'

import { Address } from './types'

/**
 * Returns the broker address from the Celo registry
 * @param signerOrProvider an ethers provider or signer
 * @returns the broker address
 */
export async function getBrokerAddressFromRegistry(
  signerOrProvider: Signer | providers.Provider
): Promise<Address> {
  const celoRegistryAddress = '0x000000000000000000000000000000000000ce10'
  const brokerIdentifier = 'Broker'

  const registryAbi = [
    'function getAddressForString(string calldata identifier) external view returns (address)',
  ]
  const contract = new Contract(
    celoRegistryAddress,
    registryAbi,
    signerOrProvider
  )

  const brokerAddress = await contract.getAddressForString(brokerIdentifier)
  if (brokerAddress === constants.AddressZero) {
    throw Error('Broker address not found in the registry')
  }

  return brokerAddress
}

/**
 * Returns the symbol of an erc20 token
 * @param tokenAddr the address of the erc20 token
 * @param signerOrProvider an ethers provider or signer
 * @returns the symbol of the erc20 token
 */
export async function getSymbolFromTokenAddress(
  tokenAddr: Address,
  signerOrProvider: Signer | providers.Provider
): Promise<string> {
  const erc20Abi = ['function symbol() external view returns (string memory)']
  const contract = new Contract(tokenAddr, erc20Abi, signerOrProvider)

  return contract.symbol()
}

/**
 * Returns a populated tx obj for increasing the allowance of a spender for a given erc20 token by a given amount
 * @param tokenAddr the address of the erc20 token
 * @param spender the address of the spender
 * @param amount the amount to increase the allowance by
 * @param signer an ethers signer
 * @returns the populated TransactionRequest object
 */
export async function increaseAllowance(
  tokenAddr: string,
  spender: string,
  amount: BigNumber,
  signer: Signer
): Promise<providers.TransactionRequest> {
  const abi = [
    'function increaseAllowance(address spender, uint256 value) external returns (bool)',
  ]
  const contract = new Contract(tokenAddr, abi, signer)

  return await contract.populateTransaction.increaseAllowance(spender, amount)
}
