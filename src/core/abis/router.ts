import { parseAbi } from 'viem'

export const ROUTER_ABI = parseAbi([
  // Swap operations
  'function getAmountsOut(uint256 amountIn, Route[] memory routes) view returns (uint256[] memory amounts)',
  'function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, Route[] calldata routes, address to, uint256 deadline) returns (uint256[] memory amounts)',

  // Basic liquidity operations
  'function addLiquidity(address tokenA, address tokenB, uint256 amountADesired, uint256 amountBDesired, uint256 amountAMin, uint256 amountBMin, address to, uint256 deadline) returns (uint256 amountA, uint256 amountB, uint256 liquidity)',
  'function removeLiquidity(address tokenA, address tokenB, uint256 liquidity, uint256 amountAMin, uint256 amountBMin, address to, uint256 deadline) returns (uint256 amountA, uint256 amountB)',
  'function quoteAddLiquidity(address tokenA, address tokenB, address _factory, uint256 amountADesired, uint256 amountBDesired) view returns (uint256 amountA, uint256 amountB, uint256 liquidity)',
  'function quoteRemoveLiquidity(address tokenA, address tokenB, address _factory, uint256 liquidity) view returns (uint256 amountA, uint256 amountB)',

  // Zap operations
  'function zapIn(address tokenIn, uint256 amountInA, uint256 amountInB, Zap calldata zapInPool, Route[] calldata routesA, Route[] calldata routesB, address to) payable returns (uint256 liquidity)',
  'function zapOut(address tokenOut, uint256 liquidity, Zap calldata zapOutPool, Route[] calldata routesA, Route[] calldata routesB)',
  'function generateZapInParams(address tokenA, address tokenB, address _factory, uint256 amountInA, uint256 amountInB, Route[] calldata routesA, Route[] calldata routesB) view returns (uint256 amountOutMinA, uint256 amountOutMinB, uint256 amountAMin, uint256 amountBMin)',
  'function generateZapOutParams(address tokenA, address tokenB, address _factory, uint256 liquidity, Route[] calldata routesA, Route[] calldata routesB) view returns (uint256 amountOutMinA, uint256 amountOutMinB, uint256 amountAMin, uint256 amountBMin)',

  // Structs
  'struct Route { address from; address to; address factory; }',
  'struct Zap { address tokenA; address tokenB; address factory; uint256 amountOutMinA; uint256 amountOutMinB; uint256 amountAMin; uint256 amountBMin; }',

  // Custom errors (Router)
  'error ETHTransferFailed()',
  'error Expired()',
  'error InsufficientAmount()',
  'error InsufficientAmountA()',
  'error InsufficientAmountB()',
  'error InsufficientAmountADesired()',
  'error InsufficientAmountBDesired()',
  'error InsufficientAmountAOptimal()',
  'error InsufficientLiquidity()',
  'error InsufficientOutputAmount()',
  'error InvalidAmountInForETHDeposit()',
  'error InvalidTokenInForETHDeposit()',
  'error InvalidPath()',
  'error InvalidRouteA()',
  'error InvalidRouteB()',
  'error OnlyWETH()',
  'error PoolDoesNotExist()',
  'error PoolFactoryDoesNotExist()',
  'error SameAddresses()',
  'error ZeroAddress()',
  'error FXMarketClosed()',
])
