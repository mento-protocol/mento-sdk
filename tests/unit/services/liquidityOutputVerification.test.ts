import { LiquidityService } from '../../../src/services/liquidity/LiquidityService'
import { PoolService } from '../../../src/services/pools/PoolService'
import { RouteService } from '../../../src/services/routes/RouteService'
import type { PublicClient, Address } from 'viem'
import { decodeFunctionData, parseAbi } from 'viem'
import { ChainId } from '../../../src/core/constants'
import { PoolType } from '../../../src/core/types'
import { ROUTER_ABI, ERC20_ABI } from '../../../src/core/abis'
import { deadlineFromMinutes } from '../../../src/utils/deadline'

/**
 * Output verification tests for LiquidityService
 *
 * Tests focus on:
 * - Decoding transaction data to verify correctness
 * - Validating encoded parameters match inputs
 * - Cross-checking quote results with contract responses
 * - Ensuring approval transaction correctness
 * - Verifying deadline, slippage, and amount calculations in encoded data
 */
describe('Liquidity Service - Output Verification', () => {
  let mockPublicClient: jest.Mocked<PublicClient>
  let mockPoolService: jest.Mocked<PoolService>
  let mockRouteService: jest.Mocked<RouteService>
  let liquidityService: LiquidityService

  const POOL_ADDRESS = '0x1000000000000000000000000000000000000001' as Address
  const TOKEN_0 = '0xaaaa000000000000000000000000000000000000' as Address
  const TOKEN_1 = '0xbbbb000000000000000000000000000000000000' as Address
  const FACTORY = '0xfacf000000000000000000000000000000000000' as Address
  const RECIPIENT = '0xecec000000000000000000000000000000000000' as Address
  const OWNER = '0x1111111111111111111111111111111111111111' as Address

  beforeEach(() => {
    mockPublicClient = {
      readContract: jest.fn(),
    } as unknown as jest.Mocked<PublicClient>

    mockPoolService = {
      getPools: jest.fn(),
      getPoolDetails: jest.fn(),
    } as unknown as jest.Mocked<PoolService>

    mockRouteService = {
      findRoute: jest.fn(),
    } as unknown as jest.Mocked<RouteService>

    liquidityService = new LiquidityService(mockPublicClient, ChainId.CELO, mockPoolService, mockRouteService)

    mockPoolService.getPools.mockResolvedValue([
      {
        poolAddr: POOL_ADDRESS,
        token0: TOKEN_0,
        token1: TOKEN_1,
        factoryAddr: FACTORY,
        poolType: PoolType.FPMM,
      },
    ])
  })

  describe('Add Liquidity Transaction Data Verification', () => {
    beforeEach(() => {
      mockPublicClient.readContract.mockImplementation(async ({ functionName }: any) => {
        if (functionName === 'quoteAddLiquidity') {
          return [1000000000000000000n, 2000000000000000000n, 1414213562373095048n]
        }
        return 0n
      })
    })

    it('should encode correct function selector for addLiquidity', async () => {
      const params = await liquidityService.buildAddLiquidityParams(
        POOL_ADDRESS,
        TOKEN_0,
        1000000000000000000n,
        TOKEN_1,
        2000000000000000000n,
        RECIPIENT,
        { slippageTolerance: 0.5, deadline: deadlineFromMinutes(20) }
      )

      // Decode the function call
      const decoded = decodeFunctionData({
        abi: ROUTER_ABI,
        data: params.params.data as `0x${string}`,
      })

      expect(decoded.functionName).toBe('addLiquidity')
    })

    it('should encode correct parameters in addLiquidity call', async () => {
      const amountA = 1000000000000000000n
      const amountB = 2000000000000000000n

      const params = await liquidityService.buildAddLiquidityParams(
        POOL_ADDRESS,
        TOKEN_0,
        amountA,
        TOKEN_1,
        amountB,
        RECIPIENT,
        { slippageTolerance: 0.5, deadline: deadlineFromMinutes(20) }
      )

      const decoded = decodeFunctionData({
        abi: ROUTER_ABI,
        data: params.params.data as `0x${string}`,
      })

      expect(decoded.args).toBeDefined()
      const [tokenA, tokenB, amountADesired, amountBDesired, amountAMin, amountBMin, to, deadline] = decoded.args as unknown as any[]

      // Verify tokens
      expect(tokenA.toLowerCase()).toBe(TOKEN_0.toLowerCase())
      expect(tokenB.toLowerCase()).toBe(TOKEN_1.toLowerCase())

      // Verify amounts
      expect(amountADesired).toBe(amountA)
      expect(amountBDesired).toBe(amountB)

      // Verify slippage applied
      expect(amountAMin).toBeLessThanOrEqual(amountADesired)
      expect(amountBMin).toBeLessThanOrEqual(amountBDesired)

      // Verify recipient
      expect(to.toLowerCase()).toBe(RECIPIENT.toLowerCase())

      // Verify deadline exists
      expect(deadline).toBeGreaterThan(0n)
    })

    it('should correctly calculate and encode min amounts with slippage', async () => {
      const amount = 1000000000000000000n
      const slippage = 0.5

      const params = await liquidityService.buildAddLiquidityParams(
        POOL_ADDRESS,
        TOKEN_0,
        amount,
        TOKEN_1,
        amount * 2n,
        RECIPIENT,
        { slippageTolerance: slippage, deadline: deadlineFromMinutes(20) }
      )

      const decoded = decodeFunctionData({
        abi: ROUTER_ABI,
        data: params.params.data as `0x${string}`,
      })

      const [, , , , amountAMin, amountBMin] = decoded.args as unknown as any[]

      // Verify slippage calculation: min = quote * (1 - 0.005) = quote * 9950 / 10000
      const expectedAmountAMin = (1000000000000000000n * 9950n) / 10000n
      const expectedAmountBMin = (2000000000000000000n * 9950n) / 10000n

      expect(amountAMin).toBe(expectedAmountAMin)
      expect(amountBMin).toBe(expectedAmountBMin)
    })

    it('should encode deadline correctly', async () => {
      const customDeadline = BigInt(Math.floor(Date.now() / 1000) + 3600)

      const params = await liquidityService.buildAddLiquidityParams(
        POOL_ADDRESS,
        TOKEN_0,
        1000000000000000000n,
        TOKEN_1,
        2000000000000000000n,
        RECIPIENT,
        { slippageTolerance: 0.5, deadline: customDeadline }
      )

      const decoded = decodeFunctionData({
        abi: ROUTER_ABI,
        data: params.params.data as `0x${string}`,
      })

      const [, , , , , , , deadline] = decoded.args as unknown as any[]

      expect(deadline).toBe(customDeadline)
    })
  })

  describe('Remove Liquidity Transaction Data Verification', () => {
    beforeEach(() => {
      mockPublicClient.readContract.mockImplementation(async ({ functionName }: any) => {
        if (functionName === 'quoteRemoveLiquidity') {
          return [1000000000000000000n, 2000000000000000000n]
        }
        return 0n
      })
    })

    it('should encode correct function selector for removeLiquidity', async () => {
      const params = await liquidityService.buildRemoveLiquidityParams(
        POOL_ADDRESS,
        1414213562373095048n,
        RECIPIENT,
        { slippageTolerance: 0.5, deadline: deadlineFromMinutes(20) }
      )

      const decoded = decodeFunctionData({
        abi: ROUTER_ABI,
        data: params.params.data as `0x${string}`,
      })

      expect(decoded.functionName).toBe('removeLiquidity')
    })

    it('should encode correct parameters in removeLiquidity call', async () => {
      const liquidity = 1414213562373095048n

      const params = await liquidityService.buildRemoveLiquidityParams(
        POOL_ADDRESS,
        liquidity,
        RECIPIENT,
        { slippageTolerance: 0.5, deadline: deadlineFromMinutes(20) }
      )

      const decoded = decodeFunctionData({
        abi: ROUTER_ABI,
        data: params.params.data as `0x${string}`,
      })

      const [token0, token1, liquidityArg, amount0Min, amount1Min, to, deadline] = decoded.args as unknown as any[]

      // Verify tokens (should be in pool's token0/token1 order)
      expect(token0.toLowerCase()).toBe(TOKEN_0.toLowerCase())
      expect(token1.toLowerCase()).toBe(TOKEN_1.toLowerCase())

      // Verify liquidity
      expect(liquidityArg).toBe(liquidity)

      // Verify minimums with slippage
      expect(amount0Min).toBeLessThanOrEqual(1000000000000000000n)
      expect(amount1Min).toBeLessThanOrEqual(2000000000000000000n)

      // Verify recipient
      expect(to.toLowerCase()).toBe(RECIPIENT.toLowerCase())

      // Verify deadline
      expect(deadline).toBeGreaterThan(0n)
    })
  })

  describe('Approval Transaction Data Verification', () => {
    beforeEach(() => {
      mockPublicClient.readContract.mockImplementation(async ({ functionName }: any) => {
        if (functionName === 'quoteAddLiquidity') {
          return [1000000000000000000n, 2000000000000000000n, 1414213562373095048n]
        }
        if (functionName === 'allowance') return 0n // No allowance
        return 0n
      })
    })

    it('should encode correct function selector for approve', async () => {
      const transaction = await liquidityService.buildAddLiquidityTransaction(
        POOL_ADDRESS,
        TOKEN_0,
        1000000000000000000n,
        TOKEN_1,
        2000000000000000000n,
        RECIPIENT,
        OWNER,
        { slippageTolerance: 0.5, deadline: deadlineFromMinutes(20) }
      )

      expect(transaction.approvalA).not.toBeNull()

      const decoded = decodeFunctionData({
        abi: ERC20_ABI,
        data: transaction.approvalA!.params.data as `0x${string}`,
      })

      expect(decoded.functionName).toBe('approve')
    })

    it('should encode correct spender (router) in approval', async () => {
      const transaction = await liquidityService.buildAddLiquidityTransaction(
        POOL_ADDRESS,
        TOKEN_0,
        1000000000000000000n,
        TOKEN_1,
        2000000000000000000n,
        RECIPIENT,
        OWNER,
        { slippageTolerance: 0.5, deadline: deadlineFromMinutes(20) }
      )

      expect(transaction.approvalA).not.toBeNull()

      const decoded = decodeFunctionData({
        abi: ERC20_ABI,
        data: transaction.approvalA!.params.data as `0x${string}`,
      })

      const [spender, amount] = decoded.args as unknown as any[]

      // Verify spender is the Router address
      const routerAddress = require('../../../src/core/constants/addresses').getContractAddress(ChainId.CELO, 'Router')
      expect(spender.toLowerCase()).toBe(routerAddress.toLowerCase())

      // Verify amount matches
      expect(amount).toBe(1000000000000000000n)
    })

    it('should encode correct amount in approval', async () => {
      const amountA = 5000000000000000000n // 5 tokens

      const transaction = await liquidityService.buildAddLiquidityTransaction(
        POOL_ADDRESS,
        TOKEN_0,
        amountA,
        TOKEN_1,
        2000000000000000000n,
        RECIPIENT,
        OWNER,
        { slippageTolerance: 0.5, deadline: deadlineFromMinutes(20) }
      )

      expect(transaction.approvalA).not.toBeNull()

      const decoded = decodeFunctionData({
        abi: ERC20_ABI,
        data: transaction.approvalA!.params.data as `0x${string}`,
      })

      const [, amount] = decoded.args as unknown as any[]

      expect(amount).toBe(amountA)
    })

    it('should target correct token address in approval params', async () => {
      const transaction = await liquidityService.buildAddLiquidityTransaction(
        POOL_ADDRESS,
        TOKEN_0,
        1000000000000000000n,
        TOKEN_1,
        2000000000000000000n,
        RECIPIENT,
        OWNER,
        { slippageTolerance: 0.5, deadline: deadlineFromMinutes(20) }
      )

      expect(transaction.approvalA).not.toBeNull()
      expect(transaction.approvalB).not.toBeNull()

      // Approval transactions should target the token contracts
      expect(transaction.approvalA!.params.to.toLowerCase()).toBe(TOKEN_0.toLowerCase())
      expect(transaction.approvalB!.params.to.toLowerCase()).toBe(TOKEN_1.toLowerCase())
    })
  })

  describe('Cross-Check Quote Results', () => {
    it('should use quote results in transaction parameters', async () => {
      const quoteAmountA = 1111111111111111111n
      const quoteAmountB = 2222222222222222222n
      const quoteLiquidity = 1570092458683775888n

      mockPublicClient.readContract.mockResolvedValue([quoteAmountA, quoteAmountB, quoteLiquidity])

      const params = await liquidityService.buildAddLiquidityParams(
        POOL_ADDRESS,
        TOKEN_0,
        1000000000000000000n,
        TOKEN_1,
        2000000000000000000n,
        RECIPIENT,
        { slippageTolerance: 0.5, deadline: deadlineFromMinutes(20) }
      )

      // Verify the returned values match quote
      expect(params.estimatedMinLiquidity).toBe(quoteLiquidity)

      // Verify mins are derived from quote with slippage
      const expectedAmountAMin = (quoteAmountA * 9950n) / 10000n
      const expectedAmountBMin = (quoteAmountB * 9950n) / 10000n

      expect(params.amountAMin).toBe(expectedAmountAMin)
      expect(params.amountBMin).toBe(expectedAmountBMin)
    })

    it('should reflect quote values in encoded transaction data', async () => {
      const quoteAmountA = 1500000000000000000n
      const quoteAmountB = 3000000000000000000n

      mockPublicClient.readContract.mockResolvedValue([quoteAmountA, quoteAmountB, 2121320343559642584n])

      const params = await liquidityService.buildAddLiquidityParams(
        POOL_ADDRESS,
        TOKEN_0,
        2000000000000000000n,
        TOKEN_1,
        4000000000000000000n,
        RECIPIENT,
        { slippageTolerance: 1.0, deadline: deadlineFromMinutes(20) } // 1% slippage
      )

      const decoded = decodeFunctionData({
        abi: ROUTER_ABI,
        data: params.params.data as `0x${string}`,
      })

      const [, , , , amountAMin, amountBMin] = decoded.args as unknown as any[]

      // Verify encoded mins match calculated mins from quote
      const expectedAmountAMin = (quoteAmountA * 9900n) / 10000n // 1% slippage
      const expectedAmountBMin = (quoteAmountB * 9900n) / 10000n

      expect(amountAMin).toBe(expectedAmountAMin)
      expect(amountBMin).toBe(expectedAmountBMin)
    })
  })

  describe('Zap Transaction Data Verification', () => {
    beforeEach(() => {
      mockPoolService.getPoolDetails.mockResolvedValue({
        poolAddr: POOL_ADDRESS,
        token0: TOKEN_0,
        token1: TOKEN_1,
        reserve0: 10000000000000000000n,
        reserve1: 10000000000000000000n,
        poolType: 'FPMM',
      } as any)

      mockRouteService.findRoute.mockResolvedValue({
        id: 'route-id',
        path: [{
          poolAddr: POOL_ADDRESS,
          token0: TOKEN_0,
          token1: TOKEN_1,
          factoryAddr: FACTORY,
        }],
        tokens: [TOKEN_0, TOKEN_1],
      } as any)

      mockPublicClient.readContract.mockImplementation(async ({ functionName }: any) => {
        if (functionName === 'generateZapInParams') {
          return [400000000000000000n, 400000000000000000n, 400000000000000000n, 400000000000000000n]
        }
        if (functionName === 'totalSupply') return 10000000000000000000n
        if (functionName === 'allowance') return 0n
        return 0n
      })
    })

    it('should encode correct function selector for zapIn', async () => {
      const params = await liquidityService.buildZapInParams(
        POOL_ADDRESS,
        TOKEN_0,
        1000000000000000000n,
        0.5,
        RECIPIENT,
        { slippageTolerance: 0.5, deadline: deadlineFromMinutes(20) }
      )

      const decoded = decodeFunctionData({
        abi: ROUTER_ABI,
        data: params.params.data as `0x${string}`,
      })

      expect(decoded.functionName).toBe('zapIn')
    })

    it('should correctly split amounts in zapIn encoding', async () => {
      const amountIn = 1000000000000000000n
      const split = 0.6 // 60/40

      const params = await liquidityService.buildZapInParams(
        POOL_ADDRESS,
        TOKEN_0,
        amountIn,
        split,
        RECIPIENT,
        { slippageTolerance: 0.5, deadline: deadlineFromMinutes(20) }
      )

      // Verify split in returned object
      const expectedAmountInA = (amountIn * 6000n) / 10000n
      const expectedAmountInB = amountIn - expectedAmountInA

      expect(params.amountInA).toBe(expectedAmountInA)
      expect(params.amountInB).toBe(expectedAmountInB)
      expect(params.amountInA + params.amountInB).toBe(amountIn)
    })

    it('should encode zap parameters correctly', async () => {
      const params = await liquidityService.buildZapInParams(
        POOL_ADDRESS,
        TOKEN_0,
        1000000000000000000n,
        0.5,
        RECIPIENT,
        { slippageTolerance: 0.5, deadline: deadlineFromMinutes(20) }
      )

      // Verify zap params structure
      expect(params.zapParams).toBeDefined()
      expect(params.zapParams.tokenA.toLowerCase()).toBe(TOKEN_0.toLowerCase())
      expect(params.zapParams.tokenB.toLowerCase()).toBe(TOKEN_1.toLowerCase())
      expect(params.zapParams.factory.toLowerCase()).toBe(FACTORY.toLowerCase())
      expect(params.zapParams.amountAMin).toBeGreaterThan(0n)
      expect(params.zapParams.amountBMin).toBeGreaterThan(0n)
      expect(params.zapParams.amountOutMinA).toBeGreaterThan(0n)
      expect(params.zapParams.amountOutMinB).toBeGreaterThan(0n)
    })
  })

  describe('Transaction Value Field', () => {
    beforeEach(() => {
      mockPublicClient.readContract.mockImplementation(async ({ functionName }: any) => {
        if (functionName === 'quoteAddLiquidity') {
          return [1000000000000000000n, 2000000000000000000n, 1414213562373095048n]
        }
        return 0n
      })
    })

    it('should always set value to "0" for ERC20 liquidity operations', async () => {
      const params = await liquidityService.buildAddLiquidityParams(
        POOL_ADDRESS,
        TOKEN_0,
        1000000000000000000n,
        TOKEN_1,
        2000000000000000000n,
        RECIPIENT,
        { slippageTolerance: 0.5, deadline: deadlineFromMinutes(20) }
      )

      // ERC20 operations should never send native tokens
      expect(params.params.value).toBe('0')
    })

    it('should set value to "0" for remove liquidity', async () => {
      mockPublicClient.readContract.mockResolvedValue([1000000000000000000n, 2000000000000000000n])

      const params = await liquidityService.buildRemoveLiquidityParams(
        POOL_ADDRESS,
        1414213562373095048n,
        RECIPIENT,
        { slippageTolerance: 0.5, deadline: deadlineFromMinutes(20) }
      )

      expect(params.params.value).toBe('0')
    })

    it('should set value to "0" for approvals', async () => {
      mockPublicClient.readContract.mockImplementation(async ({ functionName }: any) => {
        if (functionName === 'quoteAddLiquidity') {
          return [1000000000000000000n, 2000000000000000000n, 1414213562373095048n]
        }
        if (functionName === 'allowance') return 0n
        return 0n
      })

      const transaction = await liquidityService.buildAddLiquidityTransaction(
        POOL_ADDRESS,
        TOKEN_0,
        1000000000000000000n,
        TOKEN_1,
        2000000000000000000n,
        RECIPIENT,
        OWNER,
        { slippageTolerance: 0.5, deadline: deadlineFromMinutes(20) }
      )

      expect(transaction.approvalA!.params.value).toBe('0')
      expect(transaction.approvalB!.params.value).toBe('0')
    })
  })
})
