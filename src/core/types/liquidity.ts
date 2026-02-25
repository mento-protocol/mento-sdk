import { CallParams } from './transaction'
import { RouterRoute } from '../../utils/pathEncoder'

export interface LiquidityOptions {
  slippageTolerance: number // Percentage (e.g., 0.5 for 0.5%)
  deadline: bigint // Unix timestamp, use deadlineFromMinutes() for convenience
}

export interface AddLiquidityQuote {
  amountA: bigint
  amountB: bigint
  liquidity: bigint
}

export interface RemoveLiquidityQuote {
  amount0: bigint
  amount1: bigint
}

export interface AddLiquidityDetails {
  params: CallParams
  poolAddress: string
  token0: string // Pool's token0
  token1: string // Pool's token1
  tokenA: string // User's input (can be token0 or token1)
  tokenB: string // User's input (can be token0 or token1)
  amountADesired: bigint
  amountBDesired: bigint
  amountAMin: bigint // After slippage
  amountBMin: bigint // After slippage
  estimatedMinLiquidity: bigint // Conservative lower-bound; actual on-chain amount may be higher
  deadline: bigint
}

export interface RemoveLiquidityDetails {
  params: CallParams
  poolAddress: string // Also the LP token address
  token0: string
  token1: string
  liquidity: bigint
  amount0Min: bigint // After slippage
  amount1Min: bigint // After slippage
  expectedAmount0: bigint
  expectedAmount1: bigint
  deadline: bigint
}

export interface TokenApproval {
  token: string
  amount: bigint
  params: CallParams
}

export interface AddLiquidityTransaction {
  approvalA: TokenApproval | null
  approvalB: TokenApproval | null
  addLiquidity: AddLiquidityDetails
}

export interface RemoveLiquidityTransaction {
  approval: TokenApproval | null
  removeLiquidity: RemoveLiquidityDetails
}

export interface LPTokenBalance {
  poolAddress: string
  balance: bigint
  token0: string
  token1: string
  totalSupply: bigint
  sharePercent: number // 0-100
}

export interface ZapParams {
  tokenA: string
  tokenB: string
  factory: string
  amountOutMinA: bigint
  amountOutMinB: bigint
  amountAMin: bigint
  amountBMin: bigint
}

export interface ZapInQuote {
  amountOutMinA: bigint
  amountOutMinB: bigint
  amountAMin: bigint
  amountBMin: bigint
  estimatedMinLiquidity: bigint // Conservative lower-bound; actual on-chain amount may be higher
}

export interface ZapOutQuote {
  amountOutMinA: bigint
  amountOutMinB: bigint
  amountAMin: bigint
  amountBMin: bigint
  expectedTokenOut: bigint
}

export interface ZapInDetails {
  params: CallParams
  poolAddress: string
  tokenIn: string
  amountIn: bigint
  amountInA: bigint
  amountInB: bigint
  routesA: RouterRoute[]
  routesB: RouterRoute[]
  zapParams: ZapParams
  estimatedMinLiquidity: bigint // Conservative lower-bound; actual on-chain amount may be higher
}

export interface ZapOutDetails {
  params: CallParams
  poolAddress: string
  tokenOut: string
  liquidity: bigint
  routesA: RouterRoute[]
  routesB: RouterRoute[]
  zapParams: ZapParams
  expectedTokenOut: bigint
}

export interface ZapInTransaction {
  approval: TokenApproval | null
  zapIn: ZapInDetails
}

export interface ZapOutTransaction {
  approval: TokenApproval | null
  zapOut: ZapOutDetails
}
