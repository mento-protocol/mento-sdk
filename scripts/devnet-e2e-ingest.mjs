#!/usr/bin/env node
// End-to-end pull-oracle test against a Celo Sepolia fork (devnet or local anvil):
// fetch a real signed EUR/USD report from the Chainlink Data Streams testnet API via
// the SDK, submit it through the permissionless Factory.ingest path, and confirm the
// SortedOracles median updates to the report price.
//
// Usage:
//   FACTORY=0x... node scripts/devnet-e2e-ingest.mjs [RPC_URL]
//
// Credentials: DATA_STREAMS_TESTNET_API_KEY / DATA_STREAMS_TESTNET_USER_SECRET, read
// from the environment or from ../mento-sdk/.env (the main checkout).
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const { Mento } = require('../dist/index.js')
const { createPublicClient, createWalletClient, http, formatUnits } = require('viem')
const { privateKeyToAccount } = require('viem/accounts')
const { celoSepolia } = require('viem/chains')

const RPC_URL = process.argv[2] ?? 'http://34.32.22.77:8545'
const RATE_FEED_EUR_USD = '0x5D5a22116233BDb2a9C2977279cC348B8b8Ce917'
const SORTED_ORACLES = '0xfaa7Ca2B056E60F6733aE75AA0709140a6eAfD20'
// Anvil's well-known default account #0 (funded on every fork; not a secret).
const ANVIL_PK = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'

function loadTestnetCreds() {
  let { DATA_STREAMS_TESTNET_API_KEY: apiKey, DATA_STREAMS_TESTNET_USER_SECRET: userSecret } = process.env
  if (!apiKey || !userSecret) {
    const envPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../mento-sdk/.env')
    for (const line of readFileSync(envPath, 'utf8').split('\n')) {
      const m = line.match(/^(DATA_STREAMS_TESTNET_API_KEY|DATA_STREAMS_TESTNET_USER_SECRET)=(.*)$/)
      if (m) {
        const val = m[2].trim().replace(/^["']|["']$/g, '')
        if (m[1].endsWith('API_KEY')) apiKey ??= val
        else userSecret ??= val
      }
    }
  }
  if (!apiKey || !userSecret) throw new Error('Data Streams testnet credentials not found (env or ../mento-sdk/.env)')
  return { apiKey, userSecret, baseUrl: 'https://api.testnet-dataengine.chain.link' }
}

const factory = process.env.FACTORY
if (!factory) throw new Error('Set FACTORY=<PullOracleRelayerFactory proxy address>')

const publicClient = createPublicClient({ chain: celoSepolia, transport: http(RPC_URL) })
const account = privateKeyToAccount(ANVIL_PK)
const walletClient = createWalletClient({ account, chain: celoSepolia, transport: http(RPC_URL) })

const SORTED_ORACLES_ABI = [
  {
    type: 'function', name: 'medianRate', stateMutability: 'view',
    inputs: [{ type: 'address' }], outputs: [{ type: 'uint256' }, { type: 'uint256' }],
  },
  {
    type: 'function', name: 'medianTimestamp', stateMutability: 'view',
    inputs: [{ type: 'address' }], outputs: [{ type: 'uint256' }],
  },
]

async function readMedian(label) {
  const [[rate], ts] = await Promise.all([
    publicClient.readContract({ address: SORTED_ORACLES, abi: SORTED_ORACLES_ABI, functionName: 'medianRate', args: [RATE_FEED_EUR_USD] }),
    publicClient.readContract({ address: SORTED_ORACLES, abi: SORTED_ORACLES_ABI, functionName: 'medianTimestamp', args: [RATE_FEED_EUR_USD] }),
  ])
  console.log(`${label}: median=${formatUnits(rate, 24)} EUR/USD, medianTimestamp=${ts} (${new Date(Number(ts) * 1000).toISOString()})`)
  return { rate, ts }
}

const mento = await Mento.create(celoSepolia.id, publicClient, {
  dataStreams: loadTestnetCreds(),
  pullOracleRelayerFactory: factory,
})

console.log(`RPC: ${RPC_URL}`)
console.log(`Factory: ${factory}`)
console.log(`Relayer: ${await mento.reports.resolveRelayer(RATE_FEED_EUR_USD)} (provider: ${await mento.reports.resolveProvider(RATE_FEED_EUR_USD)})`)

const before = await readMedian('Before')

console.log('Fetching signed EUR/USD report from Data Streams testnet API...')
const update = await mento.reports.fetchUpdateData(RATE_FEED_EUR_USD)
console.log(`updateData: ${update.updateData.length / 2 - 1} bytes, fee: ${update.fee}`)

// Fork clocks drift from wall time; the relayer rejects reports observed "in the future"
// (FutureReport) or too old (StaleReport). Pin the next block to real time before ingesting.
const nowSec = Math.floor(Date.now() / 1000)
const block = await publicClient.getBlock()
const nextTs = Math.max(nowSec, Number(block.timestamp) + 1)
await publicClient.request({ method: 'evm_setNextBlockTimestamp', params: [`0x${nextTs.toString(16)}`] })
console.log(`Fork clock: block ts=${block.timestamp}, pinned next block to ${nextTs} (drift ${nextTs - Number(block.timestamp)}s)`)

const params = await mento.reports.buildIngestParams(RATE_FEED_EUR_USD, update)
// Explicit gas: estimation would run against the un-pinned fork clock and can trip FutureReport.
// Legacy tx priced above the (high) Celo base fee — required quirk on Celo forks.
const hash = await walletClient.sendTransaction({
  to: params.to,
  data: params.data,
  value: BigInt(params.value ?? 0),
  gas: 5_000_000n,
  gasPrice: 2_000_000_000_000n, // 2000 gwei
})
console.log(`ingest tx: ${hash}`)
const receipt = await publicClient.waitForTransactionReceipt({ hash })
console.log(`status: ${receipt.status}, gasUsed: ${receipt.gasUsed}`)
if (receipt.status !== 'success') throw new Error('ingest transaction reverted')

const after = await readMedian('After')
if (after.ts <= before.ts) throw new Error('median timestamp did not advance — ingest had no effect')
console.log(`\nE2E PASS: median moved ${formatUnits(before.rate, 24)} -> ${formatUnits(after.rate, 24)}, timestamp advanced by ${after.ts - before.ts}s`)
