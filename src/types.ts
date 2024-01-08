import { ethers, providers } from "ethers"

export type Address = string

export interface TradingLimit {
  asset: Address
  maxIn: number
  maxOut: number
  until: number
}

export interface TradingLimitsConfig {
  timestep0: number
  timestep1: number
  limit0: number
  limit1: number
  limitGlobal: number
  flags: number
}

export interface TradingLimitsState {
  lastUpdated0: number
  lastUpdated1: number
  netflow0: number
  netflow1: number
  netflowGlobal: number
}

export interface ContractAddressMap {
  [chainId: string]: ContractAddresses
}

export interface ContractAddresses {
  Airgrab: string
  Emission: string
  MentoGovernor: string
  MentoToken: string
  TimelockController: string
}

export enum ProposalState {
  PENDING = 0,
  ACTIVE = 1,
  CANCELED = 2,
  DEFEATED = 3,
  SUCCEEDED = 4,
  QUEUED = 5,
  EXPIRED = 6,
  EXECUTED = 7,
}

export interface IChainClient {
  getSigner(): Promise<ethers.Signer | providers.Provider>
  getChainId(): Promise<number>
  populateTransaction(tx: ethers.PopulatedTransaction): Promise<providers.TransactionRequest>
}