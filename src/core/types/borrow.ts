export interface BorrowPosition {
  troveId: string
  collateral: bigint
  debt: bigint
  annualInterestRate: bigint
  status: TroveStatus
  interestBatchManager: string | null
  lastDebtUpdateTime: number
  lastInterestRateAdjTime: number
  redistBoldDebtGain: bigint
  redistCollGain: bigint
  accruedInterest: bigint
  recordedDebt: bigint
  accruedBatchManagementFee: bigint
}

export type TroveStatus =
  | 'active'
  | 'closedByOwner'
  | 'closedByLiquidation'
  | 'zombie'
  | 'nonExistent'

export interface LoanDetails {
  collateral: bigint | null
  collateralUsd: bigint | null
  collPrice: bigint | null
  debt: bigint | null
  interestRate: bigint | null
  ltv: bigint | null
  maxLtv: bigint
  maxLtvAllowed: bigint
  liquidationPrice: bigint | null
  liquidationRisk: RiskLevel | null
  maxDebt: bigint | null
  maxDebtAllowed: bigint | null
  status: 'healthy' | 'at-risk' | 'liquidatable' | 'underwater' | null
}

export type RiskLevel = 'low' | 'medium' | 'high'

export interface OpenTroveParams {
  owner: string
  ownerIndex: number
  collAmount: bigint
  boldAmount: bigint
  annualInterestRate: bigint
  maxUpfrontFee: bigint
  interestBatchManager?: string
  addManager?: string
  removeManager?: string
  receiver?: string
}

export interface AdjustTroveParams {
  troveId: string
  collChange: bigint
  isCollIncrease: boolean
  debtChange: bigint
  isDebtIncrease: boolean
  maxUpfrontFee: bigint
}

export interface InterestRateBracket {
  rate: bigint
  totalDebt: bigint
}

export interface SystemParams {
  mcr: bigint
  ccr: bigint
  scr: bigint
  bcr: bigint
  minDebt: bigint
  ethGasCompensation: bigint
  minAnnualInterestRate: bigint
}

export interface BorrowContractAddresses {
  borrowerOperations: string
  troveManager: string
  sortedTroves: string
  activePool: string
  defaultPool: string
  hintHelpers: string
  multiTroveGetter: string
  collToken: string
  debtToken: string
  troveNFT: string
  metadataNFT: string
  stabilityPool: string
  priceFeed: string
  collSurplusPool: string
  interestRouter: string
  collateralRegistry: string
  gasToken: string
  gasPoolAddress: string
  liquidityStrategy: string
}
