import { providers } from 'ethers'
import { Mento } from '../src/mento'

async function main() {
  const provider = new providers.JsonRpcProvider(
    'https://baklava-forno.celo-testnet.org'
  )
  const mento = await Mento.create(provider)
  const broker = mento.getBroker()
  const exchangeProviders = await broker.getExchangeProviders()
  console.log('Exchange Providers:\n================')
  console.log(exchangeProviders, '\n')
  const exchanges = await mento.getExchanges()
  console.log('Exchanges:\n================')
  console.log(exchanges, '\n')
  const poolExchanges = await mento.getBiPoolExchanges()
  console.log('Pool Exchanges:\n================')
  console.log(poolExchanges, '\n')
}

main()
  .then(() => console.log('Done'))
  .catch((e) => console.error('Error:', e))
