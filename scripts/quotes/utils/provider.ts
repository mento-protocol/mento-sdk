import { providers } from 'ethers'
import { RPC_URLS } from '../config'

export function createProvider(chainId: number): providers.JsonRpcProvider {
  const rpcUrl = RPC_URLS[chainId]
  if (!rpcUrl) {
    throw new Error(
      `Chain id ${chainId} not supported. Supported chain ids: ${Object.keys(
        RPC_URLS
      ).join(', ')}`
    )
  }
  return new providers.JsonRpcProvider(rpcUrl)
}

export function cleanupProvider(provider: providers.Provider): void {
  provider.removeAllListeners()
  if ('polling' in provider) {
    ;(provider as unknown as { polling: boolean }).polling = false
  }
}
