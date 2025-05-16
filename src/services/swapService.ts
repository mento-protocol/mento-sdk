import { BROKER_ABI } from '../abis'
import { BROKER, getContractAddress } from '../constants'
import { ProviderAdapter, TransactionResponse, ContractWriteOptions } from '../types'
import { retryOperation } from '../utils'

/**
 * SwapService provides methods for exchanging tokens through the Mento Protocol.
 * 
 * This service handles all interactions with the Broker contract and provides
 * methods for swapping tokens and estimating exchange rates.
 */
export class SwapService {
  constructor(private provider: ProviderAdapter) {}
  
  /**
   * Swap a specified amount of collateral token for stable token.
   * 
   * @param tokenIn The address of the input token (collateral token)
   * @param tokenOut The address of the output token (stable token)
   * @param amountIn The amount of input token to swap
   * @param minAmountOut The minimum amount of output token to receive (for slippage protection)
   * @param options Optional parameters for the transaction (gas settings)
   * @returns A transaction response object
   */
  async swapIn(
    tokenIn: string,
    tokenOut: string,
    amountIn: string,
    minAmountOut: string,
    options: Omit<ContractWriteOptions, 'address' | 'abi' | 'functionName' | 'args'> = {}
  ): Promise<TransactionResponse> {
    const chainId = await this.provider.getChainId()
    const brokerAddress = getContractAddress(chainId, BROKER)
    
    return this.provider.writeContract({
      address: brokerAddress,
      abi: BROKER_ABI,
      functionName: 'swapIn',
      args: [tokenIn, tokenOut, amountIn, minAmountOut],
      ...options
    })
  }
  
  /**
   * Swap collateral token for a specified amount of stable token.
   * 
   * @param tokenIn The address of the input token (collateral token)
   * @param tokenOut The address of the output token (stable token)
   * @param amountOut The exact amount of output token to receive
   * @param maxAmountIn The maximum amount of input token to spend (for slippage protection)
   * @param options Optional parameters for the transaction (gas settings)
   * @returns A transaction response object
   */
  async swapOut(
    tokenIn: string,
    tokenOut: string,
    amountOut: string,
    maxAmountIn: string,
    options: Omit<ContractWriteOptions, 'address' | 'abi' | 'functionName' | 'args'> = {}
  ): Promise<TransactionResponse> {
    const chainId = await this.provider.getChainId()
    const brokerAddress = getContractAddress(chainId, BROKER)
    
    return this.provider.writeContract({
      address: brokerAddress,
      abi: BROKER_ABI,
      functionName: 'swapOut',
      args: [tokenIn, tokenOut, amountOut, maxAmountIn],
      ...options
    })
  }
  
  /**
   * Calculate the amount of output token that would be received for a given input amount.
   * 
   * @param tokenIn The address of the input token
   * @param tokenOut The address of the output token
   * @param amountIn The amount of input token
   * @returns The expected amount of output token as a string
   */
  async getAmountOut(tokenIn: string, tokenOut: string, amountIn: string): Promise<string> {
    const chainId = await this.provider.getChainId()
    const brokerAddress = getContractAddress(chainId, BROKER)
    
    const result = await retryOperation(() => 
      this.provider.readContract({
        address: brokerAddress,
        abi: BROKER_ABI,
        functionName: 'getAmountOut',
        args: [tokenIn, tokenOut, amountIn]
      })
    )
    
    return (result as bigint).toString()
  }
  
  /**
   * Calculate the amount of input token required to receive a given output amount.
   * 
   * @param tokenIn The address of the input token
   * @param tokenOut The address of the output token
   * @param amountOut The desired amount of output token
   * @returns The required amount of input token as a string
   */
  async getAmountIn(tokenIn: string, tokenOut: string, amountOut: string): Promise<string> {
    const chainId = await this.provider.getChainId()
    const brokerAddress = getContractAddress(chainId, BROKER)
    
    const result = await retryOperation(() => 
      this.provider.readContract({
        address: brokerAddress,
        abi: BROKER_ABI,
        functionName: 'getAmountIn',
        args: [tokenIn, tokenOut, amountOut]
      })
    )
    
    return (result as bigint).toString()
  }
  
  /**
   * Estimate the gas needed for a swap transaction.
   * 
   * @param methodName The method to call ('swapIn' or 'swapOut')
   * @param args The arguments for the method
   * @returns The estimated gas as a string
   */
  async estimateGas(
    methodName: 'swapIn' | 'swapOut',
    args: [string, string, string, string]
  ): Promise<string> {
    const chainId = await this.provider.getChainId()
    const brokerAddress = getContractAddress(chainId, BROKER)
    
    // For now we'll just return a reasonable default gas limit since the actual
    // gas estimation would depend on provider specifics that aren't in the interface
    // In a real implementation, this would interact with provider-specific gas estimation
    
    // Default values based on method type
    const defaultGas = methodName === 'swapIn' ? '300000' : '350000'
    
    // TODO: Implement actual gas estimation when provider adapters support it
    
    return defaultGas
  }
  
  /**
   * Calculate the price impact of a swap as a percentage.
   * 
   * @param tokenIn The address of the input token
   * @param tokenOut The address of the output token
   * @param amountIn The amount of input token
   * @param amountOut The expected amount of output token
   * @returns The price impact as a percentage string (e.g., "0.5" for 0.5%)
   */
  async calculatePriceImpact(
    tokenIn: string,
    tokenOut: string,
    amountIn: string,
    amountOut: string
  ): Promise<string> {
    // This is a simplified implementation. In a real-world scenario,
    // you would typically compare the execution price to a reference price
    // from an oracle or a small test amount.
    
    // For now, we'll just return a placeholder
    // TODO: Implement actual price impact calculation
    return "0.5"
  }
}