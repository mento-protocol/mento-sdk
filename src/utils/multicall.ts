import type { Abi, PublicClient } from 'viem'

/**
 * Standard Multicall3 contract address, deployed at the same address on all EVM chains.
 * https://www.multicall3.com/
 */
export const MULTICALL3_ADDRESS = '0xcA11bde05977b3631167028862bE2a173976CA11' as const

type MulticallResult = { status: 'success'; result: unknown } | { status: 'failure'; error: Error }

interface ContractCall {
  address: `0x${string}`
  abi: Abi | readonly unknown[]
  functionName: string
  args?: readonly unknown[]
}

interface MulticallOptions {
  allowFailure?: boolean
  batchSize?: number
}

/**
 * Wrapper around viem's multicall that explicitly provides the Multicall3 address.
 * This ensures multicall works even when the PublicClient was created without a `chain` config.
 */
export async function multicall(
  publicClient: PublicClient,
  contracts: ContractCall[],
  options: MulticallOptions = {}
): Promise<MulticallResult[]> {
  const { allowFailure = true, batchSize } = options
  const client = publicClient as PublicClient & {
    readContract?: (params: ContractCall & { args?: readonly unknown[] }) => Promise<unknown>
  }

  if (typeof client.multicall !== 'function') {
    if (typeof client.readContract !== 'function') {
      throw new Error('Public client does not support multicall or readContract')
    }

    return Promise.all(
      contracts.map(async (contract) => {
        try {
          const result = await client.readContract!({
            ...contract,
            args: contract.args ?? [],
          })
          return { status: 'success', result } as const
        } catch (error) {
          if (!allowFailure) {
            throw error
          }
          return {
            status: 'failure',
            error: error instanceof Error ? error : new Error(String(error)),
          } as const
        }
      })
    )
  }

  return client.multicall({
    allowFailure,
    batchSize,
    contracts: contracts as Parameters<PublicClient['multicall']>[0]['contracts'],
    multicallAddress: MULTICALL3_ADDRESS,
  }) as Promise<MulticallResult[]>
}
