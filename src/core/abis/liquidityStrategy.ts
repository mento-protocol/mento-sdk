import { parseAbi } from 'viem'

export const LIQUIDITY_STRATEGY_ABI = parseAbi([
  'function poolConfigs(address) view returns (bool isToken0Debt, uint32 lastRebalance, uint32 rebalanceCooldown, address protocolFeeRecipient, uint64 liquiditySourceIncentiveExpansion, uint64 protocolIncentiveExpansion, uint64 liquiditySourceIncentiveContraction, uint64 protocolIncentiveContraction)',
  'function determineAction(address pool) view returns ((address pool, (uint256 reserveNum, uint256 reserveDen) reserves, (uint256 oracleNum, uint256 oracleDen, bool poolPriceAbove, uint16 rebalanceThreshold) prices, address token0, address token1, uint64 token0Dec, uint64 token1Dec, bool isToken0Debt, (uint64 liquiditySourceIncentiveExpansion, uint64 protocolIncentiveExpansion, uint64 liquiditySourceIncentiveContraction, uint64 protocolIncentiveContraction) incentives) ctx, (uint8 dir, uint256 amount0Out, uint256 amount1Out, uint256 amountOwedToPool) action)',
  'function rebalance(address pool)',
])
