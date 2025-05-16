# Specification: Swap Service Implementation for Mento SDK

## 1. Objective
Implement swap functionality in the Mento SDK that enables users to exchange tokens through the Mento Protocol. This implementation must be compatible with all supported provider libraries (Ethers v5, Ethers v6, and Viem) and follow the existing service-layer architecture pattern.

## 2. User Stories
- **As a DeFi developer**, I want to programmatically execute token swaps using the Mento protocol so that I can integrate Mento Protocol liquidity into my application.
- **As a trading application developer**, I want to estimate swap rates and execute trades so that I can provide accurate pricing information and execution to my users.
- **As a protocol integrator**, I want to use one consistent SDK interface for swaps regardless of which provider library I've chosen so that I can easily switch between providers without changing my code.
- **As a smart contract developer**, I want the SDK to handle gas estimation and provide detailed error information so that I can build more reliable applications.

## 3. Functional Requirements
- **FR1: Swap Service Creation**
  - Create a new `SwapService` class following the service-layer architecture pattern.
  - The service should handle all interactions with swap-related contracts, starting with the Broker contract.
  - Design the service to be extensible to other exchange mechanisms in the future.

- **FR2: Provider Adapter Enhancement**
  - Extend the `ProviderAdapter` interface to include write operation methods.
  - Implement write functionality in all concrete adapters (Ethers v5, Ethers v6, Viem).
  - Update all proxy adapters to handle the new write methods.

- **FR3: Swap Methods**
  - Implement `swapIn` method that allows exchanging collateral assets for stable tokens.
  - Implement `swapOut` method that allows exchanging stable tokens for collateral assets.
  - Implement helper methods for calculating expected exchange rates and slippage.

- **FR4: Rate Estimation**
  - Implement methods to estimate exchange rates before performing swaps.
  - Include functionality to calculate price impact for a given swap amount.

- **FR5: Gas Estimation and Management**
  - Add methods to estimate gas costs for swap operations.
  - Provide options for users to specify custom gas settings.

- **FR6: Transaction Handling**
  - Add functionality to track the status of submitted transactions.
  - Provide methods to wait for transaction confirmation.

## 4. Non-Functional Requirements
- **NFR1: Performance**
  - Swap operations should be optimized to minimize latency and gas costs.
  - Rate calculation methods should not require on-chain transactions when possible.

- **NFR2: Error Handling**
  - Provide clear, descriptive error messages for common failure scenarios like insufficient balance, excessive slippage, or trading limits reached.
  - Handle provider-specific errors and translate them into a consistent format.

- **NFR3: Code Quality**
  - Follow TypeScript best practices with strict typing.
  - Maintain the existing pattern of dependency injection and service-based architecture.
  - All public methods should include TypeDoc comments.

- **NFR4: Compatibility**
  - Ensure consistent behavior across all supported providers.
  - Handle provider-specific quirks internally without exposing them to users.

- **NFR5: Testing**
  - Achieve high test coverage for both unit and integration tests.
  - Include tests for edge cases like transaction failures and network errors.

- **NFR6: Adaptability**
  - Design the `SwapService` to be implementation-agnostic, focusing on the functionality rather than specific contract details.
  - Ensure the service can be extended to support other exchange mechanisms in the future without breaking changes.

## 5. Proposed Implementation Steps (for AI)

### 5.1. Extend Provider Adapters
1. **Update Provider Interface**:
   - Modify `src/types/provider.ts` to add a `writeContract` method to the `ProviderAdapter` interface.
   ```typescript
   export interface ProviderAdapter {
     readContract(options: ContractCallOptions): Promise<unknown>
     writeContract(options: ContractWriteOptions): Promise<TransactionResponse>
     getChainId(): Promise<number>
   }
   ```
   - Define the necessary types for write operations and transaction responses.
   ```typescript
   export interface ContractWriteOptions extends ContractCallOptions {
     value?: bigint | string
     gasLimit?: bigint | number | string
     gasPrice?: bigint | string
     maxFeePerGas?: bigint | string
     maxPriorityFeePerGas?: bigint | string
   }
   
   export interface TransactionResponse {
     hash: string
     wait: (confirmations?: number) => Promise<TransactionReceipt>
   }
   
   export interface TransactionReceipt {
     transactionHash: string
     blockNumber: number
     status: number | boolean
     [key: string]: any
   }
   ```

2. **Update Adapter Implementations**:
   - Implement `writeContract` in `EthersAdapter` (`src/adapters/implementations/ethersAdapter.ts`).
   - Implement `writeContract` in `EthersV5Adapter` (`src/adapters/implementations/ethersV5Adapter.ts`).
   - Implement `writeContract` in `ViemAdapter` (`src/adapters/implementations/viemAdapter.ts`).

3. **Update Adapter Proxies**:
   - Add `writeContract` method to `EthersAdapterProxy` (`src/adapters/proxies/ethersAdapterProxy.ts`).
   - Add `writeContract` method to `EthersV5AdapterProxy` (`src/adapters/proxies/ethersV5AdapterProxy.ts`).
   - Add `writeContract` method to `ViemAdapterProxy` (`src/adapters/proxies/viemAdapterProxy.ts`).

### 5.2. Update ABIs
1. **Update Broker ABI**:
   - Enhance `src/abis/broker.ts` with the complete ABI for the Broker contract, including swap methods.
   ```typescript
   export const BROKER_ABI = [
     // Existing methods
     'function tradingLimitsConfig(bytes32) view returns (uint32 timestep0, uint32 timestep1, int48 limit0, int48 limit1, int48 limitGlobal, uint8 flags)',
     'function tradingLimitsState(bytes32) view returns (uint32 lastUpdated0, uint32 lastUpdated1, int48 netflow0, int48 netflow1, int48 netflowGlobal)',
     // Add swap methods
     'function swapIn(address tokenIn, address tokenOut, uint256 amountIn, uint256 minAmountOut) payable returns (uint256)',
     'function swapOut(address tokenIn, address tokenOut, uint256 amountOut, uint256 maxAmountIn) payable returns (uint256)',
     // Add rate methods
     'function getAmountOut(address tokenIn, address tokenOut, uint256 amountIn) view returns (uint256)',
     'function getAmountIn(address tokenIn, address tokenOut, uint256 amountOut) view returns (uint256)',
   ]
   ```

### 5.3. Create Swap Service
1. **Create Service File**:
   - Create a new service file at `src/services/swapService.ts` with the following structure:
   ```typescript
   import { BROKER_ABI } from '../abis'
   import { BROKER, getContractAddress } from '../constants'
   import { ProviderAdapter, TransactionResponse } from '../types'
   import { retryOperation } from '../utils'
   
   export class SwapService {
     constructor(private provider: ProviderAdapter) {}
     
     // Methods for swapping tokens
     async swapIn(tokenIn: string, tokenOut: string, amountIn: string, minAmountOut: string): Promise<TransactionResponse> {
       // Implementation
     }
     
     async swapOut(tokenIn: string, tokenOut: string, amountOut: string, maxAmountIn: string): Promise<TransactionResponse> {
       // Implementation
     }
     
     // Methods for estimating rates
     async getAmountOut(tokenIn: string, tokenOut: string, amountIn: string): Promise<string> {
       // Implementation
     }
     
     async getAmountIn(tokenIn: string, tokenOut: string, amountOut: string): Promise<string> {
       // Implementation
     }
     
     // Helper methods
     async estimateGas(methodName: string, args: unknown[]): Promise<string> {
       // Implementation
     }
   }
   ```

2. **Export Service**:
   - Update `src/services/index.ts` to export the new service:
   ```typescript
   export * from './swapService'
   ```

### 5.4. Update Main SDK Class
1. **Update Mento Class**:
   - Modify `src/index.ts` to initialize and expose the SwapService:
   ```typescript
   export class Mento {
     private provider: ProviderAdapter
     private stableTokenService: StableTokenService
     private collateralAssetService: CollateralAssetService
     private swapService: SwapService  // Add this line
     
     private constructor(
       provider: ProviderAdapter,
       stableTokenService: StableTokenService,
       collateralAssetService: CollateralAssetService,
       swapService: SwapService  // Add this line
     ) {
       this.provider = provider
       this.stableTokenService = stableTokenService
       this.collateralAssetService = collateralAssetService
       this.swapService = swapService  // Add this line
     }
     
     public static async create(config: MentoConfig): Promise<Mento> {
       // Existing provider initialization code
       
       const stableTokenService = new StableTokenService(provider)
       const collateralAssetService = new CollateralAssetService(provider)
       const swapService = new SwapService(provider)  // Add this line
       
       return new Mento(
         provider, 
         stableTokenService, 
         collateralAssetService,
         swapService  // Add this line
       )
     }
     
     // Expose swap methods
     public async swapIn(tokenIn: string, tokenOut: string, amountIn: string, minAmountOut: string): Promise<TransactionResponse> {
       return this.swapService.swapIn(tokenIn, tokenOut, amountIn, minAmountOut)
     }
     
     public async swapOut(tokenIn: string, tokenOut: string, amountOut: string, maxAmountIn: string): Promise<TransactionResponse> {
       return this.swapService.swapOut(tokenIn, tokenOut, amountOut, maxAmountIn)
     }
     
     public async getAmountOut(tokenIn: string, tokenOut: string, amountIn: string): Promise<string> {
       return this.swapService.getAmountOut(tokenIn, tokenOut, amountIn)
     }
     
     public async getAmountIn(tokenIn: string, tokenOut: string, amountOut: string): Promise<string> {
       return this.swapService.getAmountIn(tokenIn, tokenOut, amountOut)
     }
   }
   ```

### 5.5. Create Tests
1. **Unit Tests**:
   - Create unit tests for the SwapService in `tests/unit/swapService.test.ts`.
   - Test rate calculation methods with mock provider responses.

2. **Integration Tests**:
   - Create shared test modules in `tests/integration/shared/swapTests.ts`.
   - Implement integration tests for each provider in:
     - `tests/integration/adapters/ethersAdapter.test.ts`
     - `tests/integration/adapters/ethersV5Adapter.test.ts`
     - `tests/integration/adapters/viemAdapter.test.ts`

### 5.6. Update Documentation
1. **Add TypeDoc comments** to all new public methods.
2. **Update README.md** with examples of using the new swap methods.
3. **Create usage examples** for all supported providers.

## 6. Acceptance Criteria
- [ ] The `ProviderAdapter` interface has been extended with write contract functionality.
- [ ] All provider adapters (Ethers v5, Ethers v6, Viem) have working implementations of the write methods.
- [ ] A new `SwapService` class has been created following the service-layer architecture pattern.
- [ ] The service includes methods for swapping tokens (`swapIn`, `swapOut`) and querying exchange rates.
- [ ] Swap methods are exposed through the main `Mento` class.
- [ ] Gas estimation is implemented for swap transactions across all providers.
- [ ] Users are able to specify custom gas settings.
- [ ] Unit tests cover all new methods with high test coverage.
- [ ] Integration tests verify that swap functionality works with all supported providers.
- [ ] All public methods have TypeDoc comments explaining their usage.
- [ ] The README includes examples of using the swap functionality with different providers.
- [ ] Error handling is robust and provides clear error messages for common failure scenarios.
- [ ] The swap operations are fully compatible across all supported provider adapters.
- [ ] The design is extensible to support other exchange mechanisms in the future without breaking changes.