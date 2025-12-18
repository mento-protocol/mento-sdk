import { Address, PublicClient } from 'viem'
import { RouteService } from '../routes'
import { Route } from '../../core/types'
import { ROUTER_ABI } from '../../core/abis'
import { getContractAddress, ChainId } from '../../core/constants'
import { encodeRoutePath } from '../../utils/pathEncoder'

/**
 * Service for getting swap quotes from the Mento protocol.
 * Calculates expected output amounts for trades without executing them.
 */
export class QuoteService {
  constructor(
    private publicClient: PublicClient,
    private chainId: number,
    private routeService: RouteService
  ) {}

  // TODO: Go through codebase and update token/symbol/name references to the old ones.
  /**
   * Calculates the expected output amount for a swap between two tokens.
   *
   * @param tokenIn - The address of the input token
   * @param tokenOut - The address of the output token
   * @param amountIn - The amount of input tokens (in wei/smallest unit)
   * @param route - Optional pre-fetched route. If not provided, the optimal route will be found automatically.
   * @returns The expected output amount (in wei/smallest unit)
   * @throws {RouteNotFoundError} If no route exists between the token pair
   * @throws {Error} If the Router contract call fails
   * 
   * @example
   * ```typescript
   * const cUSD = '0x765DE816845861e75A25fCA122bb6898B8B1282a'
   * const CELO = '0x471EcE3750Da237f93B8E339c536989b8978a438'
   *
   * // Calculate output for 100 cUSD
   * const amountIn = BigInt(100) * BigInt(10 ** 18) // 100 cUSD in wei
   * const expectedOut = await quoteService.getAmountOut(cUSD, CELO, amountIn)
   * console.log(`Expected CELO output: ${expectedOut}`)
   *
   * // Or provide a pre-fetched route for better performance
   * const route = await routeService.findRoute(cUSD, CELO)
   * const expectedOut2 = await quoteService.getAmountOut(cUSD, CELO, amountIn, route)
   * ```
   */
  async getAmountOut(tokenIn: Address, tokenOut: Address, amountIn: bigint, route?: Route): Promise<bigint> {
    // If the consumer does not provide a route then we find the best route.
    if (!route) {
      route = await this.routeService.findRoute(tokenIn, tokenOut)
    }

    // Convert route.path to Router contract's Route[] format
    const routerRoutes = encodeRoutePath(route.path, tokenIn, tokenOut)
    const routerAddress = getContractAddress(this.chainId as ChainId, 'Router')

    const amounts = (await this.publicClient.readContract({
      address: routerAddress as `0x${string}`,
      abi: ROUTER_ABI,
      functionName: 'getAmountsOut',
      args: [amountIn, routerRoutes],
    })) as bigint[]

    return amounts[amounts.length - 1]
  }
}
