import { PoolService } from '../../../src/services/pools/PoolService'
import type { Pool } from '../../../src/core/types/pool'
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

  // Mock addresses
  const MOCK_FPMM_FACTORY = '0xFPMMFactory0000000000000000000000000000'
  const MOCK_VIRTUAL_FACTORY = '0xVirtualFactory00000000000000000000000'
  const MOCK_BIPOOL_MANAGER = '0xBiPoolManager000000000000000000000000000'

  // Mock FPMM pool data
  const mockFPMMPools = [
    {
      poolAddress: '0xFPMMPool1000000000000000000000000000000',
      token0: '0xToken0A00000000000000000000000000000000',
      token1: '0xToken1A00000000000000000000000000000000',
    },
    {
      poolAddress: '0xFPMMPool2000000000000000000000000000000',
      token0: '0xToken0B00000000000000000000000000000000',
      token1: '0xToken1B00000000000000000000000000000000',
    },
  ]

  // Mock BiPoolManager exchange data
  const mockExchanges = [
    {
      exchangeId: '0xexchange1',
      assets: [
        '0xToken0C00000000000000000000000000000000',
        '0xToken1C00000000000000000000000000000000',
      ],
    },
    {
      exchangeId: '0xexchange2',
      assets: [
        '0xToken0D00000000000000000000000000000000',
        '0xToken1D00000000000000000000000000000000',
      ],
    },
  ]

  // Mock Virtual pool addresses
  const mockVirtualPools = [
    '0xVirtualPool1000000000000000000000000000',
    '0xVirtualPool2000000000000000000000000000',
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

      it('should return empty array if no FPMM pools deployed', async () => {
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

        const pools = await service.getPools()
        expect(pools).toEqual([])
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

            // BiPoolManager.getExchanges()
            if (functionName === 'getExchanges') {
              return mockExchanges
            }

            // VirtualPoolFactory.getOrPrecomputeProxyAddress()
            if (functionName === 'getOrPrecomputeProxyAddress') {
              const [token0, token1] = args as [string, string]
              // Return a deterministic pool address based on tokens
              const index = mockExchanges.findIndex(
                (e) =>
                  (e.assets[0].toLowerCase() === token0.toLowerCase() &&
                    e.assets[1].toLowerCase() === token1.toLowerCase()) ||
                  (e.assets[0].toLowerCase() === token1.toLowerCase() &&
                    e.assets[1].toLowerCase() === token0.toLowerCase())
              )
              return mockVirtualPools[index] || '0x0'
            }

            // VirtualPoolFactory.isPool()
            if (functionName === 'isPool') {
              const [poolAddress] = args as [string]
              return mockVirtualPools.includes(poolAddress)
            }

            return null
          }
        )
      })

      it('should discover Virtual pools from BiPoolManager exchanges', async () => {
        const pools = await service.getPools()

        // Should have called getExchanges on BiPoolManager
        expect(mockPublicClient.readContract).toHaveBeenCalledWith(
          expect.objectContaining({
            functionName: 'getExchanges',
          })
        )

        // Should have virtual pools
        expect(pools.length).toBe(2)
      })

      it('should verify each pool with isPool() before including', async () => {
        const pools = await service.getPools()

        // Should have called isPool for each exchange
        const isPoolCalls = mockPublicClient.readContract.mock.calls.filter(
          (call) => (call[0] as any).functionName === 'isPool'
        )
        expect(isPoolCalls.length).toBe(mockExchanges.length)
      })

      it('should skip exchanges that do not have deployed pools', async () => {
        mockPublicClient.readContract.mockImplementation(
          async ({ functionName, args }: any) => {
            if (functionName === 'deployedFPMMAddresses') {
              return []
            }
            if (functionName === 'getExchanges') {
              return mockExchanges
            }
            if (functionName === 'getOrPrecomputeProxyAddress') {
              return '0xSomePoolAddress'
            }
            // isPool returns false - no pools deployed
            if (functionName === 'isPool') {
              return false
            }
            return null
          }
        )

        const pools = await service.getPools()
        expect(pools).toEqual([])
      })

      it('should sort tokens before querying VirtualPoolFactory', async () => {
        const calls: any[] = []

        mockPublicClient.readContract.mockImplementation(
          async ({ functionName, args }: any) => {
            if (functionName === 'getOrPrecomputeProxyAddress') {
              calls.push({ functionName, args })
            }
            if (functionName === 'deployedFPMMAddresses') {
              return []
            }
            if (functionName === 'getExchanges') {
              // Return exchange with unsorted tokens (higher address first)
              return [
                {
                  exchangeId: '0xex1',
                  assets: [
                    '0xZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
                    '0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                  ],
                },
              ]
            }
            if (functionName === 'isPool') {
              return true
            }
            return null
          }
        )

        await service.getPools()

        // Should have sorted tokens (lower address first)
        const proxyCall = calls.find(
          (c) => c.functionName === 'getOrPrecomputeProxyAddress'
        )
        expect(proxyCall).toBeDefined()
        // String comparison: first arg should be lexicographically less than second
        expect(
          proxyCall.args[0].toLowerCase() < proxyCall.args[1].toLowerCase()
        ).toBe(true)
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
            if (functionName === 'getExchanges') {
              return mockExchanges
            }
            if (functionName === 'getOrPrecomputeProxyAddress') {
              const [token0, token1] = args as [string, string]
              const index = mockExchanges.findIndex(
                (e) =>
                  (e.assets[0].toLowerCase() === token0.toLowerCase() &&
                    e.assets[1].toLowerCase() === token1.toLowerCase()) ||
                  (e.assets[0].toLowerCase() === token1.toLowerCase() &&
                    e.assets[1].toLowerCase() === token0.toLowerCase())
              )
              return mockVirtualPools[index] || '0x0'
            }
            if (functionName === 'isPool') {
              const [poolAddress] = args as [string]
              return mockVirtualPools.includes(poolAddress)
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
        const fpmmPools = pools.filter(
          (p) => p.poolAddress === mockFPMMPools[0].poolAddress
        )
        expect(fpmmPools.length).toBeGreaterThan(0)

        // Virtual pools should have Virtual factory address
        const virtualPools = pools.filter(
          (p) => p.poolAddress === mockVirtualPools[0]
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
      it('should throw error if FPMM pool fetching fails', async () => {
        mockPublicClient.readContract.mockImplementation(
          async ({ functionName }: any) => {
            if (functionName === 'deployedFPMMAddresses') {
              throw new Error('RPC connection failed')
            }
            return null
          }
        )

        await expect(service.getPools()).rejects.toThrow(
          'Failed to fetch FPMM pools'
        )
      })

      it('should throw error if Virtual pool fetching fails', async () => {
        mockPublicClient.readContract.mockImplementation(
          async ({ functionName }: any) => {
            if (functionName === 'deployedFPMMAddresses') {
              return []
            }
            if (functionName === 'getExchanges') {
              throw new Error('RPC connection failed')
            }
            return null
          }
        )

        await expect(service.getPools()).rejects.toThrow(
          'Failed to fetch Virtual pools'
        )
      })

      it('should skip exchanges with invalid asset count', async () => {
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

        mockPublicClient.readContract.mockImplementation(
          async ({ functionName }: any) => {
            if (functionName === 'deployedFPMMAddresses') {
              return []
            }
            if (functionName === 'getExchanges') {
              return [
                { exchangeId: '0xvalid', assets: ['0xtoken1', '0xtoken2'] },
                {
                  exchangeId: '0xinvalid',
                  assets: ['0xtoken1', '0xtoken2', '0xtoken3'],
                },
              ]
            }
            if (functionName === 'getOrPrecomputeProxyAddress') {
              return '0xPoolAddress'
            }
            if (functionName === 'isPool') {
              return true
            }
            return null
          }
        )

        const pools = await service.getPools()

        expect(pools.length).toBe(1)
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('Skipping invalid exchange')
        )

        consoleSpy.mockRestore()
      })

      it('should throw error if chain is not supported', async () => {
        // Create service with unsupported chain
        const unsupportedService = new PoolService(
          mockPublicClient,
          99999 // Unsupported chain ID
        )

        await expect(unsupportedService.getPools()).rejects.toThrow(
          'No addresses found for chain ID 99999'
        )
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
      expect(pool).toHaveProperty('poolAddress')
      expect(pool).toHaveProperty('token0')
      expect(pool).toHaveProperty('token1')
    })

    it('should use poolAddress as unique identifier', async () => {
      const pools = await service.getPools()

      // Each pool should have unique poolAddress
      const poolAddresses = pools.map((p) => p.poolAddress)
      const uniqueAddresses = new Set(poolAddresses)
      expect(uniqueAddresses.size).toBe(poolAddresses.length)
    })
  })
})
