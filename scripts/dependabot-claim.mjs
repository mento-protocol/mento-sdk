#!/usr/bin/env node
// Thin wrapper around the per-pull-request claim CLI.
//
// It reads `.github/dependabot-prep-policy.json` **from the fetched default
// branch**, checks the policy schema and the pinned claims package, and runs
// that package's `mento-issues` binary through `pnpm dlx`. The package is never
// installed into this repository and never imported here, so no manifest or
// lockfile entry exists for it.
//
// The policy is never read from the working tree. A per-PR worktree is an
// ordinary checkout of a candidate branch, and a candidate branch may edit the
// policy; reading it from disk would let that branch choose its own claim
// namespace, lease timings, gates and package pin, which would partition its
// claims from the fence every other writer shares. The wrapper therefore
// resolves `refs/remotes/origin/main` in the local object store and reads the
// policy blob out of that revision, so only what the default branch already
// carries can configure a claim. It prints the resolved ref and oid, and it
// never fetches: refresh a stale ref with `git fetch origin main`.
//
// `DEPENDABOT_CLAIM_POLICY_REF` names a different commit or tree oid for
// rehearsals and for this repository's structural tests. It is still read
// through the object store, so it can only ever name a revision that exists;
// it can never name a file on disk. Every use prints an override notice.
//
// `pnpm dlx` resolves the package into a temporary project outside this
// repository. This wrapper passes `--config.ignore-scripts=true`, so no
// `preinstall`, `install` or `postinstall` script runs — of the pinned package
// or of anything in its resolved tree — whatever a host `.npmrc` allows.
// `--ignore-scripts` is not a `dlx` option; `--config.ignore-scripts=true` is
// the supported pnpm configuration form.
//
// `--package=<name>@<version>` selects the package and `mento-issues` names the
// binary. Without `--package`, `pnpm dlx` reads its first positional as the
// package specifier alone and forwards every later positional to the binary it
// derives from the installed package, so `pnpm dlx <spec> mento-issues …` would
// pass `mento-issues` to the CLI as its first argument.
//
// `DEPENDABOT_CLAIM_PACKAGE_DIR` runs the pinned package from a local checkout
// while it is unpublished. It keeps every check above: the policy still comes
// from the default branch, and the checkout's own manifest must carry exactly
// the pinned name and version before its binary runs.
//
// Usage: pnpm dependabot:claim -- <group> <command> [flags] [-- <argv>]

import { spawn, spawnSync } from 'node:child_process'
import { chmodSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve, sep } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const POLICY_SCHEMA = 'dependabot-prep-policy:v4'
const POLICY_PATH = '.github/dependabot-prep-policy.json'
const DEFAULT_POLICY_REF = 'refs/remotes/origin/main'
const BINARY = 'mento-issues'
const MINIMUM_CLAIM_NODE_VERSION = [22, 12, 0]
const EXIT_USAGE = 2
const EXIT_CONFIG = 3
// The npm package-name grammar, scoped or unscoped, with a leading dash
// excluded in both halves. It stops a policy value from becoming a `pnpm` flag
// or an alternative package specifier.
const PACKAGE_NAME = /^(?:@[a-z0-9~][a-z0-9-._~]*\/)?[a-z0-9~][a-z0-9-._~]*$/u
const CONFIG_FLAG = /^--config(?:=|$)/u
// A ref name or an object id, with a leading dash excluded so an override can
// never reach `git` as a flag.
const POLICY_REF = /^[A-Za-z0-9][A-Za-z0-9._/^~@{}-]*$/u
const FORWARDED_SIGNALS = ['SIGINT', 'SIGTERM', 'SIGHUP']

let temporaryDirectory = null

function cleanup() {
  if (temporaryDirectory === null) return
  const directory = temporaryDirectory
  temporaryDirectory = null
  try {
    rmSync(directory, { recursive: true, force: true })
  } catch {
    // Best effort: the policy copy lives under a private temporary directory,
    // and a failure to remove it must not change this run's exit code.
  }
}

process.on('exit', cleanup)

function fail(exitCode, message) {
  process.stderr.write(`${message}\n`)
  process.exit(exitCode)
}

// Read the variables from a copy of the environment: the repository's lint
// rules require every directly named `process.env` key to be declared in
// turbo.json, and these belong to the operator's invocation, not the build.
const { DEPENDABOT_CLAIM_POLICY_REF: policyRefOverride, DEPENDABOT_CLAIM_PACKAGE_DIR: localPackageDirectory } = {
  ...process.env,
}

// Every `git` call goes through an argv array with no shell, and reads only the
// local object store. The wrapper never fetches, so it never reaches the
// network and never mutates the repository.
function git(argv, cwd) {
  const result = spawnSync('git', argv, {
    cwd,
    shell: false,
    encoding: 'buffer',
    maxBuffer: 16 * 1024 * 1024,
  })
  if (result.error) {
    fail(EXIT_CONFIG, `cannot run git: ${result.error.message}`)
  }
  return result
}

function gitText(argv, cwd, description) {
  const result = git(argv, cwd)
  if (result.status !== 0) {
    fail(EXIT_CONFIG, `${description}: ${result.stderr.toString('utf8').trim() || `git exited ${result.status}`}`)
  }
  return result.stdout.toString('utf8').trim()
}

// The wrapper's own location decides the repository, not the caller's working
// directory, so `pnpm --dir` and a plain invocation resolve the same policy.
const scriptDirectory = fileURLToPath(new URL('.', import.meta.url))
const repositoryRoot = gitText(
  ['rev-parse', '--show-toplevel'],
  scriptDirectory,
  `cannot locate the repository holding ${scriptDirectory}`
)

const policyRef = policyRefOverride || DEFAULT_POLICY_REF
if (!POLICY_REF.test(policyRef)) {
  fail(EXIT_CONFIG, `DEPENDABOT_CLAIM_POLICY_REF must be a git ref or object id, found ${policyRef}`)
}

const policyOid = gitText(
  ['rev-parse', '--verify', '--end-of-options', policyRef],
  repositoryRoot,
  policyRefOverride
    ? `cannot resolve DEPENDABOT_CLAIM_POLICY_REF ${policyRef}`
    : `cannot resolve ${policyRef}; run \`git fetch origin main\``
)

const policyBlob = git(['cat-file', 'blob', `${policyOid}:${POLICY_PATH}`], repositoryRoot)
if (policyBlob.status !== 0) {
  fail(
    EXIT_CONFIG,
    `cannot read ${POLICY_PATH} at ${policyRef} (${policyOid}): ${
      policyBlob.stderr.toString('utf8').trim() || `git exited ${policyBlob.status}`
    }`
  )
}
const policyBytes = policyBlob.stdout

process.stderr.write(
  policyRefOverride
    ? `dependabot:claim: policy from ${policyRef} (${policyOid}), DEPENDABOT_CLAIM_POLICY_REF override\n`
    : `dependabot:claim: policy from ${policyRef} (${policyOid}); \`git fetch origin main\` refreshes it\n`
)

let policy
try {
  policy = JSON.parse(policyBytes.toString('utf8'))
} catch (error) {
  fail(EXIT_CONFIG, `cannot parse ${POLICY_PATH} at ${policyRef} (${policyOid}): ${error.message}`)
}

if (policy.schema !== POLICY_SCHEMA) {
  fail(EXIT_CONFIG, `dependabot:claim requires ${POLICY_SCHEMA}, found ${policy.schema}`)
}

const pin = policy.coordination?.claims?.package
if (typeof pin?.name !== 'string' || !PACKAGE_NAME.test(pin.name)) {
  fail(EXIT_CONFIG, 'policy coordination.claims.package.name must be an npm package name')
}
if (typeof pin?.version !== 'string' || !/^\d+\.\d+\.\d+$/u.test(pin.version)) {
  fail(EXIT_CONFIG, 'policy coordination.claims.package.version must be an exact x.y.z version')
}

const currentNodeVersion = process.versions.node.split('.').map(Number)
if (
  currentNodeVersion[0] < MINIMUM_CLAIM_NODE_VERSION[0] ||
  (currentNodeVersion[0] === MINIMUM_CLAIM_NODE_VERSION[0] && currentNodeVersion[1] < MINIMUM_CLAIM_NODE_VERSION[1])
) {
  fail(
    EXIT_CONFIG,
    `dependabot:claim requires Node.js >=${MINIMUM_CLAIM_NODE_VERSION.join('.')} because ${pin.name}@${pin.version} requires Node >=22.12; current runtime is Node.js ${process.versions.node}. The SDK remains supported on Node.js >=18, but claim operations must use a newer runtime.`
  )
}

// Some pnpm releases forward their own separator, so the documented
// `pnpm dependabot:claim -- claims claim ...` form can arrive with a leading
// `--`. Drop it before the guard separator is located. A pnpm that strips its
// separator instead leaves nothing to drop.
const argv = process.argv.slice(2)
if (argv[0] === '--') argv.shift()

// Split at the guard separator so a guarded child's argv stays intact.
const separator = argv.indexOf('--')
const head = separator === -1 ? argv : argv.slice(0, separator)
const tail = separator === -1 ? [] : argv.slice(separator)

// Only this wrapper's own flags are refused. A guarded child keeps its `--config`.
if (head.some((argument) => CONFIG_FLAG.test(argument))) {
  fail(EXIT_USAGE, 'dependabot:claim supplies --config from repository policy; remove the flag')
}

// The resolved policy reaches the CLI as a file, because `--config` takes a
// path. It is written under a private temporary directory rather than into the
// repository, so the bytes the CLI reads are the default branch's bytes and no
// checkout can edit them between this write and the child's read.
temporaryDirectory = mkdtempSync(join(tmpdir(), 'dependabot-claim-policy-'))
const policyPath = join(temporaryDirectory, 'dependabot-prep-policy.json')
writeFileSync(policyPath, policyBytes, { mode: 0o600 })
chmodSync(policyPath, 0o600)

// Put `--config` immediately after the leading group and command words. No
// caller flag can then take the policy path as its value, and the flag still
// lands before the guard separator.
let insertAt = 0
while (insertAt < head.length && !head[insertAt].startsWith('-')) {
  insertAt += 1
}

const forwarded = [...head.slice(0, insertAt), '--config', policyPath, ...head.slice(insertAt), ...tail]

// The unpublished-package fallback stays under this wrapper. It keeps the
// default-branch policy, the schema check and the `--config` injection, and it
// adds an exact-pin check against the checkout's own manifest, so a local
// directory can only ever run the version the policy pins.
function localBinary(directory) {
  const packageRoot = resolve(directory)
  let manifest
  try {
    manifest = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8'))
  } catch (error) {
    fail(EXIT_CONFIG, `cannot read ${join(packageRoot, 'package.json')}: ${error.message}`)
  }
  if (manifest.name !== pin.name || manifest.version !== pin.version) {
    fail(
      EXIT_CONFIG,
      `DEPENDABOT_CLAIM_PACKAGE_DIR must hold ${pin.name}@${pin.version}, found ${manifest.name}@${manifest.version}`
    )
  }
  const declared = typeof manifest.bin === 'string' ? manifest.bin : manifest.bin?.[BINARY]
  if (typeof declared !== 'string') {
    fail(EXIT_CONFIG, `${pin.name} declares no ${BINARY} binary`)
  }
  const binary = resolve(packageRoot, declared)
  if (binary !== packageRoot && !binary.startsWith(`${packageRoot}${sep}`)) {
    fail(EXIT_CONFIG, `${BINARY} resolves outside ${packageRoot}`)
  }
  try {
    if (!statSync(binary).isFile()) throw new Error('not a file')
  } catch (error) {
    fail(EXIT_CONFIG, `cannot run ${binary}: ${error.message}`)
  }
  return binary
}

const [command, commandArguments] = localPackageDirectory
  ? [process.execPath, [localBinary(localPackageDirectory), ...forwarded]]
  : ['pnpm', ['--config.ignore-scripts=true', `--package=${pin.name}@${pin.version}`, 'dlx', BINARY, ...forwarded]]

if (localPackageDirectory) {
  process.stderr.write(`dependabot:claim: running ${pin.name}@${pin.version} from ${resolve(localPackageDirectory)}\n`)
}

const child = spawn(command, commandArguments, {
  shell: false,
  stdio: 'inherit',
})

// A signal addressed to this process alone must not orphan a renewing guard.
let forwardedSignal = null
for (const signal of FORWARDED_SIGNALS) {
  process.on(signal, () => {
    forwardedSignal = signal
    child.kill(signal)
  })
}

child.on('error', (error) => {
  fail(EXIT_CONFIG, `cannot run ${pin.name}@${pin.version}: ${error.message}`)
})

// An interrupted run must not reach the caller as "proceed", and `128 + signal`
// is outside the documented exit rule, so a signal-killed child and a child that
// traps the signal and still exits 0 both report the rule's "stop and report".
child.on('exit', (code, signal) => {
  if (signal) {
    fail(EXIT_CONFIG, `${BINARY} terminated by ${signal}`)
  }
  if (forwardedSignal !== null && code === 0) {
    fail(EXIT_CONFIG, `${BINARY} interrupted by ${forwardedSignal}`)
  }
  process.exit(code ?? EXIT_CONFIG)
})
