import { ChainId } from './../enums'
import { ContractAddressMap } from '../types'

export const addresses: ContractAddressMap = {
  [ChainId.CELO]: {
    GovernanceFactory: '0xee6CE2dbe788dFC38b8F583Da86cB9caf2C8cF5A',
    Airgrab: '0x7D8E73deafDBAfc98fDBe7974168cFA6d8B9AE0C',
    Emission: '0x5C789592E2611df1873b46D394c69f75faB99778',
    MentoGovernor: '0x47036d78bB3169b4F5560dD77BF93f4412A59852',
    MentoToken: '0x7FF62f59e3e89EA34163EA1458EEBCc81177Cfb6',
    TimelockController: '0x890DB8A597940165901372Dd7DB61C9f246e2147',
    Locking: '0x001Bb66636dCd149A1A2bA8C50E408BdDd80279C',
    MentoRouter: '0xbe729350f8cdfc19db6866e8579841188ee57f67',
    Broker: '0x777A8255cA72412f0d706dc03C9D1987306B4CaD',
    BiPoolManager: '0x22d9db95E6Ae61c104A7B6F6C78D7993B94ec901',
    BreakerBox: '0x303ED1df62Fa067659B586EbEe8De0EcE824Ab39',
    Reserve: '0x9380fA34Fd9e4Fd14c06305fd7B6199089eD4eb9',
    ConstantSumPricingModule: '0xDebED1F6f6ce9F6e73AA25F95acBFFE2397550Fb',
    ConstantProductPricingModule: '0x0c07126d0CB30E66eF7553Cc7C37143B4f06DddB',
    MedianDeltaBreaker: '0x49349F92D2B17d491e42C8fdB02D19f072F9B5D9',
    ValueDeltaBreaker: '0x4DBC33B3abA78475A5AA4BC7A5B11445d387BF68',
    StableToken: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
    StableTokenEUR: '0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73',
    StableTokenBRL: '0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787',
    StableTokenXOF: '0x73F93dcc49cB8A239e2032663e9475dd5ef29A08',
    SortedOracles: '0xefB84935239dAcdecF7c5bA76d8dE40b077B7b33',
  },
  [ChainId.ALFAJORES]: {
    GovernanceFactory: '0x96Fe03DBFEc1EB419885a01d2335bE7c1a45e33b',
    Airgrab: '0x8dC9282F0a74A2a36F41440e009AA0EADFe490c5',
    Emission: '0xe62cc88ca2A5E7Dd3Fe5ce8511C874e610Ddb0b6',
    MentoGovernor: '0x558e92236f85Bb4e8A63ec0D5Bf9d34087Eab744',
    MentoToken: '0x3eDd2f7c90e2E931c817a44302Af7112E84be6Cc',
    TimelockController: '0xa0Ad8DD40104556122c21dF50eD14bb1B53A3338',
    Locking: '0x537CaE97C588C6DA64A385817F3D3563DDCf0591',
    MentoRouter: '0xe6101a457a69b53e298e35a7f6e3dcb0390df02a',
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
  [ChainId.BAKLAVA]: {
    GovernanceFactory: '0xe23A28a92B95c743fC0F09c16a6b2E6D59F234Fa',
    Airgrab: '0xNotDeployed',
    Emission: '0xNotDeployed',
    MentoGovernor: '0xf1873597aA9757f57BA8Ed84a3EDb2E3217EF09f',
    MentoToken: '0x8942330eCB5A6c808aac3Aec3C6aab6D8CF436FE',
    TimelockController: '0x8c045769087F9de69B70949ED7fC23c14Db71e20',
    Locking: '0x1E15b108c51a0cAEAFf1a0E6f27A853Bde1AA2e6',
    MentoRouter: '0xC5449dbB0aF89F5E3C8E0e1611966E1964F891b1',
    Broker: '0x6723749339e320E1EFcd9f1B0D997ecb45587208',
    BiPoolManager: '0xFF9a3da00F42839CD6D33AD7adf50bCc97B41411',
    BreakerBox: '0x5Ea5A5F694F10de979BEeC7b8041E9f931F54bc7',
    Reserve: '0x68Dd816611d3DE196FDeb87438B74A9c29fd649f',
    ConstantSumPricingModule: '0x2901da88dd444a3c41AF51696548DEe3524Cf8Dc',
    ConstantProductPricingModule: '0x7586680Dd2e4F977C33cDbd597fa2490e342CbA2',
    MedianDeltaBreaker: '0x286a8137EE9EE6dE8B5e5be334706fA812400994',
    ValueDeltaBreaker: '0xf631F58b1B51E99dF3Ad1CE18f5C42ab41e4A17a',
    StableToken: '0x62492A644A588FD904270BeD06ad52B9abfEA1aE',
    StableTokenEUR: '0xf9ecE301247aD2CE21894941830A2470f4E774ca',
    StableTokenBRL: '0x6a0EEf2bed4C30Dc2CB42fe6c5f01F80f7EF16d1',
    StableTokenXOF: '0x64c1D812673E93Bc036AdC3D547d9950696DA5Af',
    SortedOracles: '0x88A187a876290E9843175027902B9f7f1B092c88',
  },
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
