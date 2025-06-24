import { BigNumberish, constants, Contract, providers, Signer } from 'ethers'

import { Address } from './interfaces'
import { TradablePair } from './mento'

/**
 * Gets the chain ID from a signer or provider
 * @param signerOrProvider an ethers provider or signer
 * @returns the chain ID
 */
export async function getChainId(
  signerOrProvider: Signer | providers.Provider
): Promise<number> {
  const provider = Signer.isSigner(signerOrProvider)
    ? signerOrProvider.provider!
    : signerOrProvider
  return (await provider.getNetwork()).chainId
}

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
 * @param signerOrProvider an ethers signer or provider
 * @returns the populated TransactionRequest object
 */
export async function increaseAllowance(
  tokenAddr: string,
  spender: string,
  amount: BigNumberish,
  signerOrProvider: Signer | providers.Provider
): Promise<providers.TransactionRequest> {
  const abi = [
    'function increaseAllowance(address spender, uint256 value) external returns (bool)',
  ]
  // TODO, not all ERC-20 contracts support increaseAllowance
  // Add a check for that here
  const contract = new Contract(tokenAddr, abi, signerOrProvider)

  return await contract.populateTransaction.increaseAllowance(spender, amount)
}

/**
 * Find a token address by its symbol from tradable pairs
 * @param pairs array of tradable pairs to search through
 * @param symbol the token symbol to find (case-insensitive)
 * @returns the token address if found, null otherwise
 */
export function findTokenBySymbol(
  pairs: readonly TradablePair[],
  symbol: string
): string | null {
  for (const pair of pairs) {
    for (const asset of pair.assets) {
      if (asset.symbol.toLowerCase() === symbol.toLowerCase()) {
        return asset.address
      }
    }
  }
  return null
}
