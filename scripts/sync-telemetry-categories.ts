import { readFile, readdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

// Explicit reviewable allowlists. Never derive telemetry property names from arbitrary sample text.
const core = resolve(import.meta.dir, '../../MLVScan.Core')
const rulesRoot = resolve(core, 'Models/Rules')
const rules = new Set(['DataFlowAnalysis', 'DataFlowScanWarning', 'MultiSignalDetection', 'ScanWarning'])
for (const name of await readdir(rulesRoot)) {
  if (!name.endsWith('.cs')) continue
  for (const match of (await readFile(resolve(rulesRoot, name), 'utf8')).matchAll(/\bRuleId\s*=>\s*"([^"]+)"/g)) rules.add(match[1])
}
const summary = await readFile(resolve(core, 'Services/ScanDiagnosticSummary.cs'), 'utf8')
const families = new Set([...summary.matchAll(/"(family-[^"]+)"/g)].map(m => m[1]))
const patternsSource = (await readFile(resolve(core, 'Models/DataFlowChain.cs'), 'utf8')).split('public enum DataFlowPattern')[1]
const patterns = [...patternsSource.matchAll(/^\s*(\w+)\s*,?\s*$/gm)].map(m => m[1])
const content = JSON.stringify({ rules: [...rules].sort(), families: [...families].sort(), patterns }, null, 2) + '\n'
const target = resolve(import.meta.dir, '../src/lib/telemetry-categories.json')
if (process.argv.includes('--check')) {
  if (await readFile(target, 'utf8') !== content) throw new Error('Telemetry allowlist drift. Run bun scripts/sync-telemetry-categories.ts')
} else await writeFile(target, content)
