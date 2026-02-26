import { BorrowContractAddresses, SystemParams } from '../../../core/types'

export interface DeploymentContext {
  addresses: BorrowContractAddresses
  systemParams: SystemParams
}

export type InterestBatchManagerData = {
  minInterestRate: bigint
  maxInterestRate: bigint
  minInterestRateChangePeriod: bigint
}

export type DebtPerInterestRateItem = {
  interestRate: bigint
  debt: bigint
}
