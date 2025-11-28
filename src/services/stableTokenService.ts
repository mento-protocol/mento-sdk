import { RESERVE_ABI } from '../abis'
import { getContractAddress, RESERVE } from '../constants'
import { StableToken } from '../types'
import { DefaultCalculatorFactory } from './supply'
import { SupplyAdjustmentService } from './supplyAdjustmentService'
import { TokenMetadataService } from './tokenMetadataService'
import type { PublicClient } from 'viem'

export class StableTokenService {
  private tokenMetadataService: TokenMetadataService
  private supplyAdjustmentService: SupplyAdjustmentService

  constructor(private publicClient: PublicClient, private chainId: number) {
    this.tokenMetadataService = new TokenMetadataService(publicClient)
    this.supplyAdjustmentService = new SupplyAdjustmentService(
      publicClient,
      chainId,
      new DefaultCalculatorFactory()
    )
  }

  async getStableTokens(): Promise<StableToken[]> {
    const reserveAddress = getContractAddress(this.chainId, RESERVE)

    const tokenAddresses = (await this.publicClient.readContract({
      address: reserveAddress as `0x${string}`,
      abi: RESERVE_ABI,
      functionName: 'getTokens',
    })) as string[]

    const tokens: StableToken[] = []

    for (const address of tokenAddresses) {
      const metadata = await this.tokenMetadataService.getTokenMetadata(address)
      const totalSupply = await this.tokenMetadataService.getTotalSupply(
        address
      )

      const token = {
        address,
        ...metadata,
        totalSupply,
      }

      const adjustedSupply =
        await this.supplyAdjustmentService.getAdjustedSupply(token)

      token.totalSupply = adjustedSupply
      tokens.push(token)
    }

    return tokens
  }
}
