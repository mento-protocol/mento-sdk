import type { ChainId } from '../constants/chainId'

/**
 * All possible contract identifiers across all chains.
 * Not all chains have all contracts deployed.
 */
export type ContractAddresses = {
  // Oracles & Breakers
  BreakerBox?: string
  MedianDeltaBreaker?: string
  SortedOracles?: string
  ValueDeltaBreaker?: string

  // DEX
  BiPoolManager?: string
  Broker?: string
  ConstantProductPricingModule?: string
  ConstantSumPricingModule?: string
  MentoRouter?: string
  Reserve?: string

  // Governance
  Airgrab?: string
  Emission?: string
  GovernanceFactory?: string
  Locking?: string
  MentoGovernor?: string
  MentoToken?: string
  TimelockController?: string

  // Stable Tokens
  StableToken?: string
  StableTokenEUR?: string
  StableTokenBRL?: string
  StableTokenXOF?: string
}

/**
 * Map of chain IDs to their contract addresses.
 * Each chain may have a different subset of contracts deployed.
 */
export type ContractAddressMap = {
  [key in ChainId]: ContractAddresses
}
