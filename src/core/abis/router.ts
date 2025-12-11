import { parseAbi } from 'viem'

export const ROUTER_ABI = parseAbi([
  'function getAmountsOut(uint256 amountIn, Route[] memory routes) view returns (uint256[] memory amounts)',
  'struct Route { address from; address to; address factory; }',
]) as any
