# Test Migration Strategy: Exchange & Pool Discovery

**Feature**: 002-exchange-pool-discovery
**Created**: 2025-11-04

## Overview

This work in progress document outlines the strategy for migrating v1 tests to v3 to ensure the exchange and pool discovery feature maintains backward compatibility and correctness.

## V1 Test Analysis

### Existing V1 Tests

**[routeFetching.test.ts](../../../src/routeFetching.test.ts)** - 272 lines
- Focus: Route finding logic with real cached data
- Test Count: ~15 test cases
- Key Coverage:
  - Token discovery and address verification
  - Optimized route selection (e.g., axlUSDC → USDC through cUSD not cREAL)
  - Route structure validation (pair ID format, path connectivity)
  - Multi-hop route display functionality
  - Direct vs two-hop route distinction

**[mento.test.ts](../../../src/mento.test.ts)** - 1129 lines
- Focus: Full SDK integration with mocked contracts
- Test Count: ~30 test cases
- Key Coverage:
  - SDK initialization (`create`, `createWithParams`)
  - Exchange discovery (`getExchangeById`)
  - Pair generation (`getTradablePairsWithPath`)
  - Token listing (`getTokens`, `getTokensAsync`)
  - Quote methods (`getAmountIn`, `getAmountOut`) - NOT in scope for this feature
  - Swap methods (`swapIn`, `swapOut`) - NOT in scope for this feature
  - Allowance management - NOT in scope for this feature

### Test Classification

| Category | V1 Tests | Porting Strategy |
|----------|----------|------------------|
| **Exchange Discovery** | `getExchangeById` tests | ✅ Port to v3 |
| **Direct Pair Discovery** | Direct pair validation in `getTradablePairsWithPath` | ✅ Port to v3 |
| **Multi-Hop Route Finding** | Route optimization, connectivity tests | ✅ Port to v3 |
| **Route Structure** | Pair ID format, path validation | ✅ Port to v3 |
| **Token Discovery** | `getTokens`, `getTokensAsync` | ✅ Port to v3 |
| **Route Display** | `buildRouteDisplay` tests | ⚠️ Utility function - port if needed |
| **Swap Execution** | `swapIn`, `swapOut`, quotes | ❌ Out of scope for this feature |

## Recommended Test Migration Strategy

### Option 1: Fixture-Based Behavioral Validation (RECOMMENDED)

**Key Insight**: Once V1 code is deleted, you can't run tests against it. Instead, **capture V1 behavior as test fixtures BEFORE migration**, then validate V3 against those fixtures.

#### Implementation

```
tests/
├── fixtures/                    # Captured from V1 BEFORE deletion (committed to git)
│   ├── v1-exchanges-mainnet.json
│   ├── v1-pairs-mainnet.json
│   ├── v1-tokens-mainnet.json
│   ├── v1-route-axlUSDC-USDC.json
│   └── v1-route-USDC-USDT.json
├── integration/
│   ├── v1-compatibility.test.ts             # Tests V3 against V1 fixtures (NEW)
│   ├── adapters/
│   │   ├── ethersExchangeDiscovery.test.ts  # Ethers v6 integration (NEW)
│   │   └── viemExchangeDiscovery.test.ts    # Viem integration (NEW)
└── unit/
    ├── services/
    │   └── ExchangeService.test.ts          # V3 service unit tests (NEW)
    └── utils/
        └── routeUtils.test.ts               # V3 route utils tests (NEW)
```

#### Step 1: Capture V1 Fixtures (BEFORE deleting V1 code)

Create a script to capture V1 outputs as JSON fixtures:

**scripts/generate-v1-test-fixtures.ts**:
```typescript
/**
 * Captures V1 behavior as test fixtures BEFORE migrating to V3
 * Run this on main branch: npm run generate-v1-fixtures
 */
import { Mento } from '../src/mento'  // V1 SDK
import { JsonRpcProvider } from 'ethers'
import fs from 'fs'
import path from 'path'

const FIXTURES_DIR = path.join(__dirname, '../tests/fixtures')

async function captureV1Fixtures() {
  console.log('🔄 Connecting to Celo mainnet...')
  const provider = new JsonRpcProvider('https://forno.celo.org')
  const mento = await Mento.create(provider)

  console.log('📦 Capturing V1 exchanges...')
  const exchanges = await mento.getExchanges()
  fs.writeFileSync(
    path.join(FIXTURES_DIR, 'v1-exchanges-mainnet.json'),
    JSON.stringify(exchanges, null, 2)
  )
  console.log(`✅ Captured ${exchanges.length} exchanges`)

  console.log('📦 Capturing V1 tradable pairs...')
  const pairs = await mento.getTradablePairsWithPath({ cached: true })
  fs.writeFileSync(
    path.join(FIXTURES_DIR, 'v1-pairs-mainnet.json'),
    JSON.stringify(pairs, null, 2)
  )
  console.log(`✅ Captured ${pairs.length} pairs`)

  console.log('📦 Capturing V1 tokens...')
  const tokens = await mento.getTokensAsync({ cached: true })
  fs.writeFileSync(
    path.join(FIXTURES_DIR, 'v1-tokens-mainnet.json'),
    JSON.stringify(tokens, null, 2)
  )
  console.log(`✅ Captured ${tokens.length} tokens`)

  console.log('📦 Capturing specific V1 routes...')
  const TOKENS = {
    axlUSDC: '0xEB466342C4d449BC9f53A865D5Cb90586f405215',
    USDC: '0xcebA9300f2b948710d2653dD7B07f33A8B32118C',
    USDT: '0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e',
  }

  const axlUSDCtoUSDC = await mento.findPairForTokens(TOKENS.axlUSDC, TOKENS.USDC)
  fs.writeFileSync(
    path.join(FIXTURES_DIR, 'v1-route-axlUSDC-USDC.json'),
    JSON.stringify(axlUSDCtoUSDC, null, 2)
  )

  const usdcToUsdt = await mento.findPairForTokens(TOKENS.USDC, TOKENS.USDT)
  fs.writeFileSync(
    path.join(FIXTURES_DIR, 'v1-route-USDC-USDT.json'),
    JSON.stringify(usdcToUsdt, null, 2)
  )
  console.log('✅ Captured route fixtures')

  console.log('\n✨ All V1 fixtures captured successfully!')
  console.log('📌 Commit these fixtures to git BEFORE deleting V1 code')
}

captureV1Fixtures().catch(console.error)
```

**Add to package.json**:
```json
{
  "scripts": {
    "generate-v1-fixtures": "ts-node scripts/generate-v1-test-fixtures.ts"
  }
}
```

#### Step 2: Test V3 Against V1 Fixtures (AFTER V1 deletion)

**tests/integration/v1-compatibility.test.ts**:
```typescript
/**
 * V1 Behavioral Compatibility Tests
 *
 * These tests validate that V3 maintains behavioral compatibility with V1
 * by comparing V3 outputs against captured V1 fixtures.
 */
import { Mento } from '../../src'  // V3 only (V1 code deleted)
import { createPublicClient, http } from 'viem'
import { celo } from 'viem/chains'
import v1Exchanges from '../fixtures/v1-exchanges-mainnet.json'
import v1Pairs from '../fixtures/v1-pairs-mainnet.json'
import v1Tokens from '../fixtures/v1-tokens-mainnet.json'
import v1RouteAxlUSDCtoUSDC from '../fixtures/v1-route-axlUSDC-USDC.json'
import v1RouteUSDCtoUSDT from '../fixtures/v1-route-USDC-USDT.json'

describe('V1 Behavioral Compatibility', () => {
  let mento: Mento

  beforeAll(async () => {
    const publicClient = createPublicClient({
      chain: celo,
      transport: http('https://forno.celo.org')
    })
    mento = await Mento.create({ provider: publicClient })
  })

  describe('Exchange Discovery', () => {
    it('should return same exchanges as V1', async () => {
      const v3Exchanges = await mento.exchanges.getExchanges()

      // All V1 exchanges should still exist in V3
      v1Exchanges.forEach((v1Exchange: any) => {
        const v3Exchange = v3Exchanges.find(e => e.id === v1Exchange.id)

        expect(v3Exchange).toBeDefined()
        expect(v3Exchange?.providerAddr).toBe(v1Exchange.providerAddr)
        expect(v3Exchange?.assets).toEqual(v1Exchange.assets)
      })

      // V3 may have MORE exchanges than V1 (new exchanges added)
      expect(v3Exchanges.length).toBeGreaterThanOrEqual(v1Exchanges.length)
    })

    it('should find exchange by ID like V1', async () => {
      const v1Exchange = v1Exchanges[0]
      const v3Exchange = await mento.exchanges.getExchangeById(v1Exchange.id)

      expect(v3Exchange.id).toBe(v1Exchange.id)
      expect(v3Exchange.providerAddr).toBe(v1Exchange.providerAddr)
      expect(v3Exchange.assets).toEqual(v1Exchange.assets)
    })
  })

  describe('Route Optimization', () => {
    it('should route axlUSDC → USDC through cUSD like V1', async () => {
      const v3Route = await mento.exchanges.findPairForTokens(
        '0xEB466342C4d449BC9f53A865D5Cb90586f405215',  // axlUSDC
        '0xcebA9300f2b948710d2653dD7B07f33A8B32118C'   // USDC
      )

      // Extract intermediate token from V1 route
      const v1IntermediateToken = extractIntermediateToken(v1RouteAxlUSDCtoUSDC)
      const v3IntermediateToken = extractIntermediateToken(v3Route)

      expect(v3IntermediateToken).toBe(v1IntermediateToken)
      expect(v3IntermediateToken).toBe('0x765DE816845861e75A25fCA122bb6898B8B1282a') // cUSD not cREAL
    })

    it('should route USDC → USDT through cUSD like V1', async () => {
      const v3Route = await mento.exchanges.findPairForTokens(
        '0xcebA9300f2b948710d2653dD7B07f33A8B32118C',  // USDC
        '0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e'   // USDT
      )

      const v1IntermediateToken = extractIntermediateToken(v1RouteUSDCtoUSDT)
      const v3IntermediateToken = extractIntermediateToken(v3Route)

      expect(v3IntermediateToken).toBe(v1IntermediateToken)
    })
  })

  describe('Data Structure Compatibility', () => {
    it('should use same pair ID format as V1', async () => {
      const v3Pairs = await mento.exchanges.getTradablePairs({ cached: true })

      // Check structure matches V1
      v3Pairs.forEach(v3Pair => {
        expect(v3Pair).toHaveProperty('id')
        expect(v3Pair).toHaveProperty('assets')
        expect(v3Pair).toHaveProperty('path')

        // Verify alphabetical sorting like V1
        const [symbol0, symbol1] = v3Pair.id.split('-')
        expect(symbol0.localeCompare(symbol1)).toBeLessThan(0)

        // Verify asset structure
        expect(v3Pair.assets).toHaveLength(2)
        expect(v3Pair.assets[0]).toHaveProperty('address')
        expect(v3Pair.assets[0]).toHaveProperty('symbol')
        expect(v3Pair.assets[1]).toHaveProperty('address')
        expect(v3Pair.assets[1]).toHaveProperty('symbol')
      })
    })

    it('should maintain token list compatibility with V1', async () => {
      const v3Tokens = await mento.exchanges.getTokens()

      // All V1 tokens should exist in V3
      v1Tokens.forEach((v1Token: any) => {
        const v3Token = v3Tokens.find(t => t.address === v1Token.address)
        expect(v3Token).toBeDefined()
        expect(v3Token?.symbol).toBe(v1Token.symbol)
      })
    })
  })
})

function extractIntermediateToken(pair: any): string {
  if (pair.path.length !== 2) return ''

  // Find common token between hop 1 and hop 2
  const hop1Assets = pair.path[0].assets
  const hop2Assets = pair.path[1].assets

  return hop1Assets.find((asset: string) => hop2Assets.includes(asset)) || ''
}
```

#### Benefits

1. **Guaranteed Behavioral Compatibility**: V3 MUST pass the exact same tests as V1
2. **Single Source of Truth**: Behavioral expectations defined once
3. **Continuous Validation**: Can run v1 tests alongside v3 during development
4. **Regression Detection**: If v3 breaks v1 behavior, tests immediately fail
5. **Provider Parity**: Same behavioral suite runs for both Ethers v6 and Viem

#### Workflow

1. **Extract behavioral tests** from v1 into shared suite
2. **Run shared suite against v1** to establish baseline (should all pass)
3. **Implement v3** ExchangeService
4. **Run shared suite against v3** - fix until all pass
5. **Add v3-specific tests** for internal implementation details

---

### Option 2: Direct Port with Snapshots (Alternative)

Port v1 tests directly to v3, using test snapshots to ensure identical outputs.

#### Implementation

```
tests/
├── integration/
│   └── v3/
│       ├── exchangeDiscovery.test.ts     # Direct port of v1 tests
│       └── __snapshots__/
│           └── v1-outputs.snap           # V1 output snapshots
```

#### Example

```typescript
// Capture v1 outputs as snapshots
describe('V3 Exchange Discovery (V1 Compatible)', () => {
  it('should return same pairs as v1 for mainnet', async () => {
    const v3Pairs = await mento.exchanges.getTradablePairs({ cached: true })

    // Compare against v1 snapshot
    expect(v3Pairs).toMatchSnapshot('v1-mainnet-pairs')
  })
})
```

#### Benefits

1. **Simplest approach** - direct test copy
2. **Clear migration path** - 1:1 test mapping
3. **Snapshot validation** - catches any output changes

#### Drawbacks

1. **Brittle** - snapshots break on any format change (even if behavior is correct)
2. **Less flexible** - harder to adapt to v3 improvements
3. **Test duplication** - separate tests for v1 and v3

---

## Recommendation: Option 1 (Shared Behavioral Suite)

### Why This Is Best

1. **Behavior over Implementation**: Tests validate *what* the system does, not *how*
2. **Future-Proof**: v3 can refactor internals as long as behavior matches
3. **Multi-Provider Coverage**: Same tests validate Ethers v6 AND Viem
4. **Living Documentation**: Shared tests document expected behavior
5. **Confidence**: If v3 passes all v1 behavioral tests, it's functionally compatible

### Migration Steps

#### Phase 1: Extract Behavioral Tests (Week 1)
- [ ] Create `tests/shared/exchange-discovery-behavior.test.ts`
- [ ] Extract these test scenarios from v1:
  - Token discovery and address verification (from routeFetching.test.ts)
  - Route optimization logic (axlUSDC → USDC, etc.)
  - Route structure validation (pair IDs, connectivity)
  - Exchange lookup (getExchangeById)
  - Direct vs multi-hop distinction
- [ ] Define `ExchangeDiscoveryAPI` interface
- [ ] Run extracted tests against v1 to establish baseline (all should pass)

#### Phase 2: V3 Implementation (Week 2-3)
- [ ] Implement ExchangeService with all methods
- [ ] Implement routeUtils with graph algorithms
- [ ] Create adapter wrapper to match `ExchangeDiscoveryAPI`

#### Phase 3: V3 Testing (Week 3)
- [ ] Create `tests/integration/adapters/viemExchangeDiscovery.test.ts`
- [ ] Create `tests/integration/adapters/ethersExchangeDiscovery.test.ts`
- [ ] Run shared behavioral suite against v3
- [ ] Fix implementation until all tests pass

#### Phase 4: Additional V3 Tests (Week 4)
- [ ] Add v3-specific unit tests:
  - ExchangeService caching logic
  - routeUtils graph algorithms
  - Error handling edge cases
- [ ] Add integration tests:
  - Performance benchmarks
  - Cache file loading
  - Provider parity validation

### Success Criteria

- ✅ All shared behavioral tests pass for v1
- ✅ All shared behavioral tests pass for v3 with Viem
- ✅ All shared behavioral tests pass for v3 with Ethers v6
- ✅ V3 has >80% code coverage (constitution requirement)
- ✅ No breaking behavioral changes vs v1

---

## Key Test Scenarios to Port

### High Priority (P0)

1. **Token Address Verification** (from routeFetching.test.ts:126-135)
   - Ensures mainnet token addresses haven't changed
   - Critical for preventing fund loss

2. **Route Optimization** (from routeFetching.test.ts:137-164)
   - axlUSDC → USDC through cUSD (not cREAL)
   - USDC → USDT through cUSD
   - Direct route preference

3. **Route Structure Validation** (from routeFetching.test.ts:167-193)
   - Alphabetically sorted pair IDs
   - Multi-hop connectivity (hops share intermediate token)

4. **Exchange Lookup** (from mento.test.ts:994-1014)
   - getExchangeById success case
   - getExchangeById not found error

### Medium Priority (P1)

5. **Direct vs Multi-Hop Pairs** (from mento.test.ts:301-378)
   - Correct count of direct pairs
   - Correct count of multi-hop pairs
   - Specific route verification (e.g., cUSD → cEUR via CELO)

6. **Token Listing** (from mento.test.ts:1035-1127)
   - getTokens synchronous access
   - getTokensAsync with caching
   - No duplicate tokens
   - Sorted by symbol

### Low Priority (P2)

7. **Route Display** (from routeFetching.test.ts:203-270)
   - Only port if v3 includes display utilities
   - Otherwise, leave in v1 for backward compat

---

## Out of Scope (Don't Port)

These tests are for features NOT in the exchange discovery scope:

- ❌ Swap execution (`swapIn`, `swapOut`)
- ❌ Quote methods (`getAmountIn`, `getAmountOut`)
- ❌ Allowance management (`increaseTradingAllowance`)
- ❌ Trading status checks (`isTradingEnabled`)

These will be migrated in separate features (likely "Swap Execution" and "Price Quotes").

---

## Test Data Strategy

### Use Real Cached Data

Both v1 tests use real Celo mainnet cached data. V3 should do the same:

```typescript
// Load real cached pairs for mainnet
const pairs = await mento.exchanges.getTradablePairs({ cached: true })
```

**Benefits**:
- Tests run against production data
- Catches real-world edge cases
- No need to maintain mock data

**Challenges**:
- Tests may fail if mainnet state changes (new exchanges added)
- Solution: Update cached files periodically, version control them

### Mock for Unit Tests

Use mocks for fast unit tests of isolated logic:

```typescript
// Unit test for route finding algorithm
describe('routeUtils.generateAllRoutes', () => {
  it('should generate 2-hop routes correctly', () => {
    const mockDirectPairs = [
      { id: 'A-B', path: [...] },
      { id: 'B-C', path: [...] },
    ]

    const routes = generateAllRoutes(buildConnectivity(mockDirectPairs))

    expect(routes).toContainEqual({ id: 'A-C', path: [A→B, B→C] })
  })
})
```

---

## Acceptance Criteria

Before merging v3 exchange discovery:

- [ ] All shared behavioral tests pass for v3 (Viem and Ethers)
- [ ] Same tests pass for v1 (baseline validation)
- [ ] Code coverage >80% for ExchangeService and routeUtils
- [ ] Performance benchmarks meet targets (<500ms cached, <10s fresh)
- [ ] Integration tests run on Celo mainnet fork
- [ ] No breaking API changes vs v1 (data structures identical)

---

## Next Steps

1. **Review this strategy** with the team
2. **Extract first behavioral test** from routeFetching.test.ts
3. **Validate it runs on v1** successfully
4. **Begin v3 implementation** with TDD approach
5. **Iterate** until all behavioral tests pass

---

## References

- V1 Tests: [routeFetching.test.ts](../../../src/routeFetching.test.ts), [mento.test.ts](../../../src/mento.test.ts)
- V3 Spec: [spec.md](./spec.md)
- V3 Plan: [plan.md](./plan.md)
- Constitution: [constitution.md](../.specify/memory/constitution.md) (Section III: Comprehensive Testing)
