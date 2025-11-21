# Quickstart: Exchange & Pool Discovery

**Feature**: 002-exchange-pool-discovery
**Date**: 2025-11-04

## Overview

This guide demonstrates how to use the Exchange & Pool Discovery feature in the Mento SDK v3. Code examples show common use cases with both Ethers v6 and Viem providers.

## Installation

```bash
npm install @mento-labs/mento-sdk

# Peer dependencies (choose one)
npm install ethers@^6.0.0  # For Ethers v6
# OR
npm install viem@^2.0.0    # For Viem
```

## Setup

### With Ethers v6

```typescript
import { EthersAdapter } from '@mento-labs/mento-sdk/adapters'
import { ExchangeService } from '@mento-labs/mento-sdk/services'
import { ethers } from 'ethers'

// Connect to Celo mainnet
const provider = new ethers.JsonRpcProvider('https://forno.celo.org')

// Create adapter
const adapter = new EthersAdapter(provider)

// Create exchange service
const exchangeService = new ExchangeService(adapter)
```

### With Viem

```typescript
import { ViemAdapter } from '@mento-labs/mento-sdk/adapters'
import { ExchangeService } from '@mento-labs/mento-sdk/services'
import { createPublicClient, http } from 'viem'
import { celo } from 'viem/chains'

// Connect to Celo mainnet
const client = createPublicClient({
  chain: celo,
  transport: http(),
})

// Create adapter
const adapter = new ViemAdapter(client)

// Create exchange service
const exchangeService = new ExchangeService(adapter)
```

---

## Use Case 1: Query All Exchanges

Discover all available exchanges in the Mento protocol.

```typescript
import { Exchange } from '@mento-labs/mento-sdk/types'

/**
 * Get all exchanges from all registered providers
 * Results are cached in memory for the service lifetime
 */
async function getAllExchanges() {
  // First call queries blockchain, subsequent calls use cache
  const exchanges: Exchange[] = await exchangeService.getExchanges()

  console.log(`Found ${exchanges.length} exchanges`)

  // Display exchanges
  exchanges.forEach((exchange) => {
    console.log({
      provider: exchange.providerAddr,
      id: exchange.id,
      pair: exchange.assets, // [token0, token1]
    })
  })

  return exchanges
}

/**
 * Get exchanges for a specific provider
 */
async function getProviderExchanges(providerAddress: string) {
  const exchanges = await exchangeService.getExchangesForProvider(
    providerAddress
  )

  console.log(`Provider ${providerAddress} has ${exchanges.length} exchanges`)
  return exchanges
}

// Example usage
await getAllExchanges()
await getProviderExchanges('0x1234567890123456789012345678901234567890')
```

**Output Example**:

```
Found 47 exchanges
{
  provider: '0x329...',
  id: '0xabcd...',
  pair: ['0x765D...', '0x471E...']  // cUSD-CELO
}
{
  provider: '0x329...',
  id: '0xef01...',
  pair: ['0x765D...', '0xD876...']  // cUSD-cEUR
}
...
```

**Performance**:

- First call: ~5-8 seconds (queries blockchain)
- Cached calls: < 10 milliseconds

---

## Use Case 2: Find Direct Trading Pairs

Discover all token pairs with direct (single-hop) exchanges.

```typescript
import { TradablePair } from '@mento-labs/mento-sdk/types'

/**
 * Get all direct trading pairs
 * Each pair may have multiple exchanges (different providers)
 */
async function getDirectPairs() {
  const pairs: TradablePair[] = await exchangeService.getDirectPairs()

  console.log(`Found ${pairs.length} direct trading pairs`)

  // Display pairs with their symbols
  pairs.forEach((pair) => {
    console.log({
      id: pair.id, // e.g., 'cEUR-cUSD'
      token0: pair.assets[0], // { address, symbol }
      token1: pair.assets[1], // { address, symbol }
      exchanges: pair.path.length, // Number of exchanges for this pair
    })
  })

  return pairs
}

/**
 * Check if a direct pair exists between two tokens
 */
async function hasDirectPair(token0: string, token1: string): Promise<boolean> {
  const pairs = await exchangeService.getDirectPairs()

  return pairs.some(
    (pair) =>
      (pair.assets[0].address === token0 &&
        pair.assets[1].address === token1) ||
      (pair.assets[0].address === token1 && pair.assets[1].address === token0)
  )
}

// Example usage
const pairs = await getDirectPairs()

const cUSD = '0x765DE816845861e75A25fCA122bb6898B8B1282a'
const CELO = '0x471EcE3750Da237f93B8E339c536989b8978a438'
const hasDirectRoute = await hasDirectPair(cUSD, CELO)
console.log(`cUSD-CELO direct pair exists: ${hasDirectRoute}`)
```

**Output Example**:

```
Found 23 direct trading pairs
{
  id: 'CELO-cUSD',
  token0: { address: '0x471E...', symbol: 'CELO' },
  token1: { address: '0x765D...', symbol: 'cUSD' },
  exchanges: 1
}
{
  id: 'cEUR-cUSD',
  token0: { address: '0xD876...', symbol: 'cEUR' },
  token1: { address: '0x765D...', symbol: 'cUSD' },
  exchanges: 2  // Multiple exchanges available
}
```

**Note**: Direct pairs are cheaper (less gas) and faster than multi-hop routes.

---

## Use Case 3: Discover Multi-Hop Trading Routes

Find all tradable pairs including two-hop routes through intermediate tokens.

```typescript
/**
 * Get all tradable pairs (direct + multi-hop)
 * Uses cached data by default for instant results
 */
async function getAllTradablePairs() {
  const pairs = await exchangeService.getTradablePairs({
    cached: true, // Use pre-generated cached pairs (fast)
  })

  const directPairs = pairs.filter((p) => p.path.length === 1)
  const twoHopPairs = pairs.filter((p) => p.path.length === 2)

  console.log(`Found ${pairs.length} total tradable pairs`)
  console.log(`  - ${directPairs.length} direct pairs`)
  console.log(`  - ${twoHopPairs.length} two-hop pairs`)

  return pairs
}

/**
 * Get all tradable pairs with fresh blockchain data
 * Slower but guaranteed up-to-date
 */
async function getFreshTradablePairs() {
  const pairs = await exchangeService.getTradablePairs({
    cached: false, // Generate from scratch
  })

  console.log(`Generated ${pairs.length} pairs from live data`)
  return pairs
}

/**
 * Examine a two-hop route in detail
 */
async function analyzeTwoHopRoute(pairId: string) {
  const pairs = await exchangeService.getTradablePairs()
  const pair = pairs.find((p) => p.id === pairId)

  if (!pair || pair.path.length !== 2) {
    console.log(`${pairId} is not a two-hop route`)
    return
  }

  console.log(`Route for ${pairId}:`)
  console.log(`  Token A: ${pair.assets[0].symbol}`)
  console.log(`  Token B: ${pair.assets[1].symbol}`)
  console.log(
    `\n  Hop 1: ${pair.path[0].assets[0]} → ${pair.path[0].assets[1]}`
  )
  console.log(`    Provider: ${pair.path[0].providerAddr}`)
  console.log(`    Exchange ID: ${pair.path[0].id}`)
  console.log(
    `\n  Hop 2: ${pair.path[1].assets[0]} → ${pair.path[1].assets[1]}`
  )
  console.log(`    Provider: ${pair.path[1].providerAddr}`)
  console.log(`    Exchange ID: ${pair.path[1].id}`)

  // Check if spread data is available (cached pairs only)
  if ('spreadData' in pair) {
    console.log(`\n  Spread Cost: ${pair.spreadData.totalSpreadPercent}%`)
  }
}

// Example usage
await getAllTradablePairs()
await analyzeTwoHopRoute('cBRL-cUSD')
```

**Output Example**:

```
Found 87 total tradable pairs
  - 23 direct pairs
  - 64 two-hop pairs

Route for cBRL-cUSD:
  Token A: cBRL
  Token B: cUSD

  Hop 1: 0x765D... → 0x471E...
    Provider: 0x329...
    Exchange ID: 0xabcd...

  Hop 2: 0x471E... → 0xE4D5...
    Provider: 0x329...
    Exchange ID: 0xef01...

  Spread Cost: 0.52%
```

**Performance**:

- Cached: < 500 milliseconds
- Fresh: ~8-10 seconds

---

## Use Case 4: Find Exchange for Specific Token Pair

Look up exchange details for a specific token pair.

```typescript
/**
 * Get exchange for a direct token pair
 * Throws error if no direct exchange exists
 */
async function getExchangeForPair(token0: string, token1: string) {
  try {
    const exchange = await exchangeService.getExchangeForTokens(token0, token1)

    console.log('Found exchange:')
    console.log(`  Provider: ${exchange.providerAddr}`)
    console.log(`  ID: ${exchange.id}`)
    console.log(`  Assets: ${exchange.assets.join(', ')}`)

    return exchange
  } catch (error) {
    console.error(`No direct exchange found between ${token0} and ${token1}`)
    console.log('Try using findPairForTokens() to find multi-hop route')
    throw error
  }
}

/**
 * Find tradable pair (direct or multi-hop) for any token pair
 */
async function findTradablePair(tokenIn: string, tokenOut: string) {
  try {
    const pair = await exchangeService.findPairForTokens(tokenIn, tokenOut)

    const routeType = pair.path.length === 1 ? 'direct' : 'two-hop'
    console.log(`Found ${routeType} route:`)
    console.log(`  Pair ID: ${pair.id}`)
    console.log(`  ${pair.assets[0].symbol} ↔ ${pair.assets[1].symbol}`)
    console.log(`  Path length: ${pair.path.length} hop(s)`)

    return pair
  } catch (error) {
    console.error(`No tradable route found between ${tokenIn} and ${tokenOut}`)
    console.log('These tokens may not be connected in the Mento protocol')
    throw error
  }
}

/**
 * Get exchange by its unique ID
 */
async function getExchangeById(exchangeId: string) {
  try {
    const exchange = await exchangeService.getExchangeById(exchangeId)
    console.log('Found exchange:', exchange)
    return exchange
  } catch (error) {
    console.error(`Exchange ${exchangeId} not found`)
    throw error
  }
}

// Example usage
const cUSD = '0x765DE816845861e75A25fCA122bb6898B8B1282a'
const CELO = '0x471EcE3750Da237f93B8E339c536989b8978a438'
const cEUR = '0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73'

// Get direct exchange
const directExchange = await getExchangeForPair(cUSD, CELO)

// Find any route (direct or multi-hop)
const pair = await findTradablePair(cUSD, cEUR)

// Get specific exchange
const exchange = await getExchangeById('0xabcd1234...')
```

**Error Handling**:

```typescript
try {
  const exchange = await exchangeService.getExchangeForTokens(tokenA, tokenB)
} catch (error) {
  if (error.message.includes('No exchange found')) {
    // No direct exchange exists, try multi-hop
    const pair = await exchangeService.findPairForTokens(tokenA, tokenB)
  }
}
```

---

## Use Case 5: Using Cached vs Fresh Data

Control when to use cached data versus querying the blockchain.

```typescript
/**
 * Performance comparison: cached vs fresh
 */
async function comparePerformance() {
  console.log('Testing cached performance...')
  const cachedStart = Date.now()
  const cachedPairs = await exchangeService.getTradablePairs({ cached: true })
  const cachedTime = Date.now() - cachedStart

  console.log(`Cached: ${cachedPairs.length} pairs in ${cachedTime}ms`)

  console.log('\nTesting fresh performance...')
  const freshStart = Date.now()
  const freshPairs = await exchangeService.getTradablePairs({ cached: false })
  const freshTime = Date.now() - freshStart

  console.log(`Fresh: ${freshPairs.length} pairs in ${freshTime}ms`)
  console.log(`\nCached is ${(freshTime / cachedTime).toFixed(1)}x faster`)
}

/**
 * Use fresh data when you need the latest state
 */
async function getLatestExchanges() {
  // Clear cache by creating new service instance
  const freshAdapter = new EthersAdapter(provider)
  const freshService = new ExchangeService(freshAdapter)

  // All queries will hit blockchain
  const exchanges = await freshService.getExchanges()
  return exchanges
}

/**
 * Recommended: Use cached by default, fresh when needed
 */
async function smartPairQuery(requireLatest: boolean = false) {
  const pairs = await exchangeService.getTradablePairs({
    cached: !requireLatest, // Cached by default
  })

  return pairs
}

// Example usage
await comparePerformance()
// Output:
// Cached: 87 pairs in 342ms
// Fresh: 87 pairs in 8751ms
// Cached is 25.6x faster
```

**When to use cached data**:

- ✅ Price quotes and swaps (data rarely changes)
- ✅ UI display of available pairs
- ✅ Frequent queries in trading bots

**When to use fresh data**:

- ✅ After governance changes add new exchanges
- ✅ When cached data returns unexpected results
- ✅ First query on new/unknown chains

---

## Use Case 6: Filter and Search Pairs

Find specific pairs that match criteria.

```typescript
/**
 * Find all pairs involving a specific token
 */
async function getPairsForToken(tokenAddress: string) {
  const allPairs = await exchangeService.getTradablePairs()

  const pairs = allPairs.filter(
    (pair) =>
      pair.assets[0].address === tokenAddress ||
      pair.assets[1].address === tokenAddress
  )

  console.log(`Found ${pairs.length} pairs for token ${tokenAddress}`)
  return pairs
}

/**
 * Find all pairs with a specific token symbol
 */
async function getPairsWithSymbol(symbol: string) {
  const allPairs = await exchangeService.getTradablePairs()

  const pairs = allPairs.filter(
    (pair) =>
      pair.assets[0].symbol === symbol || pair.assets[1].symbol === symbol
  )

  console.log(`Found ${pairs.length} pairs involving ${symbol}`)
  pairs.forEach((pair) => console.log(`  - ${pair.id}`))

  return pairs
}

/**
 * Get only direct pairs (exclude multi-hop)
 */
async function getOnlyDirectPairs() {
  // More efficient: use getDirectPairs() directly
  const pairs = await exchangeService.getDirectPairs()
  return pairs

  // Alternative: filter from getTradablePairs()
  // const allPairs = await exchangeService.getTradablePairs()
  // return allPairs.filter(p => p.path.length === 1)
}

/**
 * Find most liquid pairs (most exchanges)
 */
async function getMostLiquidPairs(limit: number = 5) {
  const pairs = await exchangeService.getDirectPairs()

  // Sort by number of exchanges (path.length for direct pairs = exchanges available)
  const sorted = pairs.sort((a, b) => b.path.length - a.path.length)

  console.log(`Top ${limit} most liquid pairs:`)
  sorted.slice(0, limit).forEach((pair, i) => {
    console.log(`${i + 1}. ${pair.id} - ${pair.path.length} exchange(s)`)
  })

  return sorted.slice(0, limit)
}

// Example usage
const cUSD = '0x765DE816845861e75A25fCA122bb6898B8B1282a'
await getPairsForToken(cUSD)
await getPairsWithSymbol('CELO')
await getMostLiquidPairs(5)
```

**Output Example**:

```
Found 18 pairs for token 0x765D...
Found 12 pairs involving CELO
  - CELO-cUSD
  - CELO-cEUR
  - CELO-cBRL
  ...

Top 5 most liquid pairs:
1. cEUR-cUSD - 3 exchange(s)
2. CELO-cUSD - 2 exchange(s)
3. cBRL-cUSD - 1 exchange(s)
4. cKES-cUSD - 1 exchange(s)
5. cREAL-cUSD - 1 exchange(s)
```

---

## Use Case 7: Route Optimization

Understand how the SDK selects optimal routes.

```typescript
/**
 * Compare multiple routes for the same pair
 * Only possible with returnAllRoutes option (internal/testing use)
 */
async function compareRoutesForPair(token0: string, token1: string) {
  // Note: returnAllRoutes is not exposed in public API
  // This demonstrates the internal optimization logic

  const pair = await exchangeService.findPairForTokens(token0, token1)

  console.log(`Optimal route for pair:`)
  console.log(`  Route type: ${pair.path.length === 1 ? 'Direct' : 'Two-hop'}`)

  if ('spreadData' in pair) {
    console.log(`  Spread cost: ${pair.spreadData.totalSpreadPercent}%`)
    console.log(`  Selection reason: Lowest spread (Tier 1 optimization)`)
  } else if (pair.path.length === 1) {
    console.log(`  Selection reason: Direct route (Tier 2 optimization)`)
  } else {
    // Check if route goes through major stablecoin
    const intermediateAddr = pair.path[0].assets.find((a) =>
      pair.path[1].assets.includes(a)
    )
    // Note: Would need symbol lookup to confirm stablecoin
    console.log(`  Selection reason: Heuristic-based (Tier 3/4 optimization)`)
  }
}

/**
 * Understand route selection priorities
 */
function explainRouteOptimization() {
  console.log(`
Route Selection Priorities (highest to lowest):

1. Tier 1 - Spread Data (if available):
   - Selects route with lowest totalSpreadPercent
   - Most cost-efficient trading
   - Only available for cached pairs

2. Tier 2 - Direct Routes:
   - Prefers single-hop over multi-hop
   - Lower gas costs
   - Lower execution risk

3. Tier 3 - Major Stablecoins:
   - For multi-hop, prefers routes through cUSD, cEUR, USDC, USDT
   - Better liquidity typically available
   - More reliable execution

4. Tier 4 - First Available:
   - Uses first discovered route
   - Last resort fallback
  `)
}

// Example usage
const cUSD = '0x765DE816845861e75A25fCA122bb6898B8B1282a'
const cBRL = '0xE4D5...' // Example address
await compareRoutesForPair(cUSD, cBRL)
explainRouteOptimization()
```

---

## Complete Example: Trading Bot

A complete example showing how to use exchange discovery in a trading context.

```typescript
import { EthersAdapter } from '@mento-labs/mento-sdk/adapters'
import { ExchangeService } from '@mento-labs/mento-sdk/services'
import { ethers } from 'ethers'

class MentoTradingBot {
  private exchangeService: ExchangeService
  private watchedTokens: Set<string>

  constructor(provider: ethers.JsonRpcProvider, tokensToWatch: string[]) {
    const adapter = new EthersAdapter(provider)
    this.exchangeService = new ExchangeService(adapter)
    this.watchedTokens = new Set(tokensToWatch)
  }

  /**
   * Initialize: discover all tradable pairs
   */
  async initialize() {
    console.log('Initializing trading bot...')

    // Load all pairs (cached for speed)
    const pairs = await this.exchangeService.getTradablePairs({ cached: true })
    console.log(`Discovered ${pairs.length} tradable pairs`)

    // Filter to only pairs involving watched tokens
    const relevantPairs = pairs.filter(
      (pair) =>
        this.watchedTokens.has(pair.assets[0].address) ||
        this.watchedTokens.has(pair.assets[1].address)
    )

    console.log(`Watching ${relevantPairs.length} relevant pairs`)
    return relevantPairs
  }

  /**
   * Find best route for a swap
   */
  async findBestRoute(tokenIn: string, tokenOut: string) {
    try {
      // SDK automatically selects optimal route
      const pair = await this.exchangeService.findPairForTokens(
        tokenIn,
        tokenOut
      )

      return {
        found: true,
        pair,
        routeType: pair.path.length === 1 ? 'direct' : 'two-hop',
        spread:
          'spreadData' in pair ? pair.spreadData.totalSpreadPercent : null,
      }
    } catch (error) {
      return {
        found: false,
        error: error.message,
      }
    }
  }

  /**
   * Get all possible output tokens for a given input token
   */
  async getAvailableOutputs(tokenIn: string) {
    const allPairs = await this.exchangeService.getTradablePairs()

    const outputs = new Set<string>()
    allPairs.forEach((pair) => {
      if (pair.assets[0].address === tokenIn) {
        outputs.add(pair.assets[1].address)
      } else if (pair.assets[1].address === tokenIn) {
        outputs.add(pair.assets[0].address)
      }
    })

    return Array.from(outputs)
  }
}

// Usage
async function runBot() {
  const provider = new ethers.JsonRpcProvider('https://forno.celo.org')

  const watchedTokens = [
    '0x765DE816845861e75A25fCA122bb6898B8B1282a', // cUSD
    '0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73', // cEUR
    '0x471EcE3750Da237f93B8E339c536989b8978a438', // CELO
  ]

  const bot = new MentoTradingBot(provider, watchedTokens)
  await bot.initialize()

  // Find route
  const route = await bot.findBestRoute(watchedTokens[0], watchedTokens[1])
  console.log('Best route:', route)

  // Get available outputs
  const outputs = await bot.getAvailableOutputs(watchedTokens[0])
  console.log(`Can swap to ${outputs.length} different tokens`)
}

runBot().catch(console.error)
```

---

## Error Handling Best Practices

```typescript
import { Exchange, TradablePair } from '@mento-labs/mento-sdk/types'

/**
 * Robust exchange query with error handling
 */
async function safeGetExchanges(): Promise<Exchange[]> {
  try {
    return await exchangeService.getExchanges()
  } catch (error) {
    console.error('Failed to fetch exchanges:', error)

    // Retry with fresh adapter (in case of stale connection)
    try {
      const freshAdapter = new EthersAdapter(provider)
      const freshService = new ExchangeService(freshAdapter)
      return await freshService.getExchanges()
    } catch (retryError) {
      console.error('Retry failed:', retryError)
      return [] // Return empty array as fallback
    }
  }
}

/**
 * Safe pair lookup with fallback
 */
async function safeFindPair(
  tokenIn: string,
  tokenOut: string
): Promise<TradablePair | null> {
  try {
    return await exchangeService.findPairForTokens(tokenIn, tokenOut)
  } catch (error) {
    if (error.message.includes('No pair found')) {
      console.log(`No route exists between tokens`)
      return null
    }
    throw error // Re-throw unexpected errors
  }
}

/**
 * Validate token pair before querying
 */
async function validateAndQuery(token0: string, token1: string) {
  // Check addresses are valid
  if (!ethers.isAddress(token0) || !ethers.isAddress(token1)) {
    throw new Error('Invalid token address')
  }

  // Check tokens are different
  if (token0.toLowerCase() === token1.toLowerCase()) {
    throw new Error('Cannot trade token with itself')
  }

  // Query pair
  return await exchangeService.findPairForTokens(token0, token1)
}
```

---

## Performance Tips

1. **Use cached data by default**:

   ```typescript
   // ✅ Fast (uses cache)
   const pairs = await exchangeService.getTradablePairs({ cached: true })

   // ❌ Slow (queries blockchain)
   const pairs = await exchangeService.getTradablePairs({ cached: false })
   ```

2. **Reuse service instances**:

   ```typescript
   // ✅ Good - reuses cached exchanges
   const service = new ExchangeService(adapter)
   await service.getExchanges() // Queries blockchain
   await service.getExchanges() // Uses cache

   // ❌ Bad - loses cache
   await new ExchangeService(adapter).getExchanges() // Queries
   await new ExchangeService(adapter).getExchanges() // Queries again
   ```

3. **Use direct pairs when possible**:

   ```typescript
   // ✅ Fast - only direct pairs
   const directPairs = await exchangeService.getDirectPairs()

   // ❌ Slower - includes route generation
   const allPairs = await exchangeService.getTradablePairs()
   const directOnly = allPairs.filter((p) => p.path.length === 1)
   ```

4. **Batch similar operations**:

   ```typescript
   // ✅ Good - parallel queries
   const [exchanges, pairs] = await Promise.all([
     exchangeService.getExchanges(),
     exchangeService.getDirectPairs(),
   ])

   // ❌ Bad - sequential queries
   const exchanges = await exchangeService.getExchanges()
   const pairs = await exchangeService.getDirectPairs()
   ```

---

## Next Steps

- **Swap Execution**: Use discovered pairs with `SwapService` to execute trades
- **Price Quotes**: Get price quotes for discovered pairs
- **Liquidity Analysis**: Check available liquidity for exchanges
- **Real-time Updates**: Subscribe to exchange updates (if supported)

## Resources

- [Full API Documentation](../api/ExchangeService.md)
- [Data Model Reference](./data-model.md)
- [Architecture Guide](./research.md)
- [SDK Repository](https://github.com/mento-protocol/mento-sdk)
