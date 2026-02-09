import { PoolService } from '../../../src/services/pools/PoolService'
import type { Pool, FPMMPoolDetails, VirtualPoolDetails } from '../../../src/core/types/pool'
import type { PublicClient } from 'viem'
import { ChainId } from '../../../src/core/constants'

/**
 * Unit tests for PoolService
 *
 * Tests pool discovery from both FPMM and Virtual pool factories.
 */
describe('PoolService', () => {
  let mockPublicClient: jest.Mocked<PublicClient>
  let service: PoolService

  // Mock FPMM pool data (all addresses must be valid hex for BigInt compatibility)
  const mockFPMMPools = [
    {
      poolAddress: '0xF100000000000000000000000000000000000001',
      token0: '0xA000000000000000000000000000000000000001',
      token1: '0xA100000000000000000000000000000000000001',
    },
    {
      poolAddress: '0xF200000000000000000000000000000000000002',
      token0: '0xB000000000000000000000000000000000000002',
      token1: '0xB100000000000000000000000000000000000002',
    },
  ]

  // Mock BiPoolManager exchange data
  const mockExchanges = [
    {
      exchangeId: '0xeee1',
      assets: [
        '0xC000000000000000000000000000000000000001',
        '0xC100000000000000000000000000000000000001',
      ],
    },
    {
      exchangeId: '0xeee2',
      assets: [
        '0xD000000000000000000000000000000000000002',
        '0xD100000000000000000000000000000000000002',
      ],
    },
  ]

  // Mock Virtual pool addresses
  const mockVirtualPools = [
    '0x5000000000000000000000000000000000000001',
    '0x5100000000000000000000000000000000000002',
  ]

  beforeEach(() => {
    mockPublicClient = {
      readContract: jest.fn(),
    } as unknown as jest.Mocked<PublicClient>

    service = new PoolService(mockPublicClient, ChainId.CELO)
  })

  describe('getPools()', () => {
    describe('FPMM pool fetching', () => {
      beforeEach(() => {
        // Mock contract reads
        mockPublicClient.readContract.mockImplementation(
          async ({ address, functionName, args }: any) => {
            // FPMMFactory.deployedFPMMAddresses()
            if (functionName === 'deployedFPMMAddresses') {
              return mockFPMMPools.map((p) => p.poolAddress)
            }

            // FPMM.token0() / FPMM.token1()
            if (functionName === 'token0') {
              const pool = mockFPMMPools.find((p) => p.poolAddress === address)
              return pool?.token0
            }
            if (functionName === 'token1') {
              const pool = mockFPMMPools.find((p) => p.poolAddress === address)
              return pool?.token1
            }

            // BiPoolManager.getExchanges() - return empty for this test
            if (functionName === 'getExchanges') {
              return []
            }

            return null
          }
        )
      })

      it('should fetch FPMM pools from FPMMFactory', async () => {
        const pools = await service.getPools()

        // Should have fetched deployedFPMMAddresses
        expect(mockPublicClient.readContract).toHaveBeenCalledWith(
          expect.objectContaining({
            functionName: 'deployedFPMMAddresses',
          })
        )

        // Should have pools (from FPMM factory mock)
        expect(pools.length).toBe(2)
      })

      it('should fetch token0 and token1 for each FPMM pool', async () => {
        const pools = await service.getPools()

        // Each pool should have token addresses
        pools.forEach((pool) => {
          expect(pool.token0).toBeDefined()
          expect(pool.token1).toBeDefined()
          expect(pool.token0).toMatch(/^0x/)
          expect(pool.token1).toMatch(/^0x/)
        })
      })

      it('should throw if no pools discovered from any factory', async () => {
        mockPublicClient.readContract.mockImplementation(
          async ({ functionName }: any) => {
            if (functionName === 'deployedFPMMAddresses') {
              return []
            }
            if (functionName === 'getExchanges') {
              return []
            }
            return null
          }
        )

        await expect(service.getPools()).rejects.toThrow(
          'Failed to discover any pools from any factory'
        )
      })
    })

    describe('Virtual pool fetching', () => {
      beforeEach(() => {
        mockPublicClient.readContract.mockImplementation(
          async ({ address, functionName, args }: any) => {
            // FPMMFactory.deployedFPMMAddresses() - return empty
            if (functionName === 'deployedFPMMAddresses') {
              return []
            }

            // VirtualPoolFactory.getAllPools()
            if (functionName === 'getAllPools') {
              return mockVirtualPools
            }

            // BiPoolManager.getExchanges()
            if (functionName === 'getExchanges') {
              return mockExchanges
            }

            // VirtualPool.tokens()
            if (functionName === 'tokens') {
              const poolIndex = mockVirtualPools.indexOf(address)
              if (poolIndex >= 0) {
                return [mockExchanges[poolIndex].assets[0], mockExchanges[poolIndex].assets[1]]
              }
              return null
            }

            return null
          }
        )
      })

      it('should discover Virtual pools from VirtualPoolFactory.getAllPools()', async () => {
        const pools = await service.getPools()

        // Should have called getAllPools on VirtualPoolFactory
        expect(mockPublicClient.readContract).toHaveBeenCalledWith(
          expect.objectContaining({
            functionName: 'getAllPools',
          })
        )

        // Should have virtual pools
        expect(pools.length).toBe(2)
      })

      it('should read tokens from each pool via tokens()', async () => {
        const pools = await service.getPools()

        // Should have called tokens() for each pool
        const tokensCalls = mockPublicClient.readContract.mock.calls.filter(
          ([params]) => 'functionName' in params && params.functionName === 'tokens'
        )
        expect(tokensCalls.length).toBe(mockVirtualPools.length)
      })

      it('should throw when getAllPools returns empty', async () => {
        mockPublicClient.readContract.mockImplementation(
          async ({ functionName }: any) => {
            if (functionName === 'deployedFPMMAddresses') {
              return []
            }
            if (functionName === 'getAllPools') {
              return []
            }
            if (functionName === 'getExchanges') {
              return mockExchanges
            }
            return null
          }
        )

        await expect(service.getPools()).rejects.toThrow(
          'Failed to discover any pools from any factory'
        )
      })

      it('should sort tokens returned from pool.tokens()', async () => {
        mockPublicClient.readContract.mockImplementation(
          async ({ functionName }: any) => {
            if (functionName === 'deployedFPMMAddresses') {
              return []
            }
            if (functionName === 'getAllPools') {
              return ['0x5000000000000000000000000000000000000001']
            }
            if (functionName === 'getExchanges') {
              return [
                {
                  exchangeId: '0xee01',
                  assets: [
                    '0xFF00000000000000000000000000000000000000',
                    '0xAA00000000000000000000000000000000000000',
                  ],
                },
              ]
            }
            // Return unsorted tokens (higher address first)
            if (functionName === 'tokens') {
              return [
                '0xFF00000000000000000000000000000000000000',
                '0xAA00000000000000000000000000000000000000',
              ]
            }
            return null
          }
        )

        const pools = await service.getPools()

        // token0 should be lexicographically less than token1
        expect(pools[0].token0.toLowerCase() < pools[0].token1.toLowerCase()).toBe(true)
      })
    })

    describe('combined pool fetching', () => {
      beforeEach(() => {
        mockPublicClient.readContract.mockImplementation(
          async ({ address, functionName, args }: any) => {
            // FPMM pools
            if (functionName === 'deployedFPMMAddresses') {
              return mockFPMMPools.map((p) => p.poolAddress)
            }
            if (functionName === 'token0') {
              const pool = mockFPMMPools.find((p) => p.poolAddress === address)
              return pool?.token0
            }
            if (functionName === 'token1') {
              const pool = mockFPMMPools.find((p) => p.poolAddress === address)
              return pool?.token1
            }

            // Virtual pools
            if (functionName === 'getAllPools') {
              return mockVirtualPools
            }
            if (functionName === 'getExchanges') {
              return mockExchanges
            }
            if (functionName === 'tokens') {
              const poolIndex = mockVirtualPools.indexOf(address)
              if (poolIndex >= 0) {
                return [mockExchanges[poolIndex].assets[0], mockExchanges[poolIndex].assets[1]]
              }
              return null
            }

            return null
          }
        )
      })

      it('should return pools from both FPMM and Virtual factories', async () => {
        const pools = await service.getPools()

        // Should have pools from both factories
        expect(pools.length).toBe(4) // 2 FPMM + 2 Virtual
      })

      it('should set correct factoryAddr for each pool type', async () => {
        const pools = await service.getPools()

        // FPMM pools should have FPMM factory address
        const fpmmPools = pools.filter((p) => p.poolAddr === mockFPMMPools[0].poolAddress)
        expect(fpmmPools.length).toBeGreaterThan(0)

        // Virtual pools should have Virtual factory address
        const virtualPools = pools.filter(
          (p) => p.poolAddr === mockVirtualPools[0]
        )
        expect(virtualPools.length).toBeGreaterThan(0)
      })
    })

    describe('caching', () => {
      beforeEach(() => {
        mockPublicClient.readContract.mockImplementation(
          async ({ functionName }: any) => {
            if (functionName === 'deployedFPMMAddresses') {
              return [mockFPMMPools[0].poolAddress]
            }
            if (functionName === 'token0') {
              return mockFPMMPools[0].token0
            }
            if (functionName === 'token1') {
              return mockFPMMPools[0].token1
            }
            if (functionName === 'getAllPools') {
              return []
            }
            if (functionName === 'getExchanges') {
              return []
            }
            return null
          }
        )
      })

      it('should cache results after first call', async () => {
        const firstResult = await service.getPools()
        const secondResult = await service.getPools()

        expect(firstResult).toEqual(secondResult)
      })

      it('should not make additional RPC calls on subsequent requests', async () => {
        await service.getPools()
        const callCountAfterFirst = mockPublicClient.readContract.mock.calls.length

        await service.getPools()
        const callCountAfterSecond = mockPublicClient.readContract.mock.calls.length

        expect(callCountAfterSecond).toBe(callCountAfterFirst)
      })
    })

    describe('error handling', () => {
      it('should throw generic error if all factory fetches fail', async () => {
        mockPublicClient.readContract.mockImplementation(
          async ({ functionName }: any) => {
            if (functionName === 'deployedFPMMAddresses') {
              throw new Error('RPC connection failed')
            }
            if (functionName === 'getAllPools') {
              throw new Error('RPC connection failed')
            }
            if (functionName === 'getExchanges') {
              throw new Error('RPC connection failed')
            }
            return null
          }
        )

        await expect(service.getPools()).rejects.toThrow(
          'Failed to discover any pools from any factory'
        )
      })

      it('should throw when FPMM returns empty and Virtual fetch fails', async () => {
        mockPublicClient.readContract.mockImplementation(
          async ({ functionName }: any) => {
            if (functionName === 'deployedFPMMAddresses') {
              return []
            }
            if (functionName === 'getAllPools') {
              throw new Error('RPC connection failed')
            }
            if (functionName === 'getExchanges') {
              throw new Error('RPC connection failed')
            }
            return null
          }
        )

        await expect(service.getPools()).rejects.toThrow(
          'Failed to discover any pools from any factory'
        )
      })

      it('should skip exchanges with invalid asset count when matching exchangeIds', async () => {
        const validToken0 = '0xAA00000000000000000000000000000000000001'
        const validToken1 = '0xBB00000000000000000000000000000000000001'
        const validPool = '0x5500000000000000000000000000000000000001'

        mockPublicClient.readContract.mockImplementation(
          async ({ functionName }: any) => {
            if (functionName === 'deployedFPMMAddresses') {
              return []
            }
            if (functionName === 'getAllPools') {
              return [validPool]
            }
            if (functionName === 'getExchanges') {
              return [
                { exchangeId: '0xee01', assets: [validToken0, validToken1] },
                {
                  exchangeId: '0xee02',
                  assets: [validToken0, validToken1, '0xCC00000000000000000000000000000000000001'],
                },
              ]
            }
            if (functionName === 'tokens') {
              return [validToken0, validToken1]
            }
            return null
          }
        )

        const pools = await service.getPools()

        // Pool should still be discovered and matched to the valid 2-asset exchange
        expect(pools.length).toBe(1)
        expect(pools[0].exchangeId).toBe('0xee01')
      })

      it('should throw error if chain is not supported', async () => {
        // Create service with unsupported chain
        const unsupportedService = new PoolService(
          mockPublicClient,
          99999 // Unsupported chain ID
        )

        await expect(unsupportedService.getPools()).rejects.toThrow(
          'Failed to discover any pools from any factory'
        )
      })
    })
  })

  describe('getPoolDetails()', () => {
    describe('FPMM pool details', () => {
      beforeEach(() => {
        mockPublicClient.readContract.mockImplementation(
          async ({ address, functionName }: any) => {
            // getPools() discovery mocks
            if (functionName === 'deployedFPMMAddresses') {
              return [mockFPMMPools[0].poolAddress]
            }
            if (functionName === 'token0') {
              return mockFPMMPools[0].token0
            }
            if (functionName === 'token1') {
              return mockFPMMPools[0].token1
            }
            if (functionName === 'getExchanges') {
              return []
            }

            // getPoolDetails() enrichment mocks
            if (functionName === 'getReserves') {
              return [3500000000000000000000n, 6400000000n, 1700000000n]
            }
            if (functionName === 'getRebalancingState') {
              return [1830n, 1000n, 1832n, 1000n, true, 60, 12n]
            }
            if (functionName === 'decimals0') {
              return 1000000000000000000n // 1e18
            }
            if (functionName === 'decimals1') {
              return 1000000n // 1e6
            }
            if (functionName === 'lpFee') {
              return 25n
            }
            if (functionName === 'protocolFee') {
              return 5n
            }
            if (functionName === 'rebalanceIncentive') {
              return 10n
            }
            if (functionName === 'rebalanceThresholdAbove') {
              return 60n
            }
            if (functionName === 'rebalanceThresholdBelow') {
              return 60n
            }
            if (functionName === 'liquidityStrategy') {
              return false
            }

            return null
          }
        )
      })

      it('should return enriched FPMM pool details with correct poolType', async () => {
        const details = await service.getPoolDetails(mockFPMMPools[0].poolAddress)

        expect(details.poolType).toBe('FPMM')
        expect(details.poolAddr).toBe(mockFPMMPools[0].poolAddress)
        expect(details.token0).toBe(mockFPMMPools[0].token0)
        expect(details.token1).toBe(mockFPMMPools[0].token1)
      })

      it('should return reserves and decimals', async () => {
        const details = await service.getPoolDetails(mockFPMMPools[0].poolAddress) as FPMMPoolDetails

        expect(details.reserve0).toBe(3500000000000000000000n)
        expect(details.reserve1).toBe(6400000000n)
        expect(details.blockTimestampLast).toBe(1700000000n)
        expect(details.scalingFactor0).toBe(1000000000000000000n)
        expect(details.scalingFactor1).toBe(1000000n)
      })

      it('should compute oracle and reserve prices correctly', async () => {
        const details = await service.getPoolDetails(mockFPMMPools[0].poolAddress) as FPMMPoolDetails

        expect(details.pricing!.oraclePriceNum).toBe(1830n)
        expect(details.pricing!.oraclePriceDen).toBe(1000n)
        expect(details.pricing!.oraclePrice).toBeCloseTo(1.83, 5)

        expect(details.pricing!.reservePriceNum).toBe(1832n)
        expect(details.pricing!.reservePriceDen).toBe(1000n)
        expect(details.pricing!.reservePrice).toBeCloseTo(1.832, 5)
      })

      it('should compute price difference correctly', async () => {
        const details = await service.getPoolDetails(mockFPMMPools[0].poolAddress) as FPMMPoolDetails

        expect(details.pricing!.priceDifferenceBps).toBe(12n)
        expect(details.pricing!.priceDifferencePercent).toBeCloseTo(0.12, 5)
        expect(details.pricing!.reservePriceAboveOraclePrice).toBe(true)
      })

      it('should compute fees correctly', async () => {
        const details = await service.getPoolDetails(mockFPMMPools[0].poolAddress) as FPMMPoolDetails

        expect(details.fees.lpFeeBps).toBe(25n)
        expect(details.fees.lpFeePercent).toBeCloseTo(0.25, 5)
        expect(details.fees.protocolFeeBps).toBe(5n)
        expect(details.fees.protocolFeePercent).toBeCloseTo(0.05, 5)
        expect(details.fees.totalFeePercent).toBeCloseTo(0.30, 5)
      })

      it('should compute rebalancing state correctly', async () => {
        const details = await service.getPoolDetails(mockFPMMPools[0].poolAddress) as FPMMPoolDetails

        expect(details.rebalancing.rebalanceIncentiveBps).toBe(10n)
        expect(details.rebalancing.rebalanceIncentivePercent).toBeCloseTo(0.10, 5)
        expect(details.rebalancing.rebalanceThresholdAboveBps).toBe(60n)
        expect(details.rebalancing.rebalanceThresholdAbovePercent).toBeCloseTo(0.60, 5)
        expect(details.rebalancing.rebalanceThresholdBelowBps).toBe(60n)
        expect(details.rebalancing.rebalanceThresholdBelowPercent).toBeCloseTo(0.60, 5)
      })

      it('should compute inBand=true when price difference < threshold', async () => {
        // priceDifference=12, thresholdAbove=60, reservePriceAboveOraclePrice=true
        // 12 < 60 → inBand = true
        const details = await service.getPoolDetails(mockFPMMPools[0].poolAddress) as FPMMPoolDetails

        expect(details.rebalancing.inBand).toBe(true)
      })

      it('should compute inBand=false when price difference >= threshold', async () => {
        mockPublicClient.readContract.mockImplementation(
          async ({ functionName }: any) => {
            if (functionName === 'deployedFPMMAddresses') return [mockFPMMPools[0].poolAddress]
            if (functionName === 'token0') return mockFPMMPools[0].token0
            if (functionName === 'token1') return mockFPMMPools[0].token1
            if (functionName === 'getExchanges') return []
            if (functionName === 'getReserves') return [1000n, 2000n, 100n]
            if (functionName === 'getRebalancingState') return [1000n, 1000n, 1100n, 1000n, true, 60, 80n]
            if (functionName === 'decimals0') return 1000000000000000000n
            if (functionName === 'decimals1') return 1000000000000000000n
            if (functionName === 'lpFee') return 25n
            if (functionName === 'protocolFee') return 5n
            if (functionName === 'rebalanceIncentive') return 10n
            if (functionName === 'rebalanceThresholdAbove') return 60n
            if (functionName === 'rebalanceThresholdBelow') return 60n
            if (functionName === 'liquidityStrategy') return false
            return null
          }
        )

        const details = await service.getPoolDetails(mockFPMMPools[0].poolAddress) as FPMMPoolDetails

        // priceDifference=80, thresholdAbove=60, 80 >= 60 → inBand = false
        expect(details.rebalancing.inBand).toBe(false)
      })

      it('should use thresholdBelow when reserve price is below oracle', async () => {
        mockPublicClient.readContract.mockImplementation(
          async ({ functionName }: any) => {
            if (functionName === 'deployedFPMMAddresses') return [mockFPMMPools[0].poolAddress]
            if (functionName === 'token0') return mockFPMMPools[0].token0
            if (functionName === 'token1') return mockFPMMPools[0].token1
            if (functionName === 'getExchanges') return []
            if (functionName === 'getReserves') return [1000n, 2000n, 100n]
            if (functionName === 'getRebalancingState') return [1000n, 1000n, 900n, 1000n, false, 40, 50n]
            if (functionName === 'decimals0') return 1000000000000000000n
            if (functionName === 'decimals1') return 1000000000000000000n
            if (functionName === 'lpFee') return 25n
            if (functionName === 'protocolFee') return 5n
            if (functionName === 'rebalanceIncentive') return 10n
            if (functionName === 'rebalanceThresholdAbove') return 60n
            if (functionName === 'rebalanceThresholdBelow') return 40n
            if (functionName === 'liquidityStrategy') return false
            return null
          }
        )

        const details = await service.getPoolDetails(mockFPMMPools[0].poolAddress) as FPMMPoolDetails

        // reservePriceAboveOraclePrice=false → uses thresholdBelow=40
        // priceDifference=50 >= 40 → inBand = false
        expect(details.pricing!.reservePriceAboveOraclePrice).toBe(false)
        expect(details.rebalancing.inBand).toBe(false)
      })

      it('should return pricing as null when getPrices() fails (FX market closed)', async () => {
        mockPublicClient.readContract.mockImplementation(
          async ({ functionName }: any) => {
            if (functionName === 'deployedFPMMAddresses') return [mockFPMMPools[0].poolAddress]
            if (functionName === 'token0') return mockFPMMPools[0].token0
            if (functionName === 'token1') return mockFPMMPools[0].token1
            if (functionName === 'getExchanges') return []
            if (functionName === 'getReserves') return [3500000000000000000000n, 6400000000n, 1700000000n]
            if (functionName === 'getRebalancingState') throw new Error('execution reverted: 0xa407143a')
            if (functionName === 'decimals0') return 1000000000000000000n
            if (functionName === 'decimals1') return 1000000n
            if (functionName === 'lpFee') return 25n
            if (functionName === 'protocolFee') return 5n
            if (functionName === 'rebalanceIncentive') return 10n
            if (functionName === 'rebalanceThresholdAbove') return 60n
            if (functionName === 'rebalanceThresholdBelow') return 60n
            if (functionName === 'liquidityStrategy') return false
            return null
          }
        )

        const details = await service.getPoolDetails(mockFPMMPools[0].poolAddress) as FPMMPoolDetails

        // Pricing should be null but other fields should still be populated
        expect(details.pricing).toBeNull()
        expect(details.rebalancing.inBand).toBeNull()

        // Other fields should still have values
        expect(details.reserve0).toBe(3500000000000000000000n)
        expect(details.reserve1).toBe(6400000000n)
        expect(details.fees.lpFeeBps).toBe(25n)
        expect(details.fees.protocolFeeBps).toBe(5n)
        expect(details.rebalancing.rebalanceThresholdAboveBps).toBe(60n)
      })

      it('should return null liquidityStrategy when no strategy is active', async () => {
        const details = await service.getPoolDetails(mockFPMMPools[0].poolAddress) as FPMMPoolDetails

        expect(details.rebalancing.liquidityStrategy).toBeNull()
      })

      it('should return the active liquidity strategy address', async () => {
        mockPublicClient.readContract.mockImplementation(
          async ({ address, functionName, args }: any) => {
            if (functionName === 'deployedFPMMAddresses') return [mockFPMMPools[0].poolAddress]
            if (functionName === 'token0') return mockFPMMPools[0].token0
            if (functionName === 'token1') return mockFPMMPools[0].token1
            if (functionName === 'getExchanges') return []
            if (functionName === 'getReserves') return [3500000000000000000000n, 6400000000n, 1700000000n]
            if (functionName === 'getRebalancingState') return [1830n, 1000n, 1832n, 1000n, true, 60, 12n]
            if (functionName === 'decimals0') return 1000000000000000000n
            if (functionName === 'decimals1') return 1000000n
            if (functionName === 'lpFee') return 25n
            if (functionName === 'protocolFee') return 5n
            if (functionName === 'rebalanceIncentive') return 10n
            if (functionName === 'rebalanceThresholdAbove') return 60n
            if (functionName === 'rebalanceThresholdBelow') return 60n
            if (functionName === 'liquidityStrategy') {
              // First known strategy is active
              const [candidate] = args as [string]
              return candidate === '0x0000000000000000000000000000000000000001'
            }
            return null
          }
        )

        const details = await service.getPoolDetails(mockFPMMPools[0].poolAddress) as FPMMPoolDetails

        expect(details.rebalancing.liquidityStrategy).toBe('0x0000000000000000000000000000000000000001')
      })

      it('should return second strategy if first is inactive', async () => {
        mockPublicClient.readContract.mockImplementation(
          async ({ address, functionName, args }: any) => {
            if (functionName === 'deployedFPMMAddresses') return [mockFPMMPools[0].poolAddress]
            if (functionName === 'token0') return mockFPMMPools[0].token0
            if (functionName === 'token1') return mockFPMMPools[0].token1
            if (functionName === 'getExchanges') return []
            if (functionName === 'getReserves') return [3500000000000000000000n, 6400000000n, 1700000000n]
            if (functionName === 'getRebalancingState') return [1830n, 1000n, 1832n, 1000n, true, 60, 12n]
            if (functionName === 'decimals0') return 1000000000000000000n
            if (functionName === 'decimals1') return 1000000n
            if (functionName === 'lpFee') return 25n
            if (functionName === 'protocolFee') return 5n
            if (functionName === 'rebalanceIncentive') return 10n
            if (functionName === 'rebalanceThresholdAbove') return 60n
            if (functionName === 'rebalanceThresholdBelow') return 60n
            if (functionName === 'liquidityStrategy') {
              // Second known strategy is active
              const [candidate] = args as [string]
              return candidate === '0x0000000000000000000000000000000000000002'
            }
            return null
          }
        )

        const details = await service.getPoolDetails(mockFPMMPools[0].poolAddress) as FPMMPoolDetails

        expect(details.rebalancing.liquidityStrategy).toBe('0x0000000000000000000000000000000000000002')
      })
    })

    describe('Virtual pool details', () => {
      // Use valid hex addresses for Virtual pool tests (BigInt-compatible)
      const virtualToken0 = '0x1111111111111111111111111111111111111111'
      const virtualToken1 = '0x2222222222222222222222222222222222222222'
      const virtualPoolAddr = '0x3333333333333333333333333333333333333333'

      beforeEach(() => {
        mockPublicClient.readContract.mockImplementation(
          async ({ address, functionName, args }: any) => {
            // getPools() discovery mocks
            if (functionName === 'deployedFPMMAddresses') return []
            if (functionName === 'getAllPools') {
              return [virtualPoolAddr]
            }
            if (functionName === 'getExchanges') {
              return [{ exchangeId: '0xabc123', assets: [virtualToken0, virtualToken1] }]
            }
            if (functionName === 'tokens') {
              return [virtualToken0, virtualToken1]
            }

            // getPoolDetails() enrichment mocks
            if (functionName === 'getReserves') {
              return [5000000000000000000000n, 9000000000n, 1700000000n]
            }
            if (functionName === 'protocolFee') {
              return 50n
            }
            if (functionName === 'metadata') {
              return [1000000000000000000n, 1000000n, 5000000000000000000000n, 9000000000n, virtualToken0, virtualToken1]
            }

            return null
          }
        )
      })

      it('should return enriched Virtual pool details', async () => {
        const details = await service.getPoolDetails(virtualPoolAddr) as VirtualPoolDetails

        expect(details.poolType).toBe('Virtual')
        expect(details.poolAddr).toBe(virtualPoolAddr)
      })

      it('should return reserves and decimals from contract', async () => {
        const details = await service.getPoolDetails(virtualPoolAddr) as VirtualPoolDetails

        expect(details.reserve0).toBe(5000000000000000000000n)
        expect(details.reserve1).toBe(9000000000n)
        expect(details.blockTimestampLast).toBe(1700000000n)
        expect(details.scalingFactor0).toBe(1000000000000000000n)
        expect(details.scalingFactor1).toBe(1000000n)
      })

      it('should return spread from protocolFee()', async () => {
        const details = await service.getPoolDetails(virtualPoolAddr) as VirtualPoolDetails

        expect(details.spreadBps).toBe(50n)
        expect(details.spreadPercent).toBeCloseTo(0.50, 5)
      })
    })

    describe('error handling', () => {
      beforeEach(() => {
        mockPublicClient.readContract.mockImplementation(
          async ({ functionName }: any) => {
            if (functionName === 'deployedFPMMAddresses') return [mockFPMMPools[0].poolAddress]
            if (functionName === 'token0') return mockFPMMPools[0].token0
            if (functionName === 'token1') return mockFPMMPools[0].token1
            if (functionName === 'getExchanges') return []
            return null
          }
        )
      })

      it('should throw if pool address is not found', async () => {
        await expect(
          service.getPoolDetails('0xUnknownPoolAddress0000000000000000000')
        ).rejects.toThrow('Pool not found')
      })

      it('should match pool address case-insensitively', async () => {
        // Set up full mocks for details
        mockPublicClient.readContract.mockImplementation(
          async ({ functionName }: any) => {
            if (functionName === 'deployedFPMMAddresses') return [mockFPMMPools[0].poolAddress]
            if (functionName === 'token0') return mockFPMMPools[0].token0
            if (functionName === 'token1') return mockFPMMPools[0].token1
            if (functionName === 'getExchanges') return []
            if (functionName === 'getReserves') return [1000n, 2000n, 100n]
            if (functionName === 'getRebalancingState') return [1000n, 1000n, 1000n, 1000n, false, 0, 0n]
            if (functionName === 'decimals0') return 1000000000000000000n
            if (functionName === 'decimals1') return 1000000000000000000n
            if (functionName === 'lpFee') return 0n
            if (functionName === 'protocolFee') return 0n
            if (functionName === 'rebalanceIncentive') return 0n
            if (functionName === 'rebalanceThresholdAbove') return 0n
            if (functionName === 'rebalanceThresholdBelow') return 0n
            if (functionName === 'liquidityStrategy') return false
            return null
          }
        )

        // Use uppercase version of the address
        const upperAddr = mockFPMMPools[0].poolAddress.toUpperCase()
        const details = await service.getPoolDetails(upperAddr)

        expect(details.poolAddr).toBe(mockFPMMPools[0].poolAddress)
      })

      it('should wrap RPC errors with descriptive message for FPMM', async () => {
        mockPublicClient.readContract.mockImplementation(
          async ({ functionName }: any) => {
            if (functionName === 'deployedFPMMAddresses') return [mockFPMMPools[0].poolAddress]
            if (functionName === 'token0') return mockFPMMPools[0].token0
            if (functionName === 'token1') return mockFPMMPools[0].token1
            if (functionName === 'getExchanges') return []
            // Detail calls fail
            if (functionName === 'getReserves') throw new Error('RPC timeout')
            return null
          }
        )

        await expect(
          service.getPoolDetails(mockFPMMPools[0].poolAddress)
        ).rejects.toThrow('Failed to fetch FPMM pool details')
      })

      it('should wrap RPC errors with descriptive message for Virtual', async () => {
        const vToken0 = '0x1111111111111111111111111111111111111111'
        const vToken1 = '0x2222222222222222222222222222222222222222'
        const vPoolAddr = '0x3333333333333333333333333333333333333333'

        mockPublicClient.readContract.mockImplementation(
          async ({ functionName }: any) => {
            if (functionName === 'deployedFPMMAddresses') return []
            if (functionName === 'getAllPools') return [vPoolAddr]
            if (functionName === 'getExchanges') return [{ exchangeId: '0xabc', assets: [vToken0, vToken1] }]
            if (functionName === 'tokens') return [vToken0, vToken1]
            // Detail calls fail
            if (functionName === 'getReserves') throw new Error('RPC timeout')
            return null
          }
        )

        await expect(
          service.getPoolDetails(vPoolAddr)
        ).rejects.toThrow('Failed to fetch Virtual pool details')
      })
    })

    describe('integration with getPools() cache', () => {
      beforeEach(() => {
        mockPublicClient.readContract.mockImplementation(
          async ({ functionName }: any) => {
            if (functionName === 'deployedFPMMAddresses') return [mockFPMMPools[0].poolAddress]
            if (functionName === 'token0') return mockFPMMPools[0].token0
            if (functionName === 'token1') return mockFPMMPools[0].token1
            if (functionName === 'getExchanges') return []
            if (functionName === 'getReserves') return [1000n, 2000n, 100n]
            if (functionName === 'getRebalancingState') return [1000n, 1000n, 1000n, 1000n, false, 0, 0n]
            if (functionName === 'decimals0') return 1000000000000000000n
            if (functionName === 'decimals1') return 1000000000000000000n
            if (functionName === 'lpFee') return 0n
            if (functionName === 'protocolFee') return 0n
            if (functionName === 'rebalanceIncentive') return 0n
            if (functionName === 'rebalanceThresholdAbove') return 0n
            if (functionName === 'rebalanceThresholdBelow') return 0n
            if (functionName === 'liquidityStrategy') return false
            return null
          }
        )
      })

      it('should use getPools() cache when available', async () => {
        // Pre-populate cache
        await service.getPools()
        const callsAfterGetPools = mockPublicClient.readContract.mock.calls.length

        // getPoolDetails should not re-call discovery functions
        await service.getPoolDetails(mockFPMMPools[0].poolAddress)

        // Should only have the 11 detail calls (9 data + 2 strategy checks), not repeated discovery calls
        const detailCalls = mockPublicClient.readContract.mock.calls
          .slice(callsAfterGetPools)
          .filter(([params]: any) =>
            ['getReserves', 'getRebalancingState', 'decimals0', 'decimals1', 'lpFee',
             'protocolFee', 'rebalanceIncentive', 'rebalanceThresholdAbove',
             'rebalanceThresholdBelow', 'liquidityStrategy'].includes(params.functionName)
          )

        expect(detailCalls.length).toBe(11)
      })
    })
  })

  describe('Pool type structure', () => {
    beforeEach(() => {
      mockPublicClient.readContract.mockImplementation(
        async ({ address, functionName }: any) => {
          if (functionName === 'deployedFPMMAddresses') {
            return [mockFPMMPools[0].poolAddress]
          }
          if (functionName === 'token0') {
            return mockFPMMPools[0].token0
          }
          if (functionName === 'token1') {
            return mockFPMMPools[0].token1
          }
          if (functionName === 'getExchanges') {
            return []
          }
          return null
        }
      )
    })

    it('should return pools with correct structure', async () => {
      const pools = await service.getPools()

      expect(pools.length).toBeGreaterThan(0)

      const pool = pools[0]
      expect(pool).toHaveProperty('factoryAddr')
      expect(pool).toHaveProperty('poolAddr')
      expect(pool).toHaveProperty('token0')
      expect(pool).toHaveProperty('token1')
    })

    it('should use poolAddress as unique identifier', async () => {
      const pools = await service.getPools()

      // Each pool should have unique poolAddress
      const poolAddresses = pools.map((p) => p.poolAddr)
      const uniqueAddresses = new Set(poolAddresses)
      expect(uniqueAddresses.size).toBe(poolAddresses.length)
    })
  })
})
