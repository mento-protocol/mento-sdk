import { BigNumberish, providers } from 'ethers'
import { MentoGovernor__factory } from '@mento-protocol/mento-core-ts'

import { ContractAddresses, ProposalState } from './types'
import { Governance } from './governance'
import { getContractsByChainId } from './utils'
import { TestChainClient } from './TestChainClient'

jest.mock('./utils', () => {
  return {
    getContractsByChainId: jest.fn(),
    validateSignerOrProvider: jest.fn(),
  }
})

jest.mock('@mento-protocol/mento-core-ts', () => {
  return {
    MentoGovernor__factory: jest.fn(),
  }
})

describe('Governance', () => {
  let testee: Governance
  let mockChainClient: TestChainClient

  async function setupMockContractAddresses() {
    const mockContractAddresses: ContractAddresses = {
      MentoGovernor: '0x123',
      Airgrab: '0x456',
      MentoToken: '0x789',
      Emission: '0xabc',
      TimelockController: '0xdef',
      Locking: '0xghi',
    }
    // @ts-ignore
    getContractsByChainId.mockReturnValue(mockContractAddresses)
  }

  const mockMentoGovernor = {
    address: 'fakeMentoGovernorAddress',
    populateTransaction: {
      'propose(address[],uint256[],bytes[],string)': jest.fn(),
      'queue(uint256)': jest.fn(),
      execute: jest.fn(),
      castVote: jest.fn(),
      cancel: jest.fn(),
      'execute(uint256)': jest.fn(),
    },
    functions: {
      state: jest.fn(),
    },
    signer: {
      populateTransaction: jest.fn(),
    },
  }
  // @ts-ignore
  MentoGovernor__factory.connect = jest.fn().mockReturnValue(mockMentoGovernor)

  beforeEach(async () => {
    await setupMockContractAddresses()

    mockChainClient = new TestChainClient()
    testee = new Governance(mockChainClient)
  })

  afterEach(async () => {
    jest.clearAllMocks()
  })

  describe('create', () => {
    it('should return a Governance instance using a signer or provider', async () => {
      const governance = await new Governance(
        new providers.JsonRpcProvider('http://localhost:8545')
      )
      expect(governance).toBeDefined()
      expect(governance).toBeInstanceOf(Governance)
    })
  })

  describe('createProposal', () => {
    it('should throw an error when targets is zero', async () => {
      const targets: string[] = []
      const values = [0]
      const calldatas = ['0x']
      const description = 'test'

      expect(async () => {
        await testee.createProposal(targets, values, calldatas, description)
      }).rejects.toThrow('Targets must be specified')
    })

    it('should throw an error when values are not specified', async () => {
      const targets = ['0x']
      const values: BigNumberish[] = []
      const calldatas = ['0x']
      const description = 'test'

      expect(async () => {
        await testee.createProposal(targets, values, calldatas, description)
      }).rejects.toThrow('Values must be specified')
    })

    it('should throw an error when calldatas are not specified', async () => {
      const targets = ['0x']
      const values = [0]
      const calldatas: string[] = []
      const description = 'test'

      expect(async () => {
        await testee.createProposal(targets, values, calldatas, description)
      }).rejects.toThrow('Calldatas must be specified')
    })

    it('should throw an error when description is not specified', async () => {
      const targets = ['0x']
      const values = [0]
      const calldatas = ['0x']
      const description = ''

      expect(async () => {
        await testee.createProposal(targets, values, calldatas, description)
      }).rejects.toThrow('Description must be specified')
    })

    it('should return a populated create proposal transaction', async () => {
      const targets = ['0x']
      const values = [0]
      const calldatas = ['0x']
      const description = 'test'

      const fakeTxObj = { to: '0x1337', data: '0x345' }
      const fakePopulatedTxObj = {
        to: '0x123',
        data: '0x00456',
        from: '0xad3',
        gasLimit: 2200,
      }

      mockMentoGovernor.populateTransaction[
        'propose(address[],uint256[],bytes[],string)'
      ].mockReturnValue(fakeTxObj)
      const spy = jest
        .spyOn(mockChainClient, 'populateTransaction')
        // @ts-ignore
        .mockReturnValueOnce(fakePopulatedTxObj)

      const result = await testee.createProposal(
        targets,
        values,
        calldatas,
        description
      )

      expect(result).toEqual(fakePopulatedTxObj)
      expect(
        mockMentoGovernor.populateTransaction[
          'propose(address[],uint256[],bytes[],string)'
        ]
      ).toHaveBeenCalledTimes(1)
      expect(
        mockMentoGovernor.populateTransaction[
          'propose(address[],uint256[],bytes[],string)'
        ]
      ).toHaveBeenCalledWith(targets, values, calldatas, description)
      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy).toHaveBeenCalledWith(fakeTxObj)

      expect(mockChainClient.populateTransaction).toHaveBeenCalledTimes(1)
      expect(mockChainClient.populateTransaction).toHaveBeenCalledWith(
        fakeTxObj
      )
    })
  })

  describe('queueProposal', () => {
    it('should return a populated queue proposal transaction', async () => {
      const proposalId = 1

      const fakeTxObj = { to: '0x1337', data: '0x345' }
      const fakePopulatedTxObj = {
        to: '0x123',
        data: '0x00456',
        from: '0xad3',
        gasLimit: 2200,
      }

      mockMentoGovernor.populateTransaction['queue(uint256)'].mockReturnValue(
        fakeTxObj
      )
      const spy = jest
        .spyOn(mockChainClient, 'populateTransaction')
        // @ts-ignore
        .mockReturnValueOnce(fakePopulatedTxObj)

      const result = await testee.queueProposal(proposalId)

      expect(result).toEqual(fakePopulatedTxObj)
      expect(
        mockMentoGovernor.populateTransaction['queue(uint256)']
      ).toHaveBeenCalledTimes(1)
      expect(
        mockMentoGovernor.populateTransaction['queue(uint256)']
      ).toHaveBeenCalledWith(proposalId)
      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy).toHaveBeenCalledWith(fakeTxObj)

      expect(mockChainClient.populateTransaction).toHaveBeenCalledTimes(1)
      expect(mockChainClient.populateTransaction).toHaveBeenCalledWith(
        fakeTxObj
      )
    })
  })

  describe('executeProposal', () => {
    it('should return a populated execute proposal transaction', async () => {
      const proposalId = 1

      const fakeTxObj = { to: '0x1337', data: '0x345' }
      const fakePopulatedTxObj = {
        to: '0x123',
        data: '0x00456',
        from: '0xad3',
        gasLimit: 2200,
      }

      mockMentoGovernor.populateTransaction['execute(uint256)'].mockReturnValue(
        fakeTxObj
      )
      const spy = jest
        .spyOn(mockChainClient, 'populateTransaction')
        // @ts-ignore
        .mockReturnValueOnce(fakePopulatedTxObj)

      const result = await testee.executeProposal(proposalId)

      expect(result).toEqual(fakePopulatedTxObj)
      expect(
        mockMentoGovernor.populateTransaction['execute(uint256)']
      ).toHaveBeenCalledTimes(1)
      expect(
        mockMentoGovernor.populateTransaction['execute(uint256)']
      ).toHaveBeenCalledWith(proposalId)
      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy).toHaveBeenCalledWith(fakeTxObj)

      expect(mockChainClient.populateTransaction).toHaveBeenCalledTimes(1)
      expect(mockChainClient.populateTransaction).toHaveBeenCalledWith(
        fakeTxObj
      )
    })
  })

  describe('castVote', () => {
    it('should return a populated cast vote transaction', async () => {
      const proposalId = 1
      const support = 1

      const fakeTxObj = { to: '0x1337', data: '0x345' }
      const fakePopulatedTxObj = {
        to: '0x123',
        data: '0x00456',
        from: '0xad3',
        gasLimit: 2200,
      }

      mockMentoGovernor.populateTransaction.castVote.mockReturnValue(fakeTxObj)
      const spy = jest
        .spyOn(mockChainClient, 'populateTransaction')
        // @ts-ignore
        .mockReturnValueOnce(fakePopulatedTxObj)

      const result = await testee.castVote(proposalId, support)

      expect(result).toEqual(fakePopulatedTxObj)
      expect(
        mockMentoGovernor.populateTransaction.castVote
      ).toHaveBeenCalledTimes(1)
      expect(
        mockMentoGovernor.populateTransaction.castVote
      ).toHaveBeenCalledWith(proposalId, support)
      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy).toHaveBeenCalledWith(fakeTxObj)

      expect(mockChainClient.populateTransaction).toHaveBeenCalledTimes(1)
      expect(mockChainClient.populateTransaction).toHaveBeenCalledWith(
        fakeTxObj
      )
    })
  })

  describe('cancelProposal', () => {
    it('should return a populated cancel proposal transaction', async () => {
      const proposalId = 1

      const fakeTxObj = { to: '0x1337', data: '0x345' }
      const fakePopulatedTxObj = {
        to: '0x123',
        data: '0x00456',
        from: '0xad3',
        gasLimit: 2200,
      }

      mockMentoGovernor.populateTransaction.cancel.mockReturnValue(fakeTxObj)
      const spy = jest
        .spyOn(mockChainClient, 'populateTransaction')
        // @ts-ignore
        .mockReturnValueOnce(fakePopulatedTxObj)

      const result = await testee.cancelProposal(proposalId)

      expect(result).toEqual(fakePopulatedTxObj)
      expect(
        mockMentoGovernor.populateTransaction.cancel
      ).toHaveBeenCalledTimes(1)
      expect(mockMentoGovernor.populateTransaction.cancel).toHaveBeenCalledWith(
        proposalId
      )
      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy).toHaveBeenCalledWith(fakeTxObj)

      expect(mockChainClient.populateTransaction).toHaveBeenCalledTimes(1)
      expect(mockChainClient.populateTransaction).toHaveBeenCalledWith(
        fakeTxObj
      )
    })
  })

  describe('getProposalState', () => {
    it('should return the state of the proposal', async () => {
      const proposalId = 1
      const fakeProposalState = [1]

      mockMentoGovernor.functions.state.mockReturnValue(fakeProposalState)

      const result = await testee.getProposalState(proposalId)

      expect(result).toEqual(ProposalState[fakeProposalState[0]])
      expect(mockMentoGovernor.functions.state).toHaveBeenCalledTimes(1)
      expect(mockMentoGovernor.functions.state).toHaveBeenCalledWith(proposalId)
    })
  })
})
