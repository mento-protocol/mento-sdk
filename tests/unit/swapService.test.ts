import { SwapService } from '../../src/services'
import { ProviderAdapter } from '../../src/types'
import { BROKER } from '../../src/constants'

// Import necessary constants and functions
import { getContractAddress } from '../../src/constants/addresses'
import { ChainId } from '../../src/constants/chainId'

// Mock ProviderAdapter
const mockProvider: jest.Mocked<ProviderAdapter> = {
  readContract: jest.fn(),
  writeContract: jest.fn(),
  getChainId: jest.fn(),
}

describe('SwapService', () => {
  let swapService: SwapService
  // Get the expected broker address for Celo mainnet
  const CHAIN_ID = ChainId.CELO // 42220
  const expectedBrokerAddress = getContractAddress(CHAIN_ID, BROKER)
  
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock getChainId to return the Celo mainnet chain ID
    mockProvider.getChainId.mockResolvedValue(CHAIN_ID)
    
    swapService = new SwapService(mockProvider)
  })
  
  describe('getAmountOut', () => {
    it('should call the broker contract with the correct parameters', async () => {
      // Mock the readContract response
      mockProvider.readContract.mockResolvedValue(BigInt('1000000000000000000'))
      
      const tokenIn = '0x1234567890123456789012345678901234567890'
      const tokenOut = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd'
      const amountIn = '1000000000000000000' // 1 token with 18 decimals
      
      const result = await swapService.getAmountOut(tokenIn, tokenOut, amountIn)
      
      // Check that readContract was called with the correct parameters
      expect(mockProvider.readContract).toHaveBeenCalledWith({
        address: expect.any(String), // This would be the broker address
        abi: expect.any(Array),
        functionName: 'getAmountOut',
        args: [tokenIn, tokenOut, amountIn]
      })
      
      // Check that the broker address was correctly resolved
      expect(mockProvider.readContract.mock.calls[0][0].address).toBe(expectedBrokerAddress)
      
      // Check that the result is correctly formatted
      expect(result).toBe('1000000000000000000')
    })
  })
  
  describe('getAmountIn', () => {
    it('should call the broker contract with the correct parameters', async () => {
      // Mock the readContract response
      mockProvider.readContract.mockResolvedValue(BigInt('2000000000000000000'))
      
      const tokenIn = '0x1234567890123456789012345678901234567890'
      const tokenOut = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd'
      const amountOut = '1000000000000000000' // 1 token with 18 decimals
      
      const result = await swapService.getAmountIn(tokenIn, tokenOut, amountOut)
      
      // Check that readContract was called with the correct parameters
      expect(mockProvider.readContract).toHaveBeenCalledWith({
        address: expect.any(String), // This would be the broker address
        abi: expect.any(Array),
        functionName: 'getAmountIn',
        args: [tokenIn, tokenOut, amountOut]
      })
      
      // Check that the result is correctly formatted
      expect(result).toBe('2000000000000000000')
    })
  })
  
  describe('swapIn', () => {
    it('should call the writeContract method with the correct parameters', async () => {
      // Mock the writeContract response
      const mockTxResponse = {
        hash: '0x1234567890abcdef',
        wait: jest.fn().mockResolvedValue({
          transactionHash: '0x1234567890abcdef',
          blockNumber: 1000,
          status: 1
        })
      }
      mockProvider.writeContract.mockResolvedValue(mockTxResponse)
      
      const tokenIn = '0x1234567890123456789012345678901234567890'
      const tokenOut = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd'
      const amountIn = '1000000000000000000' // 1 token with 18 decimals
      const minAmountOut = '900000000000000000' // 0.9 token with 18 decimals (10% slippage)
      const options = { gasLimit: '300000' }
      
      const result = await swapService.swapIn(tokenIn, tokenOut, amountIn, minAmountOut, options)
      
      // Check that writeContract was called with the correct parameters
      expect(mockProvider.writeContract).toHaveBeenCalledWith({
        address: expect.any(String), // This would be the broker address
        abi: expect.any(Array),
        functionName: 'swapIn',
        args: [tokenIn, tokenOut, amountIn, minAmountOut],
        gasLimit: '300000'
      })
      
      // Check that the result is the mocked tx response
      expect(result).toBe(mockTxResponse)
    })
  })
  
  describe('swapOut', () => {
    it('should call the writeContract method with the correct parameters', async () => {
      // Mock the writeContract response
      const mockTxResponse = {
        hash: '0xabcdef1234567890',
        wait: jest.fn().mockResolvedValue({
          transactionHash: '0xabcdef1234567890',
          blockNumber: 1001,
          status: 1
        })
      }
      mockProvider.writeContract.mockResolvedValue(mockTxResponse)
      
      const tokenIn = '0x1234567890123456789012345678901234567890'
      const tokenOut = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd'
      const amountOut = '1000000000000000000' // 1 token with 18 decimals
      const maxAmountIn = '1100000000000000000' // 1.1 token with 18 decimals (10% slippage)
      const options = { gasPrice: '5000000000' }
      
      const result = await swapService.swapOut(tokenIn, tokenOut, amountOut, maxAmountIn, options)
      
      // Check that writeContract was called with the correct parameters
      expect(mockProvider.writeContract).toHaveBeenCalledWith({
        address: expect.any(String), // This would be the broker address
        abi: expect.any(Array),
        functionName: 'swapOut',
        args: [tokenIn, tokenOut, amountOut, maxAmountIn],
        gasPrice: '5000000000'
      })
      
      // Check that the result is the mocked tx response
      expect(result).toBe(mockTxResponse)
    })
  })
  
  describe('estimateGas', () => {
    it('should return a gas estimate for swapIn', async () => {
      const result = await swapService.estimateGas(
        'swapIn',
        ['0x1234', '0xabcd', '1000', '900']
      )
      
      // For now, the implementation just returns a default value
      expect(result).toBe('300000')
    })
    
    it('should return a gas estimate for swapOut', async () => {
      const result = await swapService.estimateGas(
        'swapOut',
        ['0x1234', '0xabcd', '1000', '1100']
      )
      
      // For now, the implementation just returns a default value
      expect(result).toBe('350000')
    })
  })
})