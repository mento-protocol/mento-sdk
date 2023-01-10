import { Provider } from '@ethersproject/providers'
import {
  IBroker,
  IBroker__factory,
  IExchangeProvider,
  IExchangeProvider__factory,
} from '@mentolabs/core'
import { BigNumber } from 'ethers'
import { strict as assert } from 'assert'

interface Asset {
  address: string
  symbol: string
}

interface Pool {
  poolManagerAddress: string
  poolId: string
  assets: string[]
}

export class Broker {
  private readonly provider: Provider
  private readonly broker: IBroker
  private pools: Pool[]

  constructor(provider: Provider) {
    this.provider = provider
    this.broker = IBroker__factory.connect(
      '0x23a4D848b3976579d7371AFAF18b989D4ae0b031',
      provider
    )
    this.pools = new Array<Pool>()
  }

  async getPools(): Promise<Pool[]> {
    if (this.pools.length > 0) {
      return this.pools
    }

    let pools: Pool[] = []
    let poolManagersAddresses = await this.broker.getExchangeProviders()
    for (let poolManagerAddr of poolManagersAddresses) {
      let poolManager: IExchangeProvider = IExchangeProvider__factory.connect(
        poolManagerAddr,
        this.provider
      )
      let poolsInManager = await poolManager.getExchanges()
      for (let pool of poolsInManager) {
        pools.push({
          poolManagerAddress: poolManagerAddr,
          poolId: pool.exchangeId,
          assets: pool.assets,
        })
      }
    }

    this.pools = pools
    return pools
  }

  async getAssets(): Promise<string[]> {
    let assets: Set<string> = new Set<string>()

    const pools = await this.getPools()
    for (let pool of pools) {
      pool.assets.forEach((a) => assets.add(a))
    }
    return Array.from(assets)
  }

  /**
   * Returns the amount of tokenIn to be sold to buy amountOut of tokenOut
   * @param tokenIn
   * @param tokenOut
   * @param amountOut
   * @returns
   */
  async getAmountIn(
    tokenIn: string,
    tokenOut: string,
    amountOut: BigNumber
  ): Promise<BigNumber> {
    const pool = await this.getPoolForTokens(tokenIn, tokenOut)
    // TODO: remove callStatic once vibisility of the function is updated
    return await this.broker.callStatic.getAmountIn(
      pool.poolManagerAddress,
      pool.poolId,
      tokenIn,
      tokenOut,
      amountOut
    )
  }

  /**
   * Returns the amount of tokenOut to be bought by selling amountIn of tokenIn
   * @param tokenIn
   * @param tokenOut
   * @param amountIn
   * @returns
   */
  async getAmountOut(
    tokenIn: string,
    tokenOut: string,
    amountIn: BigNumber
  ): Promise<BigNumber> {
    const pool = await this.getPoolForTokens(tokenIn, tokenOut)
    return await this.broker.callStatic.getAmountOut(
      pool.poolManagerAddress,
      pool.poolId,
      tokenIn,
      tokenOut,
      amountIn
    )
  }

  /**
   * Returns the pool for the provided pairs
   * @param tokenIn
   * @param tokenOut
   * @returns
   */
  private async getPoolForTokens(
    tokenIn: string,
    tokenOut: string
  ): Promise<Pool> {
    const pools = (await this.getPools()).filter(
      (p) => p.assets.includes(tokenIn) && p.assets.includes(tokenOut)
    )

    if (pools.length == 0) {
      throw Error(`No pool found for ${tokenIn} and ${tokenOut}`)
    }

    assert(
      pools.length === 1,
      `More than one pool found for ${tokenIn} and ${tokenOut}`
    )
    return pools[0]
  }
}
