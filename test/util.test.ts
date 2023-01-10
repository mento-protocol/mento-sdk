import { JsonRpcProvider } from '@ethersproject/providers'
import { ethers } from 'ethers'
import { getBrokerAddressFromRegistry } from '../src/utils'

// class FakeRegistryContract extends ethers.Contract {
//   constructor() {
//     super(ethers.constants.AddressZero, [])
//   }
//   getAddressForString(): string {
//     return 'abc'
//   }
// }

describe('Utils', () => {
  beforeAll(async () => {})

  it('throws when the registry returns the null address 0x...00', async () => {
    jest.mock('ethers', () => {
      return jest.fn(() => 'abc')
    })
    // ethers.Contract = FakeRegistryContract

    let baklava = new JsonRpcProvider('https://baklava-forno.celo-testnet.org')
    let baklavaBroker = await getBrokerAddressFromRegistry(baklava)
    expect(baklavaBroker).toThrow()
    // expect(baklavaBroker).toThrow('0x23a4D848b3976579d7371AFAF18b989D4ae0b031')
  })
})
