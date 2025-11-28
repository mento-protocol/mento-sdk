/**
 * Interface for calculating non-circulating token supply.
 *
 * Determines the amount of tokens that should be excluded from total supply
 * calculations because they are pre-minted or otherwise not available for
 * trading (e.g., locked, reserved, or in protocol-owned positions).
 *
 * @param tokenAddress - The address of the token.
 * @returns The amount to subtract from total supply.
 */
export interface ISupplyCalculator {
  getAmount(tokenAddress: string): Promise<bigint>
}
