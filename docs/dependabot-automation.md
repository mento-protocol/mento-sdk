# Dependabot preparation

The portable `dependabot-prep` skill (revision `trusted-agent-v1`) prepares
open Dependabot PRs in this repo for a human merge decision. The machine-readable
policy is `.github/dependabot-prep-policy.json`. This page records the parts a
human needs.

## What the agent does

1. Selects open PRs authored by `dependabot[bot]` on `dependabot/**` branches
   with auto-merge off. Draft PRs and PRs labelled `do-not-merge` or
   `dependabot:manual` are holds: the agent researches them and reports them
   as `needs decision`, but writes nothing to them.
2. Researches every version change against upstream changelogs and releases.
3. Merges current `main` if needed, repairs conflicts and lockfile coupling,
   and runs the repository gates with a frozen lockfile:
   `pnpm build`, `pnpm lint`, `pnpm test:unit`, `pnpm size`.
4. Requests one CodeRabbit review per exact head with `@coderabbitai review`
   when the current head has no CodeRabbit review yet. CodeRabbit is also
   configured to review every PR on open (`.coderabbit.yaml`).
5. Fixes valid findings, answers declined findings on their thread, and keeps
   one summary comment per PR marked `<!-- dependabot-prep:summary:v1 -->`.

Budget: 60 minutes per batch, 30 active repair minutes and three repair
attempts per PR.

## What stays human

Branch protection requires one approving review. The agent never approves,
merges, closes, rebases, force-pushes, changes auto-merge, or resolves threads.
Changes under `.github/workflows/**` are reported as "needs decision" unless
they are version-only CI coupling for a patch or minor package update.

## Invocation

```text
/dependabot-prep mento-protocol/mento-sdk all --write
```

`--dry-run` produces the inventory and research without any writes.
