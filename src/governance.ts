import { Signer, providers } from 'ethers'
import { validateSignerOrProvider } from './utils'

export class Governance {
  private readonly signerOrProvider: Signer | providers.Provider

  /**
   * This constructor is private, use the static create Governance instance
   * @param signerOrProvider an ethers provider or connected signer
   */
  private constructor(signerOrProvider: Signer | providers.Provider) {
    this.signerOrProvider = signerOrProvider
  }

  static async create(signerOrProvider: Signer) {
    validateSignerOrProvider(signerOrProvider)
    return new Governance(signerOrProvider)
  }
}
