import { MENTO_ADDRESSES, PROTOCOL_ADDRESSES } from '../../constants'
import { AAVESupplyCalculator } from './aaveSupplyCalculator'
import { CalculatorFactory } from './calculatorFactory'
import { ISupplyCalculator } from './ISupplyCalculator'
import { UniV3SupplyCalculator } from './uniV3SupplyCalculator'
import { MultisigSupplyCalculator } from './multisigSupplyCalculator'
import type { PublicClient } from 'viem'

export class DefaultCalculatorFactory implements CalculatorFactory {
  createUniV3Calculator(publicClient: PublicClient): ISupplyCalculator {
    return new UniV3SupplyCalculator(
      publicClient,
      PROTOCOL_ADDRESSES.UNIV3_POSITION_MANAGER,
      PROTOCOL_ADDRESSES.UNIV3_FACTORY,
      MENTO_ADDRESSES.PROTOCOL_MULTISIG
    )
  }

  createAAVECalculator(
    publicClient: PublicClient,
    chainId: number
  ): ISupplyCalculator {
    return new AAVESupplyCalculator(publicClient, chainId, [
      MENTO_ADDRESSES.OPERATIONAL_WALLET,
      MENTO_ADDRESSES.PROTOCOL_MULTISIG,
    ])
  }

  createMultisigCalculator(publicClient: PublicClient): ISupplyCalculator {
    return new MultisigSupplyCalculator(publicClient, [
      MENTO_ADDRESSES.PROTOCOL_MULTISIG,
      MENTO_ADDRESSES.OPERATIONAL_WALLET,
      MENTO_ADDRESSES.OPERATIONAL_WALLET_2,
      MENTO_ADDRESSES.REBALANCER_BOT,
    ])
  }
}
