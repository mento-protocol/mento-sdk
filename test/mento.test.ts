import { JsonRpcProvider } from '@ethersproject/providers'
import { Mento } from '../src/mento'
import { utils } from 'ethers'
import {
  IBroker,
  IBroker__factory,
  IExchangeProvider,
  IExchangeProvider__factory,
} from '@mentolabs/core'

let testee: Mento
let celoAddr = '0xdDc9bE57f553fe7D61606B94CBD7e0264eF8'
let cUsdAddr = '0x62492A644A588FD904270BeD06ad52B9abfEA1aE'

const SECONDS = 1000
jest.setTimeout(70 * SECONDS)

jest.mock('@mentolabs/core')

const connect = jest.fn((a, b) => 'abc')
const getExchangeProviders = jest.fn()
const symbol = jest.fn()

// @ts-ignore
IBroker__factory.connect.mockReturnValue({
  getExchangeProviders: jest.fn(() => []),
})

describe('Broker', () => {
  beforeAll(async () => {
    testee = await Mento.create(
      new JsonRpcProvider('https://baklava-forno.celo-testnet.org')
    )
  })

  // it('Should instantitate', async () => {
  //   expect(Broker).toBeDefined()
  // })

  it('should get all exchanges', async () => {
    console.log(await testee.getExchanges())
  })

  // it('should get all assets', async () => {
  //   console.log(await testee.getTradeablePairs())
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
