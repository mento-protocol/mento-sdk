import { ContractAddressMap } from '../types'
import { ChainId } from './../enums'

export const addresses: ContractAddressMap = {
  [ChainId.CELO]: {
    // Oracls
    BreakerBox: '0x303ED1df62Fa067659B586EbEe8De0EcE824Ab39',
    MedianDeltaBreaker: '0x49349F92D2B17d491e42C8fdB02D19f072F9B5D9',
    SortedOracles: '0xefB84935239dAcdecF7c5bA76d8dE40b077B7b33',
    ValueDeltaBreaker: '0x4DBC33B3abA78475A5AA4BC7A5B11445d387BF68',
    // DEX
    BiPoolManager: '0x22d9db95E6Ae61c104A7B6F6C78D7993B94ec901',
    Broker: '0x777A8255cA72412f0d706dc03C9D1987306B4CaD',
    ConstantProductPricingModule: '0x0c07126d0CB30E66eF7553Cc7C37143B4f06DddB',
    ConstantSumPricingModule: '0xDebED1F6f6ce9F6e73AA25F95acBFFE2397550Fb',
    MentoRouter: '0xbe729350f8cdfc19db6866e8579841188ee57f67',
    Reserve: '0x9380fA34Fd9e4Fd14c06305fd7B6199089eD4eb9',
    // Governace
    Airgrab: '0x7D8E73deafDBAfc98fDBe7974168cFA6d8B9AE0C',
    Emission: '0x5C789592E2611df1873b46D394c69f75faB99778',
    Locking: '0x001Bb66636dCd149A1A2bA8C50E408BdDd80279C',
    MentoGovernor: '0x47036d78bB3169b4F5560dD77BF93f4412A59852',
    MentoToken: '0x7FF62f59e3e89EA34163EA1458EEBCc81177Cfb6',
    TimelockController: '0x890DB8A597940165901372Dd7DB61C9f246e2147',
  },
  [ChainId.ALFAJORES]: {
    // Oracles
    BreakerBox: '0xC76BDf0AFb654888728003683cf748A8B1b4f5fD',
    MedianDeltaBreaker: '0x6B0a2076713fDAef4F9301fe8404a228e3682DE4',
    SortedOracles: '0xFdd8bD58115FfBf04e47411c1d228eCC45E93075',
    ValueDeltaBreaker: '0xfa6fFf746a5E74055e432f3bba26138956AEfbFe',
    // DEX
    BiPoolManager: '0x9B64E8EaBD1a035b148cE970d3319c5C3Ad53EC3',
    Broker: '0xD3Dff18E465bCa6241A244144765b4421Ac14D09',
    ConstantProductPricingModule: '0x99EDce8143FF8AeFA1fBB6C2103B349Add2B9519',
    ConstantSumPricingModule: '0x474DBf1eDF845410bdaC6aeE97C3CC403651ba2E',
    MentoRouter: '0xe6101a457a69b53e298e35a7f6e3dcb0390df02a',
    Reserve: '0xa7ed835288Aa4524bB6C73DD23c0bF4315D9Fe3e',
    // Governance
    Airgrab: '0x8dC9282F0a74A2a36F41440e009AA0EADFe490c5',
    Emission: '0xe62cc88ca2A5E7Dd3Fe5ce8511C874e610Ddb0b6',
    Locking: '0x537CaE97C588C6DA64A385817F3D3563DDCf0591',
    MentoGovernor: '0x558e92236f85Bb4e8A63ec0D5Bf9d34087Eab744',
    MentoToken: '0x3eDd2f7c90e2E931c817a44302Af7112E84be6Cc',
    TimelockController: '0xa0Ad8DD40104556122c21dF50eD14bb1B53A3338',
  },
  [ChainId.CELO_SEPOLIA]: {
    // Oracles
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
  }
}

export type Identifier = keyof ContractAddressMap[keyof ContractAddressMap]

export function getAddress(identifier: Identifier, chainId: number): string {
  const addressesForChain = addresses[chainId]
  if (!addressesForChain) {
    throw new Error(`No addresses found for chain ID ${chainId}`)
  }

  const address = addressesForChain[identifier]
  if (!address) {
    throw new Error(
      `Address not found for identifier ${identifier} on chain ID ${chainId}`
    )
  }

  return address
}
