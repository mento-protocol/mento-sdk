export const BROKER_ABI = [
  // Existing methods
  'function tradingLimitsConfig(bytes32) view returns (uint32 timestep0, uint32 timestep1, int48 limit0, int48 limit1, int48 limitGlobal, uint8 flags)',
  'function tradingLimitsState(bytes32) view returns (uint32 lastUpdated0, uint32 lastUpdated1, int48 netflow0, int48 netflow1, int48 netflowGlobal)',
  
  // Swap methods
  'function swapIn(address tokenIn, address tokenOut, uint256 amountIn, uint256 minAmountOut) payable returns (uint256)',
  'function swapOut(address tokenIn, address tokenOut, uint256 amountOut, uint256 maxAmountIn) payable returns (uint256)',
  
  // Rate methods
  'function getAmountOut(address tokenIn, address tokenOut, uint256 amountIn) view returns (uint256)',
  'function getAmountIn(address tokenIn, address tokenOut, uint256 amountOut) view returns (uint256)'
]
