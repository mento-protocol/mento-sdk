import { BigNumberish, Contract, ethers, providers, Signer } from 'ethers'

import { TokenSymbol } from './constants'
import { getCachedTokensSync, TOKEN_ADDRESSES_BY_CHAIN } from './constants/tokens'
import { Address } from './interfaces'
import { Token, TradablePair } from './mento'

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
 * Returns the symbol of an erc20 token
 * @param tokenAddr the address of the erc20 token
 * @param signerOrProvider an ethers provider or signer
 * @returns the symbol of the erc20 token
 */
export async function getSymbolFromTokenAddress(
  tokenAddr: Address,
  signerOrProvider: Signer | providers.Provider
): Promise<TokenSymbol> {
  const erc20Abi = ['function symbol() external view returns (string memory)']
  const contract = new Contract(tokenAddr, erc20Abi, signerOrProvider)

  return contract.symbol()
}

/**
 * Returns the name of an erc20 token
 * @param tokenAddr the address of the erc20 token
 * @param signerOrProvider an ethers provider or signer
 * @returns the name of the erc20 token
 */
export async function getNameFromTokenAddress(
  tokenAddr: Address,
  signerOrProvider: Signer | providers.Provider
): Promise<string> {
  const erc20Abi = ['function name() external view returns (string memory)']
  const contract = new Contract(tokenAddr, erc20Abi, signerOrProvider)

  return contract.name()
}

/**
 * Returns the decimals of an erc20 token
 * @param tokenAddr the address of the erc20 token
 * @param signerOrProvider an ethers provider or signer
 * @returns the decimals of the erc20 token
 */
export async function getDecimalsFromTokenAddress(
  tokenAddr: Address,
  signerOrProvider: Signer | providers.Provider
): Promise<number> {
  const erc20Abi = ['function decimals() external view returns (uint8)']
  const contract = new Contract(tokenAddr, erc20Abi, signerOrProvider)

  return contract.decimals()
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
export function findTokenAddressBySymbolInTradablePairs(
  symbol: TokenSymbol,
  pairs: readonly TradablePair[]
): Address | null {
  return (
    pairs
      .flatMap((pair) => pair.assets)
      .find((asset) => asset.symbol.toLowerCase() === symbol.toLowerCase())
      ?.address ?? null
  )
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}/**
 * Helper function to get token address by symbol for a specific chain
 * @param symbol - The token symbol
 * @param chainId - The chain ID
 * @returns The token address or undefined if not found
 */

export function getTokenAddress(
  symbol: TokenSymbol,
  chainId: number
): string | undefined {
  return TOKEN_ADDRESSES_BY_CHAIN[chainId]?.[symbol]
}
/**
 * Helper function to find a token by symbol in the cached tokens
 * @param symbol - The token symbol to search for
 * @param chainId - The chain ID
 * @returns The token object or undefined if not found
 */

export function findTokenBySymbol(
  symbol: string,
  chainId: number
): Token | undefined {
  const tokens = getCachedTokensSync(chainId)
  return tokens.find((token) => token.symbol === symbol)
}

/**
 * Computes the rate feed ID from a rate feed identifier string.
 * This follows the Solidity formula: address(uint160(uint256(keccak256(abi.encodePacked(rateFeed)))))
 * @param rateFeed the rate feed identifier string (e.g., "EURUSD", "relayed:COPUSD")
 * @returns the computed rate feed address
 */
export function toRateFeedId(rateFeed: string): Address {
  // 1. Calculate keccak256 hash
  const hashedBytes = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(rateFeed))

  // 2. Convert to BigInt (equivalent to uint256)
  const hashAsBigInt = BigInt(hashedBytes)

  // 3. Mask to 160 bits (equivalent to uint160)
  const maskedToUint160 = hashAsBigInt & ((BigInt(1) << BigInt(160)) - BigInt(1))

  // 4. Convert to address (hex string)
  const addressHex = '0x' + maskedToUint160.toString(16).padStart(40, '0')

  // 5. Return calculated rate feed ID
  return addressHex
}
