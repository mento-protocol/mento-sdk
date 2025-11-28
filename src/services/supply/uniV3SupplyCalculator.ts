import {
  UNIV3_FACTORY_ABI,
  UNIV3_POOL_ABI,
  UNIV3_POSITION_MANAGER_ABI,
  ERC20_ABI,
} from '../../abis'
import { ISupplyCalculator } from './ISupplyCalculator'
import BigNumber from 'bignumber.js'
import { retryOperation } from '../../utils'
import type { PublicClient } from 'viem'

const BATCH_SIZE = 5
const BATCH_DELAY = 100

export class UniV3SupplyCalculator implements ISupplyCalculator {
  private readonly decimalsCache: Map<string, number> = new Map()
  private readonly poolCache: Map<string, string> = new Map()

  constructor(
    private publicClient: PublicClient,
    private positionManagerAddress: string,
    private factoryAddress: string,
    private governanceAddress: string
  ) {}

  async getAmount(tokenAddress: string): Promise<bigint> {
    try {
      const positions = await this.getPositionTokenIds()
      if (positions.length === 0) return 0n

      let totalAmount = new BigNumber(0)

      // Process positions in batches
      for (let i = 0; i < positions.length; i += BATCH_SIZE) {
        const batchPositions = positions.slice(i, i + BATCH_SIZE)

        const batchAmount = await retryOperation(() =>
          this.processPositionBatch(batchPositions, tokenAddress)
        )
        totalAmount = totalAmount.plus(batchAmount)

        if (i + BATCH_SIZE < positions.length) {
          await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY))
        }
      }

      // Convert to bigint, considering token decimals
      const decimals = await this.getTokenDecimals(tokenAddress)

      try {
        const rawAmount = totalAmount
          .integerValue(BigNumber.ROUND_DOWN)
          .abs() // Take absolute value as signs are handled by adjustment service
          .toString(10)

        // Remove any decimal points and handle scientific notation
        const cleanAmount = this.normalizeNumberString(rawAmount)
        return BigInt(cleanAmount)
      } catch (error) {
        console.error('Error converting to bigint:', {
          totalAmount: totalAmount.toString(),
          decimals,
          error,
        })
        return 0n
      }
    } catch (error) {
      const errorMessage = `Univ3SupplyCalculator: Failed to calculate supply for token ${tokenAddress}: ${error}`
      throw new Error(errorMessage)
    }
  }

  private normalizeNumberString(value: string): string {
    if (value.includes('e')) {
      const [mantissa, exponent] = value.split('e')
      const e = parseInt(exponent)
      if (e > 0) {
        return mantissa.replace('.', '') + '0'.repeat(e)
      }
      return '0'
    }
    return value.split('.')[0]
  }

  private async calculatePositionAmount(
    position: any,
    slot0: any,
    targetToken: string
  ): Promise<BigNumber> {
    const liquidity = new BigNumber(position[7].toString())
    const sqrtPriceX96 = new BigNumber(slot0[0].toString())
    const Q96 = new BigNumber(2).pow(96)

    const sqrtPriceX96Num = sqrtPriceX96.dividedBy(Q96)
    const currentTick = sqrtPriceX96Num.isGreaterThan(0)
      ? Math.floor(Math.log(sqrtPriceX96Num.toNumber() ** 2) / Math.log(1.0001))
      : 0

    const tickLower = Number(position[5])
    const tickUpper = Number(position[6])

    const [amount0, amount1] = this.calculateAmounts(
      liquidity,
      currentTick,
      tickLower,
      tickUpper,
      sqrtPriceX96Num
    )

    // Return positive amount if we should add to supply, negative if we should subtract
    const isToken0 = position[2] === targetToken
    const amount = isToken0 ? amount0 : amount1

    // If target token is being deposited into the pool, we should subtract from supply
    // This means if the position has liquidity of the target token, it's out of circulation
    return amount
  }

  private async processPositionBatch(
    positionIds: number[],
    targetToken: string
  ): Promise<BigNumber> {
    try {
      // Fetch position data
      const positionDataPromises = positionIds.map((id) =>
        this.readContract({
          address: this.positionManagerAddress,
          abi: UNIV3_POSITION_MANAGER_ABI,
          functionName: 'positions',
          args: [id],
        })
      )

      const positionData = (await Promise.all(positionDataPromises)) as any[][]

      // Filter active positions that contain our target token
      const activePositions = positionData.filter((pos: any[]) => {
        const liquidity = new BigNumber(pos[7].toString())
        return (
          !liquidity.isZero() &&
          (pos[2] === targetToken || pos[3] === targetToken)
        )
      })

      if (activePositions.length === 0) return new BigNumber(0)

      // Get pool addresses
      const poolAddresses = await Promise.all(
        activePositions.map((pos) =>
          this.getPoolAddress(pos[2], pos[3], Number(pos[4]))
        )
      )

      // Get slot0 data for all pools
      const slot0Data = await Promise.all(
        poolAddresses.map((poolAddress) =>
          this.readContract({
            address: poolAddress,
            abi: UNIV3_POOL_ABI,
            functionName: 'slot0',
          })
        )
      )

      // Calculate total amount
      let totalAmount = new BigNumber(0)

      for (let i = 0; i < activePositions.length; i++) {
        const pos = activePositions[i]
        const slot0 = slot0Data[i]

        const amount = await this.calculatePositionAmount(
          pos,
          slot0,
          targetToken
        )

        totalAmount = totalAmount.plus(amount)
      }

      return totalAmount
    } catch (error) {
      console.error('Failed to process position batch:', error)
      return new BigNumber(0)
    }
  }

  private async getPositionTokenIds(): Promise<number[]> {
    // Get governance balance
    const balance = await this.readContract({
      address: this.positionManagerAddress,
      abi: UNIV3_POSITION_MANAGER_ABI,
      functionName: 'balanceOf',
      args: [this.governanceAddress],
    })

    const numPositions = Number(balance)
    if (numPositions === 0) return []

    const tokenIds = []
    for (let i = 0; i < numPositions; i += BATCH_SIZE) {
      const batchPromises = Array.from(
        { length: Math.min(BATCH_SIZE, numPositions - i) },
        (_, index) =>
          this.readContract({
            address: this.positionManagerAddress,
            abi: UNIV3_POSITION_MANAGER_ABI,
            functionName: 'tokenOfOwnerByIndex',
            args: [this.governanceAddress, i + index],
          }).then((id) => Number(id))
      )

      const batchResults = await Promise.all(batchPromises)
      tokenIds.push(...batchResults)

      if (i + BATCH_SIZE < numPositions) {
        await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY))
      }
    }

    return tokenIds
  }

  private async getPoolAddress(
    token0: string,
    token1: string,
    fee: number
  ): Promise<string> {
    const cacheKey = `${token0}-${token1}-${fee}`
    if (this.poolCache.has(cacheKey)) {
      return this.poolCache.get(cacheKey)!
    }

    const poolAddress = (await this.readContract({
      address: this.factoryAddress,
      abi: UNIV3_FACTORY_ABI,
      functionName: 'getPool',
      args: [token0, token1, fee],
    })) as string

    this.poolCache.set(cacheKey, poolAddress)
    return poolAddress
  }

  private async getTokenDecimals(tokenAddress: string): Promise<number> {
    if (this.decimalsCache.has(tokenAddress)) {
      return this.decimalsCache.get(tokenAddress)!
    }

    try {
      const decimals = (await this.readContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'decimals',
      })) as number

      this.decimalsCache.set(tokenAddress, decimals)
      return decimals
    } catch (error) {
      console.warn(
        `Failed to fetch decimals for ${tokenAddress}, using default:`,
        error
      )
      return 18
    }
  }

  private async readContract(options: {
    address: string
    abi: any[]
    functionName: string
    args?: unknown[]
  }): Promise<unknown> {
    return this.publicClient.readContract({
      address: options.address as `0x${string}`,
      abi: options.abi,
      functionName: options.functionName,
      args: options.args,
    })
  }

  private calculateAmounts(
    liquidity: BigNumber,
    currentTick: number,
    tickLower: number,
    tickUpper: number,
    sqrtPrice: BigNumber
  ): [BigNumber, BigNumber] {
    try {
      const sqrtRatioLower = new BigNumber(Math.sqrt(1.0001 ** tickLower))
      const sqrtRatioUpper = new BigNumber(Math.sqrt(1.0001 ** tickUpper))

      let amount0 = new BigNumber(0)
      let amount1 = new BigNumber(0)

      if (currentTick < tickLower) {
        const amount0Numerator = sqrtRatioUpper.minus(sqrtRatioLower)
        const amount0Denominator = sqrtRatioUpper.multipliedBy(sqrtRatioLower)
        if (!amount0Denominator.isZero()) {
          amount0 = liquidity.multipliedBy(
            amount0Numerator.dividedBy(amount0Denominator)
          )
        }
      } else if (currentTick < tickUpper) {
        const amount0Numerator = sqrtRatioUpper.minus(sqrtPrice)
        const amount0Denominator = sqrtPrice.multipliedBy(sqrtRatioUpper)
        if (!amount0Denominator.isZero()) {
          amount0 = liquidity.multipliedBy(
            amount0Numerator.dividedBy(amount0Denominator)
          )
        }
        amount1 = liquidity.multipliedBy(sqrtPrice.minus(sqrtRatioLower))
      } else {
        amount1 = liquidity.multipliedBy(sqrtRatioUpper.minus(sqrtRatioLower))
      }

      return [
        amount0.isFinite()
          ? amount0.integerValue(BigNumber.ROUND_DOWN)
          : new BigNumber(0),
        amount1.isFinite()
          ? amount1.integerValue(BigNumber.ROUND_DOWN)
          : new BigNumber(0),
      ]
    } catch (error) {
      console.error('Error calculating amounts:', error)
      return [new BigNumber(0), new BigNumber(0)]
    }
  }
}
