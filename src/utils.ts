import { BigNumber, constants, Contract, providers, Signer } from 'ethers'

import { Address } from './types'

/**
 * Ensures that given signer is truly a a connected signer
 * @param signer an ethers signer
 * @throws if signer is invalid or not connected
 */
export function validateSigner(signer: Signer) {
  if (!Signer.isSigner(signer)) {
    throw new Error('A valid signer must be provided')
  }

  if (!providers.Provider.isProvider(signer.provider)) {
    throw new Error('Signer must be connected to a provider')
  }
}

/**
 * Ensures that given signerOrProvider is truly a provider or a connected signer
 * @param signerOrProvider an ethers provider or signer
 * @throws if signerOrProvider is invalid or not connected
 */
export function validateSignerOrProvider(
  signerOrProvider: Signer | providers.Provider
) {
  const isSigner = Signer.isSigner(signerOrProvider)
  const isProvider = providers.Provider.isProvider(signerOrProvider)

  if (!isSigner && !isProvider) {
    throw new Error('A valid signer or provider must be provided')
  }

  if (isSigner && !providers.Provider.isProvider(signerOrProvider.provider)) {
    throw new Error('Signer must be connected to a provider')
  }
}

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
