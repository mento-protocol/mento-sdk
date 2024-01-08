import { BigNumberish, Signer, providers } from 'ethers'
import { getContractsByChainId } from './utils'
import {
  MentoGovernor,
  MentoGovernor__factory,
} from '@mento-protocol/mento-core-ts'
import { ProposalState, IChainClient } from './types'
import { ChainClient } from './ChainClient'

export class Governance {
  private chainClient: IChainClient

  constructor(chainClient: IChainClient)
  constructor(signerOrProvider: Signer | providers.Provider)
  constructor(arg: Signer | providers.Provider | IChainClient) {
    if(arg instanceof ChainClient) {
      this.chainClient = arg
    }
    else if (arg instanceof Signer || arg instanceof providers.Provider) {
      this.chainClient = new ChainClient(arg)
    }
    else {
      throw new Error('Invalid constructor argument')
    }
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
    this.validateProposalArgs(targets, values, calldatas, description)
    const governor = await this.getGovernorContract()

    const tx = await governor.populateTransaction[
      'propose(address[],uint256[],bytes[],string)'
    ](targets, values, calldatas, description)

    return await this.chainClient.populateTransaction(tx)
  }

  // TO
  public async queueProposal(proposalId: BigNumberish): Promise<providers.TransactionRequest> {
    const governor = await this.getGovernorContract()
    const tx = await governor.populateTransaction['queue(uint256)'](proposalId)

    return await this.chainClient.populateTransaction(tx)  
  }

  public async executeProposal(proposalId: BigNumberish): Promise<providers.TransactionRequest> {
    const governor = await this.getGovernorContract()
    const tx = await governor.populateTransaction['execute(uint256)'](proposalId)

    return await this.chainClient.populateTransaction(tx) 
  }

  /**
   * This function submits a vote to the Mento Governor contract for the specified proposal.
   * @param proposalId The id of the proposal to vote on.
   * @param support Whether or not to support the proposal.
   */
  public async castVote(proposalId: BigNumberish, support: BigNumberish) {
    const governor = await this.getGovernorContract()
    const tx = await governor.populateTransaction.castVote(proposalId, support)

    return await this.chainClient.populateTransaction(tx)
  }

  /**
   * This function cancels the proposal with the specified id.
   * @param proposalId The id of the proposal to vote on.
   * @param support Whether or not to support the proposal.
   */
  public async cancelProposal(proposalId: BigNumberish): Promise<providers.TransactionRequest> {
    const governor = await this.getGovernorContract()
    const tx = await governor.populateTransaction.cancel(proposalId)

    return await this.chainClient.populateTransaction(tx) 
  }

  /**
   * This function returns the state of the proposal with the specified id.
   * @param proposalId The id of the proposal to get the state of.
   */
  public async getProposalState(proposalId: BigNumberish): Promise<ProposalState> {
    const governor = await this.getGovernorContract()
    return await governor.state(proposalId)
  }

  /**
   * This function validates the args that are to be used in the createProposal function.
   * @param targets The addresses of the contracts to be called during proposal execution.
   * @param values  The values to be passed to the calls to the target contracts.
   * @param calldatas The calldata to be passed to the calls to the target contracts.
   * @param description A human readable description of the proposal.
   */
  private validateProposalArgs(
    targets: string[],
    values: BigNumberish[],
    calldatas: string[],
    description: string
  ): void {
    if (!targets || targets.length === 0) {
      throw new Error('Targets must be specified')
    }
    if (!values || values.length === 0) {
      throw new Error('Values must be specified')
    }
    if (!calldatas || calldatas.length === 0) {
      throw new Error('Calldatas must be specified')
    }
    if (!description) {
      throw new Error('Description must be specified')
    }
    if (
      targets.length !== values.length ||
      targets.length !== calldatas.length
    ) {
      throw new Error(
        'Targets, values, and calldatas must all have the same length'
      )
    }
  }

  /**
   * This function retrieves the MentoGovernor contract.
   * @returns The MentoGovernor contract.
   */
  private async getGovernorContract(): Promise<MentoGovernor> {
    const contracts = getContractsByChainId(await this.chainClient.getChainId())
    const mentoGovernorAddress = contracts.MentoGovernor

    return MentoGovernor__factory.connect(
      mentoGovernorAddress,
      await this.chainClient.getSigner()
    )
  }
}
