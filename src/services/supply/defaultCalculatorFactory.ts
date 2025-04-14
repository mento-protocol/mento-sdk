import { ProviderAdapter } from '../../types'
import { MENTO_ADDRESSES, PROTOCOL_ADDRESSES } from '../../constants'
import { AAVESupplyCalculator } from './aaveSupplyCalculator'
import { CalculatorFactory } from './calculatorFactory'
import { ISupplyCalculator } from './ISupplyCalculator'
import { UniV3SupplyCalculator } from './uniV3SupplyCalculator'
import { MultisigSupplyCalculator } from './multisigSupplyCalculator'

export class DefaultCalculatorFactory implements CalculatorFactory {
  createUniV3Calculator(provider: ProviderAdapter): ISupplyCalculator {
    return new UniV3SupplyCalculator(
      provider,
      PROTOCOL_ADDRESSES.UNIV3_POSITION_MANAGER,
      PROTOCOL_ADDRESSES.UNIV3_FACTORY,
      MENTO_ADDRESSES.PROTOCOL_MULTISIG
    )
  }

  createAAVECalculator(provider: ProviderAdapter): ISupplyCalculator {
    return new AAVESupplyCalculator(provider, [
      MENTO_ADDRESSES.OPERATIONAL_WALLET,
      MENTO_ADDRESSES.PROTOCOL_MULTISIG,
    ])
  }

  createMultisigCalculator(provider: ProviderAdapter): ISupplyCalculator {
    return new MultisigSupplyCalculator(
      provider,
      MENTO_ADDRESSES.PROTOCOL_MULTISIG
    )
  }
}
