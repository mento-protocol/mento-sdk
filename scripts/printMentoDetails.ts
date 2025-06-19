import { providers } from 'ethers'
import { Mento } from '../src/mento'

async function main() {
  const provider = new providers.JsonRpcProvider('https://forno.celo.org')
  const mento = await Mento.create(provider)
  const broker = mento.getBroker()
  console.log('Broker:\n================')
  console.log(broker.address, '\n')
  const exchangeProviders = await broker.getExchangeProviders()
  console.log('Exchange Providers:\n================')
  console.log(exchangeProviders, '\n')
  const exchanges = await mento.getExchanges()
  console.log('Exchanges:\n================')
  console.log(exchanges, '\n')
}

main()
  .then(() => console.log('Done'))
  .catch((e) => console.error('Error:', e))
