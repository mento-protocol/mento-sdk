// import { BIPOOL_MANAGER_ABI } from '../abis'
// import { getContractAddress, BIPOOLMANAGER } from '../constants'
// import { Exchange, ProviderAdapter } from '../types'

// export class ExchangeService {
//   constructor(private provider: ProviderAdapter) {}

//   async getExchanges(): Promise<Exchange[]> {
//     const chainId = await this.provider.getChainId()

//     const bipoolManagerAddress = getContractAddress(chainId, BIPOOLMANAGER)
//     // Call getExchanges function on the bipool manager
//     const exchanges = await this.provider.readContract({
//       address: bipoolManagerAddress,
//       abi: BIPOOL_MANAGER_ABI,
//       functionName: 'getExchanges',
//     })
//     // Then for each exchange, first determine if it is a stabletoken or a collateral asset
//     // Use this to get the information about the asset so we can return it in the correct format
//   }
// }
