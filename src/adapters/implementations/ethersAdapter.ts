import { Contract, Interface, Provider as EthersProvider, Signer, BrowserProvider } from 'ethers'
import { ContractCallOptions, ContractWriteOptions, ProviderAdapter, TransactionResponse } from '../../types'

/**
 * Adapter for Ethers.js v6 provider 
 */
export class EthersAdapter implements ProviderAdapter {
  constructor(private provider: EthersProvider) {}

  async readContract(options: ContractCallOptions): Promise<unknown> {
    const contract = new Contract(
      options.address,
      options.abi as string[] | Interface,
      this.provider
    )
    return await contract[options.functionName](...(options.args || []))
  }

  async writeContract(options: ContractWriteOptions): Promise<TransactionResponse> {
    try {
      // For write operations we need a signer
      let signer: Signer
      
      // Check if the provider is already a signer
      if ('sendTransaction' in this.provider) {
        signer = this.provider as unknown as Signer
      } 
      // Check if it's a BrowserProvider (can get a signer)
      else if (this.provider instanceof BrowserProvider) {
        signer = await this.provider.getSigner()
      }
      // No signer available
      else {
        throw new Error('Ethers provider must be a Signer or BrowserProvider for write operations. Please initialize with a Wallet or BrowserProvider instance.')
      }
      
      const contract = new Contract(
        options.address,
        options.abi as string[] | Interface,
        signer
      )
      
      // Prepare transaction options
      const overrides: { [key: string]: any } = {}
      
      if (options.value !== undefined) {
        overrides.value = options.value
      }
      
      if (options.gasLimit !== undefined) {
        overrides.gasLimit = options.gasLimit
      }
      
      if (options.gasPrice !== undefined) {
        overrides.gasPrice = options.gasPrice
      }
      
      if (options.maxFeePerGas !== undefined) {
        overrides.maxFeePerGas = options.maxFeePerGas
      }
      
      if (options.maxPriorityFeePerGas !== undefined) {
        overrides.maxPriorityFeePerGas = options.maxPriorityFeePerGas
      }
      
      // Try to simulate the transaction first (estimate gas)
      try {
        await contract[options.functionName].estimateGas(...(options.args || []), overrides)
      } catch (estimateError) {
        // Format simulation errors nicely
        console.error('Transaction simulation failed:', estimateError)
        throw new Error(`Transaction simulation failed: ${estimateError instanceof Error ? estimateError.message : String(estimateError)}`)
      }
      
      // Execute transaction
      const tx = await contract[options.functionName](...(options.args || []), overrides)
      
      // Return a standardized TransactionResponse
      return {
        hash: tx.hash,
        wait: async (confirmations = 1) => {
          try {
            const receipt = await tx.wait(confirmations)
            return {
              transactionHash: receipt.hash,
              blockNumber: receipt.blockNumber,
              status: receipt.status,
              ...receipt
            }
          } catch (waitError) {
            console.error('Transaction confirmation failed:', waitError)
            throw new Error(`Transaction failed during confirmation: ${waitError instanceof Error ? waitError.message : String(waitError)}`)
          }
        }
      }
    } catch (error) {
      console.error('Transaction execution failed:', error)
      throw error
    }
  }

  async getChainId(): Promise<number> {
    const network = await this.provider.getNetwork()
    return Number(network.chainId)
  }
}
