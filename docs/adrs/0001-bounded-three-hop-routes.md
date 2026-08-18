# ADR 0001: Add bounded three-hop routes only for newly reachable pairs

- **Status:** Accepted
- **Date:** 2026-08-18
- **Scope:** Route discovery, route cache generation, and route consumers
- **Decision owner:** Mento SDK maintainers
- **Supersedes:** None

## Context

The SDK discovers direct and two-hop swap routes from the pool graph. Tokens
are graph nodes. Pools are bidirectional graph edges. A hop is one pool swap.

The deployed Mento Router accepts a non-empty route array and processes each
hop in order. The SDK path encoder and swap services also process route paths
as arrays. The protocol and transaction encoding therefore do not impose the
current two-hop limit. The limit comes from the route-discovery algorithm.

Polygon demonstrates the missing coverage. Its relevant pool graph is:

```text
USDC -- USDm -- EURm -- EUROP
```

`USDC` and `EUROP` are connected, but their minimum path length is three.
The current SDK does not discover or cache this pair.

Increasing the maximum path length without an eligibility rule would also
create three-hop alternatives for pairs that already have direct or two-hop
paths. Those alternatives increase cache generation work, cache size, swap
gas, cumulative fees, and the number of pools that can block execution. They
do not add endpoint coverage.

## Decision drivers

- Add endpoint coverage where the pool graph requires three swaps.
- Keep direct and two-hop routing behavior unchanged.
- Do not add longer detours for pairs that the SDK already supports.
- Keep route generation deterministic and bounded.
- Use the same eligibility rule for generated caches and fresh discovery.
- Avoid protocol contract changes.

## Decision

The SDK will support routes with a maximum length of three hops.

A three-hop route is eligible only when the minimum structural path length
between its endpoint tokens is exactly three. The pair must have no direct or
two-hop path in the discovered pool graph.

This rule has the following requirements:

1. Discover all endpoint pairs reachable in one or two hops before considering
   three-hop routes.
2. Exclude every three-hop route whose endpoints are already reachable in one
   or two hops.
3. Enumerate only simple paths. A path must not repeat a token or pool.
4. Treat a route and its reverse as one path for cache-generation purposes.
5. Apply the same maximum and eligibility rule to cached and fresh discovery.
6. Keep all existing direct and two-hop routes unchanged.
7. Do not discover or cache routes longer than three hops.

Path existence is structural. It depends on discovered pools, not current
liquidity, circuit-breaker state, oracle availability, or trading-limit
capacity. A temporarily unavailable direct or two-hop path still makes a
three-hop detour ineligible. Runtime failover is outside this decision.

If several eligible three-hop paths connect the same newly reachable pair,
the normal route-cost and route-selection policy applies within that
three-hop tier. This decision does not permit a three-hop candidate to compete
with a direct or two-hop route.

The Router contracts, Router ABI, public `Route` type, and path encoding do not
change.

## Current chain impact

The following snapshot was derived from live pool discovery on 2026-08-18.
The counts describe unique endpoint pairs after reverse-path deduplication.
They are evidence for this decision, not permanent network configuration.

| Chain         | Evidence block | Pairs with at most 2 hops | Pairs with at most 3 hops | Newly reachable pairs |
| ------------- | -------------: | ------------------------: | ------------------------: | --------------------: |
| Polygon       |     92,243,701 |                         5 |                         6 |                     1 |
| Polygon Amoy  |     45,252,138 |                         5 |                         6 |                     1 |
| Celo          |     75,169,819 |                       155 |                       171 |                    16 |
| Celo Sepolia  |     33,786,552 |                       155 |                       171 |                    16 |
| Monad         |     97,108,587 |                        28 |                        28 |                     0 |
| Monad Testnet |     54,841,762 |                        28 |                        28 |                     0 |
| Base Sepolia  |     45,651,145 |                         1 |                         1 |                     0 |

The current route cache contains 377 routes. This decision adds 34 routes for
the current graphs, for a total of 411 routes and a 9.0% increase.

Polygon and Polygon Amoy gain `USDC` to `EUROP` through:

```text
USDC -- USDm -- EURm -- EUROP
```

Celo and Celo Sepolia gain routes between `axlEUROC` and these 16 tokens:

```text
AUDm, BRLm, CADm, CHFm, COPm, GBPm, GHSm, JPYm,
KESm, NGNm, PHPm, USDC, USD₮, XOFm, ZARm, axlUSDC
```

Monad, Monad Testnet, and Base Sepolia gain no routes under the current pool
graphs. The shared algorithm still applies to those chains if their pool
graphs change.

## Consequences

### Positive

- The SDK supports every pair whose minimum path length is at most three.
- Polygon applications can offer the intended `USDC` to `EUROP` route.
- The eligibility rule adds coverage without adding longer alternatives for
  existing pairs.
- The maximum path length gives route discovery and execution a clear bound.
- No contract deployment or ABI change is necessary.

### Negative

- A three-hop swap executes one more pool swap than a two-hop swap. It uses
  more gas and compounds one more pool fee.
- A three-hop route can fail when any of its three pools is unavailable.
- Cache generation performs more graph work and pool-cost reads.
- Consumers that infer supported pairs from the route cache will expose the
  newly reachable pairs after the cache update.
- Route-level safety checks must inspect all pools. A check that inspects only
  the first pool is insufficient.

### Neutral or unchanged

- Existing direct and two-hop endpoint coverage does not change.
- The cached route lookup remains constant-time after initialization.
- Chains with no pair at minimum distance three receive no new cache entries.
- Current applications that already iterate over `route.path` can process the
  additional hop without an API change.

## Required invariants

An implementation that follows this ADR must prove these invariants:

- A pair with a direct path receives no three-hop cache entry.
- A pair with a two-hop path receives no three-hop cache entry.
- A pair whose minimum path length is three receives an eligible route.
- A route never repeats a token or pool.
- Forward and reverse discovery produce one canonical cached path.
- Cached and fresh discovery expose the same endpoint coverage for the same
  pool graph.
- Existing direct and two-hop route fixtures do not change unexpectedly.
- Cache generation fails instead of writing a partial route set after a pool
  discovery or route-cost failure.

## Alternatives considered

### Keep the two-hop maximum

Rejected. It leaves structurally connected pairs unsupported. Polygon
`USDC` to `EUROP` is the current production example.

### Cache every simple path with at most three hops

Rejected. It adds longer alternatives for already supported pairs. These
routes add cache and execution cost without adding endpoint coverage. Future
pool cycles would make this growth larger and less predictable.

### Discover three-hop routes only on named chains

Rejected. Chain-specific routing rules would drift. A graph-based eligibility
rule gives every supported chain the same behavior and adds entries only where
the graph requires them.

### Discover longer routes on demand after a cache miss

Rejected. Cached and fresh behavior would differ. Results would also depend on
RPC availability and add latency to a normal route lookup.

### Use unbounded shortest-path discovery

Rejected. Longer routes increase gas, cumulative fees, and failure surface.
The SDK needs an explicit execution bound.

## Out of scope

- Routes longer than three hops.
- Runtime failover around a closed, depleted, or limited shorter path.
- Split routing across several paths.
- Amount-dependent best execution or price-impact optimization.
- Expanding parallel pools on one token edge into distinct multi-hop route
  combinations. Multi-hop discovery keeps the existing edge-selection policy.
- Changes to Router contracts or deployed protocol configuration.
- The implementation task breakdown and delivery sequence.

## Evidence

- SDK route discovery: [`src/utils/routeUtils.ts`](../../src/utils/routeUtils.ts)
- Cached and fresh route loading: [`src/services/routes/RouteService.ts`](../../src/services/routes/RouteService.ts)
- Router path encoding: [`src/utils/pathEncoder.ts`](../../src/utils/pathEncoder.ts)
- Cache generation: [`scripts/cacheRoutes/index.ts`](../../scripts/cacheRoutes/index.ts)
- Generated route cache: [`src/cache/routes.ts`](../../src/cache/routes.ts)
- SDK source revision: `7b7037c8a3ca72be846c4768504829ac53044618`
- Router source revision used for behavior verification:
  `mento-core@07ecf3df5650a33ea6957f1ad2966e02c5082253`
- Deployment metadata revision used for chain and address verification:
  `deployments-v2@7b02f6a61c1eb646742c74b516f827b2c305acf1`
- Representative three-hop `getAmountsOut` calls succeeded on Polygon,
  Polygon Amoy, Celo, and Celo Sepolia during the 2026-08-18 analysis.
