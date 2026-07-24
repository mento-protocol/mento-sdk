#!/usr/bin/env node
// Verify-on-swap E2E against a Celo Sepolia fork: build a USDm -> EURm swap whose tx
// carries a freshly-signed EUR/USD Data Streams report (RouterWithReports ingests and
// verifies it before pricing), send it, and confirm both the swap and the oracle write.
//
// Prereqs (see script/devnet-deploy-datastreams.sh in mento-core + the runbook):
//   - pull-oracle stack deployed, relayer authorized on SortedOracles
//   - registry Router upgraded to RouterWithReports (devnet: anvil_setCode)
//   - sender holds USDm and has approved the Router
//
// Usage:
//   FACTORY=0x... node scripts/devnet-e2e-swap.mjs [RPC_URL]
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const { Mento } = require('../dist/index.js')
const { createPublicClient, createWalletClient, http, formatUnits, parseUnits } = require('viem')
const { privateKeyToAccount } = require('viem/accounts')
const { celoSepolia } = require('viem/chains')

const RPC_URL = process.argv[2] ?? 'http://34.32.22.77:8545'
const USDM = '0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b'
const EURM = '0xA99dC247d6b7B2E3ab48a1fEE101b83cD6aCd82a'
const RATE_FEED_EUR_USD = '0x5D5a22116233BDb2a9C2977279cC348B8b8Ce917'
const SORTED_ORACLES = '0xfaa7Ca2B056E60F6733aE75AA0709140a6eAfD20'
// Anvil's well-known default account #0 (funded on every fork; not a secret).
const ANVIL_PK = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
const AMOUNT_IN = parseUnits('0.01', 18) // pool liquidity is tiny (~1 USDm) — keep the swap small

function loadTestnetCreds() {
  let { DATA_STREAMS_TESTNET_API_KEY: apiKey, DATA_STREAMS_TESTNET_USER_SECRET: userSecret } = process.env
  if (!apiKey || !userSecret) {
    const envPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../.env')
    for (const line of readFileSync(envPath, 'utf8').split('\n')) {
      const m = line.match(/^(DATA_STREAMS_TESTNET_API_KEY|DATA_STREAMS_TESTNET_USER_SECRET)=(.*)$/)
      if (m) {
        const val = m[2].trim().replace(/^["']|["']$/g, '')
        if (m[1].endsWith('API_KEY')) apiKey ??= val
        else userSecret ??= val
      }
    }
  }
  if (!apiKey || !userSecret) throw new Error('Data Streams testnet credentials not found (env or .env)')
  return { apiKey, userSecret, baseUrl: 'https://api.testnet-dataengine.chain.link' }
}

const factory = process.env.FACTORY
if (!factory) throw new Error('Set FACTORY=<PullOracleRelayerFactory proxy address>')

const publicClient = createPublicClient({ chain: celoSepolia, transport: http(RPC_URL) })
const account = privateKeyToAccount(ANVIL_PK)
const walletClient = createWalletClient({ account, chain: celoSepolia, transport: http(RPC_URL) })

const ERC20_ABI = [
  { type: 'function', name: 'balanceOf', stateMutability: 'view', inputs: [{ type: 'address' }], outputs: [{ type: 'uint256' }] },
]
const SO_ABI = [
  { type: 'function', name: 'medianTimestamp', stateMutability: 'view', inputs: [{ type: 'address' }], outputs: [{ type: 'uint256' }] },
]

const balances = async () => ({
  usdm: await publicClient.readContract({ address: USDM, abi: ERC20_ABI, functionName: 'balanceOf', args: [account.address] }),
  eurm: await publicClient.readContract({ address: EURM, abi: ERC20_ABI, functionName: 'balanceOf', args: [account.address] }),
  medianTs: await publicClient.readContract({ address: SORTED_ORACLES, abi: SO_ABI, functionName: 'medianTimestamp', args: [RATE_FEED_EUR_USD] }),
})

const mento = await Mento.create(celoSepolia.id, publicClient, {
  dataStreams: loadTestnetCreds(),
  pullOracleRelayerFactory: factory,
})

const before = await balances()
console.log(`Before: USDm=${formatUnits(before.usdm, 18)} EURm=${formatUnits(before.eurm, 18)} medianTs=${before.medianTs}`)

console.log(`Building swap USDm -> EURm (${formatUnits(AMOUNT_IN, 18)} in) with a fresh signed report...`)
const deadline = BigInt(Math.floor(Date.now() / 1000) + 600)
const swap = await mento.swap.buildSwapWithReportsParams(USDM, EURM, AMOUNT_IN, account.address, {
  slippageTolerance: 1, // 1%
  deadline,
})
console.log(`expectedOut=${formatUnits(swap.expectedAmountOut, 18)} EURm, minOut=${formatUnits(swap.amountOutMin, 18)}, fee=${swap.params.value}`)

// Pin the fork clock to wall time so the carried report is neither "future" nor stale.
const nowSec = Math.floor(Date.now() / 1000)
const block = await publicClient.getBlock()
const nextTs = Math.max(nowSec, Number(block.timestamp) + 1)
await publicClient.request({ method: 'evm_setNextBlockTimestamp', params: [`0x${nextTs.toString(16)}`] })

const hash = await walletClient.sendTransaction({
  to: swap.params.to,
  data: swap.params.data,
  value: BigInt(swap.params.value ?? 0),
  gas: 5_000_000n, // skip estimation: it would run against the un-pinned fork clock
  gasPrice: 2_000_000_000_000n, // 2000 gwei legacy — Celo fork quirk
})
console.log(`swap tx: ${hash}`)
const receipt = await publicClient.waitForTransactionReceipt({ hash })
console.log(`status: ${receipt.status}, gasUsed: ${receipt.gasUsed}`)
if (receipt.status !== 'success') throw new Error('swap transaction reverted')

const after = await balances()
console.log(`After:  USDm=${formatUnits(after.usdm, 18)} EURm=${formatUnits(after.eurm, 18)} medianTs=${after.medianTs}`)

const spent = before.usdm - after.usdm
const received = after.eurm - before.eurm
if (spent !== AMOUNT_IN) throw new Error(`expected to spend ${AMOUNT_IN} USDm, spent ${spent}`)
if (received < swap.amountOutMin) throw new Error(`received ${received} < minOut ${swap.amountOutMin}`)
if (after.medianTs <= before.medianTs) throw new Error('oracle median timestamp did not advance — report was not ingested in the swap')
console.log(`\nE2E PASS: swapped ${formatUnits(spent, 18)} USDm -> ${formatUnits(received, 18)} EURm; ` +
  `oracle refreshed in the same tx (medianTs +${after.medianTs - before.medianTs}s)`)
