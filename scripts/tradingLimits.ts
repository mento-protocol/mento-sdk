import { Mento } from '../src/mento'
import { providers } from 'ethers'

async function main() {
  const provider = new providers.JsonRpcProvider(
    'https://baklava-forno.celo-testnet.org'
  )
  const mento = await Mento.create(provider)

  const cUSDCeloExchange =
    '0x3135b662c38265d0655177091f1b647b4fef511103d06c016efdf18b46930d2c'

  const cfgs = await mento.getTradingLimitConfig(cUSDCeloExchange)
  const state = await mento.getTradingLimitState(cUSDCeloExchange)
  const limits = await mento.getTradingLimits(cUSDCeloExchange)

  console.log('cfgs', cfgs)
  console.log('state', state)
  console.log('======')
  console.log('limits', limits)
}

main()
  .then(() => console.log('Done'))
  .catch((e) => console.error('Error:', e))
