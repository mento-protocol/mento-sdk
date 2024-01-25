import { PopulatedTransaction, ethers, providers } from 'ethers'
import { IChainClient } from './interfaces'

export class TestChainClient implements IChainClient {
  public async getSigner(): Promise<ethers.Signer | providers.Provider> {
    const fakeProvider = {} as providers.Provider
    return fakeProvider
  }

  public async getChainId(): Promise<number> {
    return 44787
  }

  public async populateTransaction(
    tx: PopulatedTransaction
  ): Promise<providers.TransactionRequest> {
    const fakeTx = {
      to: tx.to,
      from: tx.from,
      data: tx.data,
      value: tx.value,
      nonce: 0,
      gasLimit: 0,
      gasPrice: 0,
      chainId: 1,
    }
    return fakeTx
  }
}
