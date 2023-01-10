import { JsonRpcProvider } from '@ethersproject/providers'
import { ethers, Contract } from 'ethers'
import { getBrokerAddressFromRegistry } from '../src/utils'

class FakeRegistryContract {
  private returnaddress: string
  constructor(returnAddress: string) {
    this.returnaddress = returnAddress
  }
  public async getAddressForString(addressToGet: string): Promise<string> {
    return this.returnaddress
  }
}

let returnAddress
jest.mock('ethers')

const getAddressForString = jest.fn()
// @ts-ignore
Contract.mockImplementation(() => ({
  getAddressForString,
}))

describe('Utils', () => {
  beforeAll(async () => {})

  it('Should throw an exception when the registry returns the null address 0x...00', async () => {
    // @ts-ignore
    // ethers.Contract.mockReturnValue(
    //   new FakeRegistryContract('0x0000000000000000000000000000000000000000')
    // )
    getAddressForString.mockReturnValue(
      '0x0000000000000000000000000000000000000000'
    )

    // @ts-ignore
    // ethers.Contract.mockReturnValue(
    //   new FakeRegistryContract('0x0000000000000000000000000000000000000000')
    // )

    expect(async () => {
      await getBrokerAddressFromRegistry(new JsonRpcProvider('FakeProviderUrl'))
    }).rejects.toThrow()
  })

  // it('Should return the address from the registry', async () => {
  //   let brokerAddress = '0xFakeBrokerAddress'
  //   // @ts-ignore
  //   ethers.Contract.mockReturnValue(new FakeRegistryContract(brokerAddress))

  //   expect(
  //     await getBrokerAddressFromRegistry(new JsonRpcProvider('FakeProviderUrl'))
  //   ).toBe(brokerAddress)
  // })
})
