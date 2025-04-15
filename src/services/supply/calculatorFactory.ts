import { ISupplyCalculator } from './ISupplyCalculator'
import { ProviderAdapter } from '../../types'

export interface CalculatorFactory {
  createUniV3Calculator(provider: ProviderAdapter): ISupplyCalculator
  createAAVECalculator(provider: ProviderAdapter): ISupplyCalculator
  createMultisigCalculator(provider: ProviderAdapter): ISupplyCalculator
}
