import { ProviderAdapter, StableToken, TokenSupplyConfig } from '../types'
import {
  STABLE_TOKEN_SYMBOLS,
  MENTO_ADDRESSES,
  PROTOCOL_ADDRESSES,
} from '../constants'
import { UniV3SupplyCalculator, MultisigSupplyCalculator } from './supply'

export class SupplyAdjustmentService {
  private config: TokenSupplyConfig

  constructor(provider: ProviderAdapter) {
    const uniV3Calculator = new UniV3SupplyCalculator(
      provider,
      PROTOCOL_ADDRESSES.UNIV3_POSITION_MANAGER,
      PROTOCOL_ADDRESSES.UNIV3_FACTORY,
      MENTO_ADDRESSES.PROTOCOL_MULTISIG
    )

    const multisigCalculator = new MultisigSupplyCalculator(
      provider,
      MENTO_ADDRESSES.PROTOCOL_MULTISIG
    )

    this.config = {
      [STABLE_TOKEN_SYMBOLS.cUSD]: [
        { calculator: uniV3Calculator },
        { calculator: multisigCalculator },
      ],
    }
  }

  /**
   * Get the adjusted supply of a stable token
   * @param token - The stable token to get the adjusted supply for
   * @returns The adjusted supply
   */
  async getAdjustedSupply(token: StableToken): Promise<string> {
    const adjustments = this.config[token.symbol]
    if (!adjustments) return token.totalSupply

    let supply = BigInt(token.totalSupply)

    for (const adjustment of adjustments) {
      const amount = await adjustment.calculator.getAmount(token.address)
      supply -= amount
    }

    return supply.toString()
  }
}
