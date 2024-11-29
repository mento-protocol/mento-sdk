export interface ISupplyCalculator {
  getAmount(tokenAddress: string): Promise<bigint>
} 