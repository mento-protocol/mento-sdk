import { BigNumber, providers } from 'ethers'
import { Mento } from '../src/mento'

function sleep(milliseconds: number) {
  return new Promise((resolve) => setTimeout(() => resolve(true), milliseconds))
}

async function main() {
  const provider = new providers.JsonRpcProvider(
    'https://baklava-forno.celo-testnet.org'
  )

  const sums = [0, 0, 0]
  const iterations = 3
  for (let i = 0; i < 3; i++) {
    const [initDuration, mento] = await timedOperation('Mento init time', () =>
      Mento.create(provider)
    )
    sums[0] += initDuration
    const [exchangeDuration, exchanges] = await timedOperation(
      'Exchange fetch time',
      () => mento.getExchanges()
    )
    sums[1] += exchangeDuration
    const [token1, token2] = exchanges[0].assets
    const [amountOutDuration] = await timedOperation('Get amount out', () =>
      mento.getAmountOut(token1, token2, BigNumber.from(1000000000))
    )
    sums[2] += amountOutDuration
    await sleep(3000)
  }
  console.log('Avg mento init (ms):', Math.floor(sums[0] / iterations))
  console.log('Avg get exchanges (ms):', Math.floor(sums[1] / iterations))
  console.log('Avg get amount out (ms):', Math.floor(sums[2] / iterations))
}

async function timedOperation<T>(
  desc: string,
  op: () => Promise<T>
): Promise<[number, T]> {
  const t = Date.now()
  const result = await op()
  const duration = Date.now() - t
  console.log(`${desc} (ms):`, duration)
  return [duration, result]
}

main()
  .then(() => console.log('Done'))
  .catch((e) => console.error('Error:', e))
