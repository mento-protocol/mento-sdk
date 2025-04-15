import { ProviderAdapter, StableToken, TokenSupplyConfig } from '../types'
import { STABLE_TOKEN_SYMBOLS } from '../constants'
import { CalculatorFactory } from './supply/calculatorFactory'

export class SupplyAdjustmentService {
  private readonly config: Readonly<TokenSupplyConfig>

  constructor(provider: ProviderAdapter, calculatorFactory: CalculatorFactory) {
    if (!provider) throw new Error('Provider is required')
    if (!calculatorFactory) throw new Error('Calculator factory is required')

    this.config = this.initializeConfig(provider, calculatorFactory)
  }

  private initializeConfig(
    provider: ProviderAdapter,
    factory: CalculatorFactory
  ): Readonly<TokenSupplyConfig> {
    const uniV3Calculator = factory.createUniV3Calculator(provider)
    const aaveCalculator = factory.createAAVECalculator(provider)
    const multisigCalculator = factory.createMultisigCalculator(provider)

    return Object.freeze({
      [STABLE_TOKEN_SYMBOLS.cUSD]: Object.freeze([
        { calculator: uniV3Calculator },
        { calculator: multisigCalculator },
        { calculator: aaveCalculator },
      ]),
      [STABLE_TOKEN_SYMBOLS.cEUR]: Object.freeze([
        { calculator: aaveCalculator },
      ]),
    })
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
