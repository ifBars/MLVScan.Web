import type { ScanResult } from '@/types/mlvscan'
import categories from './telemetry-categories.json'

export const DIAGNOSTIC_CONSENT_VERSION = 2
const STORAGE_KEY = 'mlvscan:diagnostics:v2'
const CHANGE_EVENT = 'mlvscan:diagnostics-change'
export type DiagnosticChoice = 'allowed' | 'declined' | 'undecided'
let memoryChoice: DiagnosticChoice = 'undecided'
let pending = false

export function getDiagnosticChoice(): DiagnosticChoice {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'allowed' || stored === 'declined') return stored
    if (localStorage.getItem('mlvscan:diagnostics:v1') === 'declined') return 'declined'
    return 'undecided'
  } catch { /* Private browsing may disable storage; the current tab choice still works. */ }
  return memoryChoice
}

export function setDiagnosticChoice(choice: Exclude<DiagnosticChoice, 'undecided'>): void {
  memoryChoice = choice
  try { localStorage.setItem(STORAGE_KEY, choice) } catch { /* No persistence available. */ }
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export function subscribeDiagnosticChoice(callback: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, callback)
  window.addEventListener('storage', callback)
  return () => { window.removeEventListener(CHANGE_EVENT, callback); window.removeEventListener('storage', callback) }
}

/** Pure projection: nothing from input identity, evidence text, URLs or account context is copied. */
export function summarizeScanDiagnostics(results: ScanResult[]): Record<string, number> {
  const counts: Record<string, number> = { telemetry_schema_version: 3, result_count: results.length }
  const add = (key: string) => {
    if (!(key in counts) && Object.keys(counts).length >= 192) key = 'diagnostic_overflow_count'
    counts[key] = Math.min(2147483647, (counts[key] ?? 0) + 1)
  }
  for (const result of results) {
    const raw = result.disposition?.classification
    const verdict = ['Clean', 'Suspicious', 'KnownThreat', 'ManualReviewRequired'].includes(raw ?? '') ? raw! : 'Unknown'
    const outcome = ({ Clean: 'clean', Suspicious: 'suspicious', KnownThreat: 'known_threat', ManualReviewRequired: 'manual_review_required', Unknown: 'unknown' } as Record<string, string>)[verdict]
    add(`${outcome}_count`)
    add(result.analysisCompleteness?.isComplete === true ? 'complete_result_count' : 'incomplete_result_count')
    const seen = new Set<string>()
    for (const finding of result.findings ?? []) {
      const rule = categories.rules.includes(finding.ruleId ?? '') ? finding.ruleId : 'other'
      const severity = ['Low', 'Medium', 'High', 'Critical'].includes(finding.severity) ? finding.severity : 'Unknown'
      const visibility = ['Default', 'Advanced'].includes(finding.visibility ?? '') ? finding.visibility : 'Unknown'
      const group = `rule_${rule}_${severity}_${visibility}_${verdict}`
      add(`${group}_findings`)
      if (!seen.has(group)) { add(`${group}_results`); seen.add(group) }
    }
    const families = result.threatFamilies ?? []
    add(families.some(f => f.exactHashMatch) ? 'exact_match_result_count' : families.length ? 'family_match_result_count' : 'no_family_match_result_count')
    for (const id of new Set(families.map(f => categories.families.includes(f.familyId) ? f.familyId : 'other'))) add(`family_${id}_${verdict}_count`)
    for (const flow of result.dataFlows ?? []) add(`flow_${categories.patterns.includes(flow.pattern) ? flow.pattern : 'Unknown'}_${verdict}_count`)
    // Matches Core ScanDiagnosticSummary: one count per result and finding ID that limited analysis.
    const limiting = new Set((result.analysisCompleteness?.reasons ?? []).map(r => categories.rules.includes(r.ruleId ?? '') ? r.ruleId! : 'other'))
    for (const id of limiting) add(`incomplete_${id}_count`)
  }
  return counts
}

export async function captureBrowserScan(results: ScanResult[]): Promise<boolean> {
  if (pending || getDiagnosticChoice() !== 'allowed') return false
  const token = import.meta.env.VITE_POSTHOG_PROJECT_TOKEN ?? ''
  const environment = import.meta.env.VITE_TELEMETRY_ENVIRONMENT ?? ''
  const region = import.meta.env.VITE_POSTHOG_REGION ?? 'us'
  if (!/^phc_[A-Za-z0-9_-]{1,196}$/.test(token) || !['development', 'staging', 'production'].includes(environment) || !['us', 'eu'].includes(region)) return false
  pending = true
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 3000)
  try {
    const properties = summarizeScanDiagnostics(results)
    if (getDiagnosticChoice() !== 'allowed') return false
    const response = await fetch(`https://${region}.i.posthog.com/i/v0/e/`, {
      method: 'POST', credentials: 'omit', redirect: 'error', referrerPolicy: 'no-referrer',
      signal: controller.signal, headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: token, event: 'mlvscan_scan_run_completed',
        distinct_id: `web-scan:${crypto.randomUUID()}`, properties: {
          ...properties, consumer: 'web', environment,
          $process_person_profile: false, $geoip_disable: true, $ip: '0.0.0.0',
        } }),
    })
    return response.ok
  } catch { return false } finally { pending = false; clearTimeout(timeout) }
}
