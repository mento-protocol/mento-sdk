# Implementation Plan 0001: Bounded three-hop routes

- **Status:** Complete
- **Date:** 2026-08-18
- **Decision:** [ADR 0001](../adrs/0001-bounded-three-hop-routes.md)
- **Coordinator:** Primary Codex agent

## Outcome

Implement deterministic three-hop route discovery for endpoint pairs whose
minimum structural path length is exactly three. Preserve all existing direct
and two-hop behavior. Regenerate the route cache for every supported chain.

## Scope

This plan covers:

- Generic simple-path discovery with a maximum of three hops.
- Suppression of three-hop paths when a direct or two-hop path exists.
- Canonical reverse-path deduplication.
- Correct selection when several cached routes share endpoint tokens.
- Cache-cost lookup deduplication and memoization.
- Three-hop cache statistics and route-generation documentation.
- Unit, integration, build, size, and live quote validation.
- Route-cache regeneration for all supported chains.

This plan does not cover:

- Routes longer than three hops.
- Runtime fallback around a temporarily unavailable shorter route.
- Amount-dependent route optimization or split routing.
- Router contract changes.
- Frontend repository changes. The known first-pool-only trading-limit check is
  a separate consumer follow-up.

## Coordination model

The primary agent acts as coordinator, advisor, integrator, and reviewer. It
owns the decision boundary, shared interfaces, generated cache, final changes,
and validation results.

Lower-cost worker agents own bounded file sets. Workers do not change the ADR,
expand scope, regenerate the shared cache, publish changes, or make product
decisions. The coordinator reviews and verifies every worker result before
integration.

## Workstreams

### A. Core route discovery

#### Workstream A ownership

- `src/utils/routeUtils.ts`
- `src/core/types/route.ts` documentation only
- `tests/unit/utils/routeUtils.test.ts`

#### Workstream A changes

- Replace the fixed two-edge traversal with bounded simple-path discovery.
- Preserve direct and two-hop candidate generation.
- Add three-hop candidates only when the endpoint pair has no path with one or
  two hops.
- Prevent repeated tokens and pools.
- Preserve canonical endpoint ordering and executable pool ordering.
- Generalize intermediate-token inspection for three-hop route selection.
- Keep existing exported helpers compatible unless a change is necessary and
  covered by tests.

#### Workstream A proof

- A linear four-token graph produces one three-hop endpoint pair.
- Adding a direct edge suppresses that three-hop pair.
- Adding a two-hop path suppresses that three-hop pair.
- Four-hop-only endpoints remain unsupported.
- Cyclic graphs do not produce repeated-token paths.
- Forward and reverse traversal produce equivalent canonical routes.
- Existing direct and two-hop tests remain green.

### B. Cache pipeline and documentation

#### Workstream B ownership

- `scripts/cacheRoutes/index.ts`
- `scripts/cacheRoutes/batchProcessor.ts`
- `scripts/cacheRoutes/spread.ts`
- `scripts/cacheRoutes/statistics.ts`
- `scripts/cacheRoutes/README.md`
- New focused tests for these modules

#### Workstream B changes

- Remove reverse-path duplicates before fetching pool costs.
- Memoize pool-cost reads across routes in one chain-generation run.
- Evict rejected memoized reads so retry passes can recover.
- Count and report three-hop routes.
- Update route-generation documentation for all supported networks and the
  minimum-distance eligibility rule.
- Keep partial-discovery and partial-cost failures fail-closed.

#### Workstream B proof

- Reverse paths trigger one cost calculation.
- Reused pools trigger one successful pool-cost read per chain-generation run.
- A failed pool-cost read can succeed on a later retry pass.
- Statistics report one-, two-, and three-hop counts.
- Completeness checks still reject partial output.

### C. Cached route selection and route encoding proof

#### Workstream C ownership

- `src/services/routes/RouteService.ts`
- `tests/unit/services/RouteService.test.ts`
- New focused path-encoding tests when needed

#### Workstream C changes

- Make endpoint lookup select the lowest-cost cached candidate explicitly.
- Use hop count as a deterministic tie-breaker when costs are equal or absent.
- Avoid order-dependent last-write selection.
- Preserve constant-time lookup after cache initialization.
- Prove that path encoding accepts a connected three-pool path in both
  directions.

#### Workstream C proof

- Cached candidate order does not change the selected route.
- Lower cost wins.
- Fewer hops win when costs tie or are unavailable.
- Warmed lookups remain cached.
- A three-hop path encodes three ordered Router route entries in each direction.

## Integration sequence

1. Merge and review workstream A.
2. Adapt workstreams B and C to the final route utility interface.
3. Run focused unit tests for every changed module.
4. Run the complete unit suite, lint, build, and size checks.
5. Generate fresh route caches for all seven supported chains.
6. Verify generated cache completeness and expected endpoint changes.
7. Run representative live three-hop quotes on Polygon, Polygon Amoy, Celo,
   and Celo Sepolia at explicit blocks.
8. Run a fresh-context semantic review and deterministic autoreview.
9. Resolve accepted findings and rerun affected checks.

## Expected cache result

The 2026-08-18 graph snapshot gives this expected result after canonical
deduplication:

| Chain         | Current routes | Expected routes | New routes |
| ------------- | -------------: | --------------: | ---------: |
| Polygon       |              5 |               6 |          1 |
| Polygon Amoy  |              5 |               6 |          1 |
| Celo          |            155 |             171 |         16 |
| Celo Sepolia  |            155 |             171 |         16 |
| Monad         |             28 |              28 |          0 |
| Monad Testnet |             28 |              28 |          0 |
| Base Sepolia  |              1 |               1 |          0 |
| **Total**     |        **377** |         **411** |     **34** |

Live pool changes can alter these counts. A difference requires investigation,
not forced conformance to the snapshot.

## Required quality gates

- `git diff --check`
- Prettier check for changed files
- `pnpm lint`
- `pnpm test:unit`
- `pnpm build`
- `pnpm size`
- Focused route and cache tests
- Fresh cache generation with no failed chain
- No pool-discovery warnings
- No missing route-cost data
- Representative live three-hop Router quotes
- Clean semantic and deterministic autoreview

## Completion record

Implementation completed on 2026-08-18.

The regenerated cache contains 411 routes. The result matches the expected
chain distribution in this plan. It adds 34 three-hop routes and preserves
every previous direct and two-hop pool path. Structural validation found no
route longer than three hops, repeated token, repeated pool, disconnected
path, reverse duplicate, or three-hop pair with a shorter path.

Representative Router quotes used an input amount of `1000000` raw units:

| Chain        |      Block | Route           | Hops |              Raw output |
| ------------ | ---------: | --------------- | ---: | ----------------------: |
| Polygon      | 92,245,474 | `EUROP-USDC`    |    3 |                 862,517 |
| Polygon Amoy | 45,254,798 | `EUROP-USDC`    |    3 |                 861,964 |
| Celo         | 75,172,479 | `USDC-axlEUROC` |    3 |                 856,990 |
| Celo Sepolia | 33,789,243 | `USDC-axlEUROC` |    3 | 856,635,015,474,631,725 |

Validation results:

- The focused route and cache suites passed 43 tests.
- The full unit suite passed 467 tests.
- `pnpm lint` passed.
- `pnpm build` passed.
- `pnpm size` passed at 263.48 kB for CommonJS and 105.97 kB for ESM.
- Cache generation completed for all seven chains with no discovery or cost
  failure.
- Three fresh-context review passes found no actionable issue.
- Deterministic local autoreview found no actionable issue.

The broad integration suite was also attempted against public RPC endpoints.
It did not pass because Monad Testnet enforced its 15-request-per-second limit
and current Base Sepolia pool and quote fixtures failed. These failures did not
exercise the new three-hop routes. The explicit-block Router quotes above
provide the live integration proof for this change.

## Stop conditions

The coordinator pauses implementation if:

- A worker change conflicts with ADR 0001.
- A supported chain produces partial pool discovery.
- Cache regeneration removes an existing direct or two-hop endpoint pair.
- The generated cache adds a three-hop route for an endpoint pair reachable in
  fewer hops.
- A required quality gate fails for a reason introduced by this change.
- Completing the work requires a contract, deployment, or frontend scope
  expansion.
