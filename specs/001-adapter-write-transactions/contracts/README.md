# API Contracts: Write Transaction Support

This directory contains the TypeScript API contracts (interfaces, types, and error classes) that define the write transaction feature.

## Files

### `provider-adapter.ts`

Defines the complete `ProviderAdapter` interface including:

- **Read operations** (existing): `readContract()`, `getChainId()`
- **Write operations** (new): `writeContract()`, `estimateGas()`, `getSignerAddress()`, `getTransactionCount()`
- **Configuration types**: `ContractCallOptions`, `ContractWriteOptions`
- **Response types**: `TransactionResponse`, `TransactionReceipt`, `TransactionLog`

**Key Principles**:

- Backward compatible with existing read-only usage
- Provider-agnostic (same interface for Ethers v5/v6 and Viem)
- Type-safe with explicit TypeScript types
- Comprehensive JSDoc documentation with examples

### `errors.ts`

Defines the error hierarchy for write transactions:

- **`TransactionError`**: Abstract base class for all transaction errors
- **`ValidationError`**: Pre-submission errors (no gas cost)
- **`ExecutionError`**: On-chain errors (gas consumed, includes transaction hash)
- **`NetworkError`**: RPC/network errors (retry-able)

**Key Principles**:

- Consistent error types across all providers
- Actionable error messages (explain problem + suggest fix)
- Clear distinction between pre-submission and on-chain failures
- Type guards for error handling

## Usage

These contracts define the API surface that will be implemented in:

- `src/adapters/implementations/ethersV5Adapter.ts`
- `src/adapters/implementations/ethersAdapter.ts`
- `src/adapters/implementations/viemAdapter.ts`
- `src/types/provider.ts`
- `src/types/transaction.ts`
- `src/types/errors.ts`

## Constitution Compliance

All API contracts follow the Mento SDK Constitution:

- ✅ **Type Safety**: No `any` types in public APIs, explicit TypeScript types
- ✅ **Provider Agnostic**: Same interface for all providers
- ✅ **Documentation**: Comprehensive JSDoc with examples
- ✅ **Error Handling**: Actionable error messages
- ✅ **Blockchain Best Practices**: BigInt for numeric values, checksummed addresses

## Next Steps

1. ✅ API contracts defined (this directory)
2. ⏭️ Implement types in `src/types/`
3. ⏭️ Implement adapters in `src/adapters/implementations/`
4. ⏭️ Update virtual proxies in `src/adapters/proxy/`
5. ⏭️ Add shared test suite in `tests/integration/shared/`
6. ⏭️ Update documentation in `README.md`
