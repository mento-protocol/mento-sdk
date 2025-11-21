import { ChainId } from './chainId'
import { ContractAddresses } from '../types'

export type ContractAddressMap = {
  [key in ChainId]: ContractAddresses
}

export const addresses: ContractAddressMap = {
  [ChainId.CELO]: {
    
  },
  [ChainId.ALFAJORES]: {
    GovernanceFactory: '0x96Fe03DBFEc1EB419885a01d2335bE7c1a45e33b',
    Airgrab: '0x8dC9282F0a74A2a36F41440e009AA0EADFe490c5',
    Emission: '0xe62cc88ca2A5E7Dd3Fe5ce8511C874e610Ddb0b6',
    MentoGovernor: '0x558e92236f85Bb4e8A63ec0D5Bf9d34087Eab744',
    MentoToken: '0x3eDd2f7c90e2E931c817a44302Af7112E84be6Cc',
    TimelockController: '0xa0Ad8DD40104556122c21dF50eD14bb1B53A3338',
    Locking: '0x537CaE97C588C6DA64A385817F3D3563DDCf0591',
    Broker: '0xD3Dff18E465bCa6241A244144765b4421Ac14D09',
    BiPoolManager: '0x9B64E8EaBD1a035b148cE970d3319c5C3Ad53EC3',
    BreakerBox: '0xC76BDf0AFb654888728003683cf748A8B1b4f5fD',
    Reserve: '0xa7ed835288Aa4524bB6C73DD23c0bF4315D9Fe3e',
    ConstantSumPricingModule: '0x474DBf1eDF845410bdaC6aeE97C3CC403651ba2E',
    ConstantProductPricingModule: '0x99EDce8143FF8AeFA1fBB6C2103B349Add2B9519',
    MedianDeltaBreaker: '0x6B0a2076713fDAef4F9301fe8404a228e3682DE4',
    ValueDeltaBreaker: '0xfa6fFf746a5E74055e432f3bba26138956AEfbFe',
    StableToken: '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1',
    StableTokenEUR: '0x10c892A6EC43a53E45D0B916B4b7D383B1b78C0F',
    StableTokenBRL: '0xE4D517785D091D3c54818832dB6094bcc2744545',
    StableTokenXOF: '0xB0FA15e002516d0301884059c0aaC0F0C72b019D',
    SortedOracles: '0xFdd8bD58115FfBf04e47411c1d228eCC45E93075',
  },
  [ChainId.CELO_SEPOLIA]: {
    // Oracles & Breakers
    BreakerBox: '0x578bD46003B9D3fd4c3C3f47c98B329562a6a1dE',
    MedianDeltaBreaker: '0xd29B4e743F7B84D63fBF9149B6D983DF2eF5C952',
    SortedOracles: '0xfaa7Ca2B056E60F6733aE75AA0709140a6eAfD20',
    ValueDeltaBreaker: '0x03CDf2966185Eb0b980f2481Ad386B8aFdAB4534',

    // DEX
    BiPoolManager: '0xeCB3C656C131fCd9bB8D1d80898716bD684feb78',
    Broker: '0xB9Ae2065142EB79b6c5EB1E8778F883fad6B07Ba',
    ConstantProductPricingModule: '0x2584a5835e3aE7E901e6462E1de06920c2C68028',
    ConstantSumPricingModule: '0x3b199d9EbEbe509bb711BfFb455c2d79102A9602',
    MentoRouter: '0x8e4Fb12D86D5DF911086a9153e79CA27e0c96156',
    Reserve: '0x2bC2D48735842924C508468C5A02580aD4F6d99A',

    // Governance
    Emission: '0x3C1BEA0F35b5dcAc1065CA9b3b6877657dEa4A69',
    Locking: '0xB72320fC501cb30E55bAF0DA48c20b11fAc9f79D',
    MentoGovernor: '0x23173Ac37b8E4e5a60d787aC543B3F51e8f398b4',
    MentoToken: '0x07867fd40EB56b4380bE39c88D0a7EA59Aa99A20',
    TimelockController: '0x74c44Be99937815173A3C56274331e0A05611e0D',
  },
}

/**
 * Get the address of a contract for a given chain
 * @param chainId - The chain ID
 * @param contractName - The contract name
 * @returns The contract address
 */
export function getContractAddress(
  chainId: ChainId,
  contractName: keyof ContractAddresses
): string {
  return addresses[chainId][contractName]
}
