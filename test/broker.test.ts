import { JsonRpcProvider } from '@ethersproject/providers'
import { Broker } from '../src/broker'
import { utils } from 'ethers'

let testee: Broker
let celoAddr = '0xdDc9bE57f553fe75752D61606B94CBD7e0264eF8'
let cUsdAddr = '0x62492A644A588FD904270BeD06ad52B9abfEA1aE'

describe('Broker', () => {
  beforeAll(async () => {
    testee = await Broker.create(
      new JsonRpcProvider('https://baklava-forno.celo-testnet.org')
    )
  })

  it('Should instantitate', async () => {
    expect(Broker).toBeDefined()
  })

  it('should get all exchanges', async () => {
    console.log(await testee.getExchanges())
  })

  // it('should get all assets', async () => {
  //   console.log(await testee.getAssets())
  // })

  // it('should getAmountIn', async () => {
  //   let res = await testee.getAmountIn(
  //     celoAddr,
  //     cUsdAddr,
  //     utils.parseEther('10')
  //   )

  //   console.log(res.toString())
  // })

  // it('should getAmountOut', async () => {
  //   let res = await testee.getAmountOut(
  //     celoAddr,
  //     cUsdAddr,
  //     utils.parseEther('10')
  //   )

  //   console.log(res.toString())
  // })
})

// b = Broker()
// p = b.getPools()

// b . getPoolIdForAssets(cUSD, cEUR)
// b.getPoolManagerId(poolId)
