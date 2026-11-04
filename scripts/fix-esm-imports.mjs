#!/usr/bin/env node
// Rewrites the relative module specifiers in dist/esm to full paths, after tsc has emitted them.
//
// dist/esm is published under {"type":"module"}, and Node's ESM loader resolves a relative
// specifier exactly as written: it adds no file extension and looks up no directory index. tsc
// emits specifiers as they appear in src/ ('./core/constants'), so without this step a plain
// `import` of the package fails with ERR_MODULE_NOT_FOUND. Bundlers, tsx and ts-node resolve
// them anyway, which is how the broken build went unnoticed.
//
// Each specifier becomes './x.js' or './x/index.js', whichever file exists, in that order (the
// order TypeScript resolves them in). A specifier that resolves to neither fails the build rather
// than shipping an import that cannot load. Running the script twice changes nothing.
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const ESM_DIR = join(ROOT, 'dist', 'esm')

// Static `import … from` and `export … from`, side-effect `import '…'` and dynamic `import('…')`,
// with either quote, for specifiers that start with ./ or ../
const RELATIVE_SPECIFIER = /(\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)(['"])(\.{1,2}\/[^'"]*)\2/g
const HAS_EXTENSION = /\.(?:m?js|cjs|json)$/

function jsFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return jsFiles(path)
    return entry.isFile() && entry.name.endsWith('.js') ? [path] : []
  })
}

function fullSpecifier(fromFile, specifier) {
  const target = resolve(dirname(fromFile), specifier)
  if (HAS_EXTENSION.test(specifier)) return existsSync(target) ? specifier : null
  if (existsSync(`${target}.js`)) return `${specifier}.js`
  if (existsSync(join(target, 'index.js'))) return `${specifier.replace(/\/$/, '')}/index.js`
  return null
}

if (!existsSync(ESM_DIR)) {
  console.error(`fix-esm-imports: ${relative(ROOT, ESM_DIR)} does not exist; run tsc first`)
  process.exit(1)
}

let rewritten = 0
let changedFiles = 0
const unresolved = []

for (const file of jsFiles(ESM_DIR)) {
  const source = readFileSync(file, 'utf8')
  const output = source.replace(RELATIVE_SPECIFIER, (match, prefix, quote, specifier) => {
    const full = fullSpecifier(file, specifier)
    if (full === null) {
      unresolved.push(`${relative(ROOT, file)}: ${specifier}`)
      return match
    }
    if (full !== specifier) rewritten += 1
    return `${prefix}${quote}${full}${quote}`
  })
  if (output !== source) {
    writeFileSync(file, output)
    changedFiles += 1
  }
}

if (unresolved.length > 0) {
  console.error(`fix-esm-imports: ${unresolved.length} relative import(s) in dist/esm resolve to no file:`)
  for (const line of unresolved) console.error(`  ${line}`)
  process.exit(1)
}

console.log(`fix-esm-imports: rewrote ${rewritten} specifier(s) in ${changedFiles} file(s) under dist/esm`)
