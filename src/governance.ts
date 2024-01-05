import { BigNumberish, Signer, providers } from 'ethers'
import { getContractsByChainId, validateSignerOrProvider } from './utils'
import { MentoGovernor__factory } from '@mento-protocol/mento-core-ts'

export class Governance {
  private readonly signerOrProvider: Signer | providers.Provider

  /**
   * This constructor is private, use the static create Governance instance
   * @param signerOrProvider an ethers provider or connected signer
   */
  private constructor(signerOrProvider: Signer | providers.Provider) {
    this.signerOrProvider = signerOrProvider
  }

  // TODO: Don't use static create, just use constructor.

  static async create(signerOrProvider: Signer) {
    validateSignerOrProvider(signerOrProvider)
    return new Governance(signerOrProvider)
  }

  /**
   * This function submits a proposal to be created to the Mento Governor contract usint the specified values.
   * @param targets The addresses of the contracts to be called during proposal execution.
   * @param values The values to be passed to the calls to the target contracts.
   * @param calldatas The calldata to be passed to the calls to the target contracts.
   * @param description A human readable description of the proposal.
   * @param overrides
   * @returns
   */
  public async createProposal(
    targets: string[],
    values: BigNumberish[],
    calldatas: string[],
    description: string
  ): Promise<providers.TransactionRequest> {
    const chainId = await this.getChainId()

    if (chainId === 0) {
      throw new Error('Could not get chainId from signer or provider')
    }

    const contracts = getContractsByChainId(chainId)
    const mentoGovernorAddress = contracts.MentoGovernor

    const governor = MentoGovernor__factory.connect(
      mentoGovernorAddress,
      this.signerOrProvider
    )

    const tx = await governor.populateTransaction[
      'propose(address[],uint256[],bytes[],string)'
    ](targets, values, calldatas, description)

    if (Signer.isSigner(this.signerOrProvider)) {
      // The contract call doesn't populate all of the signer fields, so we need an extra call for the signer
      return this.signerOrProvider.populateTransaction(tx)
    } else {
      return tx
    }
  }

  private async getChainId(): Promise<number> {
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

    return chainId
  }
}
