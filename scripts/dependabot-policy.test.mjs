import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { delimiter, extname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import test from 'node:test'

const root = fileURLToPath(new URL('../', import.meta.url))
const policyPath = '.github/dependabot-prep-policy.json'
const playbookPath = 'docs/dependabot-automation.md'
const wrapperPath = 'scripts/dependabot-claim.mjs'
const testPath = 'scripts/dependabot-policy.test.mjs'
const hostLock = '${XDG_STATE_HOME:-$HOME/.local/state}/dependabot-prep/active'
const hostLockMacos = '$HOME/Library/Application Support/dependabot-prep/active'

function read(path) {
  return readFileSync(join(root, path), 'utf8')
}

function policy() {
  return JSON.parse(read(policyPath))
}

function git(args, input) {
  const run = spawnSync('git', args, {
    cwd: root,
    encoding: 'utf8',
    input,
  })
  assert.equal(run.status, 0, run.stderr)
  return run.stdout.trim()
}

function policyTree() {
  const blob = git(['hash-object', '-w', '--stdin'], read(policyPath))
  const github = git(['mktree'], `100644 blob ${blob}\tdependabot-prep-policy.json\n`)
  return git(['mktree'], `040000 tree ${github}\t.github\n`)
}

function pnpmLauncherCommand(execPath) {
  return ['.js', '.cjs', '.mjs'].includes(extname(execPath).toLowerCase()) ? [process.execPath, execPath] : [execPath]
}

function realPnpmCommand() {
  const { npm_execpath: execPath } = { ...process.env }
  if (execPath && existsSync(execPath)) return pnpmLauncherCommand(execPath)
  const found = spawnSync('/usr/bin/env', ['sh', '-c', 'command -v pnpm'], {
    encoding: 'utf8',
  })
  const resolved = found.stdout?.trim()
  return found.status === 0 && resolved ? [resolved] : null
}

test('pnpm launcher supports native executables and JavaScript entry points', () => {
  const nativeCommand = pnpmLauncherCommand(process.execPath)
  assert.deepEqual(nativeCommand, [process.execPath])
  const native = spawnSync(nativeCommand[0], [...nativeCommand.slice(1), '-e', "process.stdout.write('native')"], {
    encoding: 'utf8',
  })
  assert.equal(native.status, 0, native.stderr)
  assert.equal(native.stdout, 'native')

  const directory = mkdtempSync(join(tmpdir(), 'sdk-pnpm-launcher-'))
  try {
    const launcher = join(directory, 'pnpm.cjs')
    writeFileSync(launcher, "process.stdout.write(process.argv.slice(2).join(' '))\n")
    const javaScriptCommand = pnpmLauncherCommand(launcher)
    assert.deepEqual(javaScriptCommand, [process.execPath, launcher])
    const javaScript = spawnSync(javaScriptCommand[0], [...javaScriptCommand.slice(1), 'from', 'javascript'], {
      encoding: 'utf8',
    })
    assert.equal(javaScript.status, 0, javaScript.stderr)
    assert.equal(javaScript.stdout, 'from javascript')
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

function documentedInvocation(args) {
  const command = realPnpmCommand()
  assert.ok(command, 'pnpm must be available to test the documented command')
  const directory = mkdtempSync(join(tmpdir(), 'sdk-claim-command-'))
  try {
    const wrapper = join(root, wrapperPath)
    const argvPath = join(directory, 'argv.txt')
    const stubDirectory = join(directory, 'bin')
    mkdirSync(stubDirectory)
    writeFileSync(
      join(directory, 'package.json'),
      `${JSON.stringify({
        name: 'dependabot-claim-documented-form',
        version: '0.0.0',
        private: true,
        scripts: { 'dependabot:claim': `node '${wrapper}'` },
      })}\n`
    )
    const stub = join(stubDirectory, 'pnpm')
    writeFileSync(
      stub,
      '#!/bin/sh\nfor argument in "$@"; do printf \'%s\\n\' "$argument" >> "$DEPENDABOT_CLAIM_ARGV"; done\n'
    )
    chmodSync(stub, 0o755)
    const [executable, ...prefix] = command
    const run = spawnSync(executable, [...prefix, '--dir', directory, 'run', 'dependabot:claim', ...args], {
      encoding: 'utf8',
      env: {
        ...process.env,
        DEPENDABOT_CLAIM_ARGV: argvPath,
        DEPENDABOT_CLAIM_POLICY_REF: policyTree(),
        PATH: `${stubDirectory}${delimiter}${process.env.PATH}`,
      },
    })
    const argv = existsSync(argvPath) ? readFileSync(argvPath, 'utf8').trim().split('\n') : []
    return { run, argv }
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
}

test('v4 policy binds the installed trusted-agent-v2 workflow', () => {
  const config = policy()
  assert.equal(config.schema, 'dependabot-prep-policy:v4')
  assert.deepEqual(config.workflow, {
    skill: 'dependabot-prep',
    revision: 'trusted-agent-v2',
    runtimes: ['openclaw', 'codex', 'claude'],
    hostProfile: 'portable-serial',
  })
  assert.equal(config.repository, 'mento-protocol/mento-sdk')
  assert.equal(config.baseRef, 'main')
  assert.equal(config.canonicalPlaybook, playbookPath)
  assert.equal(config.authority.source, 'live-main')
  assert.equal(config.authority.candidateInstructions, 'not-authority')
  assert.equal(config.authority.requireCurrentPolicyBeforeWrites, true)
  assert.equal(Object.hasOwn(config.limits, 'activeBatches'), false)
})

test('claim configuration is exact and uses one host-wide heavy slot', () => {
  const config = policy()
  const claims = config.coordination.claims
  assert.equal(config.coordination.primitive, 'github-ref-claims')
  assert.equal(claims.schema, 'mento-claims-config:v1')
  assert.equal(claims.profile, 'pr')
  assert.equal(claims.namespace, 'refs/mento-claims/v1/pr')
  assert.equal(claims.scopeTemplate, `${claims.namespace}/{pr}`)
  assert.equal(claims.kind, 'mento-claim')
  assert.equal(claims.payloadVersion, 1)
  assert.ok(claims.renewMinutes > 0)
  assert.ok(claims.renewMinutes * 2 <= claims.ttlMinutes)
  assert.ok(claims.ttlMinutes <= claims.maxTtlMinutes)
  assert.ok(claims.graceMinutes * 60 > claims.skewToleranceSeconds)
  assert.equal(claims.markerRevision, 'v2')
  assert.deepEqual(claims.requiredBefore, ['branch-push', 'review-request'])
  assert.deepEqual(claims.advisoryBefore, ['summary-comment', 'inline-reply', 'long-wait'])
  assert.equal(claims.allowOverrides, false)
  assert.equal(claims.allowCloudWriters, false)
  assert.deepEqual(claims.command, ['pnpm', 'dependabot:claim', '--'])
  assert.deepEqual(claims.package, {
    name: '@mento-protocol/issues',
    version: '0.1.0',
  })
  assert.equal(config.coordination.hostLock.scope, 'host-local-heavy-tree')
  assert.equal(config.coordination.hostLock.path, hostLock)
  assert.equal(config.coordination.hostLock.pathMacos, hostLockMacos)
})

test('policy, playbook, helper, and CI carry every v2 binding', () => {
  const config = policy()
  const playbook = read(playbookPath)
  const wrapper = read(wrapperPath)
  const manifest = JSON.parse(read('package.json'))
  const workflow = read('.github/workflows/main.yml')
  const combined = [
    policyPath,
    playbookPath,
    wrapperPath,
    'package.json',
    '.github/workflows/main.yml',
    '.github/dependabot.yml',
    '.coderabbit.yaml',
    'AGENTS.md',
    'CLAUDE.md',
    'README.md',
  ]
    .map(read)
    .join('\n')

  assert.equal(manifest.scripts['dependabot:claim'], 'node scripts/dependabot-claim.mjs')
  assert.equal(manifest.scripts['dependabot:policy:test'], 'node --test scripts/dependabot-policy.test.mjs')
  assert.match(workflow, /run: pnpm dependabot:policy:test/u)
  assert.ok(config.changes.needsDecisionPaths.includes(wrapperPath))
  assert.ok(config.changes.needsDecisionPaths.includes(testPath))
  assert.ok(playbook.includes(config.workflow.revision))
  assert.ok(playbook.includes(config.schema))
  assert.ok(playbook.includes('stop before any write'))
  assert.ok(playbook.includes(config.coordination.claims.label))
  assert.ok(playbook.includes(`${config.coordination.claims.namespace}/<number>`))
  assert.ok(playbook.includes(config.reporting.prCommentMarker))
  assert.ok(playbook.includes(`<!-- ${config.reporting.prCommentClaimMarkerSchema} pr=`))
  for (const retired of [
    ['trusted-agent', 'v1'].join('-'),
    ['dependabot-prep-policy', 'v3'].join(':'),
    'same-atomic-lock-before-writes',
    '"lockPath"',
    '"activeBatches"',
  ]) {
    assert.equal(combined.includes(retired), false, retired)
  }
})

test('the claims package stays external and lifecycle scripts stay disabled', () => {
  const config = policy()
  const pin = config.coordination.claims.package
  const manifest = JSON.parse(read('package.json'))
  for (const field of ['dependencies', 'devDependencies', 'optionalDependencies']) {
    assert.equal(Object.hasOwn(manifest[field] ?? {}, pin.name), false, field)
  }
  assert.doesNotMatch(read('pnpm-lock.yaml'), /@mento-protocol\/issues/u)

  const wrapper = read(wrapperPath)
  assert.match(wrapper, /refs\/remotes\/origin\/main/u)
  assert.match(wrapper, /cat-file/u)
  assert.match(wrapper, /--config\.ignore-scripts=true/u)
  assert.doesNotMatch(wrapper, /new URL\(\s*"\.\.\/\.github/u)
  assert.doesNotMatch(wrapper, /@mento-protocol\/issues/u)
})

test('the wrapper injects the candidate policy into the pinned CLI', () => {
  const directory = mkdtempSync(join(tmpdir(), 'sdk-claim-test-'))
  try {
    const stub = join(directory, 'pnpm')
    writeFileSync(stub, '#!/bin/sh\nfor argument in "$@"; do printf \'%s\\n\' "$argument"; done\n')
    chmodSync(stub, 0o755)
    const run = spawnSync(process.execPath, [join(root, wrapperPath), 'claims', 'read', '--pr', '123', '--json'], {
      cwd: root,
      encoding: 'utf8',
      env: {
        ...process.env,
        DEPENDABOT_CLAIM_POLICY_REF: policyTree(),
        PATH: `${directory}${delimiter}${process.env.PATH}`,
      },
    })
    assert.equal(run.status, 0, run.stderr)
    assert.match(run.stderr, /policy from [0-9a-f]{40} \([0-9a-f]{40}\), DEPENDABOT_CLAIM_POLICY_REF override/u)
    const argv = run.stdout.trim().split('\n')
    const configFlag = argv.indexOf('--config')
    assert.ok(configFlag > 0)
    assert.deepEqual(argv.slice(0, 4), [
      '--config.ignore-scripts=true',
      '--package=@mento-protocol/issues@0.1.0',
      'dlx',
      'mento-issues',
    ])
    assert.deepEqual(argv.slice(4, configFlag), ['claims', 'read'])
    assert.match(argv[configFlag + 1], /dependabot-claim-policy-[^/]+\/dependabot-prep-policy\.json$/u)
    assert.deepEqual(argv.slice(configFlag + 2), ['--pr', '123', '--json'])
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

test('the claim wrapper rejects runtimes older than Node 22.12', () => {
  const directory = mkdtempSync(join(tmpdir(), 'sdk-claim-runtime-'))
  try {
    const launcher = join(directory, 'old-node.mjs')
    const wrapperUrl = pathToFileURL(join(root, wrapperPath)).href
    writeFileSync(
      launcher,
      `Object.defineProperty(process.versions, 'node', { value: '22.11.0' })\nawait import(${JSON.stringify(wrapperUrl)})\n`
    )
    const run = spawnSync(process.execPath, [launcher], {
      cwd: root,
      encoding: 'utf8',
      env: {
        ...process.env,
        DEPENDABOT_CLAIM_POLICY_REF: policyTree(),
      },
    })
    assert.equal(run.status, 3, run.stderr)
    assert.match(run.stderr, /requires Node\.js >=22\.12\.0/u)
    assert.match(run.stderr, /current runtime is Node\.js 22\.11\.0/u)
    assert.match(run.stderr, /SDK remains supported on Node\.js >=18/u)
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

test('the documented pnpm command preserves plain and guarded arguments', () => {
  const pin = policy().coordination.claims.package
  const plain = documentedInvocation(['--', 'claims', 'read', '--pr', '123', '--json'])
  assert.equal(plain.run.status, 0, plain.run.stderr)
  const plainConfig = plain.argv.indexOf('--config')
  assert.ok(plainConfig > 0)
  assert.deepEqual(plain.argv.slice(0, plainConfig), [
    '--config.ignore-scripts=true',
    `--package=${pin.name}@${pin.version}`,
    'dlx',
    'mento-issues',
    'claims',
    'read',
  ])
  assert.deepEqual(plain.argv.slice(plainConfig + 2), ['--pr', '123', '--json'])

  const guarded = documentedInvocation([
    '--',
    'claims',
    'guard',
    '--pr',
    '123',
    '--token',
    'a'.repeat(40),
    '--run-id',
    'test-run',
    '--gate',
    'push',
    '--',
    '/bin/echo',
    'pushed',
  ])
  assert.equal(guarded.run.status, 0, guarded.run.stderr)
  const guardedConfig = guarded.argv.indexOf('--config')
  assert.ok(guardedConfig > 0)
  assert.deepEqual(guarded.argv.slice(0, guardedConfig), [
    '--config.ignore-scripts=true',
    `--package=${pin.name}@${pin.version}`,
    'dlx',
    'mento-issues',
    'claims',
    'guard',
  ])
  assert.deepEqual(guarded.argv.slice(guardedConfig + 2), [
    '--pr',
    '123',
    '--token',
    'a'.repeat(40),
    '--run-id',
    'test-run',
    '--gate',
    'push',
    '--',
    '/bin/echo',
    'pushed',
  ])
})
