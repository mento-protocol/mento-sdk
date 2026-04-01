import type { PublicClient } from 'viem'
import { ChainId } from '../../../src/core/constants'
import { TokenService } from '../../../src/services/tokens/tokenService'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makePublicClient(
  readContractImpl?: jest.Mock,
  multicallImpl?: jest.Mock
): jest.Mocked<PublicClient> {
  return {
    readContract: readContractImpl ?? jest.fn(),
    multicall: multicallImpl ?? jest.fn(),
  } as unknown as jest.Mocked<PublicClient>
}

/** Build a compact multicall result for name/symbol/decimals per token */
function metadataBatchResults(
  tokens: Array<{ name: string; symbol: string; decimals: number }>
) {
  return tokens.flatMap(({ name, symbol, decimals }) => [
    { status: 'success', result: name },
    { status: 'success', result: symbol },
    { status: 'success', result: decimals },
  ])
}

/** Build a compact multicall result for totalSupply per token */
function supplyBatchResults(supplies: bigint[]) {
  return supplies.map((s) => ({ status: 'success', result: s }))
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const tokenA = '0x1000000000000000000000000000000000000001'
const tokenB = '0x2000000000000000000000000000000000000002'
const tokenC = '0x3000000000000000000000000000000000000003'

// Real addresses from the SDK constants
const CELO_RESERVE = '0x9380fA34Fd9e4Fd14c06305fd7B6199089eD4eb9'
const CELO_BIPOOLMANAGER = '0x22d9db95E6Ae61c104A7B6F6C78D7993B94ec901'
const MONAD_TESTNET_RESERVE = '0xbCdc1D0b92DfceEaa0FcD0a0D53355F4bF1DB8a7'

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('TokenService', () => {
  let mockPublicClient: jest.Mocked<PublicClient>

  // ── existing test ────────────────────────────────────────────────────────

  describe('getStableTokens (legacy Reserve, CELO)', () => {
    beforeEach(() => {
      mockPublicClient = makePublicClient(
        jest.fn().mockImplementation(async ({ functionName }: any) => {
          if (functionName === 'getTokens') return [tokenA, tokenB]
          throw new Error(`Unexpected readContract call: ${functionName}`)
        }),
        jest.fn().mockImplementation(async ({ contracts }: any) => {
          if (contracts[0]?.functionName === 'name') {
            return metadataBatchResults([
              { name: 'Token A', symbol: 'TKNA', decimals: 18 },
              { name: 'Token B', symbol: 'TKNB', decimals: 6 },
            ])
          }
          if (contracts[0]?.functionName === 'totalSupply') {
            return supplyBatchResults([1000n, 2000n])
          }
          throw new Error(`Unexpected multicall batch: ${contracts[0]?.functionName}`)
        })
      )
    })

    it('batches stable-token metadata and supply reads', async () => {
      const service = new TokenService(mockPublicClient, ChainId.CELO)
      const tokens = await service.getStableTokens(true)

      expect(tokens).toEqual([
        { address: tokenA, name: 'Token A', symbol: 'TKNA', decimals: 18, totalSupply: '1000' },
        { address: tokenB, name: 'Token B', symbol: 'TKNB', decimals: 6, totalSupply: '2000' },
      ])
      expect(mockPublicClient.readContract).toHaveBeenCalledTimes(1)
      expect(mockPublicClient.multicall).toHaveBeenCalledTimes(2)
    })

    it('skips totalSupply fetch when includeSupply=false', async () => {
      const service = new TokenService(mockPublicClient, ChainId.CELO)
      const tokens = await service.getStableTokens(false)

      expect(tokens).toHaveLength(2)
      expect(tokens[0]).toMatchObject({ address: tokenA, totalSupply: '0' })
      expect(tokens[1]).toMatchObject({ address: tokenB, totalSupply: '0' })
      // metadata multicall fired but NOT the totalSupply multicall
      expect(mockPublicClient.multicall).toHaveBeenCalledTimes(1)
    })
  })

  // ── ReserveV2 stable tokens ───────────────────────────────────────────────

  describe('getStableTokens (ReserveV2, MONAD_TESTNET)', () => {
    it('calls getStableAssets instead of getTokens', async () => {
      mockPublicClient = makePublicClient(
        jest.fn().mockImplementation(async ({ functionName }: any) => {
          if (functionName === 'getStableAssets') return [tokenA]
          throw new Error(`Unexpected readContract call: ${functionName}`)
        }),
        jest.fn().mockImplementation(async ({ contracts }: any) => {
          if (contracts[0]?.functionName === 'name') {
            return metadataBatchResults([{ name: 'USD Mento', symbol: 'USDm', decimals: 18 }])
          }
          if (contracts[0]?.functionName === 'totalSupply') {
            return supplyBatchResults([5000n])
          }
          throw new Error(`Unexpected multicall batch: ${contracts[0]?.functionName}`)
        })
      )

      const service = new TokenService(mockPublicClient, ChainId.MONAD_TESTNET)
      const tokens = await service.getStableTokens(true)

      expect(tokens).toEqual([
        { address: tokenA, name: 'USD Mento', symbol: 'USDm', decimals: 18, totalSupply: '5000' },
      ])

      const readContractCall = (mockPublicClient.readContract as jest.Mock).mock.calls[0][0]
      expect(readContractCall.functionName).toBe('getStableAssets')
      expect(readContractCall.address).toBe(MONAD_TESTNET_RESERVE)
    })
  })

  // ── metadata cache ────────────────────────────────────────────────────────

  describe('metadata caching', () => {
    it('reuses cached metadata on repeated calls', async () => {
      mockPublicClient = makePublicClient(
        jest.fn().mockResolvedValue([tokenA]),
        jest.fn().mockImplementation(async ({ contracts }: any) => {
          if (contracts[0]?.functionName === 'name') {
            return metadataBatchResults([{ name: 'Token A', symbol: 'TKNA', decimals: 18 }])
          }
          return supplyBatchResults([100n])
        })
      )

      const service = new TokenService(mockPublicClient, ChainId.CELO)

      // First call populates the cache
      await service.getStableTokens(false)
      const multicallCountAfterFirst = (mockPublicClient.multicall as jest.Mock).mock.calls.length

      // Second call should hit the cache — no extra metadata multicall
      await service.getStableTokens(false)
      const multicallCountAfterSecond = (mockPublicClient.multicall as jest.Mock).mock.calls.length

      // Only the readContract for getTokens fires again (not metadata)
      expect(multicallCountAfterSecond).toBe(multicallCountAfterFirst)
    })
  })

  // ── getTokenMetadataBatch edge cases ─────────────────────────────────────

  describe('getTokenMetadataBatch', () => {
    it('falls back to individual readContract when multicall returns failure status', async () => {
      const readContractMock = jest.fn().mockImplementation(async ({ functionName, address }: any) => {
        if (functionName === 'getTokens') return [tokenA]
        if (functionName === 'name') return `Name of ${address}`
        if (functionName === 'symbol') return 'SYM'
        if (functionName === 'decimals') return 18
        if (functionName === 'totalSupply') return 999n
        throw new Error(`Unexpected: ${functionName}`)
      })

      const multicallMock = jest.fn().mockImplementation(async ({ contracts }: any) => {
        if (contracts[0]?.functionName === 'name') {
          // Simulate full failure for all fields of tokenA
          return [
            { status: 'failure', error: new Error('RPC error') },
            { status: 'failure', error: new Error('RPC error') },
            { status: 'failure', error: new Error('RPC error') },
          ]
        }
        if (contracts[0]?.functionName === 'totalSupply') {
          return supplyBatchResults([999n])
        }
        throw new Error(`Unexpected multicall batch: ${contracts[0]?.functionName}`)
      })

      mockPublicClient = makePublicClient(readContractMock, multicallMock)
      const service = new TokenService(mockPublicClient, ChainId.CELO)
      const tokens = await service.getStableTokens(true)

      expect(tokens).toHaveLength(1)
      expect(tokens[0]).toMatchObject({ address: tokenA, symbol: 'SYM', decimals: 18 })
      // readContract should have been called for name, symbol, decimals fallback
      const readContractCalls = readContractMock.mock.calls.map((c: any) => c[0].functionName)
      expect(readContractCalls).toContain('name')
      expect(readContractCalls).toContain('symbol')
      expect(readContractCalls).toContain('decimals')
    })
  })

  // ── getTotalSupplyBatch edge cases ────────────────────────────────────────

  describe('getTotalSupplyBatch', () => {
    it('falls back to individual readContract when multicall returns failure status', async () => {
      const readContractMock = jest.fn().mockImplementation(async ({ functionName }: any) => {
        if (functionName === 'getTokens') return [tokenA]
        if (functionName === 'name') return 'Token A'
        if (functionName === 'symbol') return 'TKNA'
        if (functionName === 'decimals') return 18
        if (functionName === 'totalSupply') return 777n
        throw new Error(`Unexpected: ${functionName}`)
      })

      const multicallMock = jest.fn().mockImplementation(async ({ contracts }: any) => {
        if (contracts[0]?.functionName === 'name') {
          return metadataBatchResults([{ name: 'Token A', symbol: 'TKNA', decimals: 18 }])
        }
        if (contracts[0]?.functionName === 'totalSupply') {
          // Simulate multicall failure for supply
          return [{ status: 'failure', error: new Error('supply error') }]
        }
        throw new Error(`Unexpected multicall batch: ${contracts[0]?.functionName}`)
      })

      mockPublicClient = makePublicClient(readContractMock, multicallMock)
      const service = new TokenService(mockPublicClient, ChainId.CELO)
      const tokens = await service.getStableTokens(true)

      expect(tokens[0].totalSupply).toBe('777')
      const readCalls = readContractMock.mock.calls.map((c: any) => c[0].functionName)
      expect(readCalls).toContain('totalSupply')
    })
  })

  // ── getCollateralAssets (ReserveV2) ───────────────────────────────────────

  describe('getCollateralAssets — ReserveV2 (MONAD_TESTNET)', () => {
    it('fetches collateral assets directly from ReserveV2', async () => {
      const readContractMock = jest.fn().mockImplementation(async ({ functionName }: any) => {
        if (functionName === 'getCollateralAssets') return [tokenA, tokenB]
        throw new Error(`Unexpected: ${functionName}`)
      })

      const multicallMock = jest.fn().mockImplementation(async ({ contracts }: any) => {
        if (contracts[0]?.functionName === 'name') {
          return metadataBatchResults([
            { name: 'Wrapped ETH', symbol: 'WETH', decimals: 18 },
            { name: 'USD Coin', symbol: 'USDC', decimals: 6 },
          ])
        }
        throw new Error(`Unexpected multicall batch: ${contracts[0]?.functionName}`)
      })

      mockPublicClient = makePublicClient(readContractMock, multicallMock)
      const service = new TokenService(mockPublicClient, ChainId.MONAD_TESTNET)
      const assets = await service.getCollateralAssets()

      expect(assets).toEqual([
        { address: tokenA, name: 'Wrapped ETH', symbol: 'WETH', decimals: 18 },
        { address: tokenB, name: 'USD Coin', symbol: 'USDC', decimals: 6 },
      ])

      const readCall = readContractMock.mock.calls[0][0]
      expect(readCall.functionName).toBe('getCollateralAssets')
      expect(readCall.address).toBe(MONAD_TESTNET_RESERVE)
    })
  })

  // ── getCollateralAssets (legacy BiPoolManager) ────────────────────────────

  describe('getCollateralAssets — legacy (CELO)', () => {
    it('returns collateral tokens discovered via BiPoolManager exchanges', async () => {
      const readContractMock = jest.fn().mockImplementation(async ({ functionName }: any) => {
        if (functionName === 'getExchanges') {
          return [
            { exchangeId: '0xabc', assets: [tokenA, tokenB] },
            { exchangeId: '0xdef', assets: [tokenB, tokenC] },
          ]
        }
        throw new Error(`Unexpected: ${functionName}`)
      })

      const multicallMock = jest.fn().mockImplementation(async ({ contracts }: any) => {
        if (contracts[0]?.functionName === 'isCollateralAsset') {
          // tokenA = collateral, tokenB = collateral, tokenC = not collateral
          const statuses = contracts.map((c: any) =>
            c.args[0] === tokenC
              ? { status: 'success', result: false }
              : { status: 'success', result: true }
          )
          return statuses
        }
        if (contracts[0]?.functionName === 'name') {
          return metadataBatchResults([
            { name: 'Token A', symbol: 'TKNA', decimals: 18 },
            { name: 'Token B', symbol: 'TKNB', decimals: 18 },
            { name: 'Token C', symbol: 'TKNC', decimals: 18 },
          ])
        }
        throw new Error(`Unexpected multicall batch: ${contracts[0]?.functionName}`)
      })

      mockPublicClient = makePublicClient(readContractMock, multicallMock)
      const service = new TokenService(mockPublicClient, ChainId.CELO)
      const assets = await service.getCollateralAssets()

      expect(assets).toHaveLength(2)
      expect(assets.map((a) => a.address).sort()).toEqual([tokenA, tokenB].sort())
      // tokenC must be excluded
      expect(assets.find((a) => a.address === tokenC)).toBeUndefined()

      const getExchangesCall = readContractMock.mock.calls[0][0]
      expect(getExchangesCall.functionName).toBe('getExchanges')
      expect(getExchangesCall.address).toBe(CELO_BIPOOLMANAGER)
    })

    it('deduplicates token addresses across exchanges', async () => {
      const readContractMock = jest.fn().mockResolvedValue([
        // tokenA appears in two exchanges
        { exchangeId: '0xabc', assets: [tokenA, tokenB] },
        { exchangeId: '0xdef', assets: [tokenA, tokenC] },
      ])

      const multicallMock = jest.fn().mockImplementation(async ({ contracts }: any) => {
        if (contracts[0]?.functionName === 'isCollateralAsset') {
          return contracts.map(() => ({ status: 'success', result: true }))
        }
        if (contracts[0]?.functionName === 'name') {
          // 3 unique addresses: tokenA, tokenB, tokenC
          return metadataBatchResults([
            { name: 'Token A', symbol: 'TKNA', decimals: 18 },
            { name: 'Token B', symbol: 'TKNB', decimals: 18 },
            { name: 'Token C', symbol: 'TKNC', decimals: 18 },
          ])
        }
        throw new Error(`Unexpected multicall batch: ${contracts[0]?.functionName}`)
      })

      mockPublicClient = makePublicClient(readContractMock, multicallMock)
      const service = new TokenService(mockPublicClient, ChainId.CELO)
      const assets = await service.getCollateralAssets()

      // 3 unique addresses, not 4
      expect(assets).toHaveLength(3)
    })

    it('falls back to readContract when isCollateralAsset multicall fails', async () => {
      const readContractMock = jest.fn().mockImplementation(async ({ functionName, args }: any) => {
        if (functionName === 'getExchanges') {
          return [{ exchangeId: '0xabc', assets: [tokenA] }]
        }
        if (functionName === 'isCollateralAsset') {
          return args[0] === tokenA
        }
        throw new Error(`Unexpected: ${functionName}`)
      })

      const multicallMock = jest.fn().mockImplementation(async ({ contracts }: any) => {
        if (contracts[0]?.functionName === 'isCollateralAsset') {
          return [{ status: 'failure', error: new Error('RPC error') }]
        }
        if (contracts[0]?.functionName === 'name') {
          return metadataBatchResults([{ name: 'Token A', symbol: 'TKNA', decimals: 18 }])
        }
        throw new Error(`Unexpected multicall batch: ${contracts[0]?.functionName}`)
      })

      mockPublicClient = makePublicClient(readContractMock, multicallMock)
      const service = new TokenService(mockPublicClient, ChainId.CELO)
      const assets = await service.getCollateralAssets()

      expect(assets).toHaveLength(1)
      expect(assets[0].address).toBe(tokenA)

      const readCalls = readContractMock.mock.calls.map((c: any) => c[0].functionName)
      expect(readCalls).toContain('isCollateralAsset')
    })
  })

  // ── isReserveV2 boundary ──────────────────────────────────────────────────

  describe('isReserveV2 chain detection', () => {
    it('routes MONAD to ReserveV2 path', async () => {
      const readContractMock = jest.fn().mockImplementation(async ({ functionName }: any) => {
        if (functionName === 'getCollateralAssets') return []
        throw new Error(`Unexpected: ${functionName}`)
      })

      mockPublicClient = makePublicClient(readContractMock, jest.fn().mockResolvedValue([]))
      const service = new TokenService(mockPublicClient, ChainId.MONAD)
      await service.getCollateralAssets()

      const calls = readContractMock.mock.calls.map((c: any) => c[0].functionName)
      expect(calls).toContain('getCollateralAssets')
    })

    it('routes CELO_SEPOLIA to legacy BiPoolManager path', async () => {
      const readContractMock = jest.fn().mockResolvedValue([])
      const multicallMock = jest.fn().mockResolvedValue([])

      mockPublicClient = makePublicClient(readContractMock, multicallMock)
      const service = new TokenService(mockPublicClient, ChainId.CELO_SEPOLIA)
      const assets = await service.getCollateralAssets()

      expect(assets).toEqual([])
      const calls = readContractMock.mock.calls.map((c: any) => c[0].functionName)
      expect(calls).toContain('getExchanges')
    })
  })
})
