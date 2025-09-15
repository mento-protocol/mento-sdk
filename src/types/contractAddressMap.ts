import { ContractAddresses } from '.'

export type ContractAddressMap = {
  [chainId: number]: Partial<ContractAddresses>
}
