import { PopulatedTransaction, Signer, ethers, providers } from 'ethers'
import { validateSignerOrProvider } from './utils'
import { IChainClient } from './interfaces'

export class ChainClient implements IChainClient {
  private readonly signerOrProvider: ethers.Signer | providers.Provider

  constructor(signerOrProvider: ethers.Signer | providers.Provider) {
    validateSignerOrProvider(signerOrProvider)
    this.signerOrProvider = signerOrProvider
  }

  public async getSigner(): Promise<ethers.Signer | providers.Provider> {
    return this.signerOrProvider
  }

  public async getChainId(): Promise<number> {
    let chainId = 0

    if (Signer.isSigner(this.signerOrProvider)) {
      const network = await this.signerOrProvider.provider?.getNetwork()
      if (network) {
        chainId = network.chainId
      }
    } else if (providers.Provider.isProvider(this.signerOrProvider)) {
      const network = await this.signerOrProvider.getNetwork()
      if (network) {
        chainId = network.chainId
      }
    }

    if (chainId === 0) {
      throw new Error('Could not get chainId from signer or provider')
    }

    return chainId
  }

  public async populateTransaction(
    tx: PopulatedTransaction
  ): Promise<providers.TransactionRequest> {
    if (Signer.isSigner(this.signerOrProvider)) {
      return this.signerOrProvider.populateTransaction(tx)
    } else {
      return tx
    }
  }
}
