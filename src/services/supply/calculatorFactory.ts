import { ISupplyCalculator } from './ISupplyCalculator'
import type { PublicClient } from 'viem'

export interface CalculatorFactory {
  createUniV3Calculator(
    publicClient: PublicClient
  ): ISupplyCalculator
  createAAVECalculator(
    publicClient: PublicClient,
    chainId: number
  ): ISupplyCalculator
  createMultisigCalculator(
    publicClient: PublicClient
  ): ISupplyCalculator
}
