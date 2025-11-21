# BreakerBox Rate Feed Trading Mode SDK Usage

This document shows how to use the rate feed trading mode functionality from the Mento SDK.

## Overview

The SDK exposes two key functions for working with rate feed trading modes:
- `getRateFeedTradingMode()` - Query the current trading mode for a rate feed
- `toRateFeedId()` - Convert a rate feed identifier string to its address

## Trading Modes

The SDK exposes a `TradingMode` enum with three possible values:

- `TradingMode.BIDIRECTIONAL` (0) - Bidirectional trading is enabled
- `TradingMode.HALTED` (1) - Trading is temporarily halted (circuit breaker tripped)
- `TradingMode.DISABLED` (2) - Trading is permanently disabled

## Usage Examples

### Example 1: Using toRateFeedId() to compute a rate feed address

```typescript
import { Mento, TradingMode, toRateFeedId } from '@mento-protocol/mento-sdk'
import { ethers } from 'ethers'

async function checkTradingModeByIdentifier() {
  const provider = new ethers.providers.JsonRpcProvider('https://forno.celo.org')
  const mento = await Mento.create(provider)

  // Compute the rate feed ID from a string identifier
  const eurUsdRateFeedId = toRateFeedId('EURUSD')
  console.log(`Rate Feed ID for EURUSD: ${eurUsdRateFeedId}`)
  // Output: 0x5d5a22116233bdb2a9c2977279cc348b8b8ce917

  // Works with relayed feeds too
  const copUsdRateFeedId = toRateFeedId('relayed:COPUSD')
  console.log(`Rate Feed ID for relayed:COPUSD: ${copUsdRateFeedId}`)
  // Output: 0x0196d1f4fda21fa442e53eaf18bf31282f6139f1

  // Get the current trading mode
  const tradingMode = await mento.getRateFeedTradingMode(eurUsdRateFeedId)

  // Check the mode
  switch (tradingMode) {
    case TradingMode.BIDIRECTIONAL:
      console.log('Trading is enabled')
      break
    case TradingMode.HALTED:
      console.log('Trading is halted - circuit breaker tripped')
      break
    case TradingMode.DISABLED:
      console.log('Trading is disabled')
      break
  }
}
```

### Example 2: Getting rate feed ID from an exchange

```typescript
import { Mento, TradingMode } from '@mento-protocol/mento-sdk'
import { BiPoolManager__factory } from '@mento-protocol/mento-core-ts'
import { ethers } from 'ethers'

async function checkTradingModeFromExchange() {
  const provider = new ethers.providers.JsonRpcProvider('https://forno.celo.org')
  const mento = await Mento.create(provider)

  // Get a rate feed ID from an exchange
  const exchanges = await mento.getExchanges()
  const biPoolManager = BiPoolManager__factory.connect(
    exchanges[0].providerAddr,
    provider
  )
  const exchangeConfig = await biPoolManager.getPoolExchange(exchanges[0].id)
  const rateFeedId = exchangeConfig.config.referenceRateFeedID

  // Get the current trading mode
  const tradingMode = await mento.getRateFeedTradingMode(rateFeedId)
  console.log(`Trading mode: ${tradingMode}`)

  // Alternative: use the existing convenience method for exchange-level check
  const isEnabled = await mento.isTradingEnabled(exchanges[0].id)
  console.log(`Is trading enabled: ${isEnabled}`)
}
```

## Implementation Details

### toRateFeedId(rateFeed: string): Address

This utility function computes the rate feed ID from a string identifier following the Solidity formula:
```solidity
address(uint160(uint256(keccak256(abi.encodePacked(rateFeed)))))
```

Steps:
1. Compute keccak256 hash of the UTF-8 encoded string
2. Convert to BigInt (uint256)
3. Mask to 160 bits (uint160)
4. Convert to hex address string

### getRateFeedTradingMode(rateFeedId: Address): Promise<TradingMode>

This method:
1. Gets the BreakerBox contract address for the current chain
2. Connects to the BreakerBox contract
3. Queries `getRateFeedTradingMode()` with the provided rate feed ID
4. Returns the trading mode as a `TradingMode` enum value

**Note:** Multiple exchanges can share the same rate feed, so the BreakerBox operates at the rate feed level rather than the exchange level.

## Related Methods

- `isPairTradable(tokenIn: Address, tokenOut: Address): Promise<boolean>` - Checks if a token pair is currently tradable (most convenient for UI use)
- `isTradingEnabled(exchangeId: string): Promise<boolean>` - Returns true only if the exchange's rate feed mode is BIDIRECTIONAL (operates at exchange level)
- `getTradingLimits(exchangeId: string): Promise<TradingLimit[]>` - Get trading limits for an exchange

## Important Notes

### Multi-Hop Routes

The `isPairTradable()` method intelligently handles multi-hop routes. For example, if you want to swap CELO → USDT but there's no direct exchange, the route might be:
- CELO → cUSD (hop 1)
- cUSD → USDT (hop 2)

The method will check that **ALL** rate feeds in the path are in BIDIRECTIONAL mode. If any hop is HALTED or DISABLED, the entire pair is considered not tradable.

```typescript
// Example: Multi-hop route check
const isTradable = await mento.isPairTradable(celoAddress, usdtAddress)
// Returns true ONLY if both CELO/cUSD AND cUSD/USDT rate feeds are BIDIRECTIONAL
```

### Method Comparison

- **`isPairTradable(tokenIn, tokenOut)`** - Operates at the token pair level. Checks all rate feeds in the routing path. **Use this for UI validation.**
- **`getRateFeedTradingMode(rateFeedId)`** - Operates at the rate feed level. Returns the specific mode for a single rate feed.
- **`isTradingEnabled(exchangeId)`** - Operates at the exchange level. Checks a single exchange by ID.

## UI Integration Example

Here's a practical example for a trading UI with token dropdowns:

```typescript
import { Mento, TradingMode } from '@mento-protocol/mento-sdk'
import { ethers } from 'ethers'

// Your UI state
interface TokenDropdownState {
  tokenToSell: string  // token address
  tokenToBuy: string   // token address
}

async function checkIfPairIsTradable(
  state: TokenDropdownState,
  mento: Mento
): Promise<boolean> {
  if (!state.tokenToSell || !state.tokenToBuy) {
    return false
  }

  try {
    // Simple check - returns true if tradable, false if not
    const isTradable = await mento.isPairTradable(
      state.tokenToSell,
      state.tokenToBuy
    )
    return isTradable
  } catch (error) {
    // Pair doesn't exist or network error
    console.error('Error checking pair tradability:', error)
    return false
  }
}

// React example
function TradingForm() {
  const [tokenToSell, setTokenToSell] = useState<string>('')
  const [tokenToBuy, setTokenToBuy] = useState<string>('')
  const [isTradable, setIsTradable] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    async function checkPair() {
      if (!tokenToSell || !tokenToBuy) {
        setIsTradable(false)
        return
      }

      setIsLoading(true)
      try {
        const tradable = await mento.isPairTradable(tokenToSell, tokenToBuy)
        setIsTradable(tradable)
      } catch (error) {
        setIsTradable(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkPair()
  }, [tokenToSell, tokenToBuy])

  return (
    <div>
      <select onChange={(e) => setTokenToSell(e.target.value)}>
        {/* token options */}
      </select>
      <select onChange={(e) => setTokenToBuy(e.target.value)}>
        {/* token options */}
      </select>
      
      {isLoading && <p>Checking tradability...</p>}
      {!isLoading && !isTradable && tokenToSell && tokenToBuy && (
        <p style={{ color: 'red' }}>
          ⚠️ Trading is currently disabled for this pair
        </p>
      )}
      
      <button disabled={!isTradable || isLoading}>
        Swap
      </button>
    </div>
  )
}
```

