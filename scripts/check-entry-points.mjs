#!/usr/bin/env node
// Loads the built package the two ways a consumer does, under plain Node: `import` (the exports
// map's "import" condition, dist/esm) and `require` (its "require" condition, dist/index.js).
// The package is loaded by its own name, so the exports map is exercised exactly as an installed
// copy would be. tsc and Jest cannot see a broken ESM build; this can. Run it after `pnpm build`.
import { createRequire } from 'node:module'

const PACKAGE = '@mento-protocol/mento-sdk'
const EXPECTED_EXPORTS = ['Mento', 'ChainId', 'addresses', 'ROUTER_ABI', 'FPMM_ABI']

function check(label, sdk) {
  const missing = EXPECTED_EXPORTS.filter((name) => sdk[name] === undefined)
  if (missing.length > 0) throw new Error(`${label}: missing exports ${missing.join(', ')}`)
  if (typeof sdk.Mento.create !== 'function') throw new Error(`${label}: Mento.create is not a function`)
  if (sdk.ChainId.CELO !== 42220) throw new Error(`${label}: ChainId.CELO is not 42220`)
  console.log(`${label}: ok (${EXPECTED_EXPORTS.join(', ')})`)
}

check(`import('${PACKAGE}')`, await import(PACKAGE))
check(`require('${PACKAGE}')`, createRequire(import.meta.url)(PACKAGE))
