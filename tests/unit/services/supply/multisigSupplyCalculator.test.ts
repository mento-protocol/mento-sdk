import { MultisigSupplyCalculator } from '../../../../src/services/supply/multisigSupplyCalculator'
import { ProviderAdapter } from '../../../../src/types'
import { ERC20_ABI } from '../../../../src/abis'

describe('MultisigSupplyCalculator', () => {
  let mockProvider: jest.Mocked<ProviderAdapter>
  let calculator: MultisigSupplyCalculator

  beforeEach(() => {
    mockProvider = {
      readContract: jest.fn(),
      getChainId: jest.fn(),
      multicall: jest.fn(),
    } as unknown as jest.Mocked<ProviderAdapter>
  })

  describe('single address', () => {
    it('should return balance for a single address', async () => {
      const addresses = ['0xAddress1']
      calculator = new MultisigSupplyCalculator(mockProvider, addresses)

      mockProvider.readContract.mockResolvedValueOnce(BigInt(1000))

      const result = await calculator.getAmount('0xTokenAddress')

      expect(result).toBe(BigInt(1000))
      expect(mockProvider.readContract).toHaveBeenCalledWith({
        address: '0xTokenAddress',
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: ['0xAddress1'],
      })
      expect(mockProvider.readContract).toHaveBeenCalledTimes(1)
    })
  })

  describe('multiple addresses', () => {
    it('should sum balances from multiple addresses', async () => {
      const addresses = ['0xAddress1', '0xAddress2', '0xAddress3']
      calculator = new MultisigSupplyCalculator(mockProvider, addresses)

      mockProvider.readContract
        .mockResolvedValueOnce(BigInt(1000))
        .mockResolvedValueOnce(BigInt(2000))
        .mockResolvedValueOnce(BigInt(3000))

      const result = await calculator.getAmount('0xTokenAddress')

      expect(result).toBe(BigInt(6000))
      expect(mockProvider.readContract).toHaveBeenCalledTimes(3)

      addresses.forEach((address, index) => {
        expect(mockProvider.readContract).toHaveBeenNthCalledWith(index + 1, {
          address: '0xTokenAddress',
          abi: ERC20_ABI,
          functionName: 'balanceOf',
          args: [address],
        })
      })
    })

    it('should make parallel calls for multiple addresses', async () => {
      const addresses = ['0xAddress1', '0xAddress2']
      calculator = new MultisigSupplyCalculator(mockProvider, addresses)

      let resolveFirst: (value: bigint) => void
      let resolveSecond: (value: bigint) => void

      const firstPromise = new Promise<bigint>((resolve) => {
        resolveFirst = resolve
      })
      const secondPromise = new Promise<bigint>((resolve) => {
        resolveSecond = resolve
      })

      mockProvider.readContract
        .mockReturnValueOnce(firstPromise)
        .mockReturnValueOnce(secondPromise)

      const resultPromise = calculator.getAmount('0xTokenAddress')

      expect(mockProvider.readContract).toHaveBeenCalledTimes(2)

      resolveSecond!(BigInt(2000))
      resolveFirst!(BigInt(1000))

      const result = await resultPromise
      expect(result).toBe(BigInt(3000))
    })
  })

  describe('error handling', () => {
    it('should treat failed balance queries as zero', async () => {
      const addresses = ['0xAddress1', '0xAddress2', '0xAddress3']
      calculator = new MultisigSupplyCalculator(mockProvider, addresses)

      mockProvider.readContract
        .mockResolvedValueOnce(BigInt(1000))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(BigInt(3000))

      const result = await calculator.getAmount('0xTokenAddress')

      expect(result).toBe(BigInt(4000))
      expect(mockProvider.readContract).toHaveBeenCalledTimes(3)
    })

    it('should return zero if all queries fail', async () => {
      const addresses = ['0xAddress1', '0xAddress2']
      calculator = new MultisigSupplyCalculator(mockProvider, addresses)

      mockProvider.readContract
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Contract error'))

      const result = await calculator.getAmount('0xTokenAddress')

      expect(result).toBe(BigInt(0))
      expect(mockProvider.readContract).toHaveBeenCalledTimes(2)
    })

    it('should handle partial failures gracefully', async () => {
      const addresses = ['0xAddress1', '0xAddress2', '0xAddress3', '0xAddress4']
      calculator = new MultisigSupplyCalculator(mockProvider, addresses)

      mockProvider.readContract
        .mockResolvedValueOnce(BigInt(1000))
        .mockRejectedValueOnce(new Error('Contract reverted'))
        .mockRejectedValueOnce(new Error('Network timeout'))
        .mockResolvedValueOnce(BigInt(4000))

      const result = await calculator.getAmount('0xTokenAddress')

      expect(result).toBe(BigInt(5000))
    })
  })

  describe('edge cases', () => {
    it('should return zero for empty address array', async () => {
      calculator = new MultisigSupplyCalculator(mockProvider, [])

      const result = await calculator.getAmount('0xTokenAddress')

      expect(result).toBe(BigInt(0))
      expect(mockProvider.readContract).not.toHaveBeenCalled()
    })

    it('should handle very large balances', async () => {
      const addresses = ['0xAddress1', '0xAddress2']
      calculator = new MultisigSupplyCalculator(mockProvider, addresses)

      const largeBalance = BigInt('1000000000000000000000000') // 1M tokens with 18 decimals
      mockProvider.readContract
        .mockResolvedValueOnce(largeBalance)
        .mockResolvedValueOnce(largeBalance)

      const result = await calculator.getAmount('0xTokenAddress')

      expect(result).toBe(largeBalance * BigInt(2))
    })
  })
})
