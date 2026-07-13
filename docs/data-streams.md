# Chainlink Data Streams (verify-on-swap)

> **Status: beta.** The on-chain contracts this feature targets (`PullOracleRelayerFactory`,
> `RouterWithReports`) are not yet deployed to mainnet. The SDK surface is stable and additive, but
> the end-to-end path only works once those contracts are deployed and a factory address is
> supplied. Keep it behind a feature flag in consuming apps until then.

The Data Streams path lets a swap carry its own fresh, DON-signed price report. Instead of relying on
a push oracle updated by a keeper, the rate is verified and written **at swap time** (verify-on-swap):
the caller fetches signed reports off-chain, and the swap transaction verifies them on-chain and
composes the rate before executing. There is no Mento-operated keeper.

## ⚠️ Server-only: never expose the credentials to the browser

Fetching reports requires the Data Streams **HMAC `userSecret`**. It authenticates your subscription
and **must never reach client-side code**. Always build the swap transaction on a server (an API
route, a backend service) and send only the resulting calldata to the browser.

- `DataStreamsClient` and anything that fetches reports (`mento.reports`, `buildSwapWithReportsParams`)
  are **server-only**.
- The `@chainlink/data-streams-sdk` dependency is imported lazily, so it stays out of client bundles —
  but that is a safety net, not a licence to call these APIs from the browser.

## Credentials

```ts
interface DataStreamsCredentials {
  apiKey: string
  userSecret: string
  baseUrl?: string // defaults to https://api.dataengine.chain.link (mainnet)
}
```

Provide them via environment variables on the server, e.g.:

```bash
DATA_STREAMS_API_KEY=...
DATA_STREAMS_USER_SECRET=...
DATA_STREAMS_BASE_URL=            # optional; e.g. https://api.testnet-dataengine.chain.link for testnet
```

Mainnet and testnet use **different endpoints and different credentials/entitlements** — a mainnet key
does not authenticate against the testnet endpoint.

## Setup

Pass `dataStreams` credentials (and, until the factory is in the address registry, an explicit
`pullOracleRelayerFactory` address) to `Mento.create`:

```ts
import { Mento } from '@mento-protocol/mento-sdk'

const mento = await Mento.create(chainId, publicClient, {
  dataStreams: {
    apiKey: process.env.DATA_STREAMS_API_KEY!,
    userSecret: process.env.DATA_STREAMS_USER_SECRET!,
    baseUrl: process.env.DATA_STREAMS_BASE_URL, // optional
  },
  pullOracleRelayerFactory: process.env.PULL_ORACLE_RELAYER_FACTORY!,
})
```

Both options are optional. Omit them and `Mento` behaves exactly as before — `mento.reports` is
`undefined` and the pull-oracle methods are unavailable. This makes the feature fully
backward-compatible.

The architecture is provider-agnostic: `mento.reports` is a `PullOracleService` that resolves each
rate feed's provider from its on-chain relayer adapter (`adapter().provider()`) and picks the
matching `IOracleDataSource`. `dataStreams` credentials register the Chainlink Data Streams source;
additional providers (Pyth, RedStone, ...) can be injected via `oracleSources`.

## Building a verify-on-swap transaction

```ts
const { params, amountOutMin, expectedAmountOut } = await mento.swap.buildSwapWithReportsParams(
  tokenIn,
  tokenOut,
  amountIn,
  recipient,
  { slippageTolerance, deadline },
)
// `params` is { to, data, value } — return it to the client to sign and send.
```

`buildSwapWithReportsParams` throws if `Mento` was created without any oracle data source. It
fetches the provider update blob for each hop's rate feed, then encodes a call to
`RouterWithReports`. `params.value` carries the total native verification fee (0 for Chainlink on
Celo) — the router requires an exact match, so send it verbatim.

## Lower-level API

`mento.reports` (a `PullOracleService`, defined only when at least one source was supplied) exposes
the building blocks, all server-only:

| Method | Purpose |
|---|---|
| `resolveRelayer(rateFeedId)` | rateFeedId → deployed relayer address (via the factory) |
| `resolveLegs(rateFeedId)` | the relayer's legs (provider feedIds + invert flags) |
| `resolveProvider(rateFeedId)` | which oracle provider serves the feed (via the on-chain adapter) |
| `fetchUpdateData(rateFeedId)` | fetch the opaque update blob (+ verification fee) for a rate feed |
| `fetchUpdateDataForPools(pools)` | `updateDataPerHop` + total fee for a swap route |
| `buildIngestParams(rateFeedId, update?)` | calldata (+ value) to relay an update into `SortedOracles` |

`DataStreamsClient` is the thin HMAC-authenticated wrapper over the official
`@chainlink/data-streams-sdk` (report fetching + a short TTL cache). Prefer `mento.reports`; reach for
`DataStreamsClient` directly only if you need raw report access.

## Report schemas

The client decodes **V3** (crypto, feedId prefix `0x0003`, has `bid`/`ask`) and **V8** (RWA/forex,
prefix `0x0008`, has `marketStatus`; the price comes from the report's `midPrice`, surfaced as
`price`) reports. It **throws** on any other schema version rather than returning a mis-decoded price.
The V8 schema supersedes the now-deprecated V4 (`0x0004`) forex schema. A subscription may be
provisioned for feeds of other schemas; those are not supported by the swap path.
