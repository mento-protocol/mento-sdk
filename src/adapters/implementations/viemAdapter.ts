import {
  parseAbi,
  type PublicClient,
  type WalletClient,
  type Account,
  type TransactionReceipt as ViemTransactionReceipt,
} from 'viem'
import type {
  ContractCallOptions,
  ContractWriteOptions,
  ProviderAdapter,
  TransactionResponse,
  TransactionReceipt,
} from '../../types'

/**
 * Adapter for Viem provider
 */
export class ViemAdapter implements ProviderAdapter {
  private walletClient?: WalletClient
  private account?: Account

  constructor(
    private client: PublicClient,
    walletClientConfig?: { walletClient: WalletClient; account: Account }
  ) {
    if (walletClientConfig) {
      this.walletClient = walletClientConfig.walletClient
      this.account = walletClientConfig.account
    }
  }

  async readContract(options: ContractCallOptions): Promise<unknown> {
    // Check if the abi is a string array(human readable format) or an array of objects(the normal format)
    const abi =
      Array.isArray(options.abi) && typeof options.abi[0] === 'string'
        ? parseAbi(options.abi as string[])
        : options.abi

    return await this.client.readContract({
      address: options.address as `0x${string}`,
      abi: abi,
      functionName: options.functionName,
      args: options.args,
    })
  }

  async writeContract(
    options: ContractWriteOptions
  ): Promise<TransactionResponse> {
    if (!this.walletClient || !this.account) {
      throw new Error(
        'WalletClient and account are required for write operations with Viem'
      )
    }

    // Check if the abi is a string array(human readable format) or an array of objects(the normal format)
    const abi =
      Array.isArray(options.abi) && typeof options.abi[0] === 'string'
        ? parseAbi(options.abi as string[])
        : options.abi

    // Prepare common parameters
    const baseParams = {
      address: options.address as `0x${string}`,
      abi: abi,
      functionName: options.functionName,
      args: options.args,
    }

    // Add optional parameters
    const txParams: Record<string, any> = {}

    if (options.value !== undefined) {
      txParams.value =
        typeof options.value === 'string'
          ? BigInt(options.value)
          : options.value
    }

    if (options.gasLimit !== undefined) {
      txParams.gas =
        typeof options.gasLimit === 'string'
          ? BigInt(options.gasLimit)
          : options.gasLimit
    }

    if (options.gasPrice !== undefined) {
      txParams.gasPrice =
        typeof options.gasPrice === 'string'
          ? BigInt(options.gasPrice)
          : options.gasPrice
    }

    if (options.maxFeePerGas !== undefined) {
      txParams.maxFeePerGas =
        typeof options.maxFeePerGas === 'string'
          ? BigInt(options.maxFeePerGas)
          : options.maxFeePerGas
    }

    if (options.maxPriorityFeePerGas !== undefined) {
      txParams.maxPriorityFeePerGas =
        typeof options.maxPriorityFeePerGas === 'string'
          ? BigInt(options.maxPriorityFeePerGas)
          : options.maxPriorityFeePerGas
    }

    // Simulate first to check for errors
    try {
      // For simulation, we need the account but not the chain
      await this.client.simulateContract({
        ...baseParams,
        ...txParams,
        account: this.account,
      })
    } catch (error) {
      console.error('Contract simulation failed:', error)
      throw error
    }

    // Execute transaction
    // For write operations, we need both account and chain
    const hash = await this.walletClient.writeContract({
      ...baseParams,
      ...txParams,
      account: this.account,
      chain: null, // Required by Viem type system
    })

    // Return a standardized TransactionResponse
    return {
      hash: hash,
      wait: async (confirmations = 1) => {
        const viemReceipt = await this.client.waitForTransactionReceipt({
          hash,
          confirmations,
        })

        // Convert Viem receipt to our standardized TransactionReceipt
        const receipt: TransactionReceipt = {
          transactionHash: viemReceipt.transactionHash,
          blockNumber: Number(viemReceipt.blockNumber),
          status: viemReceipt.status === 'success' ? 1 : 0,
          gasUsed: String(viemReceipt.gasUsed),
          cumulativeGasUsed: String(viemReceipt.cumulativeGasUsed),
          logs: viemReceipt.logs,
          effectiveGasPrice: viemReceipt.effectiveGasPrice
            ? String(viemReceipt.effectiveGasPrice)
            : undefined,
          contractAddress: viemReceipt.contractAddress,
        }

        return receipt
      },
    }
  }

  async getChainId(): Promise<number> {
    return await this.client.getChainId()
  }
}
