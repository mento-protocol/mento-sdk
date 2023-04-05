/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  DEFAULT_SIMULATE_ERROR_MESSAGE,
  ETHERS_ERROR_CODE_ESTIMATEGAS,
  ETHERS_ERROR_METHOD_ESTIMATEGAS,
  knownErrorsMapping,
} from './constants'
import {
  BigNumberish,
  constants,
  Contract,
  PopulatedTransaction,
  providers,
  Signer,
} from 'ethers'
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
 * @param signerOrProvider an ethers signer or provider
 * @param simulateTx whether to simulate the transaction or not, defaults to true
 * @returns the populated TransactionRequest object
 */
export async function increaseAllowance(
  tokenAddr: string,
  spender: string,
  amount: BigNumberish,
  signerOrProvider: Signer | providers.Provider,
  simulateTx = true
): Promise<providers.TransactionRequest> {
  const abi = [
    'function increaseAllowance(address spender, uint256 value) external returns (bool)',
  ]
  // TODO, not all ERC-20 contracts support increaseAllowance
  // Add a check for that here
  const contract = new Contract(tokenAddr, abi, signerOrProvider)

  const tx = await contract.populateTransaction.increaseAllowance(
    spender,
    amount
  )

  if (simulateTx) {
    // If the simulation fails, it will throw an error
    await simulateTransaction(signerOrProvider, tx)
  }

  return tx
}

/**
 * Extracts the error message from an error object
 * @param error the error object
 * @returns The underlying error message from the smart contract
 */
export function parseContractError(error: any) {
  let errorMessage = DEFAULT_SIMULATE_ERROR_MESSAGE
  let reason = error?.reason

  // If we have a reason, we can get the friendly error message
  if (reason) {
    reason = reason.split('execution reverted:')[1]?.trim()
    errorMessage = knownErrorsMapping[reason] ?? reason
  }

  return errorMessage
}

/**
 * Simulates a transaction
 * @param signerOrProvider an ethers signer or provider
 * @param tx the transaction to be simulated
 */
export async function simulateTransaction(
  signerOrProvider: Signer | providers.Provider,
  tx: PopulatedTransaction | providers.TransactionRequest
) {
  try {
    await signerOrProvider.estimateGas(tx)
  } catch (error: any) {
    if (isEstimateGasError(error)) {
      error.message = parseContractError(error)
      throw error
    } else {
      throw error
    }
  }
}

/**
 * Checks if an error is an estimateGas error
 * @param error The error to be checked
 * @returns A boolean indicating if the error is an estimateGas error
 */
function isEstimateGasError(error: any): boolean {
  return (
    error?.code === ETHERS_ERROR_CODE_ESTIMATEGAS &&
    error?.method === ETHERS_ERROR_METHOD_ESTIMATEGAS
  )
}
