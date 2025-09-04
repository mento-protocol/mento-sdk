#!/usr/bin/env ts-node

/**
 * Calculate costs needed for token swap tests
 *
 * Usage:
 * - Default (Celo mainnet): yarn calculateTestEUR
 * - Specific chain: yarn calculateTestEUR --chain=alfajores
 * - Specific chainId: yarn calculateTestEUR --chainId=44787
 */

import { utils } from 'ethers'
import yargsParser from 'yargs-parser'
import { Mento } from '../src/mento'
import { validateTokens, getTokenDecimals } from './quotes/utils/token'
import { createProvider, cleanupProvider } from './quotes/utils/provider'
import { calculateSingleQuote } from './quotes/calculator'
import {
  DEFAULT_CHAIN_ID,
  CHAIN_NAME_TO_ID,
  CHAIN_NAMES,
} from './quotes/config'

const DAILY_CONFIG = {
  swapByTokenPairs: 1,
  swapByAmountTypes: 1,
  swapWithCustomSlippage: 1,
  highFrequencyTests: 5,
}
const DEFAULT_TEST_AMOUNT = '0.01'
const DEFAULT_USD_TO_EUR_RATE = 0.85
const GITHUB_RAW_URL =
  'https://raw.githubusercontent.com/mento-protocol/mento-automation-tests/main/specs/app-mento/web/swap/swap-by-token-pairs.spec.ts'
const TOKEN_MAP: Record<string, string> = {
  'Token.CELO': 'CELO',
  'Token.cUSD': 'cUSD',
  'Token.cEUR': 'cEUR',
  'Token.cREAL': 'cREAL',
  'Token.eXOF': 'eXOF',
  'Token.USDT': 'USDT',
  'Token.cKES': 'cKES',
  'Token.PUSO': 'PUSO',
  'Token.cCOP': 'cCOP',
  'Token.USDC': 'USDC',
  'Token.axlUSDC': 'axlUSDC',
  'Token.axlEUROC': 'axlEUROC',
  'Token.cGHS': 'cGHS',
  'Token.cGBP': 'cGBP',
  'Token.cZAR': 'cZAR',
  'Token.cCAD': 'cCAD',
  'Token.cAUD': 'cAUD',
  'Token.cCHF': 'cCHF',
  'Token.cNGN': 'cNGN',
  'Token.cJPY': 'cJPY',
}

/**
 * Format amounts with dynamic precision based on magnitude
 * Shows more decimal places for very small amounts
 */
function formatAmount(amount: number): string {
  if (amount === 0) return '0.00'

  const absAmount = Math.abs(amount)

  // For amounts >= 0.01, use 2 decimal places
  if (absAmount >= 0.01) {
    return amount.toFixed(2)
  }

  // For very small amounts, find the first significant digit and show 4 decimal places from there
  if (absAmount >= 0.001) {
    return amount.toFixed(3)
  }

  if (absAmount >= 0.0001) {
    return amount.toFixed(4)
  }

  if (absAmount >= 0.00001) {
    return amount.toFixed(5)
  }

  if (absAmount >= 0.000001) {
    return amount.toFixed(6)
  }

  // For extremely small amounts, use scientific notation
  return amount.toExponential(3)
}

main().catch((error) => {
  console.error('❌ Script failed:', error)
  process.exit(1)
})

async function main() {
  const { chainId, chainName } = parseArgs()
  console.log(`🧮 Calculating automated swap tests costs on ${chainName}...\n`)

  const [
    swapByTokenPairsTestCases,
    otherTestCases,
    usdToEurRate,
    mento,
    allPairs,
  ] = await Promise.all([
    fetchSwapByTokenPairsTestCases(),
    getOtherTestCases(),
    fetchEURRate(),
    setupMento(chainId),
    setupMento(chainId).then((m) => m.getTradablePairsWithPath()),
  ])

  console.log(
    `✅ Loaded ${swapByTokenPairsTestCases.length} swap-by-token-pairs + ${
      otherTestCases.length
    } other = ${
      swapByTokenPairsTestCases.length + otherTestCases.length
    } total test cases\n`
  )

  const results = await processAllTests(
    [...swapByTokenPairsTestCases, ...otherTestCases],
    allPairs,
    mento,
    createProvider(chainId),
    usdToEurRate
  )
  displayResults(results, chainName, usdToEurRate)
  cleanupProvider(createProvider(chainId))
}

function parseArgs() {
  const argv = yargsParser(process.argv.slice(2), {
    string: ['chain', 'chainId'],
    alias: { c: 'chainId', n: 'chain' },
    default: { chain: '', chainId: '' },
  })

  let chainId = DEFAULT_CHAIN_ID,
    chainName = 'Celo'
  if (argv.chainId) {
    chainId = parseInt(argv.chainId, 10)
    chainName = CHAIN_NAMES[chainId] || `Chain ${chainId}`
  } else if (argv.chain) {
    chainId = CHAIN_NAME_TO_ID[argv.chain.toLowerCase()] || DEFAULT_CHAIN_ID
    chainName = CHAIN_NAMES[chainId] || 'Celo'
  }
  return { chainId, chainName }
}

async function setupMento(chainId: number) {
  return await Mento.create(createProvider(chainId))
}

async function fetchSwapByTokenPairsTestCases(): Promise<TestCase[]> {
  try {
    const response = await fetch(GITHUB_RAW_URL)
    const content = await response.text()
    const match = content.match(/const testCases = \[([\s\S]*?)\];/)
    if (!match) throw new Error('No testCases found')

    const objects = match[1].match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g) || []
    return objects.map(parseTestCase).filter(Boolean) as TestCase[]
  } catch (error) {
    console.log('⚠️  Failed to fetch from GitHub, using fallback')
    return getFallbackTests()
  }
}

function parseTestCase(obj: string): TestCase | null {
  const fromMatch = obj.match(/fromToken:\s*(Token\.\w+)/)
  const toMatch =
    obj.match(/toToken:\s*(Token\.\w+)(?![^,}]*retryDataHelper)/) ||
    obj.match(/toToken:\s*retryDataHelper[^[]*\[([^\]]+)\]/)
  const amountMatch = obj.match(/fromAmount:\s*["']([^"']+)["']/)

  if (!fromMatch) return null

  let toToken = 'cUSD'
  if (toMatch) {
    if (toMatch[0].includes('retryDataHelper')) {
      const tokens = toMatch[1]?.match(/Token\.(\w+)/g)
      toToken = tokens ? resolveToken(tokens[0]) : 'cUSD'
    } else {
      toToken = resolveToken(toMatch[1])
    }
  }

  return {
    fromToken: resolveToken(fromMatch[1]),
    toToken,
    fromAmount: amountMatch?.[1],
    disable: obj.includes('disable:')
      ? { reason: 'Disabled in source' }
      : undefined,
  }
}

function resolveToken(token: string): string {
  return TOKEN_MAP[token] || token.replace('Token.', '')
}

function getOtherTestCases(): TestCase[] {
  return [
    {
      fromToken: 'cEUR',
      toToken: 'CELO',
      executionType: 'swap-with-custom-slippage',
    },
    {
      fromToken: 'CELO',
      toToken: 'cUSD',
      executionType: 'swap-by-amount-types',
    },
    {
      fromToken: 'CELO',
      toToken: 'cUSD',
      executionType: 'swap-by-amount-types',
    },
  ]
}

function getFallbackTests(): TestCase[] {
  return [
    { fromToken: 'CELO', toToken: 'cUSD', disable: { reason: 'Default pair' } },
    { fromToken: 'CELO', toToken: 'cEUR' },
    { fromToken: 'USDT', toToken: 'cUSD' },
    { fromToken: 'USDC', toToken: 'cEUR' },
    { fromToken: 'cGBP', toToken: 'CELO' },
  ]
}

async function fetchEURRate(): Promise<number> {
  try {
    const response = await fetch(
      'https://api.fxratesapi.com/latest?base=USD&currencies=EUR'
    )
    const data = await response.json()
    return data.rates?.EUR || DEFAULT_USD_TO_EUR_RATE
  } catch {
    try {
      const response = await fetch(
        'https://api.exchangerate-api.io/v4/latest/USD'
      )
      const data = await response.json()
      return data.rates?.EUR || DEFAULT_USD_TO_EUR_RATE
    } catch {
      console.log('⚠️  Using fallback EUR rate: 0.85')
      return DEFAULT_USD_TO_EUR_RATE
    }
  }
}

async function convertToUSD(
  testCase: TestCase,
  amount: string,
  amountWei: any,
  allPairs: any,
  mento: Mento,
  provider: any
): Promise<number> {
  if (testCase.fromToken === 'cUSD') return parseFloat(amount)

  try {
    const { fromAddress, toAddress } = validateTokens(
      allPairs,
      testCase.fromToken,
      'cUSD'
    )
    const route = await mento.findPairForTokens(fromAddress, toAddress)
    const quote = await calculateSingleQuote(
      mento,
      route,
      fromAddress,
      toAddress,
      amountWei
    )

    if (quote.successful) {
      const decimals = await getTokenDecimals(toAddress, provider)
      return parseFloat(utils.formatUnits(quote.outputAmount, decimals))
    }
  } catch (error) {
    console.log(
      `  ⚠️  USD conversion failed: ${
        error instanceof Error ? error.message : 'Unknown'
      }`
    )
  }
  return parseFloat(amount)
}

async function processAllTests(
  testCases: TestCase[],
  allPairs: any,
  mento: Mento,
  provider: any,
  usdToEurRate: number
): Promise<TestResult[]> {
  const results: TestResult[] = []

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i]
    const testId = `T${(i + 1).toString().padStart(3, '0')}`

    let dailyExecutions = DAILY_CONFIG.swapByTokenPairs
    let label = '(swap-by-token-pairs)'

    if (testCase.executionType === 'swap-with-custom-slippage') {
      dailyExecutions = DAILY_CONFIG.swapWithCustomSlippage
      label = '(swap-with-custom-slippage)'
    } else if (testCase.executionType === 'swap-by-amount-types') {
      dailyExecutions = DAILY_CONFIG.highFrequencyTests
      label = `(swap-by-amount-types, ${dailyExecutions}x daily)`
    }

    console.log(
      `Processing ${testId}: ${testCase.fromToken} → ${testCase.toToken} ${label}`
    )

    if (testCase.disable) {
      console.log(`  ⏸️  Skipped (disabled): ${testCase.disable.reason}`)
      results.push({
        id: testId,
        fromToken: testCase.fromToken,
        toToken: testCase.toToken,
        fromAmount: testCase.fromAmount || DEFAULT_TEST_AMOUNT,
        fromAmountUSD: 0,
        fromAmountEUR: 0,
        dailyExecutions: 0,
        dailyUSD: 0,
        dailyEUR: 0,
        disabled: true,
      })
      continue
    }

    try {
      const { fromAddress, toAddress } = validateTokens(
        allPairs,
        testCase.fromToken,
        testCase.toToken
      )
      const fromDecimals = await getTokenDecimals(fromAddress, provider)
      const fromAmount = testCase.fromAmount || DEFAULT_TEST_AMOUNT
      const fromAmountWei = utils.parseUnits(fromAmount, fromDecimals)

      const fromAmountUSD = await convertToUSD(
        testCase,
        fromAmount,
        fromAmountWei,
        allPairs,
        mento,
        provider
      )
      const fromAmountEUR = fromAmountUSD * usdToEurRate
      const dailyUSD = fromAmountUSD * dailyExecutions
      const dailyEUR = fromAmountEUR * dailyExecutions

      console.log(
        `  ✅ Amount: ${fromAmount} ${testCase.fromToken} ≈ $${formatAmount(
          fromAmountUSD
        )} ≈ €${formatAmount(fromAmountEUR)}`
      )

      if (dailyExecutions > 1) {
        console.log(
          `  📅 Daily total (${dailyExecutions}x): $${formatAmount(
            dailyUSD
          )} ≈ €${formatAmount(dailyEUR)}`
        )
      }

      results.push({
        id: testId,
        fromToken: testCase.fromToken,
        toToken: testCase.toToken,
        fromAmount,
        fromAmountUSD,
        fromAmountEUR,
        dailyExecutions,
        dailyUSD,
        dailyEUR,
      })
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'
      console.log(`  ❌ Error: ${errorMessage}`)
      results.push({
        id: testId,
        fromToken: testCase.fromToken,
        toToken: testCase.toToken,
        fromAmount: testCase.fromAmount || DEFAULT_TEST_AMOUNT,
        fromAmountUSD: 0,
        fromAmountEUR: 0,
        dailyExecutions: 0,
        dailyUSD: 0,
        dailyEUR: 0,
        error: errorMessage,
      })
    }
  }
  return results
}

function displayResults(
  results: TestResult[],
  chainName: string,
  usdToEurRate: number
) {
  console.log('\n📊 SUMMARY')
  console.log('='.repeat(80))
  console.log(`\nChain: ${chainName}`)
  console.log(`USD to EUR rate: ${usdToEurRate.toFixed(4)}`)

  console.log('\nTest Case Details:')
  results.forEach((r) => {
    const status = r.disabled ? '⏸️ ' : r.error ? '❌' : '✅'
    const info = r.disabled
      ? 'DISABLED'
      : r.error
      ? `ERROR: ${r.error}`
      : `€${formatAmount(r.fromAmountEUR)}`
    console.log(
      `${status} ${r.id}: ${r.fromAmount} ${r.fromToken} → ${r.toToken} = ${info}`
    )
  })

  const enabled = results.filter((r) => !r.disabled && !r.error)
  const singleUSD = enabled.reduce((sum, r) => sum + r.fromAmountUSD, 0)
  const singleEUR = enabled.reduce((sum, r) => sum + r.fromAmountEUR, 0)
  const dailyUSD = enabled.reduce((sum, r) => sum + r.dailyUSD, 0)
  const dailyEUR = enabled.reduce((sum, r) => sum + r.dailyEUR, 0)
  const monthlyUSD = dailyUSD * 30
  const monthlyEUR = dailyEUR * 30
  const yearlyUSD = dailyUSD * 365
  const yearlyEUR = dailyEUR * 365

  console.log('\n💰 COST ESTIMATES')
  console.log('='.repeat(50))
  console.log(
    `Single run: $${formatAmount(singleUSD)} ≈ €${formatAmount(singleEUR)}`
  )
  console.log(`Daily: $${formatAmount(dailyUSD)} ≈ €${formatAmount(dailyEUR)}`)
  console.log(
    `Monthly: $${formatAmount(monthlyUSD)} ≈ €${formatAmount(monthlyEUR)}`
  )
  console.log(
    `Yearly: $${formatAmount(yearlyUSD)} ≈ €${formatAmount(yearlyEUR)}`
  )

  const swapByTokenPairs = enabled.filter(
    (r) => r.dailyExecutions === 1 && r.id < 'T020'
  ).length
  const swapWithCustomSlippage = enabled.filter(
    (r) => r.dailyExecutions === 1 && r.id >= 'T020'
  ).length
  const swapByAmountTypes = enabled.filter(
    (r) => r.dailyExecutions === 5
  ).length

  console.log('\n📊 BREAKDOWN')
  console.log(
    `Swap-by-token-pairs (1x daily): ${swapByTokenPairs} | Swap-with-custom-slippage (1x daily): ${swapWithCustomSlippage} | Swap-by-amount-types (~5x daily): ${swapByAmountTypes}`
  )
  console.log(
    `Budget: Monthly ~$${Math.ceil(monthlyUSD)} | Yearly ~$${Math.ceil(
      yearlyUSD
    )}`
  )
  console.log(
    `${
      yearlyUSD < 100
        ? '💡 Very affordable!'
        : yearlyUSD < 500
        ? '💡 Reasonable costs'
        : '💡 Consider optimization'
    }`
  )

  console.log(
    `\n✅ Success: ${enabled.length} | ⏸️  Disabled: ${
      results.filter((r) => r.disabled).length
    } | ❌ Failed: ${results.filter((r) => r.error).length}`
  )
}

interface TestCase {
  fromToken: string
  toToken: string
  fromAmount?: string
  disable?: any
  executionType?: string
}
interface TestResult {
  id: string
  fromToken: string
  toToken: string
  fromAmount: string
  fromAmountUSD: number
  fromAmountEUR: number
  dailyExecutions: number
  dailyUSD: number
  dailyEUR: number
  disabled?: boolean
  error?: string
}
