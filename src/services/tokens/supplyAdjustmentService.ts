import { StableToken, TokenSupplyConfig } from '../../core/types'
import { CalculatorFactory } from './supply/calculatorFactory'
import type { PublicClient } from 'viem'
import { TokenSymbol } from '../../cache/tokens'

export class SupplyAdjustmentService {
  private readonly config: Readonly<TokenSupplyConfig>

  constructor(publicClient: PublicClient, chainId: number, calculatorFactory: CalculatorFactory) {
    if (!publicClient) throw new Error('PublicClient is required')
    if (!calculatorFactory) throw new Error('Calculator factory is required')

    this.config = this.initializeConfig(publicClient, chainId, calculatorFactory)
  }

  private initializeConfig(
    publicClient: PublicClient,
    chainId: number,
    factory: CalculatorFactory
  ): Readonly<TokenSupplyConfig> {
    const uniV3Calculator = factory.createUniV3Calculator(publicClient)
    const aaveCalculator = factory.createAAVECalculator(publicClient, chainId)
    const multisigCalculator = factory.createMultisigCalculator(publicClient)

    return Object.freeze({
      [TokenSymbol.USDm]: Object.freeze([
        { calculator: uniV3Calculator },
        { calculator: multisigCalculator },
        { calculator: aaveCalculator },
      ]),
      [TokenSymbol.EURm]: Object.freeze([{ calculator: aaveCalculator }]),
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
