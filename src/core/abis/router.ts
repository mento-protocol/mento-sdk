import { parseAbi } from 'viem'

export const ROUTER_ABI = parseAbi([
  'function getAmountsOut(uint256 amountIn, Route[] memory routes) view returns (uint256[] memory amounts)',
  'function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, Route[] calldata routes, address to, uint256 deadline) returns (uint256[] memory amounts)',
  'struct Route { address from; address to; address factory; }',
]) as any
