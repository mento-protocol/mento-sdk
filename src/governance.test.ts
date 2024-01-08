import { MentoGovernor__factory } from "@mento-protocol/mento-core-ts";
import { Contract, Wallet, constants, ethers, providers, utils } from 'ethers'

import { Governance } from "./governance";

jest.mock('@mento-protocol/mento-core-ts', () => {
  return {
    MentoGovernor__factory: {
        connect: jest.fn(),
        },
    }
})

jest.mock('ethers', () => {
    return {
      constants: jest.requireActual('ethers').constants,
      providers: jest.requireActual('ethers').providers,
      Signer: jest.requireActual('ethers').Signer,
      utils: jest.requireActual('ethers').utils,
      Wallet: jest.requireActual('ethers').Wallet,
      Contract: jest.fn(),
    }
  })

describe('Governance', () => {
    
    // ========== Mock contract factories ==========
    const fakeMentoGovernorAddress = 'fakeMentoGovernorAddress'
    const mockMentoGovernor = {
        address : fakeMentoGovernorAddress,
        populateTransaction: {
            propose: jest.fn(),
        },
        signer : {
            populateTransaction: jest.fn(),
        },
    }

    // @ts-ignore
    MentoGovernor__factory.connect.mockReturnValue(mockMentoGovernor)
    


    let provider: providers.JsonRpcProvider
    let signer: ethers.Wallet
    let signerWithoutProvider: ethers.Wallet
    const pk = Wallet.createRandom().privateKey

    beforeAll(async () => {
        provider = new providers.JsonRpcProvider()
        signer = new Wallet(pk, provider)
        signerWithoutProvider = new Wallet(pk)
      })
    
    afterEach(async () => {
        jest.clearAllMocks()
    })

    describe('create', () => {
        it('should return a Governance instance', async () => {
            const governance = await Governance.create(signer)
            expect(governance).toBeDefined()
            expect(governance).toBeInstanceOf(Governance)
        })
    })

    describe('createProposal', () => {
        // it('should return a populated createProposal tx object', async () => {
        //     const testee = await Governance.create(signer)
        //     const targets = [constants.AddressZero]
        //     const values = [0]
        //     const calldatas = ['0x']
        //     const description = 'test'
            
        //     const fakeTxObject = { to: '0x123', data: '0x456' }
        //     const fakePopulatedTxObj = { to: '0x123', data: '0x456', from: '0x789', gasLimit: 123 }
            
        //     mockMentoGovernor.populateTransaction.propose.mockReturnValue(fakeTxObject)
        //     const spy = jest
        //         .spyOn(signer, 'populateTransaction')
        //         // @ts-ignore
        //         .mockReturnValueOnce(fakePopulatedTxObj)

        //     const result = await testee.createProposal(targets, values, calldatas, description)
            
        //     //expect(result).toEqual(fakePopulatedTxObj)
        //     //expect(mockMentoGovernor.populateTransaction.propose).toHaveBeenCalledTimes(1)
        //     //expect(mockMentoGovernor.populateTransaction.propose).toBeCalledWith(targets, values, calldatas, description)
        // })

    })

    


})
