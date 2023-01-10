import { Provider } from '@ethersproject/providers'
import { Broker } from './broker'
import { getBrokerAddressFromRegistry } from './utils'

export * from './exchangeManager'

export async function getBrokerInstance(provider: Provider): Promise<Broker> {
  return new Broker(provider, await getBrokerAddressFromRegistry(provider))
}
