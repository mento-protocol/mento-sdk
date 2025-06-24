/**
 * Route Fetching Logic Tests
 *
 * Tests the SDK's route finding functionality with specific swap scenarios.
 */

import {
  BiPoolManager__factory,
  IBreakerBox__factory,
  IBroker__factory,
} from '@mento-protocol/mento-core-ts'
import { Contract, providers } from 'ethers'
import { IMentoRouter__factory } from 'mento-router-ts'
import { buildRouteDisplay } from '../scripts/quotes/spread'
import { Mento, TradablePair } from './mento'
import { findTokenBySymbol } from './utils'

// Simplified mock setup - only what's actually needed
jest.mock('@mento-protocol/mento-core-ts', () => ({
  IBroker__factory: {
    connect: jest.fn(),
  },
  BiPoolManager__factory: {
    connect: jest.fn(),
  },
  IBreakerBox__factory: {
    connect: jest.fn(),
  },
}))

jest.mock('mento-router-ts', () => ({
  IMentoRouter__factory: {
    connect: jest.fn(),
  },
}))

jest.mock('ethers', () => ({
  ...jest.requireActual('ethers'),
  Contract: jest.fn(),
}))

// Mock provider for testing
const mockProvider = new providers.JsonRpcProvider()
mockProvider.getNetwork = jest
  .fn()
  .mockResolvedValue({ chainId: 42220, name: 'celo' })

// Simplified mock setup
const mockBroker = {
  address: 'fakeBrokerAddr',
  getExchangeProviders: jest.fn(() => []),
  getAmountIn: jest.fn(),
  getAmountOut: jest.fn(),
}

const mockRouter = {
  address: 'fakeRouterAddr',
  getAmountIn: jest.fn(),
  getAmountOut: jest.fn(),
}

const fakeRegistryContract = {
  getAddressForString: jest.fn(() => 'fakeBrokerAddr'),
}

// @ts-ignore
IBroker__factory.connect.mockReturnValue(mockBroker)
// @ts-ignore
IMentoRouter__factory.connect.mockReturnValue(mockRouter)
// @ts-ignore
BiPoolManager__factory.connect.mockReturnValue({
  breakerBox: jest.fn(() => 'fakeBreakerBoxAddr'),
})
// @ts-ignore
IBreakerBox__factory.connect.mockReturnValue({
  getRateFeedTradingMode: jest.fn(),
})

// @ts-ignore
Contract.mockImplementation((contractAddr: string) => {
  if (contractAddr === '0x000000000000000000000000000000000000ce10') {
    return fakeRegistryContract
  }
  return {
    symbol: jest.fn(() => 'MOCK'),
    populateTransaction: {
      increaseAllowance: jest.fn(),
    },
  }
})

// Token addresses from mainnet (chain 42220) - these should eventually reference constants
const TOKENS = {
  cUSD: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
  cEUR: '0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73',
  cREAL: '0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787',
  USDC: '0xcebA9300f2b948710d2653dD7B07f33A8B32118C',
  axlUSDC: '0xEB466342C4d449BC9f53A865D5Cb90586f405215',
  USDT: '0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e',
  CELO: '0x471EcE3750Da237f93B8E339c536989b8978a438',
  eXOF: '0x73F93dcc49cB8A239e2032663e9475dd5ef29A08',
}

// Simplified helper function for checking intermediate tokens
function hasIntermediateToken(
  route: TradablePair | null,
  tokenAddress: string
): boolean {
  return route?.path.some((hop) => hop.assets.includes(tokenAddress)) ?? false
}

describe('Route Fetching Logic', () => {
  let mento: Mento
  let allPairs: readonly TradablePair[]

  beforeAll(async () => {
    mento = await Mento.create(mockProvider)
    allPairs = await mento.getTradablePairsWithPath({ cached: true })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Token Discovery and Route Finding', () => {
    it('should find all required tokens and verify their addresses', () => {
      const expectedTokens = Object.entries(TOKENS)

      for (const [symbol, expectedAddress] of expectedTokens) {
        const displaySymbol = symbol === 'USDT' ? 'USD₮' : symbol
        const foundAddress = findTokenBySymbol(allPairs, displaySymbol)

        expect(foundAddress).toBe(expectedAddress)
      }
    })

    it('should find optimized routes for key token pairs', async () => {
      // Test axlUSDC => USDC route through cUSD (not cREAL)
      const axlUsdcToUsdc = await mento.findPairForTokens(
        TOKENS.axlUSDC,
        TOKENS.USDC
      )
      expect(axlUsdcToUsdc.assets.map((a) => a.address)).toContain(
        TOKENS.axlUSDC
      )
      expect(axlUsdcToUsdc.assets.map((a) => a.address)).toContain(TOKENS.USDC)
      expect(hasIntermediateToken(axlUsdcToUsdc, TOKENS.cUSD)).toBe(true)
      expect(hasIntermediateToken(axlUsdcToUsdc, TOKENS.cREAL)).toBe(false)

      // Test USDC => USDT route through cUSD
      const usdcToUsdt = await mento.findPairForTokens(TOKENS.USDC, TOKENS.USDT)
      expect(usdcToUsdt.assets.map((a) => a.address)).toContain(TOKENS.USDC)
      expect(usdcToUsdt.assets.map((a) => a.address)).toContain(TOKENS.USDT)
      expect(hasIntermediateToken(usdcToUsdt, TOKENS.cUSD)).toBe(true)

      // Test direct routes
      const cEurToReal = await mento.findPairForTokens(
        TOKENS.cEUR,
        TOKENS.cREAL
      )
      expect(cEurToReal.assets.map((a) => a.address)).toContain(TOKENS.cEUR)
      expect(cEurToReal.assets.map((a) => a.address)).toContain(TOKENS.cREAL)
    })
  })

  describe('Route Structure Validation', () => {
    it('should have consistent route structure and connectivity', () => {
      allPairs.forEach((pair) => {
        // Verify pair ID format (symbols in alphabetical order)
        const sortedSymbols = pair.assets.map((a) => a.symbol).sort()
        expect(pair.id).toBe(`${sortedSymbols[0]}-${sortedSymbols[1]}`)

        // Verify path structure
        pair.path.forEach((hop) => {
          expect(hop.assets).toHaveLength(2)
          expect(hop.providerAddr).toBeTruthy()
          expect(hop.id).toBeTruthy()
        })

        // Verify multi-hop connectivity
        if (pair.path.length > 1) {
          for (let i = 0; i < pair.path.length - 1; i++) {
            const currentHop = pair.path[i]
            const nextHop = pair.path[i + 1]
            const hasSharedAsset = currentHop.assets.some((asset) =>
              nextHop.assets.includes(asset)
            )
            expect(hasSharedAsset).toBe(true)
          }
        }
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle non-existent token addresses', () => {
      const fakeAddress = '0x1234567890123456789012345678901234567890'
      const result = findTokenBySymbol(allPairs, fakeAddress)
      expect(result).toBeNull()
    })
  })

  describe('Route Display Functionality', () => {
    it('should correctly display multi-hop route through CELO hub', async () => {
      // Find the cUSD-eXOF route that goes through CELO
      const cUsdToExof = await mento.findPairForTokens(TOKENS.cUSD, TOKENS.eXOF)

      // Verify this is a multi-hop route
      expect(cUsdToExof.path.length).toBe(2)

      // Verify it goes through CELO as intermediate token
      expect(hasIntermediateToken(cUsdToExof, TOKENS.CELO)).toBe(true)

      // Test route display in both directions
      const cUsdToExofDisplay = buildRouteDisplay(
        cUsdToExof,
        'cUSD',
        'eXOF',
        allPairs
      )
      const exofToCUsdDisplay = buildRouteDisplay(
        cUsdToExof,
        'eXOF',
        'cUSD',
        allPairs
      )

      // Both should show CELO as the intermediate token
      expect(cUsdToExofDisplay).toBe('cUSD → CELO → eXOF')
      expect(exofToCUsdDisplay).toBe('eXOF → CELO → cUSD')
    })

    it('should correctly display direct routes', async () => {
      // Find a direct route (single hop)
      const usdcToUsdt = await mento.findPairForTokens(TOKENS.USDC, TOKENS.USDT)

      // If this is a direct route, it should display simply
      if (usdcToUsdt.path.length === 1) {
        const display = buildRouteDisplay(usdcToUsdt, 'USDC', 'USDT', allPairs)
        expect(display).toBe('USDC → USDT')
      }
    })

    it('should handle routes with multiple intermediate tokens', async () => {
      // Find a route that might have multiple intermediates
      const axlUsdcToUsdt = await mento.findPairForTokens(
        TOKENS.axlUSDC,
        TOKENS.USDT
      )

      const display = buildRouteDisplay(
        axlUsdcToUsdt,
        'axlUSDC',
        'USD₮',
        allPairs
      )

      // Should start with axlUSDC and end with USD₮ (the display symbol for USDT)
      expect(display.startsWith('axlUSDC')).toBe(true)
      expect(display.endsWith('USD₮')).toBe(true)

      // Should contain arrows for multi-hop
      if (axlUsdcToUsdt.path.length > 1) {
        expect(display).toContain('→')
      }
    })
  })
})
