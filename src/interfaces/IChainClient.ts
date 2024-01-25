import { ethers, providers } from 'ethers'

export interface IChainClient {
  getSigner(): Promise<ethers.Signer | providers.Provider>
  getChainId(): Promise<number>
  populateTransaction(
    tx: ethers.PopulatedTransaction
  ): Promise<providers.TransactionRequest>
}
