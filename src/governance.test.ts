import { constants, providers } from 'ethers'
import { MentoGovernor__factory } from '@mento-protocol/mento-core-ts'

import { ContractAddresses, IChainClient } from './types'
import { Governance } from './governance'
import { getContractsByChainId, validateSignerOrProvider } from './utils'
import { TestChainClient } from './TestChainClient'

jest.mock('./utils', () => {
  return {
    getContractsByChainId: jest.fn(),
    validateSignerOrProvider: jest.fn(),
  } 
});

jest.mock('@mento-protocol/mento-core-ts', () => {
  return {
    MentoGovernor__factory: jest.fn(),
  }
});

describe('Governance', () => {

    let testee: Governance;
    let mockChainClient: TestChainClient;
    let mockContractAddresses: ContractAddresses;

    async function setupMockContractAddresses() {

      const mockContractAddresses: ContractAddresses = {
        MentoGovernor: '0x123',
        Airgrab: '0x456',
        MentoToken: '0x789',
        Emission: '0xabc',
        TimelockController: '0xdef',
      }
      // @ts-ignore
      getContractsByChainId.mockReturnValue(mockContractAddresses);
    }

    async function setupMockContractFactory() {
 
      const mockMentoGovernor = {
        address: 'fakeMentoGovernorAddress',
        populateTransaction: {
          propose: jest.fn(),
        },
        signer: {
          populateTransaction: jest.fn(),
        },
      } 
        // @ts-ignore
        MentoGovernor__factory.connect = jest.fn().mockReturnValue(mockMentoGovernor);
    }

    beforeEach(async () => {
      await setupMockContractAddresses();
      await setupMockContractFactory();
      
      mockChainClient = new TestChainClient();
      testee = new Governance(mockChainClient);
    })

  
  afterEach(async () => {
    jest.clearAllMocks()
  })

  describe('create', () => {
    it('should return a Governance instance using a signer or provider', async () => {
      const fakeSigner = {} as any
      const governance = await new Governance(new providers.JsonRpcProvider('http://localhost:8545'))
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
      }).rejects.toThrow() 
    })
  })
})
